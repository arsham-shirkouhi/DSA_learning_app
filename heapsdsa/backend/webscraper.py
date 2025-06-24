from selenium import webdriver
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import csv
import time
impot json

# Set up Edge WebDriver
options = webdriver.EdgeOptions()
#options.add_argument('--headless')  # Comment this line if you want to see the browser
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')

driver = webdriver.Edge(service=EdgeService(EdgeChromiumDriverManager().install()), options=options)

# Go to the quiz page
url = "https://www.geeksforgeeks.org/quizzes/top-mcqs-on-array-data-structure-with-answers/"
driver.get(url)

# Wait for content to load
wait = WebDriverWait(driver, 20)

# Scroll smoothly to the bottom of the page
driver.execute_script("""
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
""")

# Wait for the scroll to finish (adjust as needed)
time.sleep(3)

# Find all MCQ blocks
question_blocks = driver.find_elements(By.XPATH, "//div[contains(@class, 'QuizQuestionCard_quizCard__9T_0J')]")
print (len(question_blocks))

loop_counter = 0

quiz_data = []  # ⬅️ To collect all the scraped questions

for card in question_blocks:
    loop_counter += 1
    q_ps = card.find_elements(By.XPATH, ".//p")
    q_number = q_ps[0].text if len(q_ps) > 0 else ""
    q_title = q_ps[1].text if len(q_ps) > 1 else ""
    q_code = ""

    try:
        # Get code block
        q_codepanel = card.find_element(By.XPATH, ".//div[@class='highlight']")
        pre = q_codepanel.find_element(By.XPATH, ".//pre")
        q_code = pre.text
    except Exception:
        pass  # No code block — that's okay

    q_choices = [li.text for li in card.find_elements(By.XPATH, ".//ul/li")]
    
    # # Click the first choice if available
    # if len(q_choices) > 0:
    #     q_choices[0].click()
    #     time.sleep(1)
        
    # try:
    #     # Get right answer
    #     q_answers = card.find_element(By.XPATH, ".//u/li")
    #     for answer in q_answers:
    #         try:
    #             q_answer = 

    # Add to list as a dictionary
    quiz_data.append({
        "question_number": q_number,
        "question_title": q_title,
        "code": q_code,
        "choices": q_choices
    })

# Write the list to a JSON file
with open("quiz_data.json", "w", encoding="utf-8") as f:
    json.dump(quiz_data, f, indent=4, ensure_ascii=False)

print("✅ Data saved to quiz_data.json")

        
driver.quit()