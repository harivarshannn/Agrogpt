import sys
import os
import traceback

# Add the root directory to sys.path so it can find app.py
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

try:
    from app import app
except Exception as e:
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    error_message = traceback.format_exc()
    print("FATAL ERROR ON STARTUP:\n", error_message)
    
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        return jsonify({
            "error": "Failed to load application.",
            "traceback": error_message
        }), 500
