const express = require('express');
const { protect } = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');
const axios = require('axios');
const { v4: uuidv4 } = require('crypto');
const router = express.Router();

// Send message to chatbot
router.post('/message', protect, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const chatSessionId = sessionId || require('crypto').randomUUID();

    // Save user message
    await ChatMessage.create({
      userId: req.user._id,
      sessionId: chatSessionId,
      role: 'user',
      content: message,
    });

    // Get AI response
    let aiResponse;
    try {
      const response = await axios.post(`${process.env.ML_SERVICE_URL}/chat`, {
        message,
        sessionId: chatSessionId,
        userId: req.user._id.toString(),
      });
      aiResponse = response.data;
    } catch (mlError) {
      // Fallback rule-based responses
      aiResponse = generateFallbackResponse(message);
    }

    // Save AI response
    await ChatMessage.create({
      userId: req.user._id,
      sessionId: chatSessionId,
      role: 'assistant',
      content: aiResponse.response || aiResponse.message,
      metadata: {
        intent: aiResponse.intent || 'general',
        confidence: aiResponse.confidence || 0.8,
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: chatSessionId,
        response: aiResponse.response || aiResponse.message,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get chat history
router.get('/history/:sessionId', protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      userId: req.user._id,
      sessionId: req.params.sessionId,
    }).sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get chat sessions
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await ChatMessage.aggregate([
      { $match: { userId: req.user._id, role: 'user' } },
      { $group: { _id: '$sessionId', lastMessage: { $last: '$content' }, lastDate: { $last: '$createdAt' }, messageCount: { $sum: 1 } } },
      { $sort: { lastDate: -1 } },
      { $limit: 20 },
    ]);
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Feedback on message
router.put('/message/:id/feedback', protect, async (req, res) => {
  try {
    const { isHelpful } = req.body;
    await ChatMessage.findByIdAndUpdate(req.params.id, { isHelpful });
    res.json({ success: true, message: 'Feedback recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fallback chatbot responses
function generateFallbackResponse(message) {
  const msg = message.toLowerCase();

  const responses = {
    diabetes: {
      response: "Diabetes is a chronic condition that affects how your body processes blood sugar. There are two main types: Type 1 (autoimmune) and Type 2 (lifestyle-related). Regular exercise, balanced diet, and medication can help manage it effectively. Would you like specific tips for managing your blood sugar?",
      intent: 'diabetes_info',
      confidence: 0.85,
    },
    exercise: {
      response: "Exercise is excellent for diabetes management! It helps improve insulin sensitivity and lower blood sugar. Recommended exercises include walking, swimming, cycling, and resistance training. Aim for 150 minutes of moderate activity per week. Start slow and monitor your blood sugar before and after exercise. Would you like me to suggest specific exercises?",
      intent: 'exercise_info',
      confidence: 0.9,
    },
    diet: {
      response: "A diabetes-friendly diet focuses on whole grains, lean proteins, healthy fats, and plenty of non-starchy vegetables. Key tips:\n1. Choose complex carbs over refined ones\n2. Monitor portion sizes\n3. Eat at regular intervals\n4. Limit sugary drinks\n5. Include fiber-rich foods\n\nWould you like me to generate a personalized meal plan?",
      intent: 'diet_info',
      confidence: 0.88,
    },
    'blood sugar': {
      response: "Normal blood sugar ranges:\n- Fasting: 70-100 mg/dL\n- Before meals: 70-130 mg/dL\n- 2 hours after meals: Less than 180 mg/dL\n\nIf your readings are consistently outside these ranges, please consult your doctor. Would you like help logging your blood sugar readings?",
      intent: 'blood_sugar_info',
      confidence: 0.92,
    },
    insulin: {
      response: "Insulin is a hormone that helps your body use glucose for energy. Some people with diabetes need insulin injections. Important tips:\n- Store insulin properly (refrigerated)\n- Rotate injection sites\n- Monitor blood sugar regularly\n- Never skip doses\n\nAlways follow your doctor's prescribed insulin regimen. Do you have specific questions about insulin?",
      intent: 'insulin_info',
      confidence: 0.85,
    },
    emergency: {
      response: "🚨 **MEDICAL EMERGENCY?**\nIf you are in India, please call **112** (National Emergency) or **108 / 102** (Ambulance) immediately!\n(If you are in the US/Canada, call **911**).\n\nSigns of diabetic emergencies:\n- Severe hypoglycemia (blood sugar below 54 mg/dL)\n- Diabetic ketoacidosis (nausea, vomiting, rapid breathing)\n- Loss of consciousness\n\nUse the fall detection feature or alert button in the app for immediate help.",
      intent: 'emergency',
      confidence: 0.95,
    },
    helpline: {
      response: "🏥 **Official National Healthcare & Emergency Helpline Numbers of India:**\n\n📞 **National Emergency Number (All-in-One):** 112\n🚑 **Medical Emergency & Ambulance Service:** 108 or 102\n🏥 **National Health Helpline (Govt. of India):** 1075 (Toll-free) or 1800-180-1104\n🧠 **National Mental Health Helpline (KIRAN):** 1800-599-0019\n👵 **Senior Citizens Helpline (Elder Line):** 14567\n👩 **Women Emergency Helpline:** 1091\n🩺 **Health & Family Welfare Support Desk:** 011-23061266\n\nPlease save these numbers for your safety and quick access!",
      intent: 'helpline_info',
      confidence: 0.95,
    },
    india: {
      response: "DiaFit AI supports healthcare parameters tailored for India. For emergencies, here are the official Indian helpline numbers:\n\n📞 **National Emergency Number:** 112\n🚑 **Ambulance Services:** 108 / 102\n🏥 **National Health Helpline:** 1075 or 1800-180-1104\n\nLet me know if you need specific guidance on diabetes-friendly Indian foods, physical activities, or logging your blood sugar.",
      intent: 'helpline_info',
      confidence: 0.95,
    },
    medication: {
      response: "Common diabetes medications include Metformin, Sulfonylureas, DPP-4 inhibitors, and insulin. Always take medications as prescribed. Never adjust doses without consulting your doctor. Set reminders to take medications on time. Would you like to set up medication reminders?",
      intent: 'medication_info',
      confidence: 0.82,
    },
  };

  for (const [keyword, data] of Object.entries(responses)) {
    if (msg.includes(keyword)) return data;
  }

  // Greeting
  if (msg.match(/^(hi|hello|hey|good morning|good evening)/)) {
    return {
      response: "Hello! I'm DiaFit AI, your healthcare assistant. I can help you with diabetes management, exercise tips, diet recommendations, blood sugar monitoring, and more. How can I help you today?",
      intent: 'greeting',
      confidence: 0.95,
    };
  }

  // Default
  return {
    response: "Thank you for your message. I'm here to help with diabetes management, exercise, diet, blood sugar monitoring, and general health tips. Could you please rephrase your question or ask about one of these topics? If you need immediate medical help, please contact your doctor or call emergency services (112 in India, 911 in US/Canada).",
    intent: 'general',
    confidence: 0.5,
  };
}

module.exports = router;
