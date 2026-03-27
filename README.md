---
title: AgroGPT
emoji: 🌿
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# AgroGPT Image Recognition Feature

## Overview
AgroGPT now includes plant disease identification through image analysis. Users can upload images of their plants to get expert advice on disease detection and treatment recommendations.

## Features

### 🌱 Text-Based Agriculture Assistant
- Ask questions about farming, crops, livestock, and agricultural practices
- Get expert advice from the AgroGPT AI model
- Interactive Q&A interface

### 📸 Plant Disease Detection
- Upload images of plant leaves or affected areas
- Automatic disease identification
- Expert treatment recommendations
- Support for multiple languages (English and Malayalam)

## Supported Image Formats
- PNG
- JPG/JPEG
- GIF
- BMP
- Maximum file size: 16MB

## Supported Diseases (Current Database)
1. **Sigatoka Leaf Spot (Banana)**
   - Treatment: Apply Mancozeb fungicide every 7-10 days
   - Prevention: Remove infected leaves, ensure proper drainage

2. **Paddy Blast Disease**
   - Treatment: Use resistant varieties, apply Tricyclazole
   - Prevention: Improve field sanitation, remove crop residue

3. **Healthy Plant Detection**
   - Confirms when no disease is detected
   - Provides general farming advice

## How to Use

### Web Interface
1. Start the Flask application: `python app.py`
2. Open your browser to `http://localhost:5000`
3. **For text questions**: Type your question and click "Ask"
4. **For image analysis**: 
   - Click the upload area or drag & drop an image
   - Preview the uploaded image
   - Click "Analyze Disease" to get results

### Command Line Interface
1. Run the demo: `python model.py`
2. For image analysis, type: `upload path/to/image.jpg`
3. For text questions, just type your question

## Technical Details

### Backend Architecture
- **Flask Web Server**: Handles HTTP requests and file uploads
- **Image Processing**: Validates and processes uploaded images
- **Disease Database**: Simulated database with disease information
- **AI Integration**: Uses Microsoft Phi-2 model for text responses

### Frontend Features
- **Responsive Design**: Works on desktop and mobile devices
- **Drag & Drop**: Easy image upload with visual feedback
- **Image Preview**: Shows uploaded image before analysis
- **Real-time Feedback**: Loading states and error handling

### File Structure
```
AgroGPT/
├── app.py                   # Flask web application
├── model.py                 # Core AI model and image recognition
├── static/
│   └── index.html          # Web interface
├── uploads/                # Temporary image storage (auto-created)
├── test_model.py           # Test script
└── README.md               # Documentation
```

## API Endpoints

### POST /api/ask
- **Purpose**: Handle text-based agriculture questions
- **Input**: JSON with `question` field
- **Output**: JSON with `answer` and `full_response`

### POST /api/upload
- **Purpose**: Handle image uploads for disease detection
- **Input**: Form data with `image` file
- **Output**: JSON with `analysis` result

### GET /api/status
- **Purpose**: Check if the AI model is loaded
- **Output**: JSON with `model_loaded` and `loading_progress`

## Development Notes

### Adding New Diseases
To add support for new plant diseases, update the `simulated_disease_database` in `model.py`:

```python
"new_disease.jpg": {
    "disease": "New Disease Name",
    "advice": "Treatment recommendations in English",
    "malayalam_advice": "Treatment recommendations in Malayalam"
}
```

### Integration with Real AI Models
The current implementation uses a simulated database. To integrate with real image classification models:

1. Replace the `analyze_image_for_disease()` function
2. Add proper image preprocessing
3. Load a trained model (e.g., using TensorFlow, PyTorch, or Hugging Face)
4. Implement proper model inference

### Security Considerations
- File uploads are validated for type and size
- Temporary files are automatically cleaned up
- Unique filenames prevent conflicts
- No persistent storage of uploaded images

## Troubleshooting

### Common Issues
1. **Model Loading**: Wait for the "Model loaded successfully!" message
2. **File Upload**: Ensure image is under 16MB and in supported format
3. **Network Errors**: Check if Flask server is running on port 5000

### Error Messages
- "Model is still loading": Wait for the AI model to finish loading
- "Invalid file type": Use supported image formats (PNG, JPG, etc.)
- "File size must be less than 16MB": Compress or resize your image

## Future Enhancements
- Integration with real plant disease classification models
- Support for more plant species and diseases
- Batch image processing
- Historical analysis tracking
- Mobile app development
- Integration with IoT sensors for field monitoring

