import json

questions = '../datasets/quiz_data.json'
with open(questions, 'r', encoding='utf-8') as f:
    data = json.load(f)

# If the top‐level JSON is a list, this is the number of entries:
print(f"There are {len(data)} questions in the file.")