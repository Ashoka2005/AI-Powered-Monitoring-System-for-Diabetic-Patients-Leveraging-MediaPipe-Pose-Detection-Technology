const express = require('express');
const { protect } = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');
const axios = require('axios');
const router = express.Router();

// Send message to chatbot
router.post('/message', protect, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const chatSessionId = sessionId || require('crypto').randomUUID();

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const cleanMsg = message.trim();

    // 1. Save user message (resilient try/catch)
    try {
      await ChatMessage.create({
        userId: req.user._id,
        sessionId: chatSessionId,
        role: 'user',
        content: cleanMsg,
      });
    } catch (saveErr) {
      console.warn('Chat user message save note:', saveErr.message);
    }

    // 2. Resolve AI response
    let aiResponse = null;
    const mlUrl = process.env.ML_SERVICE_URL;
    const isRemoteML = mlUrl && !mlUrl.includes('localhost') && !mlUrl.includes('127.0.0.1') && !process.env.VERCEL;

    if (isRemoteML) {
      try {
        const response = await axios.post(`${mlUrl}/chat`, {
          message: cleanMsg,
          sessionId: chatSessionId,
          userId: (req.user._id || '').toString(),
        }, { timeout: 1500 });
        aiResponse = response.data;
      } catch (mlError) {
        aiResponse = generateClinicalResponse(cleanMsg, req.user);
      }
    } else {
      aiResponse = generateClinicalResponse(cleanMsg, req.user);
    }

    const replyContent = aiResponse.response || aiResponse.message || 'I am here to assist you with diabetes management.';

    // 3. Save assistant response (resilient try/catch)
    try {
      await ChatMessage.create({
        userId: req.user._id,
        sessionId: chatSessionId,
        role: 'assistant',
        content: replyContent,
        metadata: {
          intent: aiResponse.intent || 'general',
          confidence: aiResponse.confidence || 0.9,
        },
      });
    } catch (saveErr) {
      console.warn('Chat assistant message save note:', saveErr.message);
    }

    // 4. Return instant response
    res.json({
      success: true,
      data: {
        sessionId: chatSessionId,
        response: replyContent,
        intent: aiResponse.intent || 'general',
        confidence: aiResponse.confidence || 0.9,
      },
    });
  } catch (error) {
    console.error('[Chat API Error]:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to process chat message' });
  }
});

// Get chat history for a session
router.get('/history/:sessionId', protect, async (req, res) => {
  try {
    let messages = [];
    try {
      messages = await ChatMessage.find({
        userId: req.user._id,
        sessionId: req.params.sessionId,
      }).sort({ createdAt: 1 });
    } catch (dbErr) {
      const { chatMessages } = require('../config/memoryStore');
      messages = chatMessages.filter(
        (m) => m.sessionId === req.params.sessionId && (m.userId || '').toString() === req.user._id.toString()
      );
    }
    res.json({ success: true, data: messages || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get chat sessions list
router.get('/sessions', protect, async (req, res) => {
  try {
    let sessions = [];
    try {
      sessions = await ChatMessage.aggregate([
        { $match: { userId: req.user._id, role: 'user' } },
        { $group: { _id: '$sessionId', lastMessage: { $last: '$content' }, lastDate: { $last: '$createdAt' }, messageCount: { $sum: 1 } } },
        { $sort: { lastDate: -1 } },
        { $limit: 20 },
      ]);
    } catch (dbErr) {
      const { chatMessages } = require('../config/memoryStore');
      const sessionMap = new Map();
      for (const m of chatMessages) {
        if ((m.userId || '').toString() === req.user._id.toString() && m.role === 'user') {
          sessionMap.set(m.sessionId, {
            _id: m.sessionId,
            lastMessage: m.content,
            lastDate: m.createdAt,
            messageCount: (sessionMap.get(m.sessionId)?.messageCount || 0) + 1,
          });
        }
      }
      sessions = Array.from(sessionMap.values());
    }
    res.json({ success: true, data: sessions || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Feedback on message
router.put('/message/:id/feedback', protect, async (req, res) => {
  try {
    const { isHelpful } = req.body;
    try {
      await ChatMessage.findByIdAndUpdate(req.params.id, { isHelpful });
    } catch (e) {}
    res.json({ success: true, message: 'Feedback recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Intelligent Clinical Diabetic Response Engine
function generateClinicalResponse(message, user = {}) {
  const msg = (message || '').toLowerCase();
  const userName = user.firstName || 'there';
  const diabetesType = user.patientInfo?.diabetesType || 'type2';
  const isPregnant = user.patientInfo?.isPregnant === true || diabetesType === 'gestational';

  // 1. Emergency & Crisis Keywords
  if (msg.match(/(emergency|ambulance|hospital|unconscious|faint|dying|chest pain|collapsed|108|112|911)/)) {
    return {
      response: `🚨 **IMMEDIATE EMERGENCY ASSISTANCE**\n\nIf you or someone nearby is experiencing severe distress, shortness of breath, chest pain, or loss of consciousness:\n\n📞 **India National Emergency Number (All-in-One):** 112\n🚑 **Ambulance & Medical Emergency:** 108 or 102\n🏥 **National Health Helpline (Govt. of India):** 1075 (Toll-Free)\n\n*(If in the US/Canada, please dial 911 immediately).*\n\nPlease activate the SOS Alert on your DiaFit AI Dashboard to notify your registered emergency contacts with your live location.`,
      intent: 'emergency',
      confidence: 0.99,
    };
  }

  // 2. Official Indian Helplines
  if (msg.match(/(helpline|phone number|toll free|customer care|contact support|emergency number|india helpline)/)) {
    return {
      response: `🏥 **Official Healthcare & Emergency Helplines (India):**\n\n• **112** — Unified National Emergency Helpline\n• **108 / 102** — Emergency Medical & Ambulance Transport\n• **1075** — National Health Portal (Toll-Free, 24x7)\n• **1800-599-0019** — KIRAN Mental Health & Stress Relief\n• **14567** — Elder Line (Senior Citizen Assistance)\n• **1091** — Women Emergency Helpline\n• **011-23061266** — Health & Family Welfare Central Desk\n\nKeep these numbers saved on your phone for rapid access.`,
      intent: 'helpline_info',
      confidence: 0.98,
    };
  }

  // 3. Hypoglycemia (Low Blood Sugar / Shaking / Dizziness)
  if (msg.match(/(low sugar|hypoglycemia|shaky|shaking|dizzy|sweating|lightheaded|sugar drop|less than 70|< 70|54)/)) {
    return {
      response: `⚠️ **HYPOGLYCEMIA ALERT (Low Blood Sugar < 70 mg/dL):**\n\nFollow the clinical **15-15 Rule** immediately:\n\n1. **Consume 15 Grams of Fast-Acting Carbs:**\n   • 1/2 cup (120 ml) fruit juice or regular (non-diet) soda\n   • 3 to 4 glucose tablets or 1 tablespoon of sugar / honey\n   • 4 to 5 hard candies\n2. **Wait 15 Minutes:** Rest quietly and avoid physical activity.\n3. **Recheck Blood Glucose:** If still under 70 mg/dL, take another 15g of fast carbs and wait another 15 minutes.\n4. **Follow Up:** Once glucose rises above 80 mg/dL, have a small snack with complex carbs and protein (e.g., peanut butter with crackers or a cup of milk) to prevent a second drop.\n\n*If glucose drops below 54 mg/dL or you feel disoriented, call 112 / 108 immediately.*`,
      intent: 'hypoglycemia_protocol',
      confidence: 0.97,
    };
  }

  // 4. Hyperglycemia (High Blood Sugar / Spikes)
  if (msg.match(/(high sugar|hyperglycemia|sugar spike|glucose spike|high glucose|above 200|> 200|above 250|thirsty|frequent urination)/)) {
    return {
      response: `📈 **HYPERGLYCEMIA GUIDANCE (High Blood Sugar):**\n\nIf your glucose readings are elevated above 180-200 mg/dL:\n\n1. **Hydrate Liberally:** Drink 2 to 3 glasses of plain water to help your kidneys flush excess glucose via urine.\n2. **Administer Prescribed Medication:** Take your doctor-prescribed insulin or oral medication as directed. *Never double doses without medical advice.*\n3. **Light Physical Movement:** A 15-minute gentle walk promotes muscle glucose uptake without insulin. *(Note: If glucose is above 250 mg/dL or you have Type 1 diabetes, check for urinary ketones before exercising—avoid strenuous activity if ketones are present).*\n4. **Review Recent Intake:** High-refined carbohydrate meals, stress, missed doses, or illness often trigger spikes.\n\nLog your reading in DiaFit AI's **Health Log** to trace glycemic trends.`,
      intent: 'hyperglycemia_protocol',
      confidence: 0.95,
    };
  }

  // 5. Normal Blood Sugar Ranges & HbA1c
  if (msg.match(/(range|normal|target|fasting|postprandial|after meal|before meal|hba1c|a1c|reading)/)) {
    if (isPregnant) {
      return {
        response: `🎯 **Gestational Diabetes Blood Sugar Targets:**\n\nDuring pregnancy, tight glycemic control protects maternal and fetal health:\n• **Fasting / Before Meals:** Below 95 mg/dL\n• **1 Hour After Meals:** Below 140 mg/dL\n• **2 Hours After Meals:** Below 120 mg/dL\n• **Target HbA1c:** < 6.0% (or < 6.5% as recommended by your obstetrician)\n\nBe sure to log your readings daily and share logs with your obstetrician and endocrinologist.`,
        intent: 'gestational_targets',
        confidence: 0.96,
      };
    }
    return {
      response: `🎯 **Standard Clinical Blood Sugar Targets (ADA Guidelines):**\n\n• **Fasting / Before Meals:** 80 – 130 mg/dL\n• **2 Hours After Meals (Postprandial):** Under 180 mg/dL\n• **Bedtime:** 100 – 140 mg/dL\n• **HbA1c (3-Month Average):** Under 7.0% (for most non-pregnant adults)\n\n*Note:* Individual targets may vary based on age, duration of diabetes, and cardiovascular health. Consult your physician for your customized target range.`,
      intent: 'blood_sugar_targets',
      confidence: 0.95,
    };
  }

  // 6. Exercise & Workout Guidance
  if (msg.match(/(exercise|workout|walk|walking|squat|gym|running|pushup|yoga|cardio|weights|training|activity)/)) {
    if (isPregnant) {
      return {
        response: `🤰 **Pregnancy-Safe Diabetic Exercises (DiaFit AI):**\n\nSafe, physician-recommended activities for gestational diabetes:\n1. **Prenatal Yoga & Gentle Stretching:** Relieves lower back strain and improves circulation.\n2. **Brisk Walking (15–20 mins):** Excellent for post-meal glucose stabilization.\n3. **Seated Arm Circles & Seated Twists:** Safe upper-body toning without abdominal compression.\n4. **Kegel Exercises:** Strengthens the pelvic floor.\n\n⚠️ *Precautions:* Avoid lying flat on your back after the first trimester. Stay hydrated and avoid hot environments. Stop immediately if you experience cramping, dizziness, or contractions.`,
        intent: 'exercise_prenatal',
        confidence: 0.96,
      };
    }
    return {
      response: `🏋️ **Diabetic-Safe Physical Fitness (DiaFit AI):**\n\nRegular movement significantly improves insulin sensitivity and glycemic uptake by skeletal muscles:\n\n• **Aerobic Activity:** 150 minutes/week of moderate activity (brisk walking, cycling, stationary cycling).\n• **Resistance Training:** 2 to 3 days/week (Bodyweight squats, Bicep curls, Wall push-ups, Shoulder presses).\n• **Flexibility & Mobility:** Seated spinal twists and ankle pumps for peripheral circulation.\n\n💡 **Pre-Workout Checklist:**\n• Check glucose: If < 100 mg/dL, eat a 15g carb snack (banana or toast) first.\n• Wear comfortable, supportive footwear.\n• Use DiaFit AI's **AI Exercise Room** with real-time pose tracking to verify your posture and joint safety!`,
      intent: 'exercise_info',
      confidence: 0.95,
    };
  }

  // 7. Diet, Meals & Indian Diabetic Foods
  if (msg.match(/(diet|food|eat|meal|breakfast|lunch|dinner|snack|fruit|rice|roti|carbs|dal|sugar|sweet|stevia|nutrition)/)) {
    return {
      response: `🥗 **Clinical Diabetic Nutrition Guidelines:**\n\n• **Complex Carbohydrates:** Replace refined white rice and maida with whole-grain alternatives: Ragi, Jowar, Bajra, steel-cut oats, and quinoa.\n• **High Fiber & Superfoods:** Fenugreek (Methi) seeds, bitter gourd (Karela), and Jamun help slow glucose absorption.\n• **Lean Protein with Every Meal:** Moong dal, sprouted legumes, low-fat paneer, tofu, eggs, and skinless chicken.\n• **Diabetic-Friendly Fruits:** Berries, green apples, guava, and papaya (in controlled portions: 1 cup max). Avoid high-glycemic fruits like mango, chiku/sapota, and fruit juices.\n• **The Plate Method:** 50% non-starchy vegetables (spinach, cucumber, broccoli), 25% lean protein, and 25% complex carbs.\n\nCheck out the **Diet & Nutrition** section in DiaFit AI for your customized meal recommendations!`,
      intent: 'diet_nutrition',
      confidence: 0.94,
    };
  }

  // 8. Medications & Insulin
  if (msg.match(/(medicine|medication|pill|tablet|metformin|insulin|glimepiride|dose|injection)/)) {
    return {
      response: `💊 **Diabetic Medication & Insulin Best Practices:**\n\n• **Metformin:** Take with meals to reduce gastrointestinal upset and nausea.\n• **Insulin Injections:**\n  - Rotate injection sites (abdomen, outer thighs, upper arms) to prevent lipohypertrophy (fatty lumps).\n  - Store unopened insulin in the refrigerator (2°C to 8°C); current in-use pens/vials can remain at room temperature (< 30°C) for up to 28 days.\n  - Never expose insulin to direct sunlight or extreme heat.\n• **Adherence:** Never skip or alter medication dosages without discussing with your doctor.\n• **Reminders:** Set daily reminders to maintain consistent timing every day.`,
      intent: 'medication_guidance',
      confidence: 0.93,
    };
  }

  // 9. Foot Care & Diabetic Neuropathy
  if (msg.match(/(foot|feet|toe|neuropathy|tingling|numbness|blister|shoe|wound|ulcer)/)) {
    return {
      response: `🦶 **Diabetic Foot Care & Neuropathy Prevention:**\n\nDiabetic neuropathy reduces sensation, increasing the risk of unnoticed cuts or ulcers:\n\n1. **Daily Inspection:** Check top, bottom, and between toes for redness, blisters, or skin breaks.\n2. **Never Walk Barefoot:** Always wear protective socks and well-fitted diabetic footwear, even indoors.\n3. **Lukewarm Washing:** Wash feet with mild soap and lukewarm water. Always dry thoroughly between toes.\n4. **Moisturize:** Apply lotion to dry heels, but avoid applying cream directly between toes to prevent fungal growth.\n5. **Ankle Pumps:** Perform gentle ankle pumps and seated leg lifts to stimulate blood flow to the lower extremities.\n\n*Consult your physician promptly if you detect any non-healing sore or red spot.*`,
      intent: 'foot_care',
      confidence: 0.94,
    };
  }

  // 10. Gestational Diabetes & Pregnancy
  if (msg.match(/(pregnant|pregnancy|gestational|baby|fetal|trimester|maternal)/)) {
    return {
      response: `🤰 **Gestational Diabetes Overview (DiaFit AI):**\n\nGestational diabetes occurs when placental hormones cause insulin resistance during pregnancy. Key points:\n\n• **Target Fasting:** Below 95 mg/dL; 2-hour post-meal below 120 mg/dL.\n• **Frequent Small Meals:** 3 balanced meals + 2 to 3 snacks to maintain steady glucose and supply nutrition to your baby.\n• **Safe Activity:** 20 to 30 minutes of gentle walking after meals or prenatal yoga.\n• **Post-Delivery:** Blood sugar usually normalizes post-delivery, but routine follow-up testing (OGTT at 6-12 weeks postpartum) is essential.\n\nDiaFit AI's exercise recommendations automatically adapt when gestational mode is enabled!`,
      intent: 'gestational_overview',
      confidence: 0.95,
    };
  }

  // 11. Hydration & Water
  if (msg.match(/(water|hydration|fluid|drink|thirsty|thirst)/)) {
    return {
      response: `💧 **Hydration & Blood Glucose:**\n\nAdequate hydration is critical for diabetes management:\n• Aim for **2.5 to 3 Liters** of water daily.\n• When blood sugar rises, your kidneys filter excess glucose into urine, pulling fluid from tissues and causing dehydration. Drinking clean water rehydrates blood volume and dilutes glucose.\n• Stick to pure water, infused lemon/mint water, unsweetened buttermilk (chaas), or herbal teas. Avoid sweetened beverages and fruit juices.`,
      intent: 'hydration_info',
      confidence: 0.92,
    };
  }

  // 12. Diabetes Education & Fundamentals
  if (msg.match(/(what is diabetes|explain diabetes|type 1|type 2|diabetes definition|causes of diabetes|understanding diabetes|types of diabetes)/)) {
    return {
      response: `🩺 **Understanding Diabetes Mellitus:**\n\nDiabetes is a metabolic condition where your body either cannot produce enough insulin or cannot effectively utilize the insulin it produces, resulting in elevated blood glucose levels (hyperglycemia).\n\n• **Type 1 Diabetes:** An autoimmune condition where pancreatic beta cells are attacked, producing minimal or no insulin. Requires daily insulin replacement.\n• **Type 2 Diabetes:** The most common form (over 90% of cases), primarily driven by insulin resistance. Highly responsive to lifestyle changes, regular exercise, balanced nutrition, and oral medications or insulin.\n• **Gestational Diabetes:** Develops during pregnancy due to placental hormones inducing temporary insulin resistance.\n• **Prediabetes:** Blood sugar is elevated (HbA1c 5.7–6.4%) but below diabetic threshold. Proactive diet and workouts can reverse this stage!\n\nDiaFit AI is designed to support your journey through guided workouts, tailored meal plans, and real-time monitoring.`,
      intent: 'diabetes_education',
      confidence: 0.98,
    };
  }

  // 13. General Greetings
  if (msg.match(/^(hi|hello|hey|good morning|good evening|good afternoon|namaste|greetings)/)) {
    return {
      response: `Hello ${userName}! 👋 I am **DiaFit AI**, your dedicated healthcare and diabetic rehabilitation assistant.\n\nI can assist you with:\n• 📊 **Blood Sugar Targets & Logging** (fasting, postprandial, HbA1c)\n• 🏃 **Diabetic-Safe Exercises & Posture Coaching**\n• 🥗 **Personalized Meal & Diet Plans**\n• ⚠️ **Hypoglycemia (15-15 Rule) & Hyperglycemia SOS**\n• 🏥 **Indian Healthcare Helplines & Emergency Numbers**\n\nHow can I help you today?`,
      intent: 'greeting',
      confidence: 0.98,
    };
  }

  // 13. Gratitude & Courtesy
  if (msg.match(/(thank you|thanks|great|helpful|appreciate|good job)/)) {
    return {
      response: `You are very welcome, ${userName}! 😊 I am always here to support your health journey. Keep staying consistent with your workouts and nutrition to maintain stable glycemic levels! Let me know if you need anything else.`,
      intent: 'gratitude',
      confidence: 0.95,
    };
  }

  // 14. Default Contextual Fallback
  return {
    response: `Thank you for reaching out, ${userName}. As your DiaFit AI assistant, I can provide evidence-based guidance on:\n\n• **Blood Sugar Management:** Fasting & post-meal targets, handling low or high sugar spikes\n• **Exercise Coaching:** Safe aerobic, seated, and resistance exercises tailored for diabetes\n• **Clinical Diet Plans:** Low-glycemic meals, Indian diabetic superfoods, and portion control\n• **Safety & Helplines:** Indian emergency numbers (112 / 108 / 1075) and foot care\n\nCould you please specify your question or pick one of the quick questions above? *(For medical emergencies, please dial 112 / 108 immediately).*`,
    intent: 'general',
    confidence: 0.85,
  };
}

module.exports = router;
