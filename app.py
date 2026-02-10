import os
import sys
import platform
import argparse
from pathlib import Path
from flask import Flask, render_template, request, jsonify
import threading
import time
from werkzeug.utils import secure_filename
import uuid
import requests

# Import the new model functionality
from model import check_ollama_connection, generate_with_ollama, analyze_image_for_disease

app = Flask(__name__)

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global status
ollama_connected = False
status_message = "Initializing..."

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def print_header() -> None:
    print("AgroGPT Web Interface (Ollama Edition) starting...", flush=True)
    print(f"Python: {platform.python_version()} ({sys.executable})", flush=True)

def check_backend_status():
    """Check Ollama status in background"""
    global ollama_connected, status_message
    
    status_message = "Connecting to Ollama (via Groq API)..."
    print("Connecting to Ollama...", flush=True)
    
    if check_ollama_connection():
        ollama_connected = True
        status_message = "Connected to Ollama! Web interface is ready."
        print(status_message, flush=True)
    else:
        ollama_connected = False
        status_message = "Error: Could not connect to Ollama. Ensure GROQ_API_KEY is set in .env."
        print(status_message, flush=True)

@app.route('/')
def index():
    """Serve the main page"""
    return app.send_static_file('index.html')

@app.route('/api/status')
def get_status():
    """Get the current status"""
    # Re-check occasionally if not connected
    if not ollama_connected:
        threading.Thread(target=check_backend_status).start()
        
    return jsonify({
        'model_loaded': ollama_connected, # Keep key for frontend compatibility
        'loading_progress': status_message
    })

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Handle user questions"""
    if not ollama_connected:
        return jsonify({'error': 'Ollama is not connected. Please ensure Ollama is running.'}), 503
    
    data = request.get_json()
    question = data.get('question', '').strip()
    
    if not question:
        return jsonify({'error': 'Please provide a question.'}), 400
    
    try:
        # Construct prompt
        full_prompt = (
            "You are AgroGPT, an expert agriculture assistant. "
            "Answer the following question clearly and concisely in plain text. "
            "Provide the main answer in English, then add a section header 'Malayalam Summary:' with the translation in native Malayalam (മലയാളം) script, "
            "then a section header 'Tamil Summary:' with the translation in native Tamil (தமிழ்) script. "
            "Use double line breaks between these sections. "
            "CRITICAL: Do not use Latin/English alphabets for Malayalam or Tamil. "
            "Do not use markdown formatting or asterisks (*).\n\n"
            f"Question: {question}\nAnswer:"
        )
        
        print(f"Asking Ollama: {question}", flush=True)
        response_text = generate_with_ollama(full_prompt)
        
        return jsonify({
            'question': question,
            'answer': response_text,
            'full_response': response_text
        })
        
    except Exception as e:
        return jsonify({'error': f'Error generating response: {str(e)}'}), 500

@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Handle image uploads for disease detection"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Generate a unique filename to avoid conflicts
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        try:
            # Save the uploaded file
            file.save(filepath)
            
            # Analyze the image for disease (uses Ollama for advice)
            analysis_result = analyze_image_for_disease(filepath)
            
            # Clean up the uploaded file after analysis
            # Optional: Keep it if we want to log queries, but deleting for privacy/space
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({
                'success': True,
                'analysis': analysis_result,
                'filename': filename
            })
            
        except Exception as e:
            # Clean up file if it exists
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': f'Error processing image: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type. Please upload a PNG, JPG, JPEG, GIF, or BMP image.'}), 400

def main():
    """Main function to start the application"""
    print_header()
    
    # Check connection first
    check_backend_status()
    
    # Start Flask app
    print("Starting web server...", flush=True)
    print("Open your browser and go to: http://localhost:5000", flush=True)
    
    # Open browser automatically
    import webbrowser
    webbrowser.open('http://localhost:5000')
    
    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == "__main__":
    os.environ.setdefault("PYTHONUNBUFFERED", "1")
    main()
