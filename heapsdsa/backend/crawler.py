import os
import json
import asyncio
from pydantic import BaseModel, Field
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, LLMConfig, BrowserConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from crawl4ai.deep_crawling import BestFirstCrawlingStrategy
from crawl4ai.deep_crawling.filters import FilterChain, URLPatternFilter, DomainFilter
from crawl4ai.deep_crawling.scorers import KeywordRelevanceScorer

class OpenAIModelFee(BaseModel):
    model_name: str = Field(..., description="The questions in the page")
    input_fee: str = Field(..., description="the possible answers for the question")
    output_fee: str = Field(..., description="the correct answer for the question")

async def extract_structured_data_using_llm(
    provider: str, api_token: str = None, extra_headers: dict[str, str] = None
):
    print(f"\n--- Extracting Data Structure Questions ---")

    browser_config = BrowserConfig(headless=True)

    # Create filters for DSA-related content
    filter_chain = FilterChain([
        DomainFilter(allowed_domains=["geeksforgeeks.org"]),
        URLPatternFilter(patterns=["*data-structure*", "*algorithm*", "*dsa*", "*interview-question*"])
    ])

    # Create a scorer for DSA-related content
    keyword_scorer = KeywordRelevanceScorer(
        keywords=["data structure", "algorithm", "interview", "question", "solution"],
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
            max_depth=3,  # Crawl up to 3 levels deep
            include_external=False,
            filter_chain=filter_chain,
            url_scorer=keyword_scorer,
            max_pages=100  # Limit to 100 most relevant pages
        ),
        extraction_strategy=LLMExtractionStrategy(
            llm_config = LLMConfig(provider=provider, api_token=api_token),
            schema=OpenAIModelFee.model_json_schema(),
            extraction_type="schema",
            instruction="""Carefully analyze the content and extract data structure questions:

            For each data structure or algorithm question found:
            - In model_name: Extract the complete question text, including any important context or constraints
            - In input_fee: List all the possible answers or solution approaches mentioned
            - In output_fee: Provide the correct answer/solution with detailed explanation
            
            Important:
            - Focus only on data structure and algorithm related questions
            - Include any code examples or implementation details in the answers
            - Make sure to capture all possible solution approaches mentioned
            - For each answer, explain why it's correct or incorrect
            - Skip any content not related to data structures or algorithms
            
            Format the output to fit the three fields above, ensuring all relevant information is preserved.""",
            extra_args=extra_args,
        ),
        stream=True  # Enable streaming for real-time results
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        async for result in await crawler.arun(
            url="https://www.geeksforgeeks.org/top-100-data-structure-and-algorithms-dsa-interview-questions-topic-wise/", 
            config=crawler_config
        ):
            print(f"\nProcessing URL: {result.url}")
            print(result.extracted_content)
            

if __name__ == "__main__":
    asyncio.run(
        extract_structured_data_using_llm(
            provider="ollama/llama2")
        )
