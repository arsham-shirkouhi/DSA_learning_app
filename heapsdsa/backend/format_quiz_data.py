import json
import os

def parse_target_text(target_text):
    """Parse the target_text to extract question, code, choices, and answer with comprehensive format handling"""
    
    # Try multiple patterns to find choices section
    choices_patterns = [
        ", Choices:",
        "Choices:",
        ", , Choices:",  # Handle double comma case
        "Choices :",     # Handle space before colon
        "choices:",      # Lowercase
        "Choices",       # Without colon
    ]
    
    choices_index = -1
    for pattern in choices_patterns:
        choices_index = target_text.find(pattern)
        if choices_index != -1:
            break
    
    # If no choices pattern found, try to find answer pattern and work backwards
    if choices_index == -1:
        answer_patterns = [
            ", Answer:",
            "Answer:",
            ", , Answer:",
            "Answer :",
            "answer:",
            "Answer",
        ]
        
        answer_index = -1
        for pattern in answer_patterns:
            answer_index = target_text.find(pattern)
            if answer_index != -1:
                break
        
        if answer_index != -1:
            # Found answer but no choices - treat everything before answer as question
            question_part = target_text[:answer_index].strip()
            answer_part = target_text[answer_index:].strip()
            choices = []
        else:
            # No patterns found - treat entire text as question
            return {
                'question': target_text,
                'code': None,
                'choices': [],
                'answer': ''
            }
    else:
        # Found choices pattern
        question_part = target_text[:choices_index].strip()
        choices_answer_part = target_text[choices_index:].strip()
        
        # Try multiple patterns to find answer section
        answer_patterns = [
            ", Answer:",
            "Answer:",
            ", , Answer:",
            "Answer :",
            "answer:",
            "Answer",
        ]
        
        answer_index = -1
        for pattern in answer_patterns:
            answer_index = choices_answer_part.find(pattern)
            if answer_index != -1:
                break
        
        if answer_index == -1:
            # Found choices but no answer - treat everything after choices as answer
            choices_str = choices_answer_part
            answer_part = ""
        else:
            # Extract choices string - remove the choices pattern prefix
            choices_str = choices_answer_part[:answer_index]
            for pattern in choices_patterns:
                if choices_str.startswith(pattern):
                    choices_str = choices_str[len(pattern):].strip()
                    break
            
            # Extract answer string - remove the answer pattern prefix
            answer_part = choices_answer_part[answer_index:]
            for pattern in answer_patterns:
                if answer_part.startswith(pattern):
                    answer_part = answer_part[len(pattern):].strip()
                    break
        
        # Parse choices - handle various formats
        choices = []
        if choices_str.startswith('[') and choices_str.endswith(']'):
            # Standard format ['A\\nchoice1', 'B\\nchoice2', ...] or ['a\\nchoice1', 'b\\nchoice2', ...]
            choices_content = choices_str[1:-1]
            raw_choices = choices_content.split("', '")
            for choice in raw_choices:
                clean_choice = choice.strip().strip("'")
                if '\\n' in clean_choice:
                    clean_choice = clean_choice.split('\\n', 1)[1]
                choices.append(clean_choice)
        elif choices_str:
            # Try to extract choices from other formats
            # Look for patterns like A) choice, B) choice, etc. or a) choice, b) choice, etc.
            import re
            choice_matches = re.findall(r'[A-Da-d]\)\s*([^,]+)', choices_str)
            if choice_matches:
                choices = [match.strip() for match in choice_matches]
            else:
                # Last resort: split by commas and clean up
                raw_choices = choices_str.split(',')
                choices = [choice.strip().strip("'\"") for choice in raw_choices if choice.strip()]
    
    # Check if there's code in the question
    code = None
    question = question_part
    
    # Look for code blocks (marked by #include or other code indicators)
    if '#include' in question_part or 'using namespace' in question_part:
        code_indicators = ['#include', 'using namespace', 'void', 'int main', 'cout', 'printf']
        for indicator in code_indicators:
            if indicator in question_part:
                indicator_pos = question_part.find(indicator)
                comma_pos = question_part.rfind(',', 0, indicator_pos)
                if comma_pos != -1:
                    question = question_part[:comma_pos].strip()
                    code = question_part[comma_pos + 1:].strip()
                    break
    
    # Clean up the answer
    answer = ""
    if answer_part:
        if '\\n' in answer_part:
            answer_letter = answer_part.split('\\n')[0]
            answer = answer_letter.upper()  # Convert to uppercase
        else:
            answer = answer_part.upper()  # Convert to uppercase
        
        # Ensure we only have the letter (A, B, C, D, etc.)
        if len(answer) > 1:
            answer = answer[0]
    
    return {
        'question': question,
        'code': code,
        'choices': choices,
        'answer': answer
    }

def format_question(question_data):
    """Format a single question into a clean, consistent string, with blank fields if missing or parsing fails."""
    parsed = parse_target_text(question_data['target_text'])
    if not parsed:
        # Output blank fields if parsing fails
        question = ''
        code = ''
        choices = []
        answer = ''
    else:
        question = parsed.get('question', '') or ''
        code = parsed.get('code', '') or ''
        choices = parsed.get('choices', []) or []
        answer = parsed.get('answer', '') or ''
    
    formatted = f"Question: {question}\n"
    formatted += f"Code: {code}\n"
    formatted += "Choices:\n"
    
    # Handle variable number of choices (2, 3, 4, 5, etc.)
    if choices:
        for i, choice in enumerate(choices):
            letter = chr(65 + i)  # A, B, C, D, E, F, etc.
            formatted += f"{letter}) {choice}\n"
    else:
        formatted += "N/A\n"
    
    formatted += f"Answer: {answer}\n"
    return formatted

def process_quiz_data():
    # Read the original quiz data
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(script_dir, "datasets", "quiz_data_generation_format.json")
    output_file = os.path.join(script_dir, "datasets", "final_quiz_questions.json")
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            quiz_data = json.load(f)
        formatted_questions = []
        for question in quiz_data:
            formatted_question = format_question(question)
            formatted_questions.append({
                "input_text": question["input_text"],
                "target_text": formatted_question
            })
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(formatted_questions, f, indent=2, ensure_ascii=False)
        print(f"✅ Processed {len(formatted_questions)} questions (all included)")
        print(f"📁 Output saved to: {output_file}")
        if formatted_questions:
            print("\n📝 Sample formatted question:")
            print("=" * 50)
            print(formatted_questions[0]["target_text"])
            print("=" * 50)
    except FileNotFoundError:
        print(f"❌ Error: Could not find {input_file}")
    except json.JSONDecodeError:
        print(f"❌ Error: Invalid JSON in {input_file}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    process_quiz_data() 