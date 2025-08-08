import fitz
import re

def clean_text(text):
    lines = text.splitlines()

    # Remove lines that are just numbers (page numbers)
    lines = [line for line in lines if not re.fullmatch(r'\d+', line.strip())]

    # Remove repeated or noisy patterns
    repeated_patterns = [
        r'^1\.2(\s+)?Classes and Objects$',
        r'^www\.EBooksWorld\.ir$',
        r'^\s*$',
        # r'^\s*Exercises\s*$'
    ]
    for pattern in repeated_patterns:
        lines = [line for line in lines if not re.match(pattern, line)]

    text = '\n'.join(lines)

    # Fix hyphenated words split across lines
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)

    # Replace single newlines (within paragraphs) with space
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)

    # Normalize multiple newlines
    text = re.sub(r'\n{2,}', '\n\n', text)

    return text.strip()

def extract_text_from_pdf(pdf_path, start_page, end_page):
    doc = fitz.open(pdf_path)
    all_text = []

    for page_num in range(start_page, end_page + 1):
        page = doc.load_page(page_num)
        raw_text = page.get_text("text")
        cleaned = clean_text(raw_text)

        # Stop if 'Summary' is found (case-insensitive)
        match = re.search(r'\bsummary\b', cleaned, re.IGNORECASE)
        if match:
            # Optional: cut off at the word "Summary"
            cleaned = cleaned[:match.start()].strip()
            all_text.append(cleaned)
            break

        all_text.append(cleaned)

    full_text = '\n\n'.join(all_text)
    return full_text

# Example usage
textbook = "textbook4"
textbook_name = "Problem Solving in Data Structures & Algorithms Using Java_ Programming Interview Guide.pdf"
pdf_path = f"../datasets/raw_docs/{textbook}/{textbook_name}"
output_path = f"../datasets/raw_docs/{textbook}/Chapter"
chapters = {
    "1":(19,59),
    "2":(63,79),
    "3":(93,123),
    "4":(128,159),
    "5":(162,186),
    "6":(190,234),
    "7":(237,256),
    "8":(261,267),
    "9":(274,314),
    "10":(320,344),
    "11":(347,362),
    "12":(366,389),
}


for chapter, (start_page, end_page) in chapters.items():
    cleaned_text = extract_text_from_pdf(pdf_path, start_page-1, end_page-1)
    # print(cleaned_text)

    with open(f"{output_path}{chapter}.txt", "w", encoding="utf-8") as f:
        f.write(cleaned_text)
