import json
import re
import os

def detect_code_in_text(text: str) -> str:
    """Detect if text contains code or pseudocode and extract only the code (OPTIMIZED)"""
    if not text:
        return ""
    
    text = str(text)
    
    # OPTIMIZED: Simplified code patterns to reduce regex complexity
    code_patterns = [
        r'<code[^>]*>(.*?)</code>',  # HTML code tags
        r'```.*?\n(.*?)```',  # Markdown code blocks
        r'`([^`]+)`',  # Inline code
        r'for\s*\([^)]*\)',  # For loops
        r'while\s*\([^)]*\)',  # While loops
        r'if\s*\([^)]*\)',  # If statements
        r'return\s+[^;]+;',  # Return statements
        r'[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^;]+;',  # Variable assignments
        r'def\s+[a-zA-Z_][a-zA-Z0-9_]*',  # Python function definitions
        r'function\s+[a-zA-Z_][a-zA-Z0-9_]*',  # JavaScript function definitions
    ]
    
    code_snippets = []
    
    # Check for HTML code tags
    html_code_matches = re.findall(r'<code[^>]*>(.*?)</code>', text, re.DOTALL)
    code_snippets.extend(html_code_matches)
    
    # Check for markdown code blocks
    markdown_code_matches = re.findall(r'```.*?\n(.*?)```', text, re.DOTALL)
    code_snippets.extend(markdown_code_matches)
    
    # Check for inline code
    inline_code_matches = re.findall(r'`([^`]+)`', text)
    code_snippets.extend(inline_code_matches)
    
    # Check for other code patterns (only if substantial)
    for pattern in code_patterns[3:]:
        matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
        if matches:
            if isinstance(matches, list):
                for match in matches:
                    if match and len(match.strip()) > 10:  # Only substantial code
                        code_snippets.append(match.strip())
            else:
                if matches and len(matches.strip()) > 10:
                    code_snippets.append(matches.strip())
    
    return '\n'.join(code_snippets) if code_snippets else ""

def detect_images_in_text(text: str) -> bool:
    """Detect if text contains image references or tags"""
    if not text:
        return False
    
    text = str(text).lower()
    
    # Image patterns to detect
    image_patterns = [
        r'<img[^>]*>',  # HTML img tags
        r'<image[^>]*>',  # HTML image tags
        r'!\[.*?\]\(.*?\)',  # Markdown images
        r'\[.*?\]\(.*?\.(jpg|jpeg|png|gif|svg|webp)\)',  # Markdown image links
        r'\.(jpg|jpeg|png|gif|svg|webp)',  # Image file extensions
        r'image\s*:',  # "Image:" text
        r'figure\s*\d+',  # "Figure 1" references
        r'see\s+the\s+image',  # "See the image" references
        r'look\s+at\s+the\s+diagram',  # Diagram references
        r'based\s+on\s+the\s+image',  # "Based on the image" references
    ]
    
    for pattern in image_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    
    return False

def clean_questions_file():
    """Clean the existing questions file by removing questions with images or code"""
    
    input_file = "filtered_questions_by_category.json"
    output_file = "filtered_questions_by_category_cleaned.json"
    
    if not os.path.exists(input_file):
        print(f"❌ Input file '{input_file}' not found!")
        return
    
    print(f"📂 Loading questions from {input_file}...")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except UnicodeDecodeError:
        try:
            with open(input_file, 'r', encoding='latin-1') as f:
                data = json.load(f)
        except Exception as e:
            print(f"❌ Error loading file: {e}")
            return
    
    original_questions = data.get('questions', [])
    print(f"📊 Found {len(original_questions)} original questions")
    
    # Filter out questions with images or code
    cleaned_questions = []
    removed_count = 0
    code_removed = 0
    image_removed = 0
    
    for i, question in enumerate(original_questions):
        question_text = question.get('txt', '')
        options = question.get('opt', {})
        
        # Check question text for code and images
        question_has_code = bool(detect_code_in_text(question_text))
        question_has_images = detect_images_in_text(question_text)
        
        # Check options for images
        options_have_images = False
        for option_text in options.values():
            if detect_images_in_text(option_text):
                options_have_images = True
                break
        
        # Skip questions with code or images
        if question_has_code or question_has_images or options_have_images:
            removed_count += 1
            if question_has_code:
                code_removed += 1
            elif question_has_images or options_have_images:
                image_removed += 1
            continue
        
        cleaned_questions.append(question)
    
    print(f"✅ Cleaning completed!")
    print(f"📊 Original questions: {len(original_questions)}")
    print(f"📊 Cleaned questions: {len(cleaned_questions)}")
    print(f"🗑️  Removed questions: {removed_count}")
    print(f"  - Code questions: {code_removed}")
    print(f"  - Image questions: {image_removed}")
    
    # Update the data structure
    data['questions'] = cleaned_questions
    data['total_questions'] = len(cleaned_questions)
    
    # Save cleaned data
    print(f"💾 Saving cleaned questions to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Cleaned file saved as: {output_file}")
    
    # Optionally replace the original file
    replace_original = input("\n🤔 Do you want to replace the original file? (y/n): ").lower().strip()
    if replace_original == 'y':
        os.rename(output_file, input_file)
        print(f"✅ Original file replaced with cleaned version")
    else:
        print(f"📁 Original file preserved. Cleaned version saved as: {output_file}")

if __name__ == "__main__":
    clean_questions_file() 