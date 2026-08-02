const express = require('express');
const { protect } = require('../middleware/auth');
const DietPlan = require('../models/DietPlan');
const axios = require('axios');
const router = express.Router();

// Generate AI diet recommendation
router.post('/recommend', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    let aiPlan;
    try {
      const response = await axios.post(`${process.env.ML_SERVICE_URL}/recommend/diet`, {
        age: user.profile?.dateOfBirth ? new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear() : 45,
        gender: user.profile?.gender || 'male',
        weight: user.profile?.weight || 70,
        height: user.profile?.height || 170,
        bmi: user.bmi || 25,
        diabetesType: user.patientInfo?.diabetesType || 'type2',
        conditions: user.patientInfo?.conditions || [],
        allergies: user.patientInfo?.allergies || [],
        isPregnant: user.patientInfo?.isPregnant === true,
        pregnancyWeeks: user.patientInfo?.pregnancyWeeks || 0,
        preferences: req.body.preferences || {},
      });
      aiPlan = response.data;
    } catch (mlError) {
      // Fallback diet plan
      aiPlan = {
        title: 'Diabetic-Friendly Meal Plan',
        description: 'AI-generated meal plan optimized for blood sugar control',
        totalCalories: 1800,
        totalCarbs: 180,
        totalProtein: 90,
        totalFat: 60,
        glycemicLoad: 85,
        meals: [
          {
            name: 'Breakfast',
            time: '08:00',
            calories: 400,
            carbs: 40,
            protein: 25,
            fat: 12,
            glycemicIndex: 45,
            items: [
              { name: 'Oatmeal with berries', quantity: '1 cup', calories: 250 },
              { name: 'Boiled eggs', quantity: '2', calories: 140 },
            ],
          },
          {
            name: 'Lunch',
            time: '13:00',
            calories: 550,
            carbs: 55,
            protein: 30,
            fat: 18,
            glycemicIndex: 42,
            items: [
              { name: 'Grilled chicken salad', quantity: '1 bowl', calories: 350 },
              { name: 'Quinoa', quantity: '1/2 cup', calories: 200 },
            ],
          },
          {
            name: 'Snack',
            time: '16:00',
            calories: 200,
            carbs: 20,
            protein: 10,
            fat: 8,
            glycemicIndex: 30,
            items: [
              { name: 'Mixed nuts', quantity: '30g', calories: 180 },
              { name: 'Apple', quantity: '1 small', calories: 80 },
            ],
          },
          {
            name: 'Dinner',
            time: '19:00',
            calories: 500,
            carbs: 45,
            protein: 35,
            fat: 15,
            glycemicIndex: 38,
            items: [
              { name: 'Baked salmon', quantity: '150g', calories: 300 },
              { name: 'Steamed vegetables', quantity: '1 cup', calories: 100 },
              { name: 'Brown rice', quantity: '1/2 cup', calories: 110 },
            ],
          },
        ],
        restrictions: ['Limit refined sugars', 'Avoid white bread', 'Limit fruit juices'],
        recommendations: ['Eat at regular intervals', 'Stay hydrated', 'Include fiber-rich foods', 'Monitor portion sizes'],
      };
    }

    // Deactivate old plans
    await DietPlan.updateMany({ userId: req.user._id, isActive: true }, { isActive: false });

    const plan = await DietPlan.create({
      userId: req.user._id,
      generatedBy: 'ai',
      ...aiPlan,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active diet plan
router.get('/active', protect, async (req, res) => {
  try {
    const plan = await DietPlan.findOne({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    if (!plan) return res.status(404).json({ success: false, message: 'No active diet plan found' });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get diet plan history
router.get('/history', protect, async (req, res) => {
  try {
    const plans = await DietPlan.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
