from flask import Flask
from langchain_ollama import OllamaLLM
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler 
from loader import main as loadermain


#app = Flask(__name__)

def main():
    print("🚀 Creating LLM...")
    llm = OllamaLLM(
        model="codellama",
        streaming=True,
        callbacks=[StreamingStdOutCallbackHandler()]
    )
    print("✅ LLM created.")

    print("🧠 Loading embeddings...")
    embedding = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
        )
    print("✅ Embeddings loaded.")

    print("📦 Loading vector store...")
    vectorstore = Chroma(
        persist_directory="./vector_db",
        embedding_function=embedding
    )
    print("✅ Vector store loaded.")

    generate(vectorstore, llm)


#@app.route('/generate', methods=['POST'])
def generate(vectorstore, llm):
    topic_query = "Stack"
    print("🔍 Starting similarity search...")
    retrieved_docs = vectorstore.similarity_search(topic_query, k = 1)
    print("✅ Similarity search complete.")

    examples = "\n\n".join(doc.page_content for doc in retrieved_docs)

    prompt = f"Based on these examples:\n{examples}\n\nGenerate 5 new questions with the same topic."
    print("🧠 Prompt constructed.")
    print(prompt)

    print("⚙️ Calling LLM...")
    response = llm.invoke(prompt)
    print("✅ LLM response received.")
    print(response)

if __name__=="__main__":
    main()