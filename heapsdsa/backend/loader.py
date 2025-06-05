from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import pandas as pd
import json

def main():
    JSON_file_path = "./datasets/tempJsonData.JSON"
    csv_file_path = "./datasets/tempData.csv"
    embedding_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    JSON_to_CSV(JSON_file_path, csv_file_path)
    docs = loader(csv_file_path)
    embed(embedding_model, docs)


# loads csv file and converts each row into a LangChain Document
def loader(csv_file_path):
    loader = CSVLoader(file_path=csv_file_path ,
        csv_args={
            'delimiter': ',',
            'quotechar': '"',
            'fieldnames': ['Question Type', 'Question', 'Choices', 'Answer', 'Topic', 'Difficulty']
        }
    )

    docs = loader.load()
    return docs


# Converts JSON format to CSV format
def JSON_to_CSV(JSON_file_path, csv_file_path):
    # Load the actual JSON data from file
    with open(JSON_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    df = pd.DataFrame(data)
    df.to_csv(csv_file_path, index=False)


# embeds the documents into a vector database
def embed(embedding_model, docs, persist_dir="./vector_db"): #persist_dir ensures that it will load the same vector DB again later
    vectorestore = Chroma.from_documents(
        documents=docs,
        embedding=embedding_model,
        persist_directory=persist_dir
    )

if __name__ == "__main__":
    main()