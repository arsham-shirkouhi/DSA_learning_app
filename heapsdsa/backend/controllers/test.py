from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base").cuda()

batch_size = 16
max_input_length = 256

inputs = tokenizer(["Generate MCQ | Context: Lorem ipsum..."] * batch_size,
                   return_tensors="pt", padding=True, truncation=True, max_length=max_input_length).to("cuda")

with torch.no_grad():
    outputs = model.generate(**inputs, max_length=192)

print("Success with batch size:", batch_size)
