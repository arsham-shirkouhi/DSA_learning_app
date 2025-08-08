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
        all_text.append(cleaned)

    full_text = '\n\n'.join(all_text)
    return full_text

# Example usage
pdf_path = "./documentations/Data Structures and Algorithms in Java™.pdf"
start_page = 20
end_page = 72  # Inclusive

cleaned_text = extract_text_from_pdf(pdf_path, start_page-1, end_page-1)
# print(cleaned_text)

with open("output.txt", "w", encoding="utf-8") as f:
    f.write(cleaned_text)
