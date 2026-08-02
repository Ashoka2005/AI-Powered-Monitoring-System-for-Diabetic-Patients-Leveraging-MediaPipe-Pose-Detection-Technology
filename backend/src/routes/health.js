const express = require('express');
const { protect } = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const axios = require('axios');
const router = express.Router();

// Add health record
router.post('/', protect, async (req, res) => {
  try {
    const record = await HealthRecord.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get health records
router.get('/', protect, async (req, res) => {
  try {
    const { metricType, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = { userId: req.user._id };
    if (metricType) filter.metricType = metricType;
    if (startDate || endDate) {
      filter.recordedAt = {};
      if (startDate) filter.recordedAt.$gte = new Date(startDate);
      if (endDate) filter.recordedAt.$lte = new Date(endDate);
    }

    const records = await HealthRecord.find(filter)
      .sort({ recordedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await HealthRecord.countDocuments(filter);
    res.json({ success: true, data: records, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Blood sugar trends
router.get('/blood-sugar/trends', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const records = await HealthRecord.find({
      userId: req.user._id,
      metricType: { $in: ['fasting', 'postprandial', 'random'] },
      recordedAt: { $gte: since },
    }).sort({ recordedAt: 1 });

    // Calculate statistics
    const values = records.map((r) => r.value);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const inRange = values.filter((v) => v >= 70 && v <= 180).length;
    const timeInRange = values.length ? (inRange / values.length) * 100 : 0;

    res.json({
      success: true,
      data: {
        records,
        statistics: { average: Math.round(avg), min, max, timeInRange: Math.round(timeInRange), totalReadings: values.length },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Predict blood sugar trends (calls ML service)
router.post('/blood-sugar/predict', protect, async (req, res) => {
  try {
    const records = await HealthRecord.find({
      userId: req.user._id,
      metricType: { $in: ['fasting', 'postprandial', 'random'] },
    })
      .sort({ recordedAt: -1 })
      .limit(30);

    const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict/blood-sugar`, {
      readings: records.map((r) => ({ value: r.value, date: r.recordedAt, type: r.metricType })),
      hours: req.body.hours || 24,
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'ML service unavailable', fallback: true });
  }
});

// Glycemic Impact Score
router.get('/glycemic-score', protect, async (req, res) => {
  try {
    const { calculateGlycemicImpactScore } = require('../utils/glycemicScore');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const records = await HealthRecord.find({
      userId: req.user._id,
      metricType: { $in: ['fasting', 'postprandial', 'random', 'hba1c'] },
      recordedAt: { $gte: thirtyDaysAgo },
    }).sort({ recordedAt: 1 });

    const score = calculateGlycemicImpactScore(records);
    res.json({ success: true, data: score });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Diabetic risk prediction (calls ML service)
router.post('/risk-prediction', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict/risk`, {
      age: user.profile?.dateOfBirth ? new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear() : 45,
      bmi: user.bmi || 25,
      familyHistory: req.body.familyHistory || false,
      physicalActivity: req.body.physicalActivity || 'moderate',
      diet: req.body.diet || 'balanced',
      bloodPressure: req.body.bloodPressure || { systolic: 120, diastolic: 80 },
      fastingGlucose: req.body.fastingGlucose || 100,
      hba1c: req.body.hba1c || 5.7,
      diabetesType: user.patientInfo?.diabetesType || '',
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    // Fallback calculation if ML service is unavailable
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    let riskScore = 20;
    if (user.bmi > 30) riskScore += 15;
    if (user.patientInfo?.diabetesType === 'type2') riskScore += 20;
    if (req.body.fastingGlucose > 126) riskScore += 20;
    if (req.body.hba1c > 6.5) riskScore += 15;

    res.json({
      success: true,
      data: {
        riskScore: Math.min(riskScore, 100),
        riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'moderate' : 'low',
        factors: ['BMI', 'Blood Sugar', 'Family History'],
        recommendations: ['Regular exercise', 'Balanced diet', 'Regular monitoring'],
        fallback: true,
      },
    });
  }
});

module.exports = router;
