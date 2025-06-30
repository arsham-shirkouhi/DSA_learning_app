from transformers import BartForConditionalGeneration
from transformers import BartTokenizer
from transformers import Seq2SeqTrainer, Seq2SeqTrainingArguments
from datasets import Dataset
import json

def main():
    global tokenizer
    
    with open("./datasets/quiz_data_generation_format.json") as f:
        data = json.load(f)
        
    dataset = Dataset.from_list(data)
    dataset = dataset.train_test_split(test_size=0.2)
    
    tokenizer = BartTokenizer.from_pretrained("facebook/bart-base")
    model = BartForConditionalGeneration.from_pretrained("facebook/bart-base")
    
    tokenized = dataset.map(tokenize, batched=True)
    tokenized_train = tokenized["train"]
    tokenized_eval = tokenized["test"]

    training_args = Seq2SeqTrainingArguments(
    output_dir="./outputs_bart",
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    num_train_epochs=10,
    save_strategy="epoch",
    learning_rate=5e-5,
    predict_with_generate=True,
    logging_dir="./logs_bart",
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_eval,
        tokenizer=tokenizer,
    )
    
    trainer.train()
    eval_results = trainer.evaluate()
    print(eval_results)

def tokenize(examples):
    global tokenizer
    model_inputs = tokenizer(examples["input_text"], max_length=128, truncation=True, padding="max_length")
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(examples["target_text"], max_length=128, truncation=True, padding="max_length")
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

if __name__ == "__main__":
    main()