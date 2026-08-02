"""
DiaFit AI - ML Microservice
Provides diabetic risk prediction, blood sugar forecasting,
diet recommendations, and healthcare chatbot responses.
"""
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from models.diabetes_risk import DiabetesRiskPredictor
from models.blood_sugar_predictor import BloodSugarPredictor
from models.diet_recommender import DietRecommender
from models.chatbot import HealthcareChatbot

app = Flask(__name__)
CORS(app)

# Initialize models
risk_predictor = DiabetesRiskPredictor()
sugar_predictor = BloodSugarPredictor()
diet_recommender = DietRecommender()
chatbot = HealthcareChatbot()


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'DiaFit AI ML Service'})


@app.route('/predict/risk', methods=['POST'])
def predict_risk():
    """Predict diabetic risk based on patient features"""
    try:
        data = request.get_json()
        prediction = risk_predictor.predict(data)
        return jsonify(prediction)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict/blood-sugar', methods=['POST'])
def predict_blood_sugar():
    """Forecast blood sugar trends"""
    try:
        data = request.get_json()
        prediction = sugar_predictor.predict(data)
        return jsonify(prediction)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/recommend/diet', methods=['POST'])
def recommend_diet():
    """Generate personalized diet recommendation"""
    try:
        data = request.get_json()
        recommendation = diet_recommender.recommend(data)
        return jsonify(recommendation)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/chat', methods=['POST'])
def chat():
    """Healthcare chatbot response"""
    try:
        data = request.get_json()
        response = chatbot.respond(data)
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
