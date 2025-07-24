import json
import difflib
import torch
from functools import partial
from datasets import Dataset
from transformers import (
    T5ForConditionalGeneration,
    T5Tokenizer,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq
)


def tokenize_batch(examples, tokenizer):
    """Tokenize inputs and targets using the provided tokenizer."""
    inputs = tokenizer(
        examples["input_text"],
        max_length=256,
        truncation=True,
        padding="max_length"
    )
    targets = tokenizer(
        examples["target_text"],
        max_length=192,
        truncation=True,
        padding="max_length"
    )
    inputs["labels"] = targets["input_ids"]
    return inputs


def compute_metrics(eval_preds, tokenizer):
    """Compute fuzzy match and exact match metrics."""
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

    # Sequence‐matching scores
    scores = [
        difflib.SequenceMatcher(None, p.strip(), l.strip()).ratio()
        for p, l in zip(decoded_preds, decoded_labels)
    ]

    # Log a few examples
    for p, l, s in zip(decoded_preds[:5], decoded_labels[:5], scores[:5]):
        print(f"\nPRED:\n{p}\nLABEL:\n{l}\nFUZZY SIMILARITY: {s:.2f}\n---")

    return {
        "fuzzy_match_score": sum(scores) / len(scores),
        "exact_match_accuracy": sum(p.strip() == l.strip() for p, l in zip(decoded_preds, decoded_labels)) / len(decoded_preds)
    }


def main():
    # Load and split dataset
    with open("./datasets/cleaned.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    ds = Dataset.from_list(data).train_test_split(test_size=0.1)

    # Initialize tokenizer and model
    tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base", legacy=False, use_fast=True)
    model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")
    # Ensure pad_token is set
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Tokenize datasets with bound tokenizer
    tokenize_fn = partial(tokenize_batch, tokenizer=tokenizer)
    tokenized = ds.map(tokenize_fn, batched=True)

    train_ds = tokenized["train"].shuffle(seed=42)
    eval_ds  = tokenized["test"].shuffle(seed=42)

    # Training arguments
    training_args = Seq2SeqTrainingArguments(
        output_dir="./outputs_T5",
        per_device_train_batch_size=4,
        per_device_eval_batch_size=4,
        num_train_epochs=3,
        save_strategy="epoch",
        save_total_limit=2,
        learning_rate=5e-5,
        predict_with_generate=True,
        logging_dir="./logs_T5",
        logging_steps=50,
        generation_max_length=160,
        generation_num_beams=4,
        label_smoothing_factor=0.1,
        metric_for_best_model="fuzzy_match_score",
        greater_is_better=True,
    )

    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        model=model,
        label_pad_token_id=-100
    )

    # Seq2SeqTrainer with compute_metrics bound to tokenizer
    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        data_collator=data_collator,
        tokenizer=tokenizer,
        compute_metrics=partial(compute_metrics, tokenizer=tokenizer)
    )

    # Train and evaluate
    trainer.train()
    results = trainer.evaluate()
    print(results)


if __name__ == "__main__":
    main()
