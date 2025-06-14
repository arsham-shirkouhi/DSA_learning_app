import os
import json
import asyncio
from pydantic import BaseModel, Field
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, LLMConfig, BrowserConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from crawl4ai.deep_crawling import BestFirstCrawlingStrategy
from crawl4ai.deep_crawling.filters import FilterChain, URLPatternFilter, DomainFilter
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer


os.environ["CRAWL4AI_SECTION_SPLIT_TAGS"] = "li,h2,h3,h4,div,p"

# Define structured schema for extracted questions
class DSAQuestion(BaseModel):
    Question_Type: str = Field(default="MCQ", description="Type of question (always MCQ)")
    Question: str = Field(..., description="The full text of the MCQ question")
    Choices: str = Field(..., description="Answer choices in format 'A) choice1; B) choice2; C) choice3; D) choice4'")
    Answer: str = Field(..., description="The correct answer letter (A, B, C, or D)")
    Topic: str = Field(..., description="The DSA topic extracted from the question")

# Main function to run the crawler
async def extract_structured_data_using_llm(provider: str, api_token: str = None):
    print(f"\n--- Extracting DSA MCQs ---")

    # Browser config (optional: set headless=True later if working fine)
    browser_config = BrowserConfig(headless=True)

    # Domain and URL filtering
    filter_chain = FilterChain([
        DomainFilter(allowed_domains=["scholarhat.com"]),
        URLPatternFilter(patterns=["*data-structures*", "*algorithms*", "*mcq*", "*graph*"])
    ])

    # Keyword scoring logic
    keyword_scorer = KeywordRelevanceScorer(
        keywords=["data structure", "algorithm", "interview", "question", "heap", "tree", "graph"],
        weight=0.7
    )

    # LLM configuration
    llm_config = LLMConfig(
        provider=provider,
        api_token=api_token
    )

    # Crawler configuration
    crawler_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        word_count_threshold=1,
        page_timeout=80000,
        wait_for="js:() => document.readyState === 'complete'",
        deep_crawl_strategy=BestFirstCrawlingStrategy(
            max_depth=10,
            include_external=False,
            filter_chain=filter_chain,
            url_scorer=keyword_scorer,
            max_pages=30  # Lowered for stability
        ),
        extraction_strategy=LLMExtractionStrategy(
            llm_config=llm_config,
            schema=DSAQuestion.model_json_schema(),
            extraction_type="section",
            instruction="""Extract all available DSA Multiple Choice Questions from the section. Do not skip or summarize.

- Question_Type: Always "MCQ"
- Question: Copy the question text exactly as it appears on the page, without paraphrasing or rewording.
- Choices: Reproduce the choices exactly in the format: "A) choice1; B) choice2; C) choice3; D) choice4". Preserve exact spelling, punctuation, and wording as shown on the original page.
- Answer: Extract the correct answer as a single uppercase letter: A, B, C, or D. Determine the correct choice from the options presented.
- Topic: Identify the main DSA topic from the content of the question (e.g., Heap, Tree, Graph, Hash Table, etc.). This should reflect the subject being tested, not the wording.

Strict rules:
- Do not paraphrase or rewrite the question or choices in any way.
- Only extract real multiple-choice questions related to Data Structures and Algorithms.
- The “Choices” must include exactly four labeled options (A, B, C, D), each separated by semicolons.
- The “Answer” must match one of the letters corresponding to the given options.
- The “Topic” must be derived based on the concept being tested in the question.

Example:
{
  "Question_Type": "MCQ",
  "Question": "What is the time complexity of inserting into a min-heap?",
  "Choices": "A) O(1); B) O(log n); C) O(n); D) O(n log n)",
  "Answer": "B",
  "Topic": "Heap"
}
""",
            extra_args={"temperature": 0, "top_p": 0.9, "max_tokens": 4096}
        ),
        stream=True
    )

    all_results = []

    async with AsyncWebCrawler(config=browser_config, concurrency=1) as crawler:
        async for result in await crawler.arun(
            url="https://www.scholarhat.com/tutorial/datastructures/data-structures-mcqs",
            config=crawler_config
        ):
            print(f"\nProcessed URL: {result.url}")
            if result.extracted_content:
                all_results.append(result.extracted_content)

    # Save to file: remove duplicates & write one JSON object per line
    seen_questions = set()
    with open("dsa_mcqs.json", "w", encoding="utf-8") as f:
        for item in all_results:
            try:
                parsed = json.loads(item) if isinstance(item, str) else item
            except Exception:
                continue

            entries = parsed if isinstance(parsed, list) else [parsed]

            for obj in entries:
                if not isinstance(obj, dict):
                    continue
                question = obj.get("Question", "").strip()
                if question and question not in seen_questions:
                    seen_questions.add(question)
                    json.dump(obj, f, ensure_ascii=False)
                    f.write("\n")

    print(f"\nSaved {len(seen_questions)} unique MCQs to dsa_mcqs.json")

# Run the script
if __name__ == "__main__":
    asyncio.run(
        extract_structured_data_using_llm(
            provider="ollama/llama3"
        )
    )
