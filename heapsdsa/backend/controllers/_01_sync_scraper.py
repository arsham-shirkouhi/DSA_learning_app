from firecrawl import FirecrawlApp, JsonConfig
from dotenv import load_dotenv
import os
import json
import time
import re
from typing import List, Dict, Tuple, Optional
import hashlib
from token_tracker import init_tracker, track_tokens, print_usage_summary

load_dotenv()

# Initialize token tracker with high budget (reset after deletion)
init_tracker(budget=100000, alert_threshold=0.9)

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

# OPTIMIZED: Ultra-minimal schema to reduce token usage
extract_config = JsonConfig(
    schema={
        "type": "object",
        "properties": {
            "q": {  # questions array (shortened from "questions")
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "txt": {"type": "string"},  # question text (shortened from "question")
                        "ans": {"type": "string"},  # answer (A, B, C, D)
                        "opt": {  # options (shortened from "choices")
                            "type": "object",
                            "properties": {
                                "a": {"type": "string"},
                                "b": {"type": "string"},
                                "c": {"type": "string"},
                                "d": {"type": "string"}
                            }
                        }
                    },
                    "required": ["txt", "ans", "opt"]  # Only require essential fields
                }
            }
        }
    },
    # OPTIMIZED: More specific selector to reduce processing
    selector=".question-item, .mcq-question, .question-block, .mcq-block",
    mode="multiple"
)

# OPTIMIZED: Cache for processed questions to avoid re-processing
question_cache = {}
cache_file = "question_cache.json"
processed_hashes_file = "processed_hashes.json"

def load_cache():
    """Load cached questions with enhanced error handling"""
    global question_cache
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                question_cache = json.load(f)
                print(f"📂 Loaded {len(question_cache)} cached questions")
        except Exception as e:
            print(f"⚠️  Error loading cache: {e}")
            question_cache = {}

def save_cache():
    """Save processed questions to cache with compression"""
    try:
        # Only save essential data to reduce file size
        compressed_cache = {}
        for key, value in question_cache.items():
            if key != 'processed_hashes':  # Don't save processed hashes in main cache
                compressed_cache[key] = value
        
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(compressed_cache, f, indent=1, ensure_ascii=False)
    except Exception as e:
        print(f"⚠️  Error saving cache: {e}")

def load_processed_hashes():
    """Load processed question hashes separately"""
    if os.path.exists(processed_hashes_file):
        try:
            with open(processed_hashes_file, 'r') as f:
                return set(json.load(f))
        except Exception:
            pass
    return set()

def save_processed_hashes(hashes):
    """Save processed question hashes separately"""
    try:
        with open(processed_hashes_file, 'w') as f:
            json.dump(list(hashes), f)
    except Exception as e:
        print(f"⚠️  Error saving processed hashes: {e}")

def get_question_hash(question_data: Dict) -> str:
    """Generate hash for question to identify duplicates efficiently"""
    # OPTIMIZED: Only hash essential fields
    q_text = str(question_data.get('txt', '')).lower().strip()
    options = question_data.get('opt', {})
    options_str = ''.join([str(options.get(k, '')).lower().strip() for k in ['a', 'b', 'c', 'd']])
    
    hash_input = f"{q_text}|{options_str}"
    return hashlib.md5(hash_input.encode()).hexdigest()

def get_app_category(website_topic: str) -> Optional[str]:
    """Map website topic to app category"""
    website_topic_lower = website_topic.lower()
    for app_category, keywords in TARGET_TOPICS.items():
        for keyword in keywords:
            if keyword in website_topic_lower:
                return app_category
    return None

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

def clean_question_text(text: str) -> str:
    """Remove code blocks from question text to keep only the question (OPTIMIZED)"""
    if not text:
        return text
    
    # OPTIMIZED: Single pass cleaning
    text = re.sub(r'<code[^>]*>.*?</code>', '', text, flags=re.DOTALL)
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    text = re.sub(r'`[^`]*`', '', text)
    text = re.sub(r'\n\s*\n', '\n', text)
    text = re.sub(r' +', ' ', text)
    
    return text.strip()

def normalize_text(text: str) -> str:
    """Normalize text for comparison (ultra optimized)"""
    if not text:
        return ""
    
    text = str(text).lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)  # Remove all punctuation
    return text.strip()

def normalize_answer(answer: str) -> str:
    """Normalize answer to single lowercase letter"""
    if not answer:
        return ""
    
    # Convert to string and lowercase
    answer = str(answer).lower().strip()
    
    # Extract first character if it's a letter
    if answer and answer[0] in ['a', 'b', 'c', 'd']:
        return answer[0]
    
    # Try to find a letter in the answer
    for char in answer:
        if char in ['a', 'b', 'c', 'd']:
            return char
    
    # Default to 'a' if no valid answer found
    return 'a'

def is_duplicate_question(new_question: Dict, existing_questions: List[Dict], processed_hashes: set) -> bool:
    """Check if a question is a duplicate (ultra optimized)"""
    new_question_text = normalize_text(new_question.get('txt', ''))
    
    # OPTIMIZED: Early exits
    if len(new_question_text) < 10:
        return False
    
    # Check if already processed
    question_hash = get_question_hash(new_question)
    if question_hash in processed_hashes:
        return True
    
    # Quick check against existing questions
    for existing_question in existing_questions:
        existing_question_text = normalize_text(existing_question.get('txt', ''))
        
        # OPTIMIZED: Length-based early exit
        if abs(len(new_question_text) - len(existing_question_text)) > 30:
            continue
        
        # Exact match check
        if new_question_text == existing_question_text:
            return True
        
        # Partial match check (only for longer questions)
        if len(new_question_text) > 30 and len(existing_question_text) > 30:
            if (new_question_text in existing_question_text or 
                existing_question_text in new_question_text):
                return True
    
    return False

def estimate_tokens_for_url(url: str) -> int:
    """Estimate tokens needed for a URL (rough estimation)"""
    # OPTIMIZED: Conservative token estimation
    base_tokens = 200  # Base extraction overhead
    content_tokens = 300  # Estimated content tokens
    return base_tokens + content_tokens

def scrape_questions_optimized(url: str, topic_name: str, app_category: str, existing_questions: List[Dict]) -> Tuple[List[Dict], bool]:
    """Scrape questions with ultra-minimal token usage"""
    try:
        print(f"Scraping {topic_name} ({app_category}) from: {url}")
        
        all_questions = []
        section_num = 1
        max_sections = 5  # OPTIMIZED: Very conservative limits
        consecutive_empty_sections = 0
        duplicates_found = 0
        code_questions_skipped = 0
        
        # Load processed hashes
        processed_hashes = load_processed_hashes()
        
        while section_num <= max_sections:
            print(f"  📖 Processing Section {section_num}...")
            
            page_num = 1
            max_pages_per_section = 10  # OPTIMIZED: Very conservative
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
                
                # OPTIMIZED: Check cache first
                cache_key = f"{current_url}_{topic_name}"
                if cache_key in question_cache:
                    cached_questions = question_cache[cache_key]
                    print(f"      📋 Found {len(cached_questions)} cached questions")
                    
                    # Process cached questions
                    new_questions_count = 0
                    for question in cached_questions:
                        question_hash = get_question_hash(question)
                        
                        # Check if already processed
                        if question_hash in processed_hashes:
                            continue
                        
                        # Normalize answer to single lowercase letter
                        question['ans'] = normalize_answer(question.get('ans', ''))
                        
                        # Add metadata
                        question['page_number'] = page_num
                        question['section_number'] = section_num
                        question['page_url'] = current_url
                        question['app_category'] = app_category
                        question['topic'] = topic_name
                        question['source_url'] = url
                        
                        # Check if question contains code or images and skip it
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
                            if question_has_code:
                                code_questions_skipped += 1
                            elif question_has_images or options_have_images:
                                code_questions_skipped += 1  # Reuse counter for image questions too
                            continue
                        
                        # Check for duplicates
                        if is_duplicate_question(question, existing_questions + all_questions, processed_hashes):
                            duplicates_found += 1
                        else:
                            all_questions.append(question)
                            new_questions_count += 1
                        
                        # Mark as processed
                        processed_hashes.add(question_hash)
                    
                    if new_questions_count > 0:
                        print(f"        ✅ Added {new_questions_count} new questions from cache")
                        section_has_questions = True
                        consecutive_empty_pages = 0
                    else:
                        print(f"        ⚠️  All cached questions were duplicates")
                        consecutive_empty_pages += 1
                    
                    page_num += 1
                    continue
                
                # OPTIMIZED: Estimate tokens before making request
                estimated_tokens = estimate_tokens_for_url(current_url)
                
                try:
                    # OPTIMIZED: Use ultra-minimal extraction config
                    result = app.scrape_url(
                        url=current_url,
                        formats=['extract'],
                        extract=extract_config
                    )
                    
                    # Track actual token usage (estimate if not available)
                    actual_tokens = estimated_tokens  # Default to estimate
                    if hasattr(result, 'usage') and result.usage:
                        actual_tokens = result.usage.get('total_tokens', estimated_tokens)
                    
                    try:
                        track_tokens(actual_tokens, current_url, f"Scraping {topic_name} page {page_num}")
                    except Exception as budget_error:
                        if "Token budget exceeded" in str(budget_error):
                            print(f"      💳 TOKEN BUDGET EXCEEDED - Stopping extraction")
                            return all_questions, True  # True indicates budget exhausted
                        else:
                            raise budget_error
                    
                    if result.extract and result.extract.get('q'):
                        questions = result.extract['q']
                        if len(questions) > 0:
                            print(f"      ✓ Found {len(questions)} questions")
                            
                            # Cache the results
                            question_cache[cache_key] = questions
                            
                            # Process each question
                            new_questions_count = 0
                            for question in questions:
                                question_hash = get_question_hash(question)
                                
                                # Check if already processed
                                if question_hash in processed_hashes:
                                    continue
                                
                                # Normalize answer to single lowercase letter
                                question['ans'] = normalize_answer(question.get('ans', ''))
                                
                                # Add metadata
                                question['page_number'] = page_num
                                question['section_number'] = section_num
                                question['page_url'] = current_url
                                question['app_category'] = app_category
                                question['topic'] = topic_name
                                question['source_url'] = url
                                
                                # Check if question contains code or images and skip it
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
                                    if question_has_code:
                                        print(f"        ⚠️  Question with code skipped")
                                    elif question_has_images or options_have_images:
                                        print(f"        🖼️  Question with images skipped")
                                    code_questions_skipped += 1
                                    continue
                                
                                # Check for duplicates
                                if is_duplicate_question(question, existing_questions + all_questions, processed_hashes):
                                    duplicates_found += 1
                                    print(f"        ⚠️  Duplicate question found and skipped")
                                else:
                                    all_questions.append(question)
                                    new_questions_count += 1
                                
                                # Mark as processed
                                processed_hashes.add(question_hash)
                            
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
                    
                    # OPTIMIZED: Save cache and hashes periodically
                    if page_num % 3 == 0:
                        save_cache()
                        save_processed_hashes(processed_hashes)
                    
                    # If we get 2 consecutive empty pages, move to next section
                    if consecutive_empty_pages >= 2:  # OPTIMIZED: Reduced threshold
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
                        print(f"      ⏳ Rate limit hit, waiting 60 seconds...")
                        time.sleep(60)  # OPTIMIZED: Much longer wait
                        continue
                    elif "404" in error_msg or "Not Found" in error_msg:
                        print(f"      📄 Page not found, moving to next section...")
                        consecutive_empty_pages += 1
                        page_num += 1
                        if consecutive_empty_pages >= 2:
                            break
                    else:
                        # Other error, try next page
                        consecutive_empty_pages += 1
                        page_num += 1
                        if consecutive_empty_pages >= 2:
                            break
            
            # Check if this section had any questions
            if not section_has_questions:
                consecutive_empty_sections += 1
                print(f"  ⏭️  Section {section_num} had no questions")
            else:
                consecutive_empty_sections = 0
                print(f"  ✅ Section {section_num} completed")
            
            # If we get 2 consecutive empty sections, we're probably done
            if consecutive_empty_sections >= 2:  # OPTIMIZED: Reduced threshold
                print(f"  🏁 {consecutive_empty_sections} consecutive empty sections, stopping...")
                break
            
            section_num += 1
        
        print(f"  ✅ Total questions found for {topic_name}: {len(all_questions)}")
        if duplicates_found > 0:
            print(f"  ⚠️  Skipped {duplicates_found} duplicate questions")
        if code_questions_skipped > 0:
            print(f"  ⚠️  Skipped {code_questions_skipped} questions with code or images")
        
        save_cache()  # Save cache after each topic
        save_processed_hashes(processed_hashes)
        return all_questions, False  # False indicates no credit issues
            
    except Exception as e:
        print(f"  ❌ Error scraping {url}: {e}")
        return [], False

# Load cache at startup
load_cache()

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

# Check if there are any topics left to scrape
if not remaining_links:
    print("🎉 No more topics to scrape! All done!")
    print(f"📊 Final stats:")
    print(f"  - Total questions: {len(existing_questions)}")
    print(f"  - Topics completed: {len(completed_topics)}")
    
    # Save final output with existing questions
    output_data = {
        "total_questions": len(existing_questions),
        "topics_covered": list(set(q['app_category'] for q in existing_questions)),
        "questions": existing_questions,
        "scraping_status": {
            "completed_topics": len(completed_topics),
            "total_topics": 0,
            "credits_exhausted": False,
            "remaining_links_count": 0,
            "status": "COMPLETED_ALL_TOPICS"
        }
    }
    
    with open("filtered_questions_by_category.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Final results saved to: filtered_questions_by_category.json")
    print_usage_summary()
    exit(0)

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
    
    # Print token usage summary
    print_usage_summary()
    
    # Check if credits are exhausted
    if credits_exhausted:
        print(f"\n💳 CREDITS EXHAUSTED - Stopping extraction")
        print(f"📊 Progress: {len(completed_topics)}/{len(remaining_links)} topics completed")
        break
    
    # OPTIMIZED: Longer delay to be more respectful and avoid rate limits
    time.sleep(10)

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

# Final cache save
save_cache()
save_processed_hashes(load_processed_hashes())

# Final token usage summary
print_usage_summary()

