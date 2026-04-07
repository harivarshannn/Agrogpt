import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Path to local PDFs
PDF_FILES = [
    "1_agro.pdf",
    "2-agro.pdf",
    "3-agrogpt.pdf",
    "4-agrogpt.pdf"
]

# Writeable path on Hugging Face for the vector store
VECTORSTORE_DIR = "vectorstore"

# Global variable to hold the FAISS index in memory
_vector_store = None

def get_embeddings_model():
    """Return the HuggingFace embeddings model. Uses a lightweight fast model."""
    # Using all-MiniLM-L6-v2 as it's very fast and effective for semantic search
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def initialize_knowledge_base():
    """
    Checks if the vector database exists in /tmp/vectorstore.
    If not, it reads the PDFs, chunks them, generates embeddings, and saves the DB.
    """
    global _vector_store
    
    if os.path.exists(VECTORSTORE_DIR) and os.path.exists(os.path.join(VECTORSTORE_DIR, "index.faiss")):
        print(f"Loading existing vector database from {VECTORSTORE_DIR}...")
        _vector_store = FAISS.load_local(VECTORSTORE_DIR, get_embeddings_model(), allow_dangerous_deserialization=True)
        return _vector_store
        
    print("Vector database not found. Initializing knowledge base (this may take a minute)...", flush=True)
    os.makedirs(VECTORSTORE_DIR, exist_ok=True)
    
    documents = []
    for pdf_file in PDF_FILES:
        try:
            if os.path.exists(pdf_file):
                print(f"Parsing {pdf_file}...", flush=True)
                loader = PyPDFLoader(pdf_file)
                documents.extend(loader.load())
            else:
                print(f"Warning: {pdf_file} not found in the root directory.", flush=True)
        except Exception as e:
            print(f"Error parsing {pdf_file}: {e}", flush=True)

    if not documents:
        print("No documents were loaded. Vector database initialization skipped.", flush=True)
        return None

    print(f"Total pages loaded: {len(documents)}. Splitting text...", flush=True)
    
    # Split the documents into manageable chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_documents(documents)
    
    print(f"Created {len(chunks)} text chunks. Generating embeddings...", flush=True)
    
    # Generate embeddings and build FAISS index
    embeddings = get_embeddings_model()
    _vector_store = FAISS.from_documents(chunks, embeddings)
    
    # Save for subsequent requests
    _vector_store.save_local(VECTORSTORE_DIR)
    print(f"Vector database built and saved to {VECTORSTORE_DIR} successfully.", flush=True)
    
    return _vector_store

def query_rag(question: str, k: int = 3) -> str:
    """
    Searches the FAISS vector database for chunks related to the question.
    Returns a formatted string containing the retrieved context.
    """
    global _vector_store
    
    if not _vector_store:
        _vector_store = initialize_knowledge_base()
        
    if not _vector_store:
        # If it's still None (e.g. PDFs missing or error), return empty context
        return ""
        
    try:
        # Perform similarity search
        docs = _vector_store.similarity_search(question, k=k)
        
        # Format the retrieved documents into a single context string
        context = "\n\n".join([f"[Source: {doc.metadata.get('source', 'Unknown')}]\n{doc.page_content}" for doc in docs])
        return context
    except Exception as e:
        print(f"Error querying RAG: {e}", flush=True)
        return ""
