from huggingface_hub import login
from datasets import load_dataset
from transformers import Trainer
from transformers import TrainingArguments
from transformers import AutoTokenizer
from transformers import AutoModelForCausalLM
from transformers import BitsAndBytesConfig
import os
import numpy as np
import evaluate
import torch
from dotenv import load_dotenv

# Global variables - properly initialized
tokenizer = None
metric = None

def tokenize(examples):
    global tokenizer
    return tokenizer(examples["text"], padding="max_length", truncation=True)

def compute_metrics(eval_pred):
    global metric
    logits, labels = eval_pred
    # convert the logits to their predicted class
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)

def main():
    global tokenizer, metric
    
    # load variables from .env file
    load_dotenv()

    # get the token
    token = os.getenv("HF_TOKEN")

    # Check if CUDA is available and set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    print(f"CUDA available: {torch.cuda.is_available()}")

    # log in using the token
    login(token=token)

    dataset = load_dataset("yelp_review_full") # load dataset
    
    # Initialize tokenizer BEFORE using it
    tokenizer = AutoTokenizer.from_pretrained("google-bert/bert-base-cased")
    
    # Initialize metric BEFORE using it
    metric = evaluate.load("accuracy")

    dataset = dataset.map(tokenize, batched=True) # preprocess the entire dataset (tokenize, pad, and truncate)

    # Create smaller datasets for faster training/testing
    small_train = dataset["train"].shuffle(seed=42).select(range(1000))
    small_eval = dataset["test"].shuffle(seed=42).select(range(1000))
    '''
    print(f"Original train size: {len(dataset['train'])}")
    print(f"Small train size: {len(small_train)}")
    print(f"Original test size: {len(dataset['test'])}")   
    print(f"Small eval size: {len(small_eval)}")
    '''

    # config for quantization
    bnb_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16, bnb_4bit_quant_type="nf4", bnb_4bit_use_double_quant=True)
    
    # load model and move to GPU 
    model = AutoModelForCausalLM.from_pretrained(
        "google-bert/bert-base-cased",
        torch_dtype=torch.bfloat16,
        device_map="auto",
        quantization_config=bnb_config
    )
    model.to(device)  # Move model to GPU

    # Define training arguments with explicit device configuration
    training_args = TrainingArguments(
        output_dir="./results",
        eval_strategy="epoch",
        save_strategy="epoch",
        logging_dir="./logs",
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=3,
        logging_steps=100,
        dataloader_pin_memory=False,  # Sometimes helps with CUDA issues
        use_cpu=False,  # Explicitly disable CPU-only mode
    )

    # Initialize Trainer - Using positional arguments to avoid keyword conflicts
    trainer = Trainer(
        model,
        training_args,
        train_dataset=small_train,  # Use smaller dataset
        eval_dataset=small_eval,    # Use smaller dataset
        compute_metrics=compute_metrics
    )

    # Train the model
    trainer.train()

    # Evaluate the model
    eval_results = trainer.evaluate()
    print("Evaluation Accuracy:", eval_results["eval_accuracy"])

if __name__ == "__main__":
    main()