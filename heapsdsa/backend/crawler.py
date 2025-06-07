# import os
# import json
# import asyncio
# from pydantic import BaseModel, Field
# from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, LLMConfig, BrowserConfig, CacheMode
# from crawl4ai.extraction_strategy import LLMExtractionStrategy
# from crawl4ai.deep_crawling import BestFirstCrawlingStrategy
# from crawl4ai.deep_crawling.filters import FilterChain, URLPatternFilter, DomainFilter
# from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer

# class OpenAIModelFee(BaseModel):
#     model_name: str = Field(..., description="The questions in the page")
#     input_fee: str = Field(..., description="the possible answers for the question")
#     output_fee: str = Field(..., description="the correct answer for the question")

# async def extract_structured_data_using_llm(
#     provider: str, api_token: str = None, extra_headers: dict[str, str] = None
# ):
#     print(f"\n--- Extracting Data Structure Questions ---")

#     browser_config = BrowserConfig(headless=True)

#     # Create filters for DSA-related content
#     filter_chain = FilterChain([
#         DomainFilter(allowed_domains=["geeksforgeeks.org"]),
#         URLPatternFilter(patterns=["*data-structure*", "*algorithm*", "*dsa*", "*interview-question*"])
#     ])

#     # Create a scorer for DSA-related content
#     keyword_scorer = KeywordRelevanceScorer(
#         keywords=["data structure", "algorithm", "interview", "question", "solution"],
#         weight=0.7
#     )

#     extra_args = {"temperature": 0, "top_p": 0.9, "max_tokens": 2000}
#     if extra_headers:
#         extra_args["extra_headers"] = extra_headers

#     crawler_config = CrawlerRunConfig(
#         cache_mode=CacheMode.BYPASS,
#         word_count_threshold=1,
#         page_timeout=80000,
#         wait_for="js:() => window.loaded === true",
#         deep_crawl_strategy=BestFirstCrawlingStrategy(
#             max_depth=3,  # Crawl up to 3 levels deep
#             include_external=False,
#             filter_chain=filter_chain,
#             url_scorer=keyword_scorer,
#             max_pages=100  # Limit to 100 most relevant pages
#         ),
#         extraction_strategy=LLMExtractionStrategy(
#             llm_config = LLMConfig(provider=provider, api_token=api_token),
#             schema=OpenAIModelFee.model_json_schema(),
#             extraction_type="schema",
#             instruction="""Carefully analyze the content and extract data structure questions:

#             For each data structure or algorithm question found:
#             - In model_name: Extract the complete question text, including any important context or constraints
#             - In input_fee: List all the possible answers or solution approaches mentioned
#             - In output_fee: Provide the correct answer/solution with detailed explanation
            
#             Important:
#             - Focus only on data structure and algorithm related questions
#             - Include any code examples or implementation details in the answers
#             - must include the exact fully worded question 
#             - Make sure to capture all possible solution approaches mentioned
#             - For each answer, explain why it's correct or incorrect
#             - Skip any content not related to data structures or algorithms
            
#             Format the output to fit the three fields above, ensuring all relevant information is preserved.""",
#             extra_args=extra_args,
#         ),
#         stream=True  # Enable streaming for real-time results
#     )

#     async with AsyncWebCrawler(config=browser_config) as crawler:
#         async for result in await crawler.arun(
#             url="https://www.geeksforgeeks.org/quizzes/top-50-data-structures-mcqs-with-answers/", 
#             config=crawler_config
#         ):
#             print(f"\nProcessing URL: {result.url}")
#             print(result.extracted_content)
            

# if __name__ == "__main__":
#     asyncio.run(
#         extract_structured_data_using_llm(
#             provider="ollama/llama3")
#         )

import os
import json
import asyncio
from pydantic import BaseModel, Field
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, LLMConfig, BrowserConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from crawl4ai.deep_crawling import BestFirstCrawlingStrategy
from crawl4ai.deep_crawling.filters import FilterChain, URLPatternFilter, DomainFilter
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer

class DSAQuestion(BaseModel):
    Question_Type: str = Field(default="MCQ", description="Type of question (always MCQ)")
    Question: str = Field(..., description="The full text of the MCQ question")
    Choices: str = Field(..., description="Answer choices in format 'A) choice1; B) choice2; C) choice3; D) choice4'")
    Answer: str = Field(..., description="The correct answer letter (A, B, C, or D)")
    Topic: str = Field(..., description="The DSA topic extracted from the question")

async def extract_structured_data_using_llm(
    provider: str, api_token: str = None, extra_headers: dict[str, str] = None
):
    print(f"\n--- Extracting DSA MCQs ---")

    browser_config = BrowserConfig(headless=True)

    filter_chain = FilterChain([
        DomainFilter(allowed_domains=["geeksforgeeks.org"]),
        URLPatternFilter(patterns=["*data-structure*", "*algorithm*", "*dsa*", "*interview-question*"])
    ])

    keyword_scorer = KeywordRelevanceScorer(
        keywords=["data structure", "algorithm", "interview", "question", "heap", "tree", "graph"],
        weight=0.7
    )

    extra_args = {"temperature": 0, "top_p": 0.9, "max_tokens": 2000}
    if extra_headers:
        extra_args["extra_headers"] = extra_headers

    crawler_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        word_count_threshold=1,
        page_timeout=80000,
        wait_for="js:() => window.loaded === true",
        deep_crawl_strategy=BestFirstCrawlingStrategy(
            max_depth=3,
            include_external=False,
            filter_chain=filter_chain,
            url_scorer=keyword_scorer,
            max_pages=100
        ),
        extraction_strategy=LLMExtractionStrategy(
            llm_config=LLMConfig(provider=provider, api_token=api_token),
            schema=DSAQuestion.model_json_schema(),
            extraction_type="schema",
            instruction="""Extract DSA Multiple Choice Questions in the following format:

- Question_Type: Always "MCQ"
- Question: The complete question text
- Choices: Format as "A) choice1; B) choice2; C) choice3; D) choice4"
- Answer: Just the letter (A, B, C, or D)
- Topic: Extract the main DSA topic from the question (e.g., Heap, Tree, Graph, etc.)

Example format:
{
    "Question_Type": "MCQ",
    "Question": "What is the time complexity of inserting into a min-heap?",
    "Choices": "A) O(1); B) O(log n); C) O(n); D) O(n log n)",
    "Answer": "B",
    "Topic": "Heap"
}

Rules:
- Only extract actual MCQs about data structures and algorithms
- Format choices exactly as shown with semicolons between options
- Answer should be just the letter
- Topic should be derived from the question content""",
            extra_args=extra_args,
        ),
        stream=True
    )

    all_results = []

    async with AsyncWebCrawler(config=browser_config) as crawler:
        async for result in await crawler.arun(
            url="https://www.geeksforgeeks.org/quizzes/top-50-data-structures-mcqs-with-answers/", 
            config=crawler_config
        ):
            print(f"\nProcessed URL: {result.url}")
            if result.extracted_content:
                all_results.append(result.extracted_content)

    # Save only the extracted MCQs to a JSON file
    with open("dsa_mcqs.json", "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(all_results)} MCQs to dsa_mcqs.json")

if __name__ == "__main__":
    asyncio.run(
        extract_structured_data_using_llm(
            provider="ollama/llama3"
        )
    )
