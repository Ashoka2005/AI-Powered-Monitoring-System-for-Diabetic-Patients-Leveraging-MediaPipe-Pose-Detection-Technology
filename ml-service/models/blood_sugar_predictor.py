"""
Blood Sugar Trend Prediction Model
Uses statistical methods for time-series forecasting
"""
import numpy as np
from datetime import datetime, timedelta


class BloodSugarPredictor:
    """Predict blood sugar trends based on historical readings"""

    def predict(self, data):
        """
        Forecast blood sugar values for the specified hours ahead
        """
        readings = data.get('readings', [])
        hours = data.get('hours', 24)

        if not readings or len(readings) < 3:
            return {
                'predictions': [],
                'statistics': {'average': 0, 'trend': 'insufficient_data'},
                'message': 'Need at least 3 readings to make predictions',
            }

        # Sort by date
        readings.sort(key=lambda x: x.get('date', x.get('timestamp', '')))
        values = [r.get('value', 0) for r in readings]
        dates = [r.get('date', r.get('timestamp', '')) for r in readings]

        # Calculate statistics
        avg = np.mean(values)
        std = np.std(values)
        min_val = min(values)
        max_val = max(values)

        # Trend detection using simple linear regression
        n = len(values)
        x = np.arange(n)
        slope = np.polyfit(x, values, 1)[0]

        if slope > 2:
            trend = 'rising'
        elif slope < -2:
            trend = 'falling'
        else:
            trend = 'stable'

        # Generate predictions using exponential moving average + trend
        predictions = []
        alpha = 0.3  # smoothing factor
        ema = values[-1]

        for i in range(1, hours + 1):
            # Apply trend with damping
            predicted = ema + (slope * 0.5) * (i / hours)
            # Add some randomness for realistic variation
            noise = np.random.normal(0, std * 0.1)
            predicted = predicted + noise
            # Clamp to realistic range
            predicted = max(50, min(400, predicted))
            # Update EMA
            ema = alpha * predicted + (1 - alpha) * ema

            pred_time = datetime.now() + timedelta(hours=i)
            predictions.append({
                'time': pred_time.isoformat(),
                'value': round(predicted, 1),
                'confidence': max(0.5, 0.95 - (i * 0.02)),  # decreasing confidence
            })

        # Risk assessment
        high_risk = sum(1 for p in predictions if p['value'] > 180)
        low_risk = sum(1 for p in predictions if p['value'] < 70)

        alerts = []
        if high_risk > hours * 0.3:
            alerts.append('High blood sugar predicted - consider adjusting diet or medication')
        if low_risk > hours * 0.1:
            alerts.append('Low blood sugar risk detected - keep glucose tablets handy')
        if trend == 'rising':
            alerts.append('Blood sugar trend is rising - monitor closely')

        return {
            'predictions': predictions[:hours],
            'statistics': {
                'average': round(float(avg), 1),
                'min': round(float(min_val), 1),
                'max': round(float(max_val), 1),
                'stdDev': round(float(std), 1),
                'trend': trend,
                'trendSlope': round(float(slope), 2),
            },
            'alerts': alerts,
            'timeInRange': {
                'inRange': round(sum(1 for v in values if 70 <= v <= 180) / len(values) * 100, 1),
                'belowRange': round(sum(1 for v in values if v < 70) / len(values) * 100, 1),
                'aboveRange': round(sum(1 for v in values if v > 180) / len(values) * 100, 1),
            },
        }
