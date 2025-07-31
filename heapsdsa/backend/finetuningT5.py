import json
import difflib
import torch
import argparse
import wandb
from datetime import datetime
from functools import partial
from dataclasses import dataclass
from datasets import Dataset
from transformers import (
    T5ForConditionalGeneration,
    T5Tokenizer,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq,
    EarlyStoppingCallback
)
from nltk.translate.bleu_score import sentence_bleu
from rouge_score import rouge_scorer


@dataclass
class ModelConfig:
    """Configuration class for model training parameters."""
    model_name: str = "google/flan-t5-large"
    max_input_length: int = 256
    max_target_length: int = 192
    batch_size: int = 4
    gradient_accumulation_steps: int = 4
    num_epochs: int = 3
    learning_rate: float = 5e-5
    warmup_steps: int = 500
    eval_steps: int = 500
    save_steps: int = 500
    fp16: bool = True
    gradient_checkpointing: bool = True
    use_wandb: bool = True


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Fine-tune T5 model")
    parser.add_argument("--model_name", type=str, default="google/flan-t5-base")
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=1)
    parser.add_argument("--num_epochs", type=int, default=3)
    parser.add_argument("--learning_rate", type=float, default=3e-4)
    # parser.add_argument("--warmup_steps", type=int, default=500)
    # parser.add_argument("--eval_steps", type=int, default=10000)
    # parser.add_argument("--save_steps", type=int, default=10000)
    parser.add_argument("--fp16", action="store_true", help="Use mixed precision training")
    parser.add_argument("--gradient_checkpointing", action="store_true", help="Use gradient checkpointing")
    parser.add_argument("--use_wandb", action="store_true", help="Use Weights & Biases for logging")
    parser.add_argument("--train_path", type=str, default="./datasets/RACE/race_train.json")
    parser.add_argument("--test_path", type=str, default="./datasets/RACE/race_test.json")
    parser.add_argument("--val_path", type=str, default="./datasets/RACE/race_dev.json")
    parser.add_argument("--output_dir", type=str, default="./outputs_T5_enhanced")
    return parser.parse_args()


def tokenize_batch(examples, tokenizer, config):
    """Tokenize inputs and targets using the provided tokenizer with dynamic padding."""
    inputs = tokenizer(
        examples["input_text"],
        max_length=config.max_input_length,
        truncation=True,
        padding=False  # Dynamic padding in collator
    )
    targets = tokenizer(
        examples["target_text"],
        max_length=config.max_target_length,
        truncation=True,
        padding=False  # Dynamic padding in collator
    )
    inputs["labels"] = targets["input_ids"]
    return inputs


def compute_metrics(eval_preds, tokenizer):
    """Compute comprehensive metrics including fuzzy match, exact match, BLEU, and ROUGE."""
    preds, labels = eval_preds
    
    # Unpack if necessary
    if isinstance(preds, tuple):
        preds = preds[0]
    
    # Convert to numpy
    if isinstance(preds, torch.Tensor):
        preds = preds.cpu().numpy()
    if isinstance(labels, torch.Tensor):
        labels = labels.cpu().numpy()

    # Clip out-of-vocab tokens, replace -100 with pad token
    preds = [
        [token if 0 <= token < tokenizer.vocab_size else tokenizer.pad_token_id for token in p]
        for p in preds
    ]
    labels = [
        [token if token != -100 else tokenizer.pad_token_id for token in l]
        for l in labels
    ]

    decoded_preds = tokenizer.batch_decode(preds, skip_special_tokens=True)
    decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)

    # Sequence matching scores
    fuzzy_scores = [
        difflib.SequenceMatcher(None, p.strip(), l.strip()).ratio()
        for p, l in zip(decoded_preds, decoded_labels)
    ]

    # BLEU scores
    bleu_scores = []
    rouge_scorer_obj = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    rouge1_scores, rouge2_scores, rougeL_scores = [], [], []
    
    for pred, label in zip(decoded_preds, decoded_labels):
        # BLEU
        try:
            bleu = sentence_bleu([label.split()], pred.split())
            bleu_scores.append(bleu)
        except:
            bleu_scores.append(0.0)
        
        # ROUGE
        scores = rouge_scorer_obj.score(label.strip(), pred.strip())
        rouge1_scores.append(scores['rouge1'].fmeasure)
        rouge2_scores.append(scores['rouge2'].fmeasure)
        rougeL_scores.append(scores['rougeL'].fmeasure)

    # Log a few examples
    print("\n" + "="*50)
    for i, (p, l, s) in enumerate(zip(decoded_preds[:3], decoded_labels[:3], fuzzy_scores[:3])):
        print(f"\nExample {i+1}:")
        print(f"PRED: {p[:100]}...")
        print(f"LABEL: {l[:100]}...")
        print(f"FUZZY SIMILARITY: {s:.2f}")
    print("="*50 + "\n")

    return {
        "fuzzy_match_score": sum(fuzzy_scores) / len(fuzzy_scores),
        "exact_match_accuracy": sum(p.strip() == l.strip() for p, l in zip(decoded_preds, decoded_labels)) / len(decoded_preds),
        "bleu": sum(bleu_scores) / len(bleu_scores) if bleu_scores else 0.0,
        "rouge1": sum(rouge1_scores) / len(rouge1_scores),
        "rouge2": sum(rouge2_scores) / len(rouge2_scores),
        "rougeL": sum(rougeL_scores) / len(rougeL_scores),
    }


def generate_predictions(model, tokenizer, texts, device):
    """Generate predictions with custom parameters."""
    model.eval()
    inputs = tokenizer(texts, return_tensors="pt", padding=True, truncation=True, max_length=256)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=192,
            num_beams=4,
            temperature=0.7,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.2,
            length_penalty=1.0,
            early_stopping=True
        )
    
    return tokenizer.batch_decode(outputs, skip_special_tokens=True)


def main():
    """Main training function."""
    # Parse arguments
    args = parse_args()
    config = ModelConfig(
        model_name=args.model_name,
        batch_size=args.batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        num_epochs=args.num_epochs,
        learning_rate=args.learning_rate,
        # warmup_steps=args.warmup_steps,
        # eval_steps=args.eval_steps,
        # save_steps=args.save_steps,
        fp16=args.fp16,
        gradient_checkpointing=args.gradient_checkpointing,
        use_wandb=args.use_wandb
    )
    
    # Initialize wandb if requested
    if config.use_wandb:
        wandb.init(
            project="t5-finetuning",
            name=f"{config.model_name.split('/')[-1]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            config=config.__dict__
        )
    
    try:
        # Load and split dataset
        print(f"Loading dataset from {args.train_path}")
        with open(args.train_path, "r", encoding="utf-8") as f:
            train_data = json.load(f)

        print(f"Loading dataset from {args.val_path}")
        with open(args.val_path, "r", encoding="utf-8") as f:
            val_data = json.load(f)

        print(f"Loading dataset from {args.test_path}")
        with open(args.test_path, "r", encoding="utf-8") as f:
            test_data = json.load(f)
        
        # Split into train/val/test (80/10/10)
        # total_size = len(data)
        # train_size = int(0.8 * total_size)
        # val_size = int(0.1 * total_size)
        
        train_data = train_data[:30000]
        # val_data = data[train_size:train_size + val_size]
        # test_data = data[train_size + val_size:]
        
        print(f"Dataset sizes - Train: {len(train_data)}, Val: {len(val_data)}, Test: {len(test_data)}")
        
        # Create datasets
        train_dataset = Dataset.from_list(train_data)
        val_dataset = Dataset.from_list(val_data)
        test_dataset = Dataset.from_list(test_data)

        # Initialize tokenizer and model
        print(f"Loading model and tokenizer: {config.model_name}")
        tokenizer = T5Tokenizer.from_pretrained(config.model_name, legacy=False, use_fast=True)
        model = T5ForConditionalGeneration.from_pretrained(config.model_name)
        
        # Enable gradient checkpointing if requested
        if config.gradient_checkpointing:
            model.gradient_checkpointing_enable()
        
        # Ensure pad_token is set
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        # Tokenize datasets
        tokenize_fn = partial(tokenize_batch, tokenizer=tokenizer, config=config)
        train_dataset = train_dataset.map(tokenize_fn, batched=True)
        val_dataset = val_dataset.map(tokenize_fn, batched=True)
        test_dataset = test_dataset.map(tokenize_fn, batched=True)

        # Shuffle datasets
        train_dataset = train_dataset.shuffle(seed=42)
        val_dataset = val_dataset.shuffle(seed=42)
        test_dataset = test_dataset.shuffle(seed=42)

        # Training arguments
        training_args = Seq2SeqTrainingArguments(
            output_dir=args.output_dir,
            per_device_train_batch_size=config.batch_size,
            per_device_eval_batch_size=config.batch_size,
            gradient_accumulation_steps=config.gradient_accumulation_steps,
            num_train_epochs=config.num_epochs,
            learning_rate=config.learning_rate,
            # warmup_steps=config.warmup_steps,
            # eval_strategy="steps",
            # eval_steps=config.eval_steps,
            # save_strategy="steps",
            # save_steps=config.save_steps,
            save_total_limit=3,
            load_best_model_at_end=False, # REMMEBER TO SET IT BACK TO TRUE WHEN MID EVALUATING DURING TRAINING
            metric_for_best_model="fuzzy_match_score",
            greater_is_better=True,
            predict_with_generate=True,
            generation_max_length=160,
            generation_num_beams=4,
            label_smoothing_factor=0.1,
            fp16=config.fp16,
            logging_dir=f"{args.output_dir}/logs",
            logging_steps=50,
            report_to=["wandb"] if config.use_wandb else ["tensorboard"],
            run_name=f"t5_run_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            push_to_hub=False,
            remove_unused_columns=True,
        )

        # Data collator with dynamic padding
        data_collator = DataCollatorForSeq2Seq(
            tokenizer=tokenizer,
            model=model,
            padding=True,
            label_pad_token_id=-100
        )

        # Initialize trainer with callbacks
        trainer = Seq2SeqTrainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=val_dataset,
            data_collator=data_collator,
            tokenizer=tokenizer,
            compute_metrics=partial(compute_metrics, tokenizer=tokenizer),
        )

        # Train the model
        print("Starting training...")
        trainer.train()
        
        # Evaluate on test set
        print("Evaluating on test set...")
        test_results = trainer.evaluate(eval_dataset=test_dataset)
        print(f"Test results: {test_results}")
        
        # Save final model
        final_model_path = f"{args.output_dir}/final_model"
        print(f"Saving final model to {final_model_path}")
        trainer.save_model(final_model_path)
        tokenizer.save_pretrained(final_model_path)
        
        # Save metrics
        metrics_path = f"{args.output_dir}/final_metrics.json"
        with open(metrics_path, "w") as f:
            json.dump(test_results, f, indent=2)
        print(f"Metrics saved to {metrics_path}")
        
        # Test generation on a few examples
        print("\nTesting generation on sample inputs...")
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        
        sample_texts = [ex["input_text"] for ex in test_data[:3]]
        predictions = generate_predictions(model, tokenizer, sample_texts, device)
        
        print("\nSample generations:")
        for i, (inp, pred) in enumerate(zip(sample_texts, predictions)):
            print(f"\nExample {i+1}:")
            print(f"Input: {inp}")
            print(f"Generated: {pred}")
        
        if config.use_wandb:
            wandb.finish()
            
    except Exception as e:
        print(f"Training failed: {e}")
        # Save emergency checkpoint if possible
        if 'trainer' in locals():
            emergency_path = f"{args.output_dir}/emergency_checkpoint"
            trainer.save_model(emergency_path)
            print(f"Emergency checkpoint saved to {emergency_path}")
        raise


if __name__ == "__main__":
    main()