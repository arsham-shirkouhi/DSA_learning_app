from selenium import webdriver
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import time
import json
import os

# Set up Edge WebDriver
options = webdriver.EdgeOptions()
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
# options.add_argument('--headless')  # Uncomment for headless mode

driver = webdriver.Edge(service=EdgeService(EdgeChromiumDriverManager().install()), options=options)

# Go to the quiz page
url = "https://www.geeksforgeeks.org/quizzes/top-mcqs-on-linked-list-data-structure-with-answers/"
driver.get(url)

# Wait for content to load
wait = WebDriverWait(driver, 30)

# Scroll smoothly to the bottom of the page
driver.execute_script("""
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
""")
time.sleep(3)

# Find all MCQ blocks
question_blocks = driver.find_elements(By.XPATH, "//div[contains(@class, 'QuizQuestionCard_quizCard__9T_0J')]")
print(f"Found {len(question_blocks)} question blocks")

quiz_data = []

for card in question_blocks:
    try:
        q_ps = card.find_elements(By.XPATH, ".//p")
        q_number = q_ps[0].text if len(q_ps) > 0 else ""
        q_title = q_ps[1].text if len(q_ps) > 1 else ""
        q_code = ""

        # Try to get code block (optional)
        try:
            q_codepanel = card.find_element(By.XPATH, ".//div[@class='highlight']")
            pre = q_codepanel.find_element(By.XPATH, ".//pre")
            q_code = pre.text
        except:
            pass

        # Get all choice <li> elements
        li_elements = card.find_elements(By.XPATH, ".//ul/li")
        q_choices = [li.text for li in li_elements]

        # Click the first choice (A), using JS for safety
        if li_elements:
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", li_elements[0])
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", li_elements[0])
            time.sleep(1)

        # Try getting the answer
        try:
            correct_li = card.find_element(By.XPATH, ".//li[contains(@class, 'QuizQuestionCard_selectedRow__b_SAP')]")
            q_answer = correct_li.text.strip()
        except:
            try:
                wrong_li = card.find_element(By.XPATH, ".//li[contains(@class, 'QuizQuestionCard_wrongSelectedRow__YmiT3')]")
                q_answer = wrong_li.text.strip()
            except:
                q_answer = "N/A"
                print(f"⚠️ Could not determine answer for Q{q_number}")

        # Store in list
        quiz_data.append({
            "question_number": q_number,
            "question_title": q_title,
            "code": q_code,
            "choices": q_choices,
            "answer": q_answer
        })

    except Exception as e:
        print(f"❌ Skipping question due to error: {e}")


json_file = "quiz_data.json"

# Try to load existing data
if os.path.exists(json_file):
    try:
        with open(json_file, "r", encoding="utf-8") as f:
            existing_data = json.load(f)
    except json.JSONDecodeError:
        print("⚠️ Existing file is invalid JSON. Starting fresh.")
        existing_data = []
else:
    existing_data = []

# Append new quiz_data to existing data
existing_data.extend(quiz_data)

# Save to JSON
with open(json_file, "w", encoding="utf-8") as f:
    json.dump(existing_data, f, indent=4, ensure_ascii=False)

print("✅ Data saved to quiz_data.json")

driver.quit()
