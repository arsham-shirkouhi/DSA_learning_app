from pdf2image import convert_from_path
from PIL import Image
import pytesseract

def ocr_pdf_pages(pdf_path, page_start, page_end):
    # Convert the specified range of pages to images
    images = convert_from_path(
        pdf_path,
        first_page=page_start,
        last_page=page_end,
        dpi=300,
        poppler_path="C:/poppler-24.08.0/Library/bin"
    )

    all_text = ""
    for i, image in enumerate(images, start=page_start):
        print(f"OCR processing page {i}...")
        text = pytesseract.image_to_string(image)
        all_text += f"\n{text}"
    
    return all_text

# Example usage
def main():
    pytesseract.pytesseract.tesseract_cmd = "C:/Program Files/Tesseract-OCR/tesseract.exe"
    pdf_path = "./documentations/Introduction to Algorithms, Third Edition.pdf"  # Replace with your PDF path
    page_start = 37
    page_end = 60

    text = ocr_pdf_pages(pdf_path, page_start, page_end)
    
    with open("output.txt", "w", encoding="utf-8") as f:
        f.write(text)

if __name__ == "__main__":
    main()
