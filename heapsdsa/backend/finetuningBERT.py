import torch
import torch.nn as nn
from transformers import BertModel, BertPreTrainedModel
from transformers import Trainer, TrainingArguments
from transformers import AutoTokenizer
import os
from dotenv import load_dotenv
from huggingface_hub import login
from datasets import Dataset
import json
import evaluate
import numpy as np
from sklearn.metrics import accuracy_score, f1_score

def main():
    global tokenizer, metric, TOPIC_LABELS, DIFFICULTY_LABELS
    TOPIC_LABELS = {
        "Array": 0,
        "Linked List": 1,
        "Stack": 2,
        "Queue": 3,
        "Heap": 4,
        "Hashing": 5,
        "Tree": 6,
        "Graph": 7,
        "String": 8,
        "Sorting": 9,
        "Search": 10,
        "Theory": 11
    }
    
    DIFFICULTY_LABELS = {
        "Easy": 0,
        "Medium": 1,
        "Hard": 2
    }

    load_dotenv()
    token = os.getenv("HF_TOKEN")

    deviceToGPU()
    login(token=token)


    with open("./datasets/quiz_data.json") as f:
        data = json.load(f)

    dataset = Dataset.from_list(data)
    dataset = dataset.train_test_split(test_size=0.2)

    tokenizer = AutoTokenizer.from_pretrained("google-bert/bert-base-cased")
    metric = evaluate.load("accuracy")
    dataset = dataset.map(map_labels)
    dataset = dataset.map(tokenize, batched=True)
    small_train = dataset["train"].shuffle(seed=42)#.select(range(1000))
    small_eval = dataset["test"].shuffle(seed=42)#.select(range(1000))

    trainer = config(small_train, small_eval)
    trainer.train()
    eval_results = trainer.evaluate()
    print("Evaluation Summary (Epoch {:.1f}):".format(eval_results["epoch"]))
    print(f"  📌 Eval Loss:           {eval_results['eval_loss']:.4f}")
    print(f"  🎯 Topic Accuracy:      {eval_results['eval_topic_acc']:.4f}")
    print(f"  🎯 Difficulty Accuracy: {eval_results['eval_difficulty_acc']:.4f}")
    print(f"  🧠 Topic F1:            {eval_results['eval_topic_f1']:.4f}")
    print(f"  🧠 Difficulty F1:       {eval_results['eval_difficulty_f1']:.4f}")
    print(f"  ⏱ Runtime:             {eval_results['eval_runtime']:.2f}s")

        
def map_labels(examples):
    examples["topic_label"] = TOPIC_LABELS[examples["topic_label"]]
    examples["difficulty_label"] = DIFFICULTY_LABELS[examples["difficulty_label"]]
    examples["labels"] = [examples["topic_label"], examples["difficulty_label"]]
    return examples
    
def tokenize(examples):
    global tokenizer
    return tokenizer(examples["input_text"], padding="max_length", truncation=True)

def compute_metrics(eval_pred):
    preds = eval_pred.predictions
    labels = eval_pred.label_ids

    topic_preds, diff_preds = preds
    topic_labels = labels[:, 0]  # first column
    diff_labels = labels[:, 1]   # second column

    topic_preds = np.argmax(topic_preds, axis=1)
    diff_preds = np.argmax(diff_preds, axis=1)

    return {
        "topic_acc": accuracy_score(topic_labels, topic_preds),
        "difficulty_acc": accuracy_score(diff_labels, diff_preds),
        "topic_f1": f1_score(topic_labels, topic_preds, average="macro"),
        "difficulty_f1": f1_score(diff_labels, diff_preds, average="macro")
    }

# checks if its training on gpu
def deviceToGPU():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    
def config(small_train, small_eval):
       # config for training
    training_args = TrainingArguments(
        output_dir="./outputs",
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=15,
        learning_rate=2e-5,
        eval_strategy="epoch",
        save_strategy="epoch",
        logging_dir="./logs",
        save_total_limit=2,
        dataloader_pin_memory=False,
        use_cpu=False
    )

    # initializing model
    model = TopicDifficultyClassifier.from_pretrained(
        "google-bert/bert-base-cased",
        topic_labels = 9,
        diff_labels = 3
    )

    # initializing trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=small_train,
        eval_dataset=small_eval,
        compute_metrics=compute_metrics
    )

    return trainer

class TopicDifficultyClassifier(BertPreTrainedModel):
    def __init__(self, config, diff_labels, topic_labels):
        super().__init__(config)
        self.base = BertModel(config)
        hidden_size = self.base.config.hidden_size
        self.dropout = nn.Dropout(0.1) # what is this for?
        self.diff_classifier_head = nn.Linear(hidden_size, diff_labels)
        self.topic_classifier_head = nn.Linear(hidden_size, topic_labels)
        
    def forward(self, input_ids=None, attention_mask=None, labels=None, **kwargs):
        outputs = self.base(input_ids=input_ids, attention_mask=attention_mask)
        cls_output = self.dropout(outputs.last_hidden_state[:, 0, :])

        topic_logits = self.topic_classifier_head(cls_output)
        diff_logits = self.diff_classifier_head(cls_output)

        loss = None
        if labels is not None:
            topic_labels = labels[:, 0]
            diff_labels = labels[:, 1]
            loss_fn = nn.CrossEntropyLoss()
            loss = loss_fn(diff_logits, diff_labels) + loss_fn(topic_logits, topic_labels)

        return {
            "loss": loss,
            "logits": (topic_logits, diff_logits)
        }


if __name__ == "__main__":
    main()