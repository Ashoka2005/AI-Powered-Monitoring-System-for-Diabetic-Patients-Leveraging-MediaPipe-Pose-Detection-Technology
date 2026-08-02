"""
Healthcare Chatbot
NLP-based conversational agent for diabetes health queries
"""
import re


class HealthcareChatbot:
    """Rule-based + keyword-matching healthcare chatbot"""

    def __init__(self):
        self.knowledge_base = self._build_knowledge_base()

    def _build_knowledge_base(self):
        return {
            'diabetes': {
                'keywords': ['diabetes', 'diabetic', 'type 1', 'type 2', 'gestational', 'prediabetes'],
                'response': "Diabetes is a metabolic condition where your body cannot properly regulate blood sugar. Type 1 is autoimmune (insulin-dependent), while Type 2 is lifestyle-related. Management includes regular exercise, balanced diet, medication adherence, and blood sugar monitoring. DiaFit AI helps you with all of these! Would you like to try our pose-guided exercise feature?",
                'intent': 'diabetes_info',
            },
            'exercise': {
                'keywords': ['exercise', 'workout', 'physical activity', 'fitness', 'gym', 'training'],
                'response': "Exercise is crucial for diabetes management! It improves insulin sensitivity and helps lower blood sugar. Recommended: 150 min/week of moderate activity. DiaFit AI offers real-time pose detection to guide your form during exercises like shoulder presses, squats, and more. Start with our beginner exercises and track your progress. Shall I suggest some exercises?",
                'intent': 'exercise_info',
            },
            'blood sugar': {
                'keywords': ['blood sugar', 'glucose', 'blood glucose', 'sugar level', 'reading'],
                'response': "Blood sugar targets:\n- Fasting: 70-100 mg/dL (normal), 100-125 (prediabetes), 126+ (diabetes)\n- Before meals: 70-130 mg/dL\n- 2 hours after meals: Less than 180 mg/dL\n- HbA1c target: Below 7%\n\nDiaFit AI can track your trends and predict future values. Would you like to log a reading or see your trends?",
                'intent': 'blood_sugar_info',
            },
            'diet': {
                'keywords': ['diet', 'food', 'meal', 'eat', 'nutrition', 'carbohydrate', 'protein'],
                'response': "A diabetes-friendly diet emphasizes:\n- Complex carbs (whole grains, legumes) over simple sugars\n- Lean proteins (chicken, fish, tofu)\n- Healthy fats (avocado, nuts, olive oil)\n- High-fiber vegetables\n- Regular meal timing\n\nAvoid: sugary drinks, white bread, processed snacks, excess fruit juice. Use our AI diet recommender for a personalized plan!",
                'intent': 'diet_info',
            },
            'insulin': {
                'keywords': ['insulin', 'injection', 'pump', 'dosage'],
                'response': "Insulin helps your cells absorb glucose from the blood. Key points:\n- Store insulin in the refrigerator (not freezer)\n- Rotate injection sites to prevent lipodystrophy\n- Never skip doses\n- Check blood sugar before dosing\n- Types: rapid-acting, short-acting, intermediate, long-acting\n\nAlways follow your doctor's prescribed regimen. DiaFit AI can help you track your doses and blood sugar response.",
                'intent': 'insulin_info',
            },
            'medication': {
                'keywords': ['medication', 'medicine', 'metformin', 'drug', 'pill', 'prescription'],
                'response': "Common diabetes medications:\n- Metformin (first-line, reduces liver glucose)\n- Sulfonylureas (stimulate insulin production)\n- DPP-4 inhibitors (improve insulin secretion)\n- SGLT2 inhibitors (reduce glucose reabsorption)\n- GLP-1 agonists (slow digestion, increase insulin)\n\nTake medications as prescribed and report side effects to your doctor. Set reminders in DiaFit AI to never miss a dose!",
                'intent': 'medication_info',
            },
            'emergency': {
                'keywords': ['emergency', 'fall', 'faint', 'unconscious', '911', 'hospital', 'urgent', 'dying', 'accident'],
                'response': (
                    "🚨 **MEDICAL EMERGENCY?**\n"
                    "If you are in India, please call **112** (National Emergency Response) or **108 / 102** (Ambulance) immediately!\n"
                    "(If you are in the US/Canada, call **911**).\n\n"
                    "Critical Diabetic Warning Signs requiring urgent medical care:\n"
                    "- Severe Hypoglycemia (blood sugar < 54 mg/dL causing confusion, sweating, loss of consciousness)\n"
                    "- Diabetic Ketoacidosis (nausea, vomiting, rapid breathing, dry mouth)\n"
                    "- Loss of consciousness or severe dizziness\n"
                    "- Chest pain or difficulty breathing\n\n"
                    "DiaFit AI's fall detection can automatically alert your emergency contacts. Stay safe!"
                ),
                'intent': 'emergency',
            },
            'helpline': {
                'keywords': ['helpline', 'india', 'indian', 'emergency number', 'contact number', 'phone number', 'toll free', 'support line', 'medical help', 'police', 'ambulance', 'delhi', 'mumbai'],
                'response': (
                    "🏥 **Official National Healthcare & Emergency Helpline Numbers of India:**\n\n"
                    "📞 **National Emergency Number (All-in-One):** 112\n"
                    "🚑 **Medical Emergency & Ambulance Service:** 108 or 102\n"
                    "🏥 **National Health Helpline (Govt. of India):** 1075 (Toll-free) or 1800-180-1104\n"
                    "🧠 **National Mental Health Helpline (KIRAN):** 1800-599-0019\n"
                    "👵 **Senior Citizens Helpline (Elder Line):** 14567\n"
                    "👩 **Women Emergency Helpline:** 1091\n"
                    "🩺 **Health & Family Welfare Support Desk:** 011-23061266\n\n"
                    "Please save these numbers for your safety and quick access!"
                ),
                'intent': 'helpline_info',
            },
            'hypoglycemia': {
                'keywords': ['low blood sugar', 'hypo', 'hypoglycemia', 'dizzy', 'shaking', 'sweating'],
                'response': "Hypoglycemia (low blood sugar, below 70 mg/dL) symptoms: shaking, sweating, dizziness, confusion, hunger.\n\nTreatment (15-15 rule):\n1. Consume 15g fast-acting carbs (glucose tablets, juice, candy)\n2. Wait 15 minutes\n3. Recheck blood sugar\n4. Repeat if still below 70 mg/dL\n\nAlways carry a glucose source. DiaFit AI can alert your contacts if your levels drop dangerously low.",
                'intent': 'hypoglycemia_info',
            },
            'hba1c': {
                'keywords': ['hba1c', 'a1c', 'glycated hemoglobin', 'three month'],
                'response': "HbA1c measures your average blood sugar over 2-3 months:\n- Normal: Below 5.7%\n- Prediabetes: 5.7% - 6.4%\n- Diabetes: 6.5% or higher\n- Target for diabetics: Below 7%\n\nGet tested every 3-6 months. DiaFit AI calculates your estimated A1c from daily readings using the Glycemic Impact Score. Would you like to check yours?",
                'intent': 'hba1c_info',
            },
            'weight': {
                'keywords': ['weight', 'bmi', 'obesity', 'overweight', 'lose weight', 'fat'],
                'response': "Weight management is key for Type 2 diabetes:\n- Even 5-10% weight loss improves insulin sensitivity\n- Target BMI: 18.5 - 24.9\n- Combine diet changes with regular exercise\n- Avoid crash diets\n- Focus on sustainable lifestyle changes\n\nDiaFit AI calculates your BMI, tracks weight, and provides exercise guidance with pose detection to help you reach your goals!",
                'intent': 'weight_info',
            },
        }

    def respond(self, data):
        """Generate chatbot response"""
        message = data.get('message', '').lower().strip()

        if not message:
            return {
                'response': "Hello! I'm DiaFit AI, your diabetes health assistant. Ask me about diabetes, exercise, blood sugar, diet, medications, or any health concern. How can I help you?",
                'intent': 'greeting',
                'confidence': 1.0,
            }

        # Greeting patterns
        if re.match(r'^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings|howdy)', message):
            return {
                'response': "Hello! I'm DiaFit AI, your healthcare companion. I can help you with:\n- Diabetes information\n- Exercise guidance with pose detection\n- Blood sugar monitoring\n- Diet recommendations\n- Medication info\n- Emergency guidance\n\nWhat would you like to know?",
                'intent': 'greeting',
                'confidence': 1.0,
            }

        # Thank you
        if re.search(r'(thank|thanks|appreciate)', message):
            return {
                'response': "You're welcome! I'm here to help you manage your diabetes journey. Feel free to ask anything else about exercise, diet, blood sugar, or any health concern. Stay healthy!",
                'intent': 'gratitude',
                'confidence': 1.0,
            }

        # Search knowledge base
        best_match = None
        best_score = 0

        for topic, info in self.knowledge_base.items():
            score = sum(1 for kw in info['keywords'] if kw in message)
            if score > best_score:
                best_score = score
                best_match = info

        if best_match and best_score > 0:
            confidence = min(0.95, 0.6 + (best_score * 0.1))
            return {
                'response': best_match['response'],
                'intent': best_match['intent'],
                'confidence': confidence,
            }

        # Fallback
        return {
            'response': "I appreciate your question. While I'm specialized in diabetes management, I can help with topics like exercise, blood sugar monitoring, diet plans, medications, and emergency guidance. Could you rephrase your question or ask about one of these topics?\n\nFor medical emergencies, please call 112 (India) or 911 immediately.",
            'intent': 'unknown',
            'confidence': 0.3,
        }
