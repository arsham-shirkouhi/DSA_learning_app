from firecrawl import FirecrawlApp, JsonConfig
from dotenv import load_dotenv
import os
import json
import time
import re

load_dotenv()

app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))

# Define the topics we want to extract (matching your app categories)
TARGET_TOPICS = {
    "Array": ["arrays", "array"],
    "Linked List": ["linked-lists", "linked list", "linkedlist"],
    "Stack": ["stacks", "stack"],
    "Queue": ["queues", "queue"],
    "Heap": ["heaps", "heap"],
    "Hashing": ["hashing", "hash"],
    "Tree": ["trees", "tree", "binary-search-trees", "advanced-trees"],
    "Graph": ["graphs", "graph", "graph-algorithms"],
    "String": ["string-matching", "string"],
    "Sorting": ["sorting-algorithms", "sorting"],
    "Search": ["searching-algorithms", "searching", "search"],
    "Theory": ["introduction-to-data-structures", "theory", "miscellaneous"]
}

# Configure extraction to get questions, choices, answers, and code
extract_config = JsonConfig(
    schema={
        "type": "object",
        "properties": {
            "questions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "question": {"type": "string"},
                        "choices": {
                            "type": "object",
                            "properties": {
                                "a": {"type": "string"},
                                "b": {"type": "string"},
                                "c": {"type": "string"},
                                "d": {"type": "string"}
                            }
                        },
                        "answer": {"type": "string"},
                        "code": {"type": "string"}
                    }
                }
            }
        }
    },
    selector=".question-item, .mcq-question, article, .question, .question-block, .mcq-block, .question-container, .mcq-container",  # More comprehensive selectors
    mode="multiple"
)

def get_app_category(website_topic):
    """Map website topic to app category"""
    website_topic_lower = website_topic.lower()
    for app_category, keywords in TARGET_TOPICS.items():
        for keyword in keywords:
            if keyword in website_topic_lower:
                return app_category
    return None

def detect_code_in_text(text):
    """Detect if text contains code or pseudocode and extract only the code"""
    if not text:
        return ""
    
    # Convert to string if it's not already
    text = str(text)
    
    # Code patterns to detect
    code_patterns = [
        r'<code[^>]*>(.*?)</code>',  # HTML code tags
        r'```.*?\n(.*?)```',  # Markdown code blocks
        r'`([^`]+)`',  # Inline code
        r'[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)',  # Function calls
        r'for\s*\([^)]*\)',  # For loops
        r'while\s*\([^)]*\)',  # While loops
        r'if\s*\([^)]*\)',  # If statements
        r'else\s*{',  # Else statements
        r'return\s+[^;]+;',  # Return statements
        r'[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^;]+;',  # Variable assignments
        r'[a-zA-Z_][a-zA-Z0-9_]*\s*\+\+',  # Increment operators
        r'[a-zA-Z_][a-zA-Z0-9_]*\s*--',  # Decrement operators
        r'[a-zA-Z_][a-zA-Z0-9_]*\s*\[[^\]]*\]',  # Array access
        r'[a-zA-Z_][a-zA-Z0-9_]*\s*\.\s*[a-zA-Z_][a-zA-Z0-9_]*',  # Object property access
        r'new\s+[a-zA-Z_][a-zA-Z0-9_]*',  # Object instantiation
        r'class\s+[a-zA-Z_][a-zA-Z0-9_]*',  # Class definitions
        r'public\s+|private\s+|protected\s+',  # Access modifiers
        r'void\s+|int\s+|string\s+|bool\s+|float\s+|double\s+',  # Data types
        r'#include\s+<[^>]+>',  # C++ includes
        r'import\s+[a-zA-Z_][a-zA-Z0-9_.]*',  # Import statements
        r'def\s+[a-zA-Z_][a-zA-Z0-9_]*',  # Python function definitions
        r'function\s+[a-zA-Z_][a-zA-Z0-9_]*',  # JavaScript function definitions
        r'var\s+|let\s+|const\s+',  # Variable declarations
        r'console\.log',  # Console logging
        r'printf\s*\(',  # C printf
        r'cout\s*<<',  # C++ cout
        r'System\.out\.println',  # Java println
        r'print\s*\(',  # Python print
        r'algorithm\s+[a-zA-Z_][a-zA-Z0-9_]*',  # Algorithm definitions
        r'procedure\s+[a-zA-Z_][a-zA-Z0-9_]*',  # Procedure definitions
        r'begin\s+.*?\s+end',  # Pascal-like blocks
        r'do\s+.*?\s+while',  # Do-while loops
        r'switch\s*\([^)]*\)',  # Switch statements
        r'case\s+[^:]+:',  # Case statements
        r'break\s*;',  # Break statements
        r'continue\s*;',  # Continue statements
        r'throw\s+',  # Exception throwing
        r'try\s*{',  # Try blocks
        r'catch\s*\([^)]*\)',  # Catch blocks
        r'finally\s*{',  # Finally blocks
    ]
    
    # Extract code snippets
    code_snippets = []
    
    # Check for HTML code tags
    html_code_matches = re.findall(r'<code[^>]*>(.*?)</code>', text, re.DOTALL)
    for match in html_code_matches:
        code_snippets.append(match.strip())
    
    # Check for markdown code blocks
    markdown_code_matches = re.findall(r'```.*?\n(.*?)```', text, re.DOTALL)
    for match in markdown_code_matches:
        code_snippets.append(match.strip())
    
    # Check for inline code
    inline_code_matches = re.findall(r'`([^`]+)`', text)
    for match in inline_code_matches:
        code_snippets.append(match.strip())
    
    # Check for other code patterns
    for pattern in code_patterns[3:]:  # Skip the first 3 patterns we already checked
        matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
        if matches:
            # If it's a complex pattern, extract the matching part
            if isinstance(matches, list):
                for match in matches:
                    if match and len(match.strip()) > 5:  # Only add substantial code
                        code_snippets.append(match.strip())
            else:
                if matches and len(matches.strip()) > 5:
                    code_snippets.append(matches.strip())
    
    # Combine all code snippets
    if code_snippets:
        return '\n'.join(code_snippets)
    
    return ""  # Return empty string if no code detected

def clean_question_text(text):
    """Remove code blocks from question text to keep only the question"""
    if not text:
        return text
    
    # Remove HTML code tags and their content
    text = re.sub(r'<code[^>]*>.*?</code>', '', text, flags=re.DOTALL)
    
    # Remove markdown code blocks and their content
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    
    # Remove inline code markers
    text = re.sub(r'`[^`]*`', '', text)
    
    # Clean up extra whitespace and newlines
    text = re.sub(r'\n\s*\n', '\n', text)  # Remove multiple newlines
    text = re.sub(r' +', ' ', text)  # Remove multiple spaces
    text = text.strip()
    
    return text

def normalize_text(text):
    """Normalize text for comparison (remove extra spaces, lowercase, etc.)"""
    if not text:
        return ""
    
    # Convert to string and lowercase
    text = str(text).lower()
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove punctuation except for code-related characters
    text = re.sub(r'[^\w\s\-_\(\)\[\]{}<>.,;:!?]', '', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text

def is_duplicate_question(new_question, existing_questions):
    """Check if a question is a duplicate of any existing question"""
    new_question_text = normalize_text(new_question.get('question', ''))
    new_choices = new_question.get('choices', {})
    
    # Normalize new question choices
    new_choices_normalized = {}
    for key, value in new_choices.items():
        new_choices_normalized[key] = normalize_text(value)
    
    for existing_question in existing_questions:
        existing_question_text = normalize_text(existing_question.get('question', ''))
        existing_choices = existing_question.get('choices', {})
        
        # Normalize existing question choices
        existing_choices_normalized = {}
        for key, value in existing_choices.items():
            existing_choices_normalized[key] = normalize_text(value)
        
        # Check if question text is similar (90% similarity threshold)
        if new_question_text and existing_question_text:
            # Simple similarity check - if normalized texts are very similar
            if new_question_text == existing_question_text:
                # Check if choices are also similar
                choices_match = True
                for key in new_choices_normalized:
                    if key in existing_choices_normalized:
                        if new_choices_normalized[key] != existing_choices_normalized[key]:
                            choices_match = False
                            break
                    else:
                        choices_match = False
                        break
                
                if choices_match:
                    return True
        
        # Also check for partial matches (questions that are very similar)
        if len(new_question_text) > 20 and len(existing_question_text) > 20:
            # Check if one question contains most of the other
            if (new_question_text in existing_question_text or 
                existing_question_text in new_question_text):
                # Check if choices are also similar
                choices_match = True
                for key in new_choices_normalized:
                    if key in existing_choices_normalized:
                        if new_choices_normalized[key] != existing_choices_normalized[key]:
                            choices_match = False
                            break
                    else:
                        choices_match = False
                        break
                
                if choices_match:
                    return True
    
    return False

def scrape_questions_optimized(url, topic_name, app_category, existing_questions):
    """Scrape questions with minimal token usage - check and extract in one go"""
    try:
        print(f"Scraping {topic_name} ({app_category}) from: {url}")
        
        all_questions = []
        section_num = 1
        max_sections = 20
        consecutive_empty_sections = 0
        duplicates_found = 0
        
        while section_num <= max_sections:
            print(f"  📖 Processing Section {section_num}...")
            
            page_num = 1
            max_pages_per_section = 50
            consecutive_empty_pages = 0
            section_has_questions = False
            
            while page_num <= max_pages_per_section:
                # Construct URL for this page/section
                if url.endswith('/'):
                    base_url = url[:-1]
                else:
                    base_url = url
                
                if section_num == 1 and page_num == 1:
                    current_url = url
                else:
                    current_url = f"{base_url}?section={section_num}&page={page_num}"
                
                print(f"    📄 Processing page {page_num}...")
                
                try:
                    # Extract questions from this page (check and extract in one request)
                    result = app.scrape_url(
                        url=current_url,
                        formats=['extract'],
                        extract=extract_config
                    )
                    
                    if result.extract and result.extract.get('questions'):
                        questions = result.extract['questions']
                        if len(questions) > 0:
                            print(f"      ✓ Found {len(questions)} questions")
                            
                            # Process each question and check for duplicates
                            new_questions_count = 0
                            for question in questions:
                                # Add metadata and detect code for each question
                                question['page_number'] = page_num
                                question['section_number'] = section_num
                                question['page_url'] = current_url
                                question['app_category'] = app_category
                                
                                # Detect code in question and choices
                                question_text = question.get('question', '')
                                choices = question.get('choices', {})
                                
                                # Clean question text
                                question_text = clean_question_text(question_text)
                                
                                # Check question text for code
                                question_code = detect_code_in_text(question.get('question', ''))
                                
                                # Check choices for code
                                choices_code = ""
                                for choice_key, choice_text in choices.items():
                                    choice_code = detect_code_in_text(choice_text)
                                    if choice_code:
                                        choices_code += f"{choice_code}\n"
                                
                                # Combine all code found
                                all_code = ""
                                if question_code:
                                    all_code += question_code
                                if choices_code:
                                    if all_code:
                                        all_code += "\n"
                                    all_code += choices_code
                                
                                question['code'] = all_code.strip() if all_code else ""
                                question['question'] = question_text  # Update with cleaned question
                                
                                # Check if this question is a duplicate
                                if is_duplicate_question(question, existing_questions + all_questions):
                                    duplicates_found += 1
                                    print(f"        ⚠️  Duplicate question found and skipped")
                                else:
                                    all_questions.append(question)
                                    new_questions_count += 1
                            
                            if new_questions_count > 0:
                                print(f"        ✅ Added {new_questions_count} new questions")
                                section_has_questions = True
                                consecutive_empty_pages = 0
                            else:
                                print(f"        ⚠️  All questions were duplicates")
                                consecutive_empty_pages += 1
                            
                            page_num += 1
                            
                        else:
                            print(f"      ✗ No questions found")
                            consecutive_empty_pages += 1
                            page_num += 1
                    else:
                        print(f"      ✗ No questions found")
                        consecutive_empty_pages += 1
                        page_num += 1
                    
                    # If we get 3 consecutive empty pages, move to next section
                    if consecutive_empty_pages >= 3:
                        print(f"      ⏭️  {consecutive_empty_pages} consecutive empty pages, moving to next section...")
                        break
                        
                except Exception as e:
                    error_msg = str(e)
                    print(f"      ❌ Error on page {page_num}: {error_msg}")
                    
                    # Check if it's a credit/rate limit error
                    if "Payment Required" in error_msg or "Insufficient credits" in error_msg:
                        print(f"      💳 CREDITS EXHAUSTED - Stopping extraction for this topic")
                        return all_questions, True  # True indicates credits exhausted
                    elif "Rate limit exceeded" in error_msg:
                        print(f"      ⏳ Rate limit hit, waiting 15 seconds...")
                        time.sleep(15)
                        continue
                    elif "404" in error_msg or "Not Found" in error_msg:
                        print(f"      📄 Page not found, moving to next section...")
                        consecutive_empty_pages += 1
                        page_num += 1
                        if consecutive_empty_pages >= 3:
                            break
                    else:
                        # Other error, try next page
                        consecutive_empty_pages += 1
                        page_num += 1
                        if consecutive_empty_pages >= 3:
                            break
            
            # Check if this section had any questions
            if not section_has_questions:
                consecutive_empty_sections += 1
                print(f"  ⏭️  Section {section_num} had no questions")
            else:
                consecutive_empty_sections = 0
                print(f"  ✅ Section {section_num} completed")
            
            # If we get 3 consecutive empty sections, we're probably done
            if consecutive_empty_sections >= 3:
                print(f"  🏁 {consecutive_empty_sections} consecutive empty sections, stopping...")
                break
            
            section_num += 1
        
        print(f"  ✅ Total questions found for {topic_name}: {len(all_questions)}")
        if duplicates_found > 0:
            print(f"  ⚠️  Skipped {duplicates_found} duplicate questions")
        return all_questions, False  # False indicates no credit issues
            
    except Exception as e:
        print(f"  ❌ Error scraping {url}: {e}")
        return [], False

# Load existing progress if available
progress_file = "scraping_progress.json"
remaining_links = []
completed_topics = set()
existing_questions = []

if os.path.exists(progress_file):
    try:
        with open(progress_file, 'r', encoding='utf-8') as f:
            progress_data = json.load(f)
            remaining_links = progress_data.get('remaining_links', [])
            completed_topics = set(progress_data.get('completed_topics', []))
            print(f"📂 Loaded progress: {len(completed_topics)} topics completed, {len(remaining_links)} remaining")
    except Exception as e:
        print(f"⚠️  Error loading progress file: {e}")
        print("🔄 Starting fresh...")

# Load existing questions if available - with proper encoding handling
if os.path.exists("filtered_questions_by_category.json"):
    try:
        with open("filtered_questions_by_category.json", 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            existing_questions = existing_data.get('questions', [])
            print(f"📂 Loaded {len(existing_questions)} existing questions")
    except UnicodeDecodeError:
        # Try with different encoding if UTF-8 fails
        try:
            with open("filtered_questions_by_category.json", 'r', encoding='latin-1') as f:
                existing_data = json.load(f)
                existing_questions = existing_data.get('questions', [])
                print(f"📂 Loaded {len(existing_questions)} existing questions (latin-1 encoding)")
        except Exception as e:
            print(f"⚠️  Error loading existing questions: {e}")
            print("🔄 Starting with empty question set...")
            existing_questions = []
    except Exception as e:
        print(f"⚠️  Error loading existing questions: {e}")
        print("🔄 Starting with empty question set...")
        existing_questions = []

# If no remaining links, get all links fresh
if not remaining_links:
    print("Getting question page links...")
    result = app.scrape_url(
        url="https://www.examveda.com/mcq-question-on-data-structure",
        formats=['links']
    )

    # Filter links to only include question pages that match our target topics
    if result.links:
        for link in result.links:
            if "practice-mcq-question-on" in link and "data-structure" in link:
                # Extract topic name from URL
                topic_name = link.split("practice-mcq-question-on-")[-1].replace("/", "").replace("-", " ").title()
                
                # Check if this topic matches our target categories
                app_category = get_app_category(topic_name)
                if app_category:
                    remaining_links.append((link, topic_name, app_category))
                    print(f"✓ Matched: {topic_name} -> {app_category}")

print(f"\nFound {len(remaining_links)} relevant question pages to scrape")

# Scrape questions from each page (with pagination and sections)
all_questions = existing_questions.copy()  # Start with existing questions
credits_exhausted = False

for i, (url, topic_name, app_category) in enumerate(remaining_links):
    # Skip if already completed
    if topic_name in completed_topics:
        print(f"\n⏭️  Skipping {topic_name} (already completed)")
        continue
        
    print(f"\n[{i+1}/{len(remaining_links)}] Scraping {topic_name} ({app_category})...")
    
    questions, credits_exhausted = scrape_questions_optimized(url, topic_name, app_category, all_questions)
    
    # Add topic information to each question
    for question in questions:
        question['topic'] = topic_name
        question['source_url'] = url
    
    all_questions.extend(questions)
    
    # Mark as completed
    completed_topics.add(topic_name)
    
    # Save progress after each topic
    progress_data = {
        'remaining_links': remaining_links[i+1:],  # Remove completed topics
        'completed_topics': list(completed_topics),
        'last_completed': topic_name,
        'total_questions_extracted': len(all_questions)
    }
    
    with open(progress_file, 'w', encoding='utf-8') as f:
        json.dump(progress_data, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Progress saved: {len(completed_topics)} topics completed")
    
    # Check if credits are exhausted
    if credits_exhausted:
        print(f"\n💳 CREDITS EXHAUSTED - Stopping extraction")
        print(f"📊 Progress: {len(completed_topics)}/{len(remaining_links)} topics completed")
        break
    
    # Add a longer delay to be more respectful to the server
    time.sleep(3)

# Save all questions to JSON file
output_data = {
    "total_questions": len(all_questions),
    "topics_covered": list(set(q['app_category'] for q in all_questions)),
    "questions": all_questions,
    "scraping_status": {
        "completed_topics": len(completed_topics),
        "total_topics": len(remaining_links),
        "credits_exhausted": credits_exhausted,
        "remaining_links_count": len(remaining_links) - len(completed_topics)
    }
}

# Count questions per category for display
category_counts = {}
for question in all_questions:
    category = question['app_category']
    category_counts[category] = category_counts.get(category, 0) + 1

# Display category counts
print(f"\n📊 Questions extracted by category:")
for category, count in category_counts.items():
    print(f"  {category}: {count} questions")

# Save remaining links for later continuation
if credits_exhausted:
    remaining_links_file = "remaining_links_to_scrape.json"
    remaining_data = {
        "remaining_links": remaining_links[len(completed_topics):],
        "completed_topics": list(completed_topics),
        "total_questions_extracted": len(all_questions),
        "credits_exhausted_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    with open(remaining_links_file, 'w', encoding='utf-8') as f:
        json.dump(remaining_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n📋 Remaining links saved to: {remaining_links_file}")

with open("filtered_questions_by_category.json", "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Extraction completed!")
print(f"Total questions extracted: {len(all_questions)}")
print(f"Topics covered: {len(output_data['topics_covered'])}")
print(f"Results saved to: filtered_questions_by_category.json")

if credits_exhausted:
    print(f"\n🔄 To continue scraping, run the script again - it will automatically resume from where it left off!")

