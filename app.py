import os
import sys
import platform
import argparse
from pathlib import Path
from flask import Flask, render_template, request, jsonify
import threading
import time
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import uuid
import requests

# Import the new model functionality
from model import check_ollama_connection, generate_with_ollama, analyze_image_for_disease
from weather import get_current_weather, TN_DISTRICTS

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Disable static file caching

# ----- DATABASE, AUTH & LIMITER SETUP -----
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_agrogpt_secret_key')
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///agrogpt.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Please log in to use this feature.'}), 401

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["1000 per day", "100 per hour"],
    storage_uri="memory://"
)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

with app.app_context():
    db.create_all()
# ------------------------------------------

@app.after_request
def add_no_cache_headers(response):
    """Prevent browser from caching static files during development."""
    if request.path.startswith('/static/'):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    return response

# Configuration for file uploads
if os.environ.get('VERCEL_ENV') or os.environ.get('VERCEL'):
    UPLOAD_FOLDER = '/tmp'
else:
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


@app.route('/api/weather', methods=['GET'])
def fetch_weather():
    """Fetch live weather for a district"""
    district = request.args.get('district', '').strip()
    if not district:
        return jsonify({'error': 'District parameter is required.'}), 400
    
    weather_data = get_current_weather(district)
    if weather_data.get('success'):
        return jsonify(weather_data)
    else:
        return jsonify(weather_data), 500

# ----- AUTHENTICATION ROUTES -----
@app.route('/api/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    login_user(new_user)
    return jsonify({'success': True, 'username': username})

@app.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        login_user(user)
        return jsonify({'success': True, 'username': username})
        
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'success': True})

@app.route('/api/user', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({'logged_in': True, 'username': current_user.username})
    return jsonify({'logged_in': False})
# ---------------------------------

@app.route('/api/ask', methods=['POST'])
@limiter.limit("10 per minute")
def ask_question():
    """Handle user questions"""
    if not ollama_connected:
        return jsonify({'error': 'Ollama is not connected. Please ensure Ollama is running.'}), 503
    
    data = request.get_json()
    question = data.get('question', '').strip()
    district = data.get('district', '').strip()
    
    if not question:
        return jsonify({'error': 'Please provide a question.'}), 400
    
    weather_context = ""
    if district and district in TN_DISTRICTS:
        weather_data = get_current_weather(district)
        if weather_data.get('success'):
            weather_context = f"\n\nCurrent Weather in {district}, Tamil Nadu: {weather_data['temperature']}°C, Humidity: {weather_data['humidity']}%, Condition: {weather_data['condition']} {weather_data['emoji']}, Wind Speed: {weather_data['wind_speed']} km/h. Please consider this live weather context in your advice if relevant."

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
            f"{weather_context}\n"
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
@login_required
@limiter.limit("10 per minute")
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
    port = int(os.environ.get("PORT", 7860))
    print(f"Starting web server...", flush=True)
    print(f"Open your browser and go to: http://0.0.0.0:{port}", flush=True)
    
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == "__main__":
    os.environ.setdefault("PYTHONUNBUFFERED", "1")
    main()
