"""
Diabetes Risk Prediction Model
Uses a scoring algorithm based on clinical risk factors
"""
import numpy as np


class DiabetesRiskPredictor:
    """Predict diabetic risk based on patient health metrics"""

    def __init__(self):
        # Risk factor weights (based on clinical studies)
        self.weights = {
            'age': 0.15,
            'bmi': 0.20,
            'family_history': 0.15,
            'physical_activity': 0.10,
            'fasting_glucose': 0.20,
            'hba1c': 0.15,
            'blood_pressure': 0.05,
        }

    def predict(self, data):
        """
        Calculate risk score (0-100) and risk level
        """
        age = data.get('age', 45)
        bmi = data.get('bmi', 25)
        family_history = data.get('familyHistory', False)
        physical_activity = data.get('physicalActivity', 'moderate')
        fasting_glucose = data.get('fastingGlucose', 100)
        hba1c = data.get('hba1c', 5.7)
        bp = data.get('bloodPressure', {'systolic': 120, 'diastolic': 80})
        if isinstance(bp, (int, float)):
            bp = {'systolic': bp, 'diastolic': 80}
        diabetes_type = data.get('diabetesType', '')

        # Age risk (higher risk with age)
        if age < 30:
            age_risk = 5
        elif age < 45:
            age_risk = 15
        elif age < 55:
            age_risk = 30
        elif age < 65:
            age_risk = 50
        else:
            age_risk = 70

        # BMI risk
        if bmi < 18.5:
            bmi_risk = 10
        elif bmi < 25:
            bmi_risk = 10
        elif bmi < 30:
            bmi_risk = 40
        elif bmi < 35:
            bmi_risk = 65
        else:
            bmi_risk = 85

        # Family history risk
        family_risk = 70 if family_history else 10

        # Physical activity risk
        activity_map = {'sedentary': 70, 'light': 45, 'moderate': 25, 'active': 10}
        activity_risk = activity_map.get(physical_activity, 25)

        # Fasting glucose risk
        if fasting_glucose < 100:
            glucose_risk = 10
        elif fasting_glucose < 126:
            glucose_risk = 45  # prediabetes
        elif fasting_glucose < 200:
            glucose_risk = 75  # diabetes
        else:
            glucose_risk = 95  # severe

        # HbA1c risk
        if hba1c < 5.7:
            hba1c_risk = 10
        elif hba1c < 6.5:
            hba1c_risk = 50  # prediabetes
        elif hba1c < 8:
            hba1c_risk = 75  # diabetes
        else:
            hba1c_risk = 95  # uncontrolled

        # Blood pressure risk
        sys_risk = 10 if bp.get('systolic', 120) < 130 else 50 if bp.get('systolic', 120) < 140 else 75

        # Weighted risk calculation
        risk_score = (
            age_risk * self.weights['age'] +
            bmi_risk * self.weights['bmi'] +
            family_risk * self.weights['family_history'] +
            activity_risk * self.weights['physical_activity'] +
            glucose_risk * self.weights['fasting_glucose'] +
            hba1c_risk * self.weights['hba1c'] +
            sys_risk * self.weights['blood_pressure']
        )

        risk_score = min(max(round(risk_score, 1), 0), 100)

        # Risk level
        if risk_score < 25:
            risk_level = 'low'
        elif risk_score < 50:
            risk_level = 'moderate'
        elif risk_score < 75:
            risk_level = 'high'
        else:
            risk_level = 'very_high'

        # Contributing factors
        factors = []
        if bmi_risk > 40:
            factors.append(f"BMI ({bmi:.1f}) indicates overweight/obese")
        if glucose_risk > 40:
            factors.append(f"Fasting glucose ({fasting_glucose} mg/dL) is elevated")
        if hba1c_risk > 40:
            factors.append(f"HbA1c ({hba1c}%) indicates poor glycemic control")
        if family_risk > 40:
            factors.append("Family history of diabetes")
        if activity_risk > 40:
            factors.append("Low physical activity level")
        if age_risk > 40:
            factors.append(f"Age ({age} years) increases risk")

        # Recommendations
        recommendations = []
        if bmi_risk > 40:
            recommendations.append("Focus on weight management through diet and exercise")
        if glucose_risk > 40 or hba1c_risk > 40:
            recommendations.append("Monitor blood sugar regularly and consult endocrinologist")
        if activity_risk > 40:
            recommendations.append("Increase physical activity to at least 150 min/week")
        if family_risk > 40:
            recommendations.append("Get regular diabetes screenings due to family history")
        recommendations.append("Maintain a balanced, low-glycemic diet")
        recommendations.append("Schedule regular health check-ups")

        return {
            'riskScore': risk_score,
            'riskLevel': risk_level,
            'factors': factors,
            'recommendations': recommendations,
            'breakdown': {
                'ageRisk': round(age_risk * self.weights['age'], 1),
                'bmiRisk': round(bmi_risk * self.weights['bmi'], 1),
                'glucoseRisk': round(glucose_risk * self.weights['fasting_glucose'], 1),
                'hba1cRisk': round(hba1c_risk * self.weights['hba1c'], 1),
                'familyRisk': round(family_risk * self.weights['family_history'], 1),
                'activityRisk': round(activity_risk * self.weights['physical_activity'], 1),
            },
        }
