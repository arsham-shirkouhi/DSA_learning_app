from transformers import (
    T5ForConditionalGeneration,
    T5Tokenizer,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq
)
from datasets import Dataset
import json
import difflib
import torch


def main():
    # Load dataset
    with open('./datasets/final.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    dataset = Dataset.from_list(data)
    dataset = dataset.train_test_split(test_size=0.1)

    # Load tokenizer and model
    tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base", legacy=False, use_fast=True)
    model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")

    # Ensure padding token is set
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Tokenize
    tokenize_fn = build_tokenize_fn(tokenizer)
    tokenized = dataset.map(tokenize_fn, batched=True)
    tokenized_train = tokenized["train"].shuffle(seed=42)
    tokenized_eval = tokenized["test"].shuffle(seed=42)

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

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_eval,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=build_compute_metrics(tokenizer)
    )

    # Train and evaluate
    trainer.train()
    eval_results = trainer.evaluate()
    print(eval_results)


def build_tokenize_fn(tokenizer):
    def tokenize(examples):
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
    return tokenize


def build_compute_metrics(tokenizer):
    def compute_metrics(eval_preds):
        predictions, labels = eval_preds

        # Convert to numpy if tensor
        if isinstance(predictions, tuple):
            predictions = predictions[0]
        if isinstance(predictions, torch.Tensor):
            predictions = predictions.cpu().numpy()
        if isinstance(labels, torch.Tensor):
            labels = labels.cpu().numpy()

        # Clip token IDs to vocab range
        predictions = [
            [token if 0 <= token < tokenizer.vocab_size else tokenizer.pad_token_id for token in pred]
            for pred in predictions
        ]

        # Replace -100 with pad_token_id in labels
        labels = [
            [token if token != -100 else tokenizer.pad_token_id for token in label]
            for label in labels
        ]

        decoded_preds = tokenizer.batch_decode(predictions, skip_special_tokens=True)
        decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)

        scores = [
            difflib.SequenceMatcher(None, pred.strip(), label.strip()).ratio()
            for pred, label in zip(decoded_preds, decoded_labels)
        ]

        for p, l, s in zip(decoded_preds[:5], decoded_labels[:5], scores[:5]):
            print(f"\nPRED:\n{p.strip()}\nLABEL:\n{l.strip()}\nFUZZY SIMILARITY: {s:.2f}\n---")

        return {
            "fuzzy_match_score": sum(scores) / len(scores),
            "exact_match_accuracy": sum(p.strip() == l.strip() for p, l in zip(decoded_preds, decoded_labels)) / len(decoded_preds)
        }
    return compute_metrics


if __name__ == "__main__":
    main()
