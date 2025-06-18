from transformers import AutoModel, AutoTokenizer

model = "google-bert/bert-base-cased"
tokenizer = AutoTokenizer.from_pretrained(model)
model = AutoModel.from_pretrained(model, output_hidden_states=True)

print(model.config)