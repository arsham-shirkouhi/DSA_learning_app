import json
import os

def parse_target_text(target_text):
    """Parse the target_text to extract question, code, choices, and answer"""
    parts = target_text.split(', Choices: ')
    if len(parts) != 2:
        return None
    
    question_part = parts[0]
    choices_answer_part = parts[1]
    
    # Split choices and answer
    choices_answer_parts = choices_answer_part.split(', Answer: ')
    if len(choices_answer_parts) != 2:
        return None
    
    choices_str = choices_answer_parts[0]
    answer = choices_answer_parts[1]
    
    # Parse choices - handle the format ['A\\nchoice1', 'B\\nchoice2', ...]
    choices = []
    if choices_str.startswith('[') and choices_str.endswith(']'):
        choices_content = choices_str[1:-1]  # Remove brackets
        # Split by "', '" and clean up each choice
        raw_choices = choices_content.split("', '")
        for choice in raw_choices:
            # Remove quotes and clean up
            clean_choice = choice.strip().strip("'")
            # Remove the letter prefix (A\\n, B\\n, etc.)
            if '\\n' in clean_choice:
                clean_choice = clean_choice.split('\\n', 1)[1]
            choices.append(clean_choice)
    
    # Check if there's code in the question
    code = None
    question = question_part
    
    # Look for code blocks (marked by #include or other code indicators)
    if '#include' in question_part or 'using namespace' in question_part:
        # Split by the first comma to separate question from code
        question_code_parts = question_part.split(',', 1)
        if len(question_code_parts) == 2:
            question = question_code_parts[0]
            code = question_code_parts[1]
    
    # Clean up the answer - extract just the letter (A, B, C, or D)
    # The answer format is "A\nUnsorted array" so we need to get just "A"
    if '\\n' in answer:
        answer_letter = answer.split('\\n')[0]
        answer = answer_letter
    else:
        # If no \n, the answer might already be just the letter
        answer = answer
    
    # Ensure we only have the letter (A, B, C, or D)
    if len(answer) > 1:
        # If answer has more than one character, take just the first letter
        answer = answer[0]
    
    return {
        'question': question,
        'code': code,
        'choices': choices,
        'answer': answer
    }

def format_question(question_data):
    """Format a single question into a readable string"""
    # Parse the target_text
    parsed = parse_target_text(question_data['target_text'])
    if not parsed:
        return None  # Return None instead of error message
    
    formatted = f"Question: {parsed['question']}\n"
    
    # Add code block if present
    if parsed['code']:
        formatted += f"Code: {parsed['code']}\n"
    
    # Add choices
    formatted += "Choices:\n"
    choices = parsed['choices']
    for i, choice in enumerate(choices):
        letter = chr(65 + i)  # A, B, C, D...
        formatted += f"{letter}) {choice}\n"
    
    # Add answer
    formatted += f"Answer: {parsed['answer']}\n"
    
    return formatted

def process_quiz_data():
    # Read the original quiz data
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(script_dir, "datasets", "quiz_data_generation_format.json")
    output_file = os.path.join(script_dir, "datasets", "final_quiz_questions.json")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            quiz_data = json.load(f)
        
        # Format each question
        formatted_questions = []
        skipped_count = 0
        for question in quiz_data:
            formatted_question = format_question(question)
            if formatted_question is not None:  # Only include successfully parsed questions
                formatted_questions.append({
                    "input_text": question["input_text"],
                    "target_text": formatted_question
                })
            else:
                skipped_count += 1
        
        # Write to new file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(formatted_questions, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully processed {len(formatted_questions)} questions")
        if skipped_count > 0:
            print(f"⚠️  Skipped {skipped_count} questions that couldn't be parsed")
        print(f"📁 Output saved to: {output_file}")
        
        # Show a sample of the first question
        if formatted_questions:
            print("\n📝 Sample formatted question:")
            print("=" * 50)
            print(formatted_questions[0]["target_text"])
            print("=" * 50)
            
            # Debug: Show original data and parsed answer
            print("\n🔍 Debug - Original data:")
            print(quiz_data[0]["target_text"])
            print("\n🔍 Debug - Parsed answer:")
            parsed = parse_target_text(quiz_data[0]["target_text"])
            if parsed:
                print(f"Answer: '{parsed['answer']}'")
            print("=" * 50)
            
    except FileNotFoundError:
        print(f"❌ Error: Could not find {input_file}")
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON in {input_file}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    process_quiz_data() 