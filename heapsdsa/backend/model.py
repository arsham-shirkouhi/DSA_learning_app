from flask import Flask
from langchain_ollama import OllamaLLM
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from loader import main as loadermain


#app = Flask(__name__)

def main():
    #loadermain()
    llm = OllamaLLM(model="codellama:13b-instruct")
    embedding = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    vectorstore = Chroma(
    persist_directory="./vector_db",
    embedding_function=embedding
    )
    generate(vectorstore, llm)


#@app.route('/generate', methods=['POST'])
def generate(vectorstore, llm):
    topic_query = "Stack"
    retrieved_docs = vectorstore.similarity_search(topic_query, k = 2)
    examples = "\n\n".join(doc.page_content for doc in retrieved_docs)

    prompt = f"Based on these examples:\n{examples}\n\nGenerate 5 new questions with the same topic."
    print(prompt)
    response = llm.invoke(prompt)
    print(response)

if __name__=="__main__":
    main()