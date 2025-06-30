from selenium import webdriver
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import time
import json
import re
import os

# --- Configuration ---
LINKS = [
    "https://www.sanfoundry.com/bplus-tree-multiple-choice-questions-answers-mcqs/",
    "https://www.sanfoundry.com/2-3-tree-multiple-choice-questions-answers-mcqs/"
    # add as many URLs as you like
]
OUTPUT_JSON = "sanfoundry_structured_clean.json"

# --- Initialize WebDriver ---
options = webdriver.EdgeOptions()
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--log-level=3')  # only FATAL errors
options.add_experimental_option('excludeSwitches', ['enable-logging'])
# options.add_argument('--headless')  # uncomment to run headless

driver = webdriver.Edge(
    service=EdgeService(EdgeChromiumDriverManager().install()),
    options=options
)

link_counter = 0

try:
    for URL in LINKS:
        # --- Load the page ---
        driver.get(URL)
        WebDriverWait(driver, 30)  # wait up to 30s for initial load
        time.sleep(2)              # extra time for dynamic content

        # --- Locate content container ---
        content = driver.find_element(By.XPATH, "//div[contains(@class,'entry-content')]")
        children = content.find_elements(By.XPATH, "./*")

        # --- Scrape questions ---
        questions = []
        current = {}
        qnum = 0
        i = 0

        while i < len(children):
            el = children[i]
            
            # 0) Skip if there's an image inside this element
            if el.find_elements(By.TAG_NAME, "img"):
                i += 1
                continue
        
            tag = el.tag_name.lower()
            txt = el.text.strip()
            cls = el.get_attribute("class") or ""

            # Skip standalone "View Answer" or "Hide Answer"
            if tag == "p" and re.fullmatch(r"(?i)(view|hide)\s*answer", txt):
                i += 1
                continue

            # New question header
            if tag == "p" and re.match(r"^\d+\.", txt):
                if current:
                    questions.append(current)
                qnum += 1
                title = re.sub(r"^\d+\.\s*", "", txt)
                current = {
                    "question_number": qnum,
                    "title": title,
                    "code": "",
                    "options": "",
                    "answer": ""
                }
                i += 1
                continue

            # Code block detection
            if current and (
                tag == "pre"
                or "code" in cls.lower()
                or "highlight" in cls.lower()
                or "syntax" in cls.lower()
                or (tag == "div" and any(kw in txt.lower() for kw in
                    ["#include", "int main", "public class", "def ", "function",
                    "void ", "for(", "while(", "if("]))
            ):
                if len(txt) > 10:
                    current["code"] += ("\n" if current["code"] else "") + txt
                i += 1
                continue

            # Options line (a), b), c), d))
            if tag == "p" and current and any(opt in txt for opt in ["a)", "b)", "c)", "d)"]):
                clean_opts = re.sub(r"(?i)view\s*answer", "", txt).strip()
                current["options"] = clean_opts
                i += 1
                continue

            # Answer content
            if tag == "div" and "collapseomatic_content" in cls:
                raw = el.get_attribute("textContent").strip()
                first = raw.split("\n", 1)[0].strip()
                # remove any "View Answer"/"Hide Answer" and leading "Answer:" prefix
                first = re.sub(r"(?i)(view|hide)\s*answer", "", first).strip()
                first = re.sub(r"(?i)^answer[:.\s]*", "", first).strip()
                current["answer"] = first
                i += 1
                continue

            i += 1

        # Append the last question
        if current:
            questions.append(current)

        # --- Build structured list and clean "View Answer" everywhere ---
        structured = []
        for q in questions:
            parts = [q["title"]]
            if q["code"]:
                parts.append("\n\n" + q["code"])
            if q["options"]:
                parts.append("\n\n" + q["options"])
            if q["answer"]:
                parts.append("\n\nAnswer: " + q["answer"])
            input_text = "".join(parts)
            input_text = re.sub(r"(?i)view\s*answer", "", input_text).strip()

            structured.append({
                "question_number": q["question_number"],
                "input_text": input_text
            })

        # --- Load existing JSON and append if non-empty ---
        existing = []
        if os.path.exists(OUTPUT_JSON):
            try:
                with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
                    existing = json.load(f) or []
            except json.JSONDecodeError:
                existing = []

        combined = existing + structured

        # --- Save combined to JSON ---
        with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
            json.dump(combined, f, indent=2, ensure_ascii=False)

        
        print(f"Done! Combined data saved to '{OUTPUT_JSON}' ({len(combined)} total questions).")
        link_counter += 1
        print(f" 📌 Link number {link_counter}:\n {URL}")
    
except Exception as e:
    print("Error during scraping:", e)
    import traceback; traceback.print_exc()

finally:
    driver.quit()
