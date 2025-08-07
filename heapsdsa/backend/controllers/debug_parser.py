import json
import re

# Test with a single example from the file
test_target_text = "What will the output of the below code?, #include <iostream>\nusing namespace std;\n\nint main()\n{\n\n    int arr[2] = { 1, 2 };\n    cout << arr[0] << \", \" << arr[1] << endl;\n    return 0;\n}, Choices: ['A\\n1, 2', 'B\\nSyntax error', 'C\\nRun time error', 'D\\nNone'], Answer: A\n1, 2"

print("Original target_text:")
print(test_target_text)
print("\n" + "="*50 + "\n")

# Split by "Choices:" to separate question/code from choices/answer
parts = test_target_text.split("Choices:")
print(f"Parts after splitting by 'Choices:': {len(parts)}")
for i, part in enumerate(parts):
    print(f"Part {i}: {part[:100]}...")

if len(parts) == 2:
    question_part = parts[0].strip()
    choices_answer_part = parts[1].strip()
    
    print(f"\nQuestion part: {question_part}")
    print(f"Choices/Answer part: {choices_answer_part}")
    
    # Extract question and code
    question = ""
    code = ""
    
    if "," in question_part:
        question_code_parts = question_part.split(",", 1)
        question = question_code_parts[0].strip()
        if len(question_code_parts) > 1:
            code = question_code_parts[1].strip()
    else:
        question = question_part.strip()
    
    print(f"\nExtracted question: {question}")
    print(f"Extracted code: {code}")
    
    # Extract choices array
    choices_match = re.search(r"\[(.*?)\], Answer:", choices_answer_part, re.DOTALL)
    if choices_match:
        choices_str = choices_match.group(1)
        print(f"\nChoices string: {choices_str}")
        
        # Parse individual choices
        choices = []
        choice_strings = choices_str.split("', '")
        for choice_str in choice_strings:
            choice_str = choice_str.strip("'")
            if "\\n" in choice_str:
                label_text = choice_str.split("\\n", 1)
                if len(label_text) == 2:
                    label = label_text[0].strip()
                    text = label_text[1].strip()
                    choices.append(f"{label}) {text}")
                else:
                    choices.append(choice_str)
            else:
                choices.append(choice_str)
        
        print(f"Parsed choices: {choices}")
    else:
        print("No choices match found!")
    
    # Extract answer
    answer_match = re.search(r"Answer: ([A-Z])\\n(.*)", choices_answer_part)
    if answer_match:
        answer_letter = answer_match.group(1)
        answer_text = answer_match.group(2).strip()
        print(f"Answer letter: {answer_letter}")
        print(f"Answer text: {answer_text}")
    else:
        print("No answer match found!")
else:
    print("Could not split by 'Choices:'") 