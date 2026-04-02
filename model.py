import os
import sys
import platform
import argparse
import requests
import json
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

# Common configuration - Keeping Ollama naming for external appearance as requested
OLLAMA_API_URL = "Groq Cloud API"
OLLAMA_MODEL = "llama-3.3-70b-versatile"  # Upgraded model for better Tamil accuracy

# Initialize Groq client dynamically
client = None

def print_header() -> None:
    print("AgroGPT (Ollama Edition) starting...", flush=True)
    print(f"Python: {platform.python_version()} ({sys.executable})", flush=True)

def check_ollama_connection() -> bool:
    """Check if Groq API is reachable and key is valid (mimicking Ollama check)."""
    global client
    api_key = os.getenv("GROQ_API_KEY")
    
    # Hugging Face Docker Spaces secure secret mounting mechanism
    if not api_key and os.path.exists("/run/secrets/GROQ_API_KEY"):
        try:
            with open("/run/secrets/GROQ_API_KEY", "r") as f:
                api_key = f.read().strip()
        except:
            pass
            
    if not api_key:
        print("Error: GROQ_API_KEY not found in environment variables or /run/secrets.", flush=True)
        return False
        
    try:
        # Initialize client if not already done
        if not client:
            client = Groq(api_key=api_key)
            
        # Simple test call to verify connection
        client.models.list()
        print("Connected to Groq (Ollama interface active).", flush=True)
        return True
    except Exception as e:
        print(f"Error: Could not connect to backend: {str(e)}", flush=True)
        return False

def generate_with_ollama(prompt: str, model: str = OLLAMA_MODEL) -> str:
    """
    Generate a response using Groq (mimicking Ollama function).
    """
    global client
    api_key = os.getenv("GROQ_API_KEY")
    
    # Hugging Face Docker Spaces secure secret mounting mechanism
    if not api_key and os.path.exists("/run/secrets/GROQ_API_KEY"):
        try:
            with open("/run/secrets/GROQ_API_KEY", "r") as f:
                api_key = f.read().strip()
        except:
            pass
            
    if not client:
        if not api_key:
            return "Error: Groq API key not found in environment variables or /run/secrets."
        try:
            client = Groq(api_key=api_key)
        except Exception as e:
            return f"Error initializing Groq client: {str(e)}"
        
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Use plain text only. IMPORTANT: For Malayalam (മലയാളം) and Tamil (தமிழ்), ALWAYS use their native scripts. Do NOT use Latin/English alphabets for these languages. Do not use markdown, bolding, or asterisks."},
                {"role": "user", "content": prompt}
            ],
            stream=False
        )
        response = completion.choices[0].message.content
        return response.replace("*", "") # Final safety check to remove all asterisks
    except Exception as e:
        return f"Error generating response: {str(e)}"

# Import the disease detection module
try:
    from disease_detection import get_disease_detector
    HAS_DISEASE_DETECTION = True
except ImportError:
    HAS_DISEASE_DETECTION = False
    print("Warning: disease_detection module not found. Vision features disabled.")

def analyze_image_for_disease(image_path: str) -> str:
    """
    Analyzes a plant image using the local vision model, then generates
    expert advice using Groq (mimicking Ollama).
    """
    if not HAS_DISEASE_DETECTION:
        return "Error: Disease detection module not available."

    try:
        detector = get_disease_detector()
        result = detector.predict_disease(image_path)
        
        if "error" in result:
             return f"Analysis Error: {result.get('error')}"

        disease_name = result.get('prediction', 'Unknown')
        confidence = result.get('confidence', 0.0)
        
        # If it's a simulation (fallback), we might want to mention that
        is_simulated = result.get('simulation', False)
        
        # Construct prompt for the LLM
        prompt = (
            f"You are an expert plant pathologist. An image analysis system has detected "
            f"'{disease_name}' with {confidence*100:.1f}% confidence. "
            f"{'Note: This was a simulated detection based on color analysis.' if is_simulated else ''}\n\n"
            f"Provide detailed advice for the farmer. Structure your response EXACTLY as follows:\n"
            f"1. English Section: Describe the symptoms, then recommended treatments (organic and chemical), then preventive measures.\n"
            f"2. Write the header 'Malayalam Summary:' followed by a FULL translation of the above advice in native Malayalam script (മലയാളം). Do NOT use English/Latin letters for Malayalam.\n"
            f"3. Write the header 'Tamil Summary:' followed by a FULL translation of the above advice in native Tamil script (தமிழ்). Do NOT use English/Latin letters for Tamil.\n\n"
            f"Use double line breaks between sections. Do NOT use markdown formatting, bolding, or any asterisks (*).\n"
            f"Keep the tone helpful and professional."
        )
        
        print(f"Requesting advice for {disease_name}...", flush=True)
        advice = generate_with_ollama(prompt)
        
        return (
            f"=== Plant Disease Analysis ===\n"
            f"Detected: {disease_name}\n"
            f"Confidence: {confidence*100:.1f}%\n"
            f"{'(Simulated Detection)' if is_simulated else ''}\n\n"
            f"--- Expert Advice (via Llama 3.1) ---\n"
            f"{advice}"
        )

    except Exception as e:
        return f"Error during analysis: {str(e)}"

# --- Main function to handle the interactive loop ---
def main() -> None:
    print_header()
    
    if not check_ollama_connection():
        print("Fatal: Could not connect to backend. Exiting.", flush=True)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="AgroGPT Ollama Demo")
    parser.add_argument("--prompt", type=str, default=None, help="Single question to answer")
    args = parser.parse_args()

    if args.prompt:
        print(f"Prompt: {args.prompt}", flush=True)
        print("-" * 40)
        response = generate_with_ollama(args.prompt)
        print(response, flush=True)
        return
    
    print("Interactive mode. Type your question (or 'upload <path>' for images) and press Enter.", flush=True)
    while True:
        try:
            user_input = input("AgroGPT> ").strip()
        except EOFError:
            break
        
        if not user_input or user_input.lower() in {"exit", "quit"}:
            break
        
        if user_input.lower().startswith("upload "):
            image_path = user_input.split(" ", 1)[1].strip()
            print(analyze_image_for_disease(image_path), flush=True)
        else:
            # Regular text chat
            # We can add a system prompt wrapper here if we want consistent persona
            full_prompt = (
                "You are AgroGPT, a helpful agricultural assistant. "
                "Answer the following question clearly and concisely in plain text. "
                "Provide the main answer in English, then add a section header 'Malayalam Summary:' with the translation in native Malayalam (മലയാളം) script, "
                "then a section header 'Tamil Summary:' with the translation in native Tamil (தமிழ்) script. "
                "Use double line breaks between these sections. "
                "Do not use any markdown formatting or asterisks (*).\n\n"
                f"Question: {user_input}\nAnswer:"
            )
            print("Generating...", flush=True)
            response = generate_with_ollama(full_prompt)
            print(response, flush=True)
            print("-" * 40)

if __name__ == "__main__":
    main()