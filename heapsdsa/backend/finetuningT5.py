import json
import torch
import argparse
import random
import numpy as np
import difflib
from datasets import Dataset
from transformers import (
    T5ForConditionalGeneration,
    T5Tokenizer,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq,
    EarlyStoppingCallback
)
from rouge_score import rouge_scorer
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
import re

def set_seed(seed=42):
    """Set all random seeds."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_name", type=str, default="google/flan-t5-base")
    parser.add_argument("--batch_size", type=int, default=4)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=4)
    parser.add_argument("--learning_rate", type=float, default=3e-4)
    parser.add_argument("--num_epochs", type=int, default=5)
    parser.add_argument("--output_dir", type=str, default="./trained_model/outputs_optimized")
    parser.add_argument("--train_path", type=str, default="./datasets/RACE/race_train.json")
    parser.add_argument("--test_path", type=str, default="./datasets/RACE/race_test.json")
    parser.add_argument("--dev_path", type=str, default="./datasets/RACE/race_dev.json")
    parser.add_argument("--augment_data", action="store_true")
    parser.add_argument("--gradient_checkpointing", action="store_true")
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()

def augment_data(examples):
    """Simple but effective data augmentation."""
    augmented = []
    
    paraphrases = {
        "Which of the following": ["Which option", "Select the correct option"],
        "What is the": ["What's the", "Define the"],
        "time complexity": ["computational complexity", "runtime"],
        "space complexity": ["memory complexity", "storage requirement"],
        "worst case": ["worst-case scenario", "pessimistic case"],
        "best case": ["best-case scenario", "optimal case"],
    }
    
    for example in examples:
        augmented.append(example)
        
        # Create augmented versions
        if random.random() < 0.5:
            text = example["target_text"]
            
            # Apply one random paraphrase
            for original, replacements in paraphrases.items():
                if original in text:
                    replacement = random.choice(replacements)
                    new_text = text.replace(original, replacement)
                    
                    if new_text != text:
                        augmented.append({
                            "input_text": example["input_text"],
                            "target_text": new_text
                        })
                        break
        
        # Shuffle choices occasionally
        if "Choices:" in example["target_text"] and random.random() < 0.3:
            shuffled = shuffle_choices(example["target_text"])
            if shuffled and shuffled != example["target_text"]:
                augmented.append({
                    "input_text": example["input_text"],
                    "target_text": shuffled
                })
    
    return augmented

def shuffle_choices(text):
    """Shuffle MCQ choices while keeping the answer correct."""
    try:
        parts = text.split("Choices:")
        if len(parts) != 2:
            return None
            
        question_part = parts[0] + "Choices: "
        rest = parts[1]
        
        if "Answer:" not in rest:
            return None
            
        choices_part, answer_part = rest.split("Answer:")
        answer_letter = answer_part.strip()
        
        # Extract choices
        choices = re.findall(r'([a-d])\)\s*([^a-d\)]+)', choices_part)
        if len(choices) < 4:
            return None
            
        # Map old to content
        choice_map = {letter: content.strip() for letter, content in choices}
        correct_content = choice_map.get(answer_letter)
        
        if not correct_content:
            return None
            
        # Shuffle contents
        contents = list(choice_map.values())
        random.shuffle(contents)
        
        # Find new position of correct answer
        new_letters = ['a', 'b', 'c', 'd']
        new_answer = new_letters[contents.index(correct_content)]
        
        # Rebuild
        new_choices = " ".join([f"{new_letters[i]}) {contents[i]}" for i in range(len(contents))])
        return f"{question_part}{new_choices} Answer: {new_answer}"
        
    except:
        return None
def preprocess_function(examples, tokenizer, max_input_length=384, max_target_length=256):
    """Tokenize with better length handling."""
    inputs = tokenizer(
        examples["input_text"],
        max_length=max_input_length,
        truncation=True,
        padding="max_length",
    )
    
    targets = tokenizer(
        examples["target_text"],
        max_length=max_target_length,
        truncation=True,
        padding="max_length",
    )
    
    # This is to manually tokenize -- use data collator to automatically tokenize and remove the hassle of manually tweaking it
    # Replace padding token id's of labels by -100
    # targets["input_ids"] = [
    #     [(t if t != tokenizer.pad_token_id else -100) for t in target]
    #     for target in targets["input_ids"]
    # ]
    
    inputs["labels"] = targets["input_ids"]
    return inputs

def compute_metrics(eval_preds, tokenizer):
    """Comprehensive metrics."""
    preds, labels = eval_preds
    
    if isinstance(preds, tuple):
        preds = preds[0]
    
    # Decode
    decoded_preds = tokenizer.batch_decode(preds, skip_special_tokens=True)
    labels = np.where(labels != -100, labels, tokenizer.pad_token_id)
    decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)
    
    # Format validation
    format_scores = []
    for pred in decoded_preds:
        score = 0.0
        if "Question:" in pred:
            score += 0.25
        if "Choices:" in pred:
            score += 0.25
        if re.search(r'[a-d]\)', pred):
            score += 0.25
        if "Answer:" in pred and re.search(r'Answer:\s*[a-d]', pred):
            score += 0.25
        format_scores.append(score)
    
    # Fuzzy matching
    fuzzy_scores = []
    for pred, label in zip(decoded_preds, decoded_labels):
        score = difflib.SequenceMatcher(None, pred.strip(), label.strip()).ratio()
        fuzzy_scores.append(score)
    
    # BLEU
    smooth = SmoothingFunction().method1
    bleu_scores = []
    for pred, label in zip(decoded_preds, decoded_labels):
        try:
            score = sentence_bleu([label.split()], pred.split(), smoothing_function=smooth)
            bleu_scores.append(score)
        except:
            bleu_scores.append(0.0)
    
    # ROUGE
    rouge = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    rouge_scores = {'rouge1': [], 'rouge2': [], 'rougeL': []}
    
    for pred, label in zip(decoded_preds, decoded_labels):
        scores = rouge.score(label.strip(), pred.strip())
        rouge_scores['rouge1'].append(scores['rouge1'].fmeasure)
        rouge_scores['rouge2'].append(scores['rouge2'].fmeasure)
        rouge_scores['rougeL'].append(scores['rougeL'].fmeasure)
    
    # Print examples
    print("\n" + "="*50)
    for i in range(min(3, len(decoded_preds))):
        print(f"\nExample {i+1}:")
        print(f"Pred: {decoded_preds[i][:150]}...")
        print(f"Label: {decoded_labels[i][:150]}...")
        print(f"Format: {format_scores[i]:.2f}, Fuzzy: {fuzzy_scores[i]:.2f}")
    print("="*50 + "\n")
    
    return {
        "format_accuracy": np.mean(format_scores),
        "fuzzy_match": np.mean(fuzzy_scores),
        "exact_match": np.mean([p.strip() == l.strip() for p, l in zip(decoded_preds, decoded_labels)]),
        "bleu": np.mean(bleu_scores),
        "rouge1": np.mean(rouge_scores['rouge1']),
        "rouge2": np.mean(rouge_scores['rouge2']),
        "rougeL": np.mean(rouge_scores['rougeL']),
    }

def generate_samples(model, tokenizer, test_data, num_samples=5):
    """Generate sample outputs with post-processing."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()
    
    samples = random.sample(test_data, min(num_samples, len(test_data)))
    
    print("\n" + "="*50)
    print("Sample Generations:")
    print("="*50)
    
    for i, sample in enumerate(samples):
        inputs = tokenizer(sample["input_text"], return_tensors="pt", max_length=384, truncation=True)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=256,
                num_beams=8,
                temperature=0.8,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.2,
                no_repeat_ngram_size=3,
            )
        
        generated = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Post-process
        generated = post_process_output(generated)
        
        print(f"\nExample {i+1}:")
        print(f"Input: {sample['input_text']}")
        print(f"Generated: {generated}")
        print(f"Expected: {sample['target_text'][:150]}...")

def post_process_output(text):
    """Ensure proper MCQ format."""
    # Ensure Question: prefix
    if not text.strip().startswith("Question:"):
        text = "Question: " + text.strip()
    
    # Add Choices: if missing
    if "Choices:" not in text and re.search(r'[a-d]\)', text):
        match = re.search(r'([a-d]\))', text)
        if match:
            pos = match.start()
            text = text[:pos] + " Choices: " + text[pos:]
    
    # Ensure Answer: format
    if "Answer:" not in text:
        # Try to find answer pattern
        answer_match = re.search(r'\b([a-d])\s*$', text)
        if answer_match:
            text = text[:answer_match.start()] + f"Answer: {answer_match.group(1)}"
    
    return text.strip()

def main():
    args = parse_args()
    set_seed(args.seed)
    
    # Load training set
    print(f"Loading dataset from {args.train_path}")
    with open(args.train_path, "r", encoding="utf-8") as f:
        train_data = json.load(f)
        
    # Load validation set
    print(f"Loading dataset from {args.dev_path}")
    with open(args.dev_path, "r", encoding="utf-8") as f:
        val_data = json.load(f)
     
    # Load test set   
    print(f"Loading dataset from {args.test_path}")
    with open(args.test_path, "r", encoding="utf-8") as f:
        test_data = json.load(f)
    
    # Augment if requested
    if args.augment_data:
        print("Applying data augmentation...")
        original_size = len(data)
        data = augment_data(data)
        print(f"Dataset size: {original_size} -> {len(data)}")
    
    # Shuffle and split
    random.shuffle(data)
    train_size = int(0.8 * len(data))
    val_size = int(0.1 * len(data))
    
    random.shuffle(train_data)
    random.shuffle(val_data)
    random.shuffle(test_data)
    
    
    print(f"Splits - Train: {len(train_data)}, Val: {len(val_data)}, Test: {len(test_data)}")
    
    # Load model
    print(f"Loading model: {args.model_name}")
    tokenizer = T5Tokenizer.from_pretrained(args.model_name)
    model = T5ForConditionalGeneration.from_pretrained(args.model_name)
    
    # Configure
    tokenizer.pad_token = tokenizer.eos_token
    model.config.pad_token_id = tokenizer.pad_token_id
    
    if args.gradient_checkpointing and hasattr(model, "gradient_checkpointing_enable"):
        model.gradient_checkpointing_enable()
        print("Gradient checkpointing enabled")
    
    # Create datasets
    train_dataset = Dataset.from_list(train_data)
    val_dataset = Dataset.from_list(val_data)
    test_dataset = Dataset.from_list(test_data)
    
    # Tokenize
    print("Tokenizing datasets...")
    preprocess_fn = lambda x: preprocess_function(x, tokenizer)
    
    train_dataset = train_dataset.map(preprocess_fn, batched=True, remove_columns=["input_text", "target_text"])
    val_dataset = val_dataset.map(preprocess_fn, batched=True, remove_columns=["input_text", "target_text"])
    test_dataset = test_dataset.map(preprocess_fn, batched=True, remove_columns=["input_text", "target_text"])
    
    # Calculate steps
    total_steps = len(train_dataset) // (args.batch_size * args.gradient_accumulation_steps) * args.num_epochs
    eval_steps = max(50, total_steps // 10)  # Evaluate 10 times during training
    
    # Training arguments
    training_args = Seq2SeqTrainingArguments(
        output_dir=args.output_dir,
        overwrite_output_dir=True,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size * 2,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        num_train_epochs=args.num_epochs,
        learning_rate=args.learning_rate,
        warmup_steps=min(100, int(0.1 * total_steps)),
        lr_scheduler_type="cosine",
        weight_decay=0.01,
        eval_strategy="steps",
        eval_steps=eval_steps,
        save_steps=eval_steps,
        logging_steps=25,
        logging_first_step=True,
        save_total_limit=3,
        load_best_model_at_end=True,
        metric_for_best_model="fuzzy_match",
        greater_is_better=True,
        predict_with_generate=True,
        generation_max_length=256,
        generation_num_beams=8,
        fp16=torch.cuda.is_available(),  # Only use if CUDA available
        optim="adamw_torch",
        max_grad_norm=1.0,
        seed=args.seed,
        report_to="none",  # Disable wandb/tensorboard for simplicity
    )
    
    # Data collator
    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        model=model,
        pad_to_multiple_of=8,
        label_pad_token_id=-100
    )
    
    # Trainer
    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        data_collator=data_collator,
        tokenizer=tokenizer,
        compute_metrics=lambda x: compute_metrics(x, tokenizer),
        callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
    )
    
    # Train
    print(f"\nStarting training... Total steps: {total_steps}")
    trainer.train()
    
    # Evaluate on test set
    print("\nEvaluating on test set...")
    test_results = trainer.evaluate(eval_dataset=test_dataset)
    
    print("\nTest Results:")
    for key, value in test_results.items():
        if not key.startswith("eval_"):
            continue
        metric_name = key.replace("eval_", "")
        print(f"  {metric_name}: {value:.4f}")
    
    # Save model
    print(f"\nSaving model to {args.output_dir}/final_model")
    trainer.save_model(f"{args.output_dir}/final_model")
    tokenizer.save_pretrained(f"{args.output_dir}/final_model")
    
    # Save metrics
    with open(f"{args.output_dir}/test_results.json", "w") as f:
        json.dump(test_results, f, indent=2)
    
    # Generate samples
    generate_samples(model, tokenizer, test_data)
    
    print("\nTraining complete!")

if __name__ == "__main__":
    main()