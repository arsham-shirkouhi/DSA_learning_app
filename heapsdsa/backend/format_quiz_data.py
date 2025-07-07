# import json
# import os
# import re

# def parse_target_text(target_text):
#     """Parse the target_text to extract question, code, choices, and answer with comprehensive format handling"""
    
#     # Try multiple patterns to find choices section
#     choices_patterns = [
#         ", Choices:",
#         "Choices:",
#         ", , Choices:",  # Handle double comma case
#         "Choices :",     # Handle space before colon
#         "choices:",      # Lowercase
#         "Choices",       # Without colon
#     ]
    
#     choices_index = -1
#     for pattern in choices_patterns:
#         choices_index = target_text.find(pattern)
#         if choices_index != -1:
#             break
    
#     # If no choices pattern found, try to find answer pattern and work backwards
#     if choices_index == -1:
#         answer_patterns = [
#             ", Answer:",
#             "Answer:",
#             ", , Answer:",
#             "Answer :",
#             "answer:",
#             "Answer",
#         ]
        
#         answer_index = -1
#         for pattern in answer_patterns:
#             answer_index = target_text.find(pattern)
#             if answer_index != -1:
#                 break
        
#         if answer_index != -1:
#             # Found answer but no choices - treat everything before answer as question
#             question_part = target_text[:answer_index].strip()
#             answer_part = target_text[answer_index:].strip()
#             choices = []
#         else:
#             # No patterns found - treat entire text as question
#             return {
#                 'question': target_text,
#                 'code': None,
#                 'choices': [],
#                 'answer': ''
#             }
#     else:
#         # Found choices pattern
#         question_part = target_text[:choices_index].strip()
#         choices_answer_part = target_text[choices_index:].strip()
        
#         # Try multiple patterns to find answer section
#         answer_patterns = [
#             ", Answer:",
#             "Answer:",
#             ", , Answer:",
#             "Answer :",
#             "answer:",
#             "Answer",
#         ]
        
#         answer_index = -1
#         for pattern in answer_patterns:
#             answer_index = choices_answer_part.find(pattern)
#             if answer_index != -1:
#                 break
        
#         if answer_index == -1:
#             # Found choices but no answer - treat everything after choices as answer
#             choices_str = choices_answer_part
#             answer_part = ""
#         else:
#             # Extract choices string - remove the choices pattern prefix
#             choices_str = choices_answer_part[:answer_index]
#             for pattern in choices_patterns:
#                 if choices_str.startswith(pattern):
#                     choices_str = choices_str[len(pattern):].strip()
#                     break
            
#             # Extract answer string - remove the answer pattern prefix
#             answer_part = choices_answer_part[answer_index:]
#             for pattern in answer_patterns:
#                 if answer_part.startswith(pattern):
#                     answer_part = answer_part[len(pattern):].strip()
#                     break
        
#         # Parse choices - handle all possible label formats
#         choices = []
#         # Standard format ['A\nchoice1', ...]
#         if choices_str.startswith('[') and choices_str.endswith(']'):
#             choices_content = choices_str[1:-1]
#             raw_choices = choices_content.split("', '")
#             for choice in raw_choices:
#                 clean_choice = choice.strip().strip("'")
#                 if '\\n' in clean_choice:
#                     clean_choice = clean_choice.split('\\n', 1)[1]
#                 choices.append(clean_choice)
#         elif choices_str:
#             # Regex for all label formats: a), a., a:, (a), a ), etc.
#             label_regex = r"[\(\[]?([a-zA-Z])[\)\]\.: ]+"
#             matches = list(re.finditer(label_regex, choices_str))
#             if matches:
#                 for i, match in enumerate(matches):
#                     start = match.end()
#                     end = matches[i+1].start() if i+1 < len(matches) else len(choices_str)
#                     choice_text = choices_str[start:end].strip().strip(",'")
#                     choices.append(choice_text)
#             else:
#                 # Last resort: split by commas and clean up
#                 raw_choices = choices_str.split(',')
#                 choices = [choice.strip().strip("'\"") for choice in raw_choices if choice.strip()]
    
#     # Check if there's code in the question
#     code = None
#     question = question_part
    
#     # Look for code blocks (marked by #include or other code indicators)
#     if '#include' in question_part or 'using namespace' in question_part:
#         code_indicators = ['#include', 'using namespace', 'void', 'int main', 'cout', 'printf']
#         for indicator in code_indicators:
#             if indicator in question_part:
#                 indicator_pos = question_part.find(indicator)
#                 comma_pos = question_part.rfind(',', 0, indicator_pos)
#                 if comma_pos != -1:
#                     question = question_part[:comma_pos].strip()
#                     code = question_part[comma_pos + 1:].strip()
#                     break
    
#     # Clean up the answer
#     answer = ""
#     if answer_part:
#         if '\\n' in answer_part:
#             answer_letter = answer_part.split('\\n')[0]
#             answer = answer_letter.upper()  # Convert to uppercase
#         else:
#             answer = answer_part.upper()  # Convert to uppercase
#         if len(answer) > 1:
#             answer = answer[0]
    
#     return {
#         'question': question,
#         'code': code,
#         'choices': choices,
#         'answer': answer
#     }

# def format_question(question_data):
#     """Format a single question into a clean, consistent string, with blank fields if missing or parsing fails."""
#     parsed = parse_target_text(question_data['target_text'])
#     if not parsed:
#         question = ''
#         code = ''
#         choices = []
#         answer = ''
#     else:
#         question = parsed.get('question', '') or ''
#         code = parsed.get('code', '') or ''
#         choices = parsed.get('choices', []) or []
#         answer = parsed.get('answer', '') or ''
#     formatted = f"Question: {question}\n"
#     formatted += f"Code: {code}\n"
#     formatted += "Choices:\n"
#     for i, choice in enumerate(choices):
#         letter = chr(65 + i)  # Always output A), B), C), ...
#         formatted += f"{letter}) {choice}\n"
#     if not choices:
#         formatted += "N/A\n"
#     formatted += f"Answer: {answer}\n"
#     return formatted

# def process_quiz_data():
#     # Read the original quiz data
#     script_dir = os.path.dirname(os.path.abspath(__file__))
#     input_file = os.path.join(script_dir, "datasets", "quiz_data_generation_format.json")
#     output_file = os.path.join(script_dir, "datasets", "final_quiz_questions.json")
#     try:
#         with open(input_file, 'r', encoding='utf-8') as f:
#             quiz_data = json.load(f)
#         formatted_questions = []
#         for question in quiz_data:
#             formatted_question = format_question(question)
#             formatted_questions.append({
#                 "input_text": question["input_text"],
#                 "target_text": formatted_question
#             })
#         with open(output_file, 'w', encoding='utf-8') as f:
#             json.dump(formatted_questions, f, indent=2, ensure_ascii=False)
#         print(f"✅ Processed {len(formatted_questions)} questions (all included)")
#         print(f"📁 Output saved to: {output_file}")
#         if formatted_questions:
#             print("\n📝 Sample formatted question:")
#             print("=" * 50)
#             print(formatted_questions[0]["target_text"])
#             print("=" * 50)
#     except FileNotFoundError:
#         print(f"❌ Error: Could not find {input_file}")
#     except json.JSONDecodeError:
#         print(f"❌ Error: Invalid JSON in {input_file}")
#     except Exception as e:
#         print(f"❌ Error: {str(e)}")

# def parse_quiz_data(input_file, output_file):
#     """
#     Parse quiz data and process 100 questions at a time with comments.
#     """
#     try:
#         with open(input_file, 'r', encoding='utf-8') as f:
#             data = json.load(f)
#     except FileNotFoundError:
#         print(f"Error: Input file '{input_file}' not found.")
#         return
#     except json.JSONDecodeError as e:
#         print(f"Error: Invalid JSON in input file: {e}")
#         return

#     print(f"Loaded {len(data)} items from input file")
#     formatted_questions = []
    
#     for i, item in enumerate(data):
#         target_text = item.get('target_text', '')
        
#         # Simple parsing - find Choices: and extract parts
#         if "Choices:" not in target_text:
#             continue
            
#         # Split at Choices:
#         parts = target_text.split("Choices:", 1)
#         if len(parts) != 2:
#             continue
            
#         question_code_part = parts[0].strip()
#         choices_answer_part = parts[1].strip()
        
#         # Extract question and code
#         question = ""
#         code = ""
        
#         if "," in question_code_part:
#             split_parts = question_code_part.split(",", 1)
#             question = split_parts[0].strip()
#             if len(split_parts) > 1:
#                 code = split_parts[1].strip()
#         else:
#             question = question_code_part.strip()
        
#         # Extract choices
#         choices = []
#         bracket_start = choices_answer_part.find("[")
#         bracket_end = choices_answer_part.find("], Answer:")
        
#         if bracket_start != -1 and bracket_end != -1:
#             choices_content = choices_answer_part[bracket_start + 1:bracket_end]
#             choice_strings = choices_content.split("', '")
            
#             for choice_str in choice_strings:
#                 choice_str = choice_str.strip("'")
#                 if "\\n" in choice_str:
#                     parts = choice_str.split("\\n", 1)
#                     if len(parts) == 2:
#                         label = parts[0].strip()
#                         text = parts[1].strip()
#                         choices.append(f"{label}) {text}")
#                     else:
#                         choices.append(choice_str)
#                 else:
#                     choices.append(choice_str)
        
#         # Extract answer
#         answer_match = re.search(r"Answer: ([A-Z])\\n", choices_answer_part)
#         if not answer_match:
#             continue
            
#         answer_letter = answer_match.group(1)
        
#         # Create formatted question
#         formatted_question = {
#             "Question": question,
#             "Choices": choices,
#             "Answer": answer_letter
#         }
        
#         if code and code.strip():
#             formatted_question["Code"] = code
            
#         formatted_questions.append(formatted_question)
        
#         # Add comment every 100 questions
#         if (i + 1) % 100 == 0:
#             comment = {"_comment": f"=== PROCESSED {i + 1} QUESTIONS ==="}
#             formatted_questions.append(comment)
    
#     print(f"Successfully parsed {len(formatted_questions)} items")
    
#     # Write formatted data to output file
#     try:
#         with open(output_file, 'w', encoding='utf-8') as f:
#             json.dump(formatted_questions, f, indent=2, ensure_ascii=False)
#         print(f"Successfully formatted questions to '{output_file}'")
#     except Exception as e:
#         print(f"Error writing output file: {e}")

# if __name__ == "__main__":
#     input_file = "datasets/quiz_data_generation_format.json"
#     output_file = "datasets/formatted_quiz_data.json"
#     parse_quiz_data(input_file, output_file) 

import json

def add_comments_to_json(input_file, output_file):
    """
    Simply add comments every 50 items to the JSON file for manual copy-pasting.
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found.")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in input file: {e}")
        return

    print(f"Loaded {len(data)} items from input file")
    
    # Write data with comments to output file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("[\n")
            
            for i, item in enumerate(data):
                # Add comment every 50 items
                if i > 0 and i % 50 == 0:
                    f.write(f"  // === PROCESSED {i} ITEMS ===\n")
                
                # Write the item
                json_str = json.dumps(item, indent=2, ensure_ascii=False)
                # Add comma if not the last item
                if i < len(data) - 1:
                    json_str = json_str.rstrip() + ","
                f.write(json_str + "\n")
            
            f.write("]\n")
            
        print(f"Successfully added comments to '{output_file}'")
    except Exception as e:
        print(f"Error writing output file: {e}")

if __name__ == "__main__":
    input_file = "datasets/quiz_data_generation_format.json"
    output_file = "datasets/commented_quiz_data.json"
    add_comments_to_json(input_file, output_file) 