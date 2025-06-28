from selenium import webdriver
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.common.exceptions import NoSuchElementException
import time
import json
import os

# Set up Edge WebDriver
options = webdriver.EdgeOptions()
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')

# Log suppression:
options.add_argument('--log-level=3')  # Show only FATAL errors
options.add_experimental_option('excludeSwitches', ['enable-logging'])

# Optional: run headless
# options.add_argument('--headless')

driver = webdriver.Edge(service=EdgeService(EdgeChromiumDriverManager().install()), options=options)

# Go to the quiz page
url = "https://www.geeksforgeeks.org/quizzes/top-mcqs-on-tree-traversal-with-interview-question-and-answers/"
driver.get(url)

# Wait for content to load
wait = WebDriverWait(driver, 100)

# Scroll smoothly to the bottom of the page
for _ in range(2):
    driver.execute_script("""
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    """)
    time.sleep(1)
    
    driver.execute_script("""
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })   
    """)
    time.sleep(3)

# Find all MCQ blocks
question_blocks = driver.find_elements(By.XPATH, "//div[contains(@class, 'QuizQuestionCard_quizCard__9T_0J')]")
print(f"Found {len(question_blocks)} question blocks")

quiz_data = []
skipped_questions = 0

for card in question_blocks:
    try:
        image_exist = card.find_element(By.XPATH, ".//img")
    except NoSuchElementException:
        image_exist = None

    if image_exist == None:
        try:
            q_ps = card.find_elements(By.XPATH, ".//p")
            q_number = q_ps[0].text if len(q_ps) > 0 else ""
            q_title = q_ps[1].text if len(q_ps) > 1 else ""
            
            # Fallback conditional
            if q_title == "":
                raise Exception("Question title is empty!")
            #     print("In fallback conditional to find q_title")
            #     question_text = card.find_element(By.XPATH, ".//div[contains(@class, 'quizQuestionTextContainer')]").text

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
                time.sleep(0.5)

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
            # quiz_data.append({
            #     "question_number": q_number,
            #     "question_title": q_title,
            #     "code": q_code,
            #     "choices": q_choices,
            #     "answer": q_answer
            # })
            
            # Store in list (formatted for finetuning)
            quiz_data.append({
                "Question_number": q_number,
                "input_text": f"{q_title}, {q_code}, Choices: {q_choices}, Answer: {q_answer}",
                "topic_label": "Tree"
            })

        except Exception as e:
            print(f"❌ Skipping {q_number} due to error: {e}")
            skipped_questions +=1
    else:
        skipped_questions += 1


json_file = "quiz_data.json"

print(f"Number of skipped questions = {skipped_questions}")

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
