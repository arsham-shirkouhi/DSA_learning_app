import json
import torch
import argparse
import wandb
import random
import numpy as np
from datetime import datetime
from functools import partial
from dataclasses import dataclass
from datasets import Dataset, load_dataset
from transformers import (
    T5ForConditionalGeneration,
    T5Tokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling,
    EarlyStoppingCallback
)
from typing import List, Dict, Any


@dataclass
class PreTrainingConfig:
    """Configuration class for pre-training parameters."""
    model_name: str = "t5-base"
    max_length: int = 512
    batch_size: int = 8
    gradient_accumulation_steps: int = 4
    num_epochs: int = 3
    learning_rate: float = 1e-4  # Lower for continue pre-training
    warmup_steps: int = 1000
    save_steps: int = 2000
    eval_steps: int = 1000
    fp16: bool = True
    gradient_checkpointing: bool = True
    use_wandb: bool = True
    # T5 span corruption parameters
    noise_density: float = 0.15  # 15% of tokens masked
    mean_noise_span_length: float = 3.0  # Average span length


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Pre-train T5 model on raw documentation")
    parser.add_argument("--model_name", type=str, default="t5-base")
    parser.add_argument("--data_path", type=str, default="datasets/java_corpus.txt", help="Path to raw text file(s)")
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=4)
    parser.add_argument("--num_epochs", type=int, default=3)
    parser.add_argument("--learning_rate", type=float, default=1e-4)
    parser.add_argument("--warmup_steps", type=int, default=1000)
    parser.add_argument("--eval_steps", type=int, default=1000)
    parser.add_argument("--save_steps", type=int, default=2000)
    parser.add_argument("--fp16", action="store_true", help="Use mixed precision training")
    parser.add_argument("--gradient_checkpointing", action="store_true", help="Use gradient checkpointing")
    parser.add_argument("--use_wandb", action="store_true", help="Use Weights & Biases for logging")
    parser.add_argument("--output_dir", type=str, default="./trained_models/t5_pretrained_model")
    parser.add_argument("--noise_density", type=float, default=0.15, help="Fraction of tokens to mask")
    parser.add_argument("--mean_noise_span_length", type=float, default=3.0, help="Average span length")
    return parser.parse_args()


def load_raw_text_data(data_path: str) -> List[str]:
    """Load raw text data from file(s)."""
    texts = []
    
    if data_path.endswith('.txt'):
        # Single text file
        with open(data_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Split into chunks (paragraphs or sections)
            chunks = content.split('\n\n')
            texts.extend([chunk.strip() for chunk in chunks if chunk.strip()])
    
    elif data_path.endswith('.jsonl'):
        # JSONL file where each line has a 'text' field
        with open(data_path, 'r', encoding='utf-8') as f:
            for line in f:
                data = json.loads(line)
                if 'text' in data:
                    texts.append(data['text'])
    
    else:
        # Directory of text files
        import os
        if os.path.isdir(data_path):
            for filename in os.listdir(data_path):
                if filename.endswith('.txt'):
                    filepath = os.path.join(data_path, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        chunks = content.split('\n\n')
                        texts.extend([chunk.strip() for chunk in chunks if chunk.strip()])
    
    # Filter out very short texts
    texts = [text for text in texts if len(text.split()) > 10]
    return texts


def random_spans_noise_mask(length: int, noise_density: float, mean_noise_span_length: float) -> np.ndarray:
    """Generate random spans mask for T5 span corruption."""
    # Calculate number of tokens to mask
    num_noise_tokens = int(np.round(length * noise_density))
    num_nonnoise_tokens = length - num_noise_tokens
    
    # Avoid degenerate cases
    if num_noise_tokens == 0 or num_nonnoise_tokens == 0:
        return np.zeros(length, dtype=bool)
    
    # Calculate number of spans
    num_noise_spans = int(np.round(num_noise_tokens / mean_noise_span_length))
    num_noise_spans = max(1, num_noise_spans)
    
    # Generate spans
    span_starts = np.random.choice(length, size=num_noise_spans, replace=False)
    span_starts = np.sort(span_starts)
    
    mask = np.zeros(length, dtype=bool)
    for start in span_starts:
        # Random span length
        span_length = np.random.poisson(mean_noise_span_length)
        span_length = max(1, span_length)
        end = min(start + span_length, length)
        mask[start:end] = True
        
        # Stop if we've masked enough tokens
        if np.sum(mask) >= num_noise_tokens:
            break
    
    return mask


def create_sentinel_ids(vocab_size: int, num_sentinels: int) -> List[int]:
    """Create sentinel token IDs for T5."""
    # T5 uses special sentinel tokens <extra_id_0>, <extra_id_1>, etc.
    # These are typically the last tokens in the vocabulary
    return list(range(vocab_size - num_sentinels, vocab_size))


def span_corruption(
    tokens: List[int], 
    tokenizer, 
    noise_density: float = 0.15, 
    mean_noise_span_length: float = 3.0
) -> Dict[str, List[int]]:
    """Apply T5 span corruption to input tokens."""
    if len(tokens) < 5:  # Too short to corrupt meaningfully
        return {
            'input_ids': tokens,
            'labels': [tokenizer.pad_token_id]
        }
    
    # Generate noise mask
    mask = random_spans_noise_mask(len(tokens), noise_density, mean_noise_span_length)
    
    if not np.any(mask):  # No tokens to mask
        return {
            'input_ids': tokens,
            'labels': [tokenizer.pad_token_id]
        }
    
    # Get sentinel tokens
    sentinel_ids = create_sentinel_ids(tokenizer.vocab_size, 100)  # T5 has 100 sentinel tokens
    
    # Create corrupted input and targets
    input_tokens = []
    target_tokens = []
    
    sentinel_idx = 0
    i = 0
    
    while i < len(tokens):
        if mask[i]:
            # Start of a masked span
            span_start = i
            while i < len(tokens) and mask[i]:
                i += 1
            span_end = i
            
            # Add sentinel to input
            if sentinel_idx < len(sentinel_ids):
                sentinel_token = sentinel_ids[sentinel_idx]
                input_tokens.append(sentinel_token)
                
                # Add sentinel and original tokens to target
                target_tokens.append(sentinel_token)
                target_tokens.extend(tokens[span_start:span_end])
                
                sentinel_idx += 1
        else:
            # Non-masked token
            input_tokens.append(tokens[i])
            i += 1
    
    # Add final EOS to target
    target_tokens.append(tokenizer.eos_token_id)
    
    return {
        'input_ids': input_tokens,
        'labels': target_tokens
    }


def preprocess_function(examples: Dict[str, List[str]], tokenizer, config: PreTrainingConfig) -> Dict[str, List[List[int]]]:
    """Preprocess raw text with span corruption."""
    batch_input_ids = []
    batch_labels = []
    
    for text in examples['text']:
        # Tokenize
        tokens = tokenizer.encode(text, max_length=config.max_length, truncation=True)
        
        # Apply span corruption
        corrupted = span_corruption(
            tokens, 
            tokenizer, 
            config.noise_density, 
            config.mean_noise_span_length
        )
        
        batch_input_ids.append(corrupted['input_ids'])
        batch_labels.append(corrupted['labels'])
    
    return {
        'input_ids': batch_input_ids,
        'labels': batch_labels
    }


class T5DataCollator:
    """Custom data collator for T5 pre-training."""
    
    def __init__(self, tokenizer, max_length=512):
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __call__(self, features: List[Dict[str, List[int]]]) -> Dict[str, torch.Tensor]:
        # Pad input_ids
        input_ids = [f['input_ids'] for f in features]
        input_ids = self._pad_sequences(input_ids, self.tokenizer.pad_token_id)
        
        # Pad labels
        labels = [f['labels'] for f in features]
        labels = self._pad_sequences(labels, -100)
        
        # Create attention mask
        attention_mask = (input_ids != self.tokenizer.pad_token_id).long()
        
        return {
            'input_ids': input_ids,
            'attention_mask': attention_mask,
            'labels': labels
        }
    
    def _pad_sequences(self, sequences: List[List[int]], pad_token_id: int) -> torch.Tensor:
        max_len = min(max(len(seq) for seq in sequences), self.max_length)
        padded = []
        
        for seq in sequences:
            if len(seq) > max_len:
                seq = seq[:max_len]
            else:
                seq = seq + [pad_token_id] * (max_len - len(seq))
            padded.append(seq)
        
        return torch.tensor(padded, dtype=torch.long)


def compute_metrics(eval_preds):
    """Compute perplexity for evaluation."""
    predictions, labels = eval_preds
    
    # Get logits and flatten
    if isinstance(predictions, tuple):
        predictions = predictions[0]
    
    # Calculate loss manually for perplexity
    predictions = torch.from_numpy(predictions)
    labels = torch.from_numpy(labels)
    
    # Reshape for loss calculation
    shift_logits = predictions[..., :-1, :].contiguous()
    shift_labels = labels[..., 1:].contiguous()
    
    # Flatten
    shift_logits = shift_logits.view(-1, shift_logits.size(-1))
    shift_labels = shift_labels.view(-1)
    
    # Calculate cross entropy loss
    loss_fct = torch.nn.CrossEntropyLoss(ignore_index=-100)
    loss = loss_fct(shift_logits, shift_labels)
    
    perplexity = torch.exp(loss)
    
    return {"perplexity": perplexity.item()}


def main():
    """Main pre-training function."""
    args = parse_args()
    config = PreTrainingConfig(
        model_name=args.model_name,
        batch_size=args.batch_size,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        num_epochs=args.num_epochs,
        learning_rate=args.learning_rate,
        warmup_steps=args.warmup_steps,
        eval_steps=args.eval_steps,
        save_steps=args.save_steps,
        fp16=args.fp16,
        gradient_checkpointing=args.gradient_checkpointing,
        use_wandb=args.use_wandb,
        noise_density=args.noise_density,
        mean_noise_span_length=args.mean_noise_span_length
    )
    
    # Initialize wandb
    if config.use_wandb:
        wandb.init(
            project="t5-pretraining",
            name=f"{config.model_name.replace('/', '-')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            config=config.__dict__
        )
    
    # Load raw text data
    print(f"Loading raw text data from {args.data_path}")
    texts = load_raw_text_data(args.data_path)
    print(f"Loaded {len(texts)} text chunks")
    
    # Split into train/validation
    random.shuffle(texts)
    split_idx = int(0.95 * len(texts))
    train_texts = texts[:split_idx]
    val_texts = texts[split_idx:]
    
    print(f"Train: {len(train_texts)}, Validation: {len(val_texts)}")
    
    # Create datasets
    train_dataset = Dataset.from_dict({'text': train_texts})
    val_dataset = Dataset.from_dict({'text': val_texts})
    
    # Load tokenizer and model
    print(f"Loading model and tokenizer: {config.model_name}")
    tokenizer = T5Tokenizer.from_pretrained(config.model_name)
    model = T5ForConditionalGeneration.from_pretrained(config.model_name)
    
    if config.gradient_checkpointing:
        model.gradient_checkpointing_enable()
    
    # Preprocess datasets
    preprocess_fn = partial(preprocess_function, tokenizer=tokenizer, config=config)
    train_dataset = train_dataset.map(preprocess_fn, batched=True, remove_columns=['text'])
    val_dataset = val_dataset.map(preprocess_fn, batched=True, remove_columns=['text'])
    
    # Create data collator
    data_collator = T5DataCollator(tokenizer, max_length=config.max_length)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=config.batch_size,
        per_device_eval_batch_size=config.batch_size,
        gradient_accumulation_steps=config.gradient_accumulation_steps,
        num_train_epochs=config.num_epochs,
        learning_rate=config.learning_rate,
        warmup_steps=config.warmup_steps,
        eval_strategy="steps",
        eval_steps=config.eval_steps,
        save_strategy="steps",
        save_steps=config.save_steps,
        save_total_limit=3,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        fp16=config.fp16,
        logging_dir=f"{args.output_dir}/logs",
        logging_steps=100,
        report_to=["wandb"] if config.use_wandb else ["tensorboard"],
        run_name=f"t5_pretrain_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        dataloader_drop_last=True,
        remove_unused_columns=False,
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )
    
    # Train
    print("Starting pre-training...")
    trainer.train()
    
    # Save final model
    final_model_path = f"{args.output_dir}/final_model"
    print(f"Saving final model to {final_model_path}")
    trainer.save_model(final_model_path)
    tokenizer.save_pretrained(final_model_path)
    
    # Test the model
    print("\nTesting span corruption...")
    sample_text = train_texts[0][:200]  # First 200 chars
    tokens = tokenizer.encode(sample_text)
    corrupted = span_corruption(tokens, tokenizer, config.noise_density, config.mean_noise_span_length)
    
    print(f"Original: {tokenizer.decode(tokens)}")
    print(f"Corrupted input: {tokenizer.decode(corrupted['input_ids'])}")
    print(f"Target: {tokenizer.decode(corrupted['labels'])}")
    
    if config.use_wandb:
        wandb.finish()


if __name__ == "__main__":
    main()