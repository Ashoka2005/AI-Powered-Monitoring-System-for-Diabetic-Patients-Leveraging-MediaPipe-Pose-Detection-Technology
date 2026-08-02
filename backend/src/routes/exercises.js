const express = require('express');
const { protect } = require('../middleware/auth');
const Exercise = require('../models/Exercise');
const ExerciseSession = require('../models/ExerciseSession');
const User = require('../models/User');
const router = express.Router();

// Get all exercises
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty, diabetes } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (diabetes === 'true') filter.isDiabetesRecommended = true;

    const exercises = await Exercise.find(filter).sort({ name: 1 });
    res.json({ success: true, data: exercises });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get exercise recommendations based on user BMI and age
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Calculate age from dateOfBirth
    let age = null;
    let ageCategory = 'adult'; // 'child', 'adult', 'senior'
    let ageCategoryLabel = 'Adult';
    if (user.profile && user.profile.dateOfBirth) {
      const birthDate = new Date(user.profile.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        ageCategory = 'child';
        ageCategoryLabel = 'Child';
      } else if (age >= 65) {
        ageCategory = 'senior';
        ageCategoryLabel = 'Senior Citizen';
      } else {
        ageCategory = 'adult';
        ageCategoryLabel = 'Adult';
      }
    }

    // 2. Fetch BMI from virtual property
    const bmi = user.bmi;
    let bmiCategory = 'normal'; // 'underweight', 'normal', 'overweight', 'obese'
    let bmiCategoryLabel = 'Normal Weight';
    if (bmi) {
      if (bmi < 18.5) {
        bmiCategory = 'underweight';
        bmiCategoryLabel = 'Underweight';
      } else if (bmi >= 18.5 && bmi < 25) {
        bmiCategory = 'normal';
        bmiCategoryLabel = 'Normal Weight';
      } else if (bmi >= 25 && bmi < 30) {
        bmiCategory = 'overweight';
        bmiCategoryLabel = 'Overweight';
      } else {
        bmiCategory = 'obese';
        bmiCategoryLabel = 'Obese';
      }
    }

    // 3. Check pregnancy status
    const isPregnant = user.patientInfo?.isPregnant === true;
    const pregnancyWeeks = user.patientInfo?.pregnancyWeeks || 0;

    // Check conditions/injuries
    const conditions = user.patientInfo?.conditions || [];
    const hasKneePain = conditions.includes('knee_pain');
    const hasShoulderPain = conditions.includes('shoulder_pain');
    const hasBackPain = conditions.includes('back_pain');
    const hasHypertension = conditions.includes('hypertension');

    // 4. Define safety precaution text based on age, BMI, pregnancy, and injuries
    let precautionText = '';
    if (isPregnant) {
      precautionText = `Pregnancy safety guidelines (${pregnancyWeeks} weeks):
• Safe exercises include: Walking (20–30 mins), Prenatal yoga, Swimming, Stationary cycling, Pelvic floor (Kegel) exercises, Gentle stretching, and Light resistance training with proper guidance.
• Avoid: Contact sports, Heavy weightlifting, High-impact jumping, Exercises with a high risk of falling (horse riding, skiing), and Scuba diving.`;
      
      if (pregnancyWeeks > 12) {
        precautionText += '\n• IMPORTANT: Lying flat on the back for long periods is discouraged after the first trimester. Avoid flat supine exercises (like standard Leg Raises) as they can restrict blood circulation.';
      }
    } else if (ageCategory === 'senior') {
      precautionText = 'As a senior citizen, safety is the top priority. Focus on low-impact, seated exercises, and flexibility to support circulation and mobility. Ensure you have a stable chair or wall nearby for balance support.';
    } else if (ageCategory === 'child') {
      precautionText = 'For children, exercises should focus on building core strength, bodyweight coordination, and fun cardiovascular movement. Avoid heavy resistance training or overexertion.';
    } else if (bmiCategory === 'obese' || bmiCategory === 'overweight') {
      precautionText = 'To protect your joints (especially knees and lower back), prioritize low-impact standing movements or seated exercises. Maintain an easy or moderate intensity and take breaks as needed.';
    } else if (bmiCategory === 'underweight') {
      precautionText = 'Focus on gentle, strength-oriented bodyweight exercises to help build muscle mass safely. Combine exercises with adequate rest periods and a nutritious diet.';
    } else {
      precautionText = 'Maintain a balanced routine consisting of strength training, light cardio, and flexibility. Pay close attention to posture and form alerts during exercise.';
    }

    // Append injury warnings to precautionText
    let injuryPrecautions = [];
    if (hasKneePain) {
      injuryPrecautions.push('KNEE PAIN: Avoid heavy lower body strain. Deep Squats and Standing Knee Bends are restricted. Focus on seated or low-impact exercises.');
    }
    if (hasShoulderPain) {
      injuryPrecautions.push('SHOULDER PAIN: Avoid heavy overhead loads. Shoulder Presses, Arm Circles, Lateral Raises, and Wall Push-ups are restricted. Focus on lower body and core.');
    }
    if (hasBackPain) {
      injuryPrecautions.push('CHRONIC BACK PAIN: Avoid high back strain. Leg Raises (lying flat on back) and Shoulder Presses are restricted. Maintain proper posture.');
    }
    if (hasHypertension) {
      injuryPrecautions.push('HYPERTENSION: Avoid breath-holding (valsalva maneuver) and heavy isometric resistance. Focus on breathing and low-impact cardio.');
    }

    if (injuryPrecautions.length > 0) {
      if (precautionText) {
        precautionText += '\n\n⚠️ INJURY SAFETY WARNINGS:\n• ' + injuryPrecautions.join('\n• ');
      } else {
        precautionText = '⚠️ INJURY SAFETY WARNINGS:\n• ' + injuryPrecautions.join('\n• ');
      }
    }

    // 5. Get active exercises and filter them into Primary, Secondary, Caution lists
    const exercises = await Exercise.find({ isActive: true });
    
    const primary = [];
    const secondary = [];
    const caution = [];

    for (const ex of exercises) {
      const slug = ex.slug;
      
      if (isPregnant) {
        // Pregnancy recommended segmentation
        if (['prenatal-yoga', 'kegels', 'gentle-stretching', 'walking-place', 'seated-march', 'ankle-pump', 'arm-circle'].includes(slug)) {
          primary.push(ex);
        } else if (['bicep-curl', 'lateral-raise', 'wall-pushup', 'standing-knee-bend', 'seated-twist', 'stationary-cycling'].includes(slug)) {
          secondary.push(ex);
        } else if (slug === 'leg-raise') {
          if (pregnancyWeeks <= 12) {
            secondary.push(ex);
          } else {
            caution.push(ex);
          }
        } else {
          caution.push(ex);
        }
      } else if (ageCategory === 'senior') {
        // Seniors: Seated & flexibility exercises are primary.
        if (['seated-march', 'seated-twist', 'ankle-pump', 'arm-circle', 'wall-pushup'].includes(slug)) {
          primary.push(ex);
        } else if (['walking-place', 'standing-knee-bend', 'bicep-curl'].includes(slug)) {
          secondary.push(ex);
        } else {
          caution.push(ex);
        }
      } else if (ageCategory === 'child') {
        // Children: Bodyweight, dynamic cardio/flexibility are primary.
        if (['walking-place', 'arm-circle', 'squat', 'bicep-curl'].includes(slug)) {
          primary.push(ex);
        } else if (['lateral-raise', 'wall-pushup', 'seated-march', 'seated-twist'].includes(slug)) {
          secondary.push(ex);
        } else {
          caution.push(ex);
        }
      } else {
        // Adults: segment by BMI
        if (bmiCategory === 'obese' || bmiCategory === 'overweight') {
          // Overweight/Obese: Low impact, joint-friendly are primary.
          if (['seated-march', 'seated-twist', 'ankle-pump', 'arm-circle', 'wall-pushup', 'walking-place'].includes(slug)) {
            primary.push(ex);
          } else if (['bicep-curl', 'standing-knee-bend', 'lateral-raise'].includes(slug)) {
            secondary.push(ex);
          } else {
            caution.push(ex);
          }
        } else if (bmiCategory === 'underweight') {
          // Underweight: Strength builders are primary.
          if (['bicep-curl', 'wall-pushup', 'squat', 'arm-circle', 'shoulder-press'].includes(slug)) {
            primary.push(ex);
          } else if (['leg-raise', 'lateral-raise', 'seated-march', 'seated-twist'].includes(slug)) {
            secondary.push(ex);
          } else {
            caution.push(ex);
          }
        } else {
          // Normal: Well-balanced.
          if (['squat', 'bicep-curl', 'wall-pushup', 'leg-raise', 'walking-place', 'seated-twist'].includes(slug)) {
            primary.push(ex);
          } else {
            secondary.push(ex);
          }
        }
      }
    }

    // Helper to move exercise from primary/secondary to caution if unsafe
    const enforceSafetyFilter = (exerciseSlug, isUnsafe, cautionReason) => {
      if (!isUnsafe) return;
      
      const moveInList = (list) => {
        const idx = list.findIndex(e => e.slug === exerciseSlug);
        if (idx > -1) {
          const [ex] = list.splice(idx, 1);
          const exObj = ex.toObject ? ex.toObject() : { ...ex };
          if (!exObj.precautions) exObj.precautions = [];
          if (!exObj.precautions.includes(cautionReason)) {
            exObj.precautions = [cautionReason, ...exObj.precautions];
          }
          caution.push(exObj);
        }
      };
      
      moveInList(primary);
      moveInList(secondary);
    };

    // Apply injury restrictions to filter unsafe movements
    if (hasKneePain) {
      enforceSafetyFilter('squat', true, 'Restricted: Deep squats can aggravate knee pain/injury.');
      enforceSafetyFilter('standing-knee-bend', true, 'Restricted: Standing curls put strain on vulnerable knee joints.');
    }
    if (hasShoulderPain) {
      enforceSafetyFilter('shoulder-press', true, 'Restricted: Overhead pressing places high stress on injured shoulders.');
      enforceSafetyFilter('arm-circle', true, 'Restricted: Arm rotation can cause impingement on painful shoulders.');
      enforceSafetyFilter('lateral-raise', true, 'Restricted: Side raises place leverage strain on shoulder tendons.');
      enforceSafetyFilter('wall-pushup', true, 'Restricted: Push-ups strain the shoulder joint complex.');
    }
    if (hasBackPain) {
      enforceSafetyFilter('leg-raise', true, 'Restricted: Lying leg raises place high strain on the lumbar spine.');
      enforceSafetyFilter('shoulder-press', true, 'Restricted: Overhead weights compress the spine, causing back pain.');
    }
    if (hasHypertension) {
      enforceSafetyFilter('wall-pushup', true, 'Restricted: Push-ups can spike blood pressure due to isometric contraction.');
    }

    res.json({
      success: true,
      data: {
        profile: {
          height: user.profile?.height || null,
          weight: user.profile?.weight || null,
          bmi: bmi || null,
          bmiCategory: bmiCategoryLabel,
          age: age,
          ageCategory: ageCategoryLabel,
          gender: user.profile?.gender || null,
          isPregnant: isPregnant,
          pregnancyWeeks: pregnancyWeeks,
          conditions: conditions,
        },
        precautionText,
        recommendations: {
          primary,
          secondary,
          caution,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single exercise
router.get('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });
    res.json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start exercise session
router.post('/session/start', protect, async (req, res) => {
  try {
    const { exerciseId, preExerciseSugar } = req.body;
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });

    const session = await ExerciseSession.create({
      userId: req.user._id,
      exerciseId,
      startTime: new Date(),
      glycemicImpact: { preExerciseSugar },
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// End exercise session
router.put('/session/:sessionId/end', protect, async (req, res) => {
  try {
    const { repsCompleted, setsCompleted, accuracyScore, caloriesBurned, avgJointAngles, postureCorrections, feedback, fallDetected, postExerciseSugar } = req.body;

    const session = await ExerciseSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    session.endTime = new Date();
    session.duration = Math.floor((session.endTime - session.startTime) / 1000);
    session.repsCompleted = repsCompleted || 0;
    session.setsCompleted = setsCompleted || 0;
    session.accuracyScore = accuracyScore || 0;
    session.caloriesBurned = caloriesBurned || 0;
    session.avgJointAngles = avgJointAngles || {};
    session.postureCorrections = postureCorrections || 0;
    session.feedback = feedback || [];
    session.fallDetected = fallDetected || false;
    session.completed = true;

    if (postExerciseSugar) {
      session.glycemicImpact.postExerciseSugar = postExerciseSugar;
      if (session.glycemicImpact.preExerciseSugar) {
        const { calculateGlycemicImpact } = require('../utils/glycemicScore');
        session.glycemicImpact.impactScore = calculateGlycemicImpact(
          session.glycemicImpact.preExerciseSugar,
          postExerciseSugar,
          session.duration
        );
      }
    }

    await session.save();
    
    // 1. Generate the diet plan recommendation synchronously
    const { generateAndSendWorkoutReport, getDietRecommendation } = require('../utils/pdfReport');
    const Exercise = require('../models/Exercise');
    const exercise = await Exercise.findById(session.exerciseId);
    let dietPlan = null;
    try {
      dietPlan = await getDietRecommendation(req.user, session, exercise?.name || 'Unknown Exercise');
    } catch (dietErr) {
      console.error('Failed to pre-generate diet plan:', dietErr.message);
    }

    // 2. Asynchronously generate the 2-page PDF report (including diet plan) and email it
    generateAndSendWorkoutReport(session, req.user, dietPlan)
      .catch(err => console.error('Failed to generate and email PDF report:', err));

    res.json({ success: true, data: session, dietPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// End exercise session via Beacon (for page unloads to bypass CORS preflight)
router.post('/session/:sessionId/end-beacon', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      bodyData = JSON.parse(bodyData);
    }

    const { repsCompleted, setsCompleted, accuracyScore, caloriesBurned, avgJointAngles, postureCorrections, feedback, fallDetected, postExerciseSugar } = bodyData;

    const session = await ExerciseSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    session.endTime = new Date();
    session.duration = Math.floor((session.endTime - session.startTime) / 1000);
    session.repsCompleted = repsCompleted || 0;
    session.setsCompleted = setsCompleted || 0;
    session.accuracyScore = accuracyScore || 0;
    session.caloriesBurned = caloriesBurned || 0;
    session.avgJointAngles = avgJointAngles || {};
    session.postureCorrections = postureCorrections || 0;
    session.feedback = feedback || [];
    session.fallDetected = fallDetected || false;
    session.completed = true;

    if (postExerciseSugar) {
      session.glycemicImpact.postExerciseSugar = postExerciseSugar;
      if (session.glycemicImpact.preExerciseSugar) {
        const { calculateGlycemicImpact } = require('../utils/glycemicScore');
        session.glycemicImpact.impactScore = calculateGlycemicImpact(
          session.glycemicImpact.preExerciseSugar,
          postExerciseSugar,
          session.duration
        );
      }
    }

    await session.save();

    // 1. Generate the diet plan recommendation synchronously
    const { generateAndSendWorkoutReport, getDietRecommendation } = require('../utils/pdfReport');
    const Exercise = require('../models/Exercise');
    const exercise = await Exercise.findById(session.exerciseId);
    let dietPlan = null;
    try {
      dietPlan = await getDietRecommendation(user, session, exercise?.name || 'Unknown Exercise');
    } catch (dietErr) {
      console.error('Failed to pre-generate diet plan:', dietErr.message);
    }

    // 2. Asynchronously generate the 2-page PDF report and email it
    generateAndSendWorkoutReport(session, user, dietPlan)
      .catch(err => console.error('Failed to generate and email PDF report:', err));

    res.json({ success: true, data: session, dietPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's exercise sessions
router.get('/sessions/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, exerciseId } = req.query;
    const filter = { userId: req.user._id };
    if (exerciseId) filter.exerciseId = exerciseId;

    const sessions = await ExerciseSession.find(filter)
      .populate('exerciseId', 'name slug category thumbnail')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ExerciseSession.countDocuments(filter);
    res.json({ success: true, data: sessions, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Exercise stats
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const stats = await ExerciseSession.aggregate([
      { $match: { userId: req.user._id, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$caloriesBurned' },
          avgAccuracy: { $avg: '$accuracyScore' },
          totalReps: { $sum: '$repsCompleted' },
        },
      },
    ]);

    res.json({ success: true, data: stats[0] || { totalSessions: 0, totalDuration: 0, totalCalories: 0, avgAccuracy: 0, totalReps: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete exercise session
router.delete('/session/:sessionId', protect, async (req, res) => {
  try {
    const session = await ExerciseSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized to delete this session' });

    await session.deleteOne();
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download PDF Report directly in browser
router.get('/session/:sessionId/download-pdf', async (req, res) => {
  try {
    let token = req.query.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized access' });

    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const session = await ExerciseSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const { generateWorkoutReportPDF } = require('../utils/pdfReport');
    const { pdfBuffer } = await generateWorkoutReportPDF(session, user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=DiaFit_Workout_Report_${session._id.toString().substring(0, 8)}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Email PDF Report on-demand to patient
router.post('/session/:sessionId/send-email', protect, async (req, res) => {
  try {
    const session = await ExerciseSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const { generateAndSendWorkoutReport } = require('../utils/pdfReport');
    await generateAndSendWorkoutReport(session, req.user);

    res.json({ success: true, message: 'Report successfully emailed to patient' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
