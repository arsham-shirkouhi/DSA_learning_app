import os
import json
import asyncio
from pydantic import BaseModel, Field
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, LLMConfig, BrowserConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy

class OpenAIModelFee(BaseModel):
    model_name: str = Field(..., description="The questions in the page")
    input_fee: str = Field(..., description="the possible answers for the question")
    output_fee: str = Field(..., description="the correct answer for the question")

async def extract_structured_data_using_llm(
    provider: str, api_token: str = None, extra_headers: dict[str, str] = None
):
    print(f"\n--- Extracting Structured Data with {provider} ---")

    browser_config = BrowserConfig(headless=True)

    extra_args = {"temperature": 0, "top_p": 0.9, "max_tokens": 2000}
    if extra_headers:
        extra_args["extra_headers"] = extra_headers

    crawler_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        word_count_threshold=1,
        page_timeout=80000,
        wait_for="js:() => window.loaded === true",
        extraction_strategy=LLMExtractionStrategy(
            llm_config = LLMConfig(provider=provider,api_token=api_token),
            schema=OpenAIModelFee.model_json_schema(),
            extraction_type="schema",
            instruction="""From the crawled content, extract all mentioned questions along with the possible answers and the correct answer for each question. 
            Do not miss any topic in the entire content.""",
            extra_args=extra_args,
        ),
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(
            url="https://www.techiedelight.com/data-structures-and-algorithms-problems/", config=crawler_config
        )
        print(result.extracted_content)

if __name__ == "__main__":

    asyncio.run(
        extract_structured_data_using_llm(
            provider="ollama/llama3")
        )
