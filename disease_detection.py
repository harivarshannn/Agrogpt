"""
Disease Detection Module for AgroGPT
This module integrates the trained PyTorch model for plant disease detection.
"""

import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import json
import os
from typing import Dict, Tuple, Optional
import numpy as np

class DiseaseDetector:
    def __init__(self, model_path: str = "models/efficientnet_b0.pt", classes_path: str = "models/classes.json"):
        """
        Initialize the disease detector with the trained model.

        Args:
            model_path: Path to the trained PyTorch model
            classes_path: Path to the classes JSON file
        """
        self.model_path = model_path
        self.classes_path = classes_path
        self.model = None
        self.classes = []
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        # Load model and classes
        self._load_model()
        self._load_classes()

        # Disease-specific advice database
        self.disease_advice = {
            "Pepper__bell___Bacterial_spot": {
                "advice": "Apply copper-based bactericides or streptomycin. Remove and destroy infected plants. Practice crop rotation and avoid overhead irrigation.",
                "malayalam_advice": "ചെമ്പ് അടിസ്ഥാനമായ ബാക്ടീരിസൈഡുകൾ പ്രയോഗിക്കുക. രോഗബാധിത സസ്യങ്ങൾ നീക്കം ചെയ്ത് നശിപ്പിക്കുക."
            },
            "Potato___Early_blight": {
                "advice": "Apply fungicides containing mancozeb or chlorothalonil. Remove affected leaves and practice crop rotation. Ensure proper spacing for air circulation.",
                "malayalam_advice": "മാങ്കോസെബ് അല്ലെങ്കിൽ ക്ലോറോതലോണിൽ അടങ്ങിയ കുമിൾനാശിനി പ്രയോഗിക്കുക."
            },
            "Potato___Late_blight": {
                "advice": "Use resistant varieties. Apply metalaxyl or mancozeb-based fungicides. Destroy infected plant debris and avoid overhead watering.",
                "malayalam_advice": "പ്രതിരോധ ശേഷിയുള്ള വിത്തിനങ്ങള്‍ ഉപയോഗിക്കുക. മെറ്റലാക്സിൽ അല്ലെങ്കിൽ മാങ്കോസെബ് അടിസ്ഥാനമായ കുമിൾനാശിനി പ്രയോഗിക്കുക."
            },
            "Tomato_Bacterial_spot": {
                "advice": "Use disease-free seeds. Apply copper-based sprays. Practice crop rotation and avoid working in wet fields.",
                "malayalam_advice": "രോഗമുക്തമായ വിത്തുകൾ ഉപയോഗിക്കുക. ചെമ്പ് അടിസ്ഥാനമായ സ്പ്രേകൾ പ്രയോഗിക്കുക."
            },
            "Tomato_Early_blight": {
                "advice": "Remove lower leaves showing symptoms. Apply fungicides preventatively. Mulch around plants to prevent soil splash.",
                "malayalam_advice": "ലക്ഷണങ്ങൾ കാണിക്കുന്ന താഴെ ഇലകൾ നീക്കം ചെയ്യുക."
            },
            "healthy": {
                "advice": "Plant appears healthy. Continue good agricultural practices including proper watering, fertilization, and pest monitoring.",
                "malayalam_advice": "സസ്യം ആരോഗ്യകരമായി കാണുന്നു. നല്ല കാർഷിക രീതികൾ തുടരുക."
            }
        }

    def _load_model(self):
        """Load the trained PyTorch model."""
        try:
            if os.path.exists(self.model_path):
                # Import torchvision models
                from torchvision import models
                
                # Create EfficientNet-B0 model structure
                self.model = models.efficientnet_b0(pretrained=False)
                num_features = self.model.classifier[1].in_features
                self.model.classifier = nn.Sequential(
                    nn.Dropout(0.2),
                    nn.Linear(num_features, 25)  # 25 classes based on classes.json
                )

                # Load the trained weights
                checkpoint = torch.load(self.model_path, map_location=self.device)
                self.model.load_state_dict(checkpoint)
                self.model.to(self.device)
                self.model.eval()
                print(f"Disease detection model loaded successfully from {self.model_path}")
            else:
                print(f"Model file not found at {self.model_path}. Using simulated detection.")
                self.model = None
        except Exception as e:
            print(f"Error loading model: {e}. Using simulated detection.")
            self.model = None

    def _load_classes(self):
        """Load the class labels."""
        try:
            if os.path.exists(self.classes_path):
                with open(self.classes_path, 'r') as f:
                    self.classes = json.load(f)
                print(f"Loaded {len(self.classes)} disease classes")
            else:
                print(f"Classes file not found at {self.classes_path}")
                self.classes = [
                    "Pepper__bell___Bacterial_spot", "Pepper__bell___healthy",
                    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
                    "Tomato_Bacterial_spot", "Tomato_Early_blight", "Tomato_Late_blight",
                    "Tomato_Leaf_Mold", "Tomato_Septoria_leaf_spot",
                    "Tomato_Spider_mites_Two_spotted_spider_mite", "Tomato__Target_Spot",
                    "Tomato__Tomato_YellowLeaf__Curl_Virus", "Tomato__Tomato_mosaic_virus",
                    "Tomato_healthy", "arasa_tree_diease", "flower_diease",
                    "four_clever_diease", "fungus_diease", "guava_diease",
                    "hibiscus_diease", "kunga_maram-diease", "murungai_diease",
                    "plant_diease", "tamrind_diease"
                ]
        except Exception as e:
            print(f"Error loading classes: {e}")
            # Default classes
            self.classes = [
                "Pepper__bell___Bacterial_spot", "Pepper__bell___healthy",
                "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
                "Tomato_Bacterial_spot", "Tomato_Early_blight", "Tomato_Late_blight",
                "Tomato_Leaf_Mold", "Tomato_Septoria_leaf_spot",
                "Tomato_Spider_mites_Two_spotted_spider_mite", "Tomato__Target_Spot",
                "Tomato__Tomato_YellowLeaf__Curl_Virus", "Tomato__Tomato_mosaic_virus",
                "Tomato_healthy", "arasa_tree_diease", "flower_diease",
                "four_clever_diease", "fungus_diease", "guava_diease",
                "hibiscus_diease", "kunga_maram-diease", "murungai_diease",
                "plant_diease", "tamrind_diease"
            ]

    def preprocess_image(self, image_path: str) -> torch.Tensor:
        """
        Preprocess the input image for model prediction.

        Args:
            image_path: Path to the input image

        Returns:
            Preprocessed tensor ready for model input
        """
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image)
        image_tensor = image_tensor.unsqueeze(0)  # Add batch dimension
        return image_tensor.to(self.device)

    def predict_disease(self, image_path: str) -> Dict[str, any]:
        """
        Predict the disease from an input image.

        Args:
            image_path: Path to the input image

        Returns:
            Dictionary containing prediction results and advice
        """
        if not os.path.exists(image_path):
            return {
                "error": f"Image file not found: {image_path}",
                "prediction": None,
                "confidence": 0.0,
                "advice": "Please provide a valid image file.",
                "malayalam_advice": "സാധുവായ ഒരു ചിത്രം നൽകുക."
            }

        try:
            # If we have a real model, use it for prediction
            if self.model is not None:
                # Preprocess image
                image_tensor = self.preprocess_image(image_path)

                # Make prediction
                with torch.no_grad():
                    outputs = self.model(image_tensor)
                    probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                    confidence, predicted_idx = torch.max(probabilities, 0)

                    predicted_class = self.classes[predicted_idx.item()]
                    confidence_score = confidence.item()

                    # Get disease advice
                    advice_data = self.disease_advice.get(predicted_class, {
                        "advice": "Continue monitoring your plants for any signs of stress or disease. Maintain good agricultural practices.",
                        "malayalam_advice": "നിങ്ങളുടെ സസ്യങ്ങൾക്ക് പ്രതിസന്ധിയോ രോഗലക്ഷണങ്ങളോ ഉണ്ടോ എന്ന് നിരീക്ഷിക്കുക."
                    })

                    return {
                        "prediction": predicted_class,
                        "confidence": confidence_score,
                        "advice": advice_data["advice"],
                        "malayalam_advice": advice_data["malayalam_advice"]
                    }
            else:
                # Fallback to simulated detection based on image analysis
                return self._simulate_disease_detection(image_path)

        except Exception as e:
            return {
                "error": f"Error processing image: {str(e)}",
                "prediction": None,
                "confidence": 0.0,
                "advice": "Please try uploading a clearer image or describe the symptoms you observe.",
                "malayalam_advice": "വ്യക്തമായ ഒരു ചിത്രം അപ്‌ലോഡ് ചെയ്യാൻ ശ്രമിക്കുക."
            }

    def _simulate_disease_detection(self, image_path: str) -> Dict[str, any]:
        """
        Simulate disease detection based on image characteristics.
        This is used when the actual model is not available.
        """
        try:
            from PIL import Image
            import numpy as np

            # Load and analyze the image
            image = Image.open(image_path)
            image_array = np.array(image)

            # Convert to RGB if needed
            if len(image_array.shape) == 3:
                # Analyze color characteristics
                red_channel = image_array[:, :, 0]
                green_channel = image_array[:, :, 1]
                blue_channel = image_array[:, :, 2]

                # Calculate average colors
                avg_red = np.mean(red_channel)
                avg_green = np.mean(green_channel)
                avg_blue = np.mean(blue_channel)

                # Analyze for disease patterns based on color characteristics
                brown_ratio = avg_red / (avg_green + 1)  # Avoid division by zero
                yellow_ratio = (avg_red + avg_green) / (avg_blue + 1)

                # Simulate disease detection based on color analysis
                if brown_ratio > 1.3 and avg_red > 100:
                    # Likely brown spot disease
                    predicted_class = "Tomato_Early_blight"  # Example disease
                    confidence = 0.85
                elif yellow_ratio > 2.0 and avg_green < 120:
                    # Likely chlorosis or nutrient deficiency
                    predicted_class = "Tomato_Leaf_Mold"  # Example disease
                    confidence = 0.75
                elif avg_green > 150 and avg_red < 80:
                    # Likely healthy plant
                    predicted_class = "Tomato_healthy"
                    confidence = 0.90
                else:
                    # General disease symptoms detected
                    predicted_class = "Tomato_Bacterial_spot"  # Example disease
                    confidence = 0.70

                # Get disease advice
                advice_data = self.disease_advice.get(predicted_class, {
                    "advice": "Some disease symptoms are visible. Apply appropriate treatment based on the specific symptoms observed.",
                    "malayalam_advice": "ചില രോഗ ലക്ഷണങ്ങൾ കണ്ടെത്തി. നിരീക്ഷിച്ച പ്രത്യേക ലക്ഷണങ്ങൾക്കനുസരിച്ച് യോഗ്യമായ ചികിത്സ പ്രയോഗിക്കുക."
                })

                return {
                    "prediction": predicted_class,
                    "confidence": confidence,
                    "advice": advice_data["advice"],
                    "malayalam_advice": advice_data["malayalam_advice"],
                    "simulation": True  # Indicates this is simulated
                }
        except Exception as e:
            return {
                "error": f"Error in simulated detection: {str(e)}",
                "prediction": None,
                "confidence": 0.0,
                "advice": "Please describe the symptoms you observe (spots, discoloration, wilting, etc.) and I can provide specific treatment recommendations.",
                "malayalam_advice": "ലക്ഷണങ്ങൾ വിവരിക്കുക (സ്പോട്ടുകൾ, വർണ്ണഭേദം, വെള്ളില്ലാപ്പ് മുതലായവ) എന്നാൽ ഞാൻ പ്രത്യേക ചികിത്സാ ശുപാർശകൾ നൽകാം."
            }

# Global instance
_detector = None

def get_disease_detector() -> DiseaseDetector:
    """Get or create a global disease detector instance."""
    global _detector
    if _detector is None:
        _detector = DiseaseDetector()
    return _detector

def analyze_plant_image(image_path: str) -> str:
    """
    Analyze a plant image for disease detection and provide treatment advice.

    Args:
        image_path: Path to the uploaded plant image

    Returns:
        Formatted string with disease analysis and advice
    """
    detector = get_disease_detector()
    result = detector.predict_disease(image_path)

    if "error" in result:
        return f"Error: {result['error']}\nAdvice: {result['advice']}"

    # Format the result nicely
    output = []
    output.append("=== Plant Disease Analysis Report ===")
    output.append(f"Predicted Disease: {result['prediction']}")
    output.append(f"Confidence Level: {result['confidence']*100:.1f}%")
    output.append("")
    output.append("Treatment Recommendations:")
    output.append(result['advice'])
    output.append("")
    output.append("Malayalam Translation:")
    output.append(result['malayalam_advice'])

    if result.get('simulation'):
        output.append("")
        output.append("(Note: Using simulated detection as the model file is not available)")

    return "\n".join(output)