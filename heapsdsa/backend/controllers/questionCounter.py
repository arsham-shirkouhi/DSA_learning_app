import json
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
questions = os.path.join(script_dir, "..", "datasets", "final_quiz_questions.json")

with open(questions, 'r', encoding='utf-8') as f:
    data = json.load(f)

# If the top‐level JSON is a list, this is the number of entries:
print(f"There are {len(data)} questions in the file.")