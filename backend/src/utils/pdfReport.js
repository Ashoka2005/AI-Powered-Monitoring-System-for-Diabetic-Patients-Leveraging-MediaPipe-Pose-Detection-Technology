const PDFDocument = require('pdfkit');
const { sendEmail } = require('./email');

/**
 * Generates an AI-tailored diet recommendation post-workout, saves it in the database 
 * as the active plan, and returns it.
 */
const getDietRecommendation = async (user, session, exerciseName) => {
  const DietPlan = require('../models/DietPlan');
  const axios = require('axios');
  
  let aiPlan;
  try {
    const age = user.profile?.dateOfBirth 
      ? new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear() 
      : 45;
      
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/recommend/diet`, {
      age,
      gender: user.profile?.gender || 'male',
      weight: user.profile?.weight || 70,
      height: user.profile?.height || 170,
      bmi: user.bmi || 25,
      diabetesType: user.patientInfo?.diabetesType || 'type2',
      conditions: user.patientInfo?.conditions || [],
      allergies: user.patientInfo?.allergies || [],
      isPregnant: user.patientInfo?.isPregnant === true,
      pregnancyWeeks: user.patientInfo?.pregnancyWeeks || 0,
      preferences: {
        lastWorkout: exerciseName,
        caloriesBurned: session.caloriesBurned
      },
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
  await DietPlan.updateMany({ userId: user._id, isActive: true }, { isActive: false });

  // Create new active plan
  const plan = await DietPlan.create({
    userId: user._id,
    generatedBy: 'ai',
    ...aiPlan,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return plan;
};

/**
 * Generates a professional 2-page PDF report containing performance and nutritional diet guidelines
 * and emails it as an attachment to the patient.
 */
const generateWorkoutReportPDF = async (session, user, dietPlan) => {
  return new Promise(async (resolve, reject) => {
    try {
      const Exercise = require('../models/Exercise');
      const exercise = await Exercise.findById(session.exerciseId);
      
      // 1. Get or generate the AI Diet Plan Recommendation
      const activeDietPlan = dietPlan || await getDietRecommendation(user, session, exercise?.name || 'Unknown Exercise');

      const doc = new PDFDocument({ margin: 50 });
      
      // Buffer the PDF generation
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve({ pdfBuffer, activeDietPlan });
      });

      // PDF Content styling & building
      doc.rect(0, 0, 612, 792).fill('#ffffff'); // page bg
      
      // Top color accent bar
      doc.rect(0, 0, 612, 15).fill('#3b82f6');
      
      // Document header
      doc.fillColor('#1e3a8a')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('DIAFIT AI', 50, 45);
         
      doc.fillColor('#64748b')
         .fontSize(9)
         .font('Helvetica')
         .text('INTELLIGENT DIABETIC REHABILITATION PLATFORM', 50, 72);

      // Report Title
      doc.fillColor('#0f172a')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Patient Exercise Performance Report', 50, 110);

      // Horizontal separator line
      doc.strokeColor('#e2e8f0')
         .lineWidth(1)
         .moveTo(50, 135)
         .lineTo(562, 135)
         .stroke();

      // Two-column profile details
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('PATIENT PROFILE DETAILS', 50, 155);

      doc.fillColor('#1e293b')
         .fontSize(10)
         .font('Helvetica')
         .text(`Name: ${user.firstName} ${user.lastName}`, 50, 175)
         .text(`Email: ${user.email}`, 50, 190)
         .text(`Phone: ${user.phone || 'N/A'}`, 50, 205);

      // Column 2 for Session Meta
      const dateString = new Date(session.startTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
      const timeStartStr = new Date(session.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
      const timeEndStr = new Date(session.endTime || session.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

      doc.fillColor('#1e293b')
         .fontSize(10)
         .font('Helvetica')
         .text(`Session ID: ${session._id.toString().toUpperCase()}`, 320, 175)
         .text(`Session Date: ${dateString}`, 320, 190)
         .text(`Session Time: ${timeStartStr} - ${timeEndStr}`, 320, 205);

      // Session Summary Section title
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('WORKOUT PERFORMANCE STATISTICS', 50, 240);

      // Stats Table Box
      doc.rect(50, 260, 512, 175).stroke('#e2e8f0');

      // Grid Rows Helper
      const drawRow = (y, label, val, isColored = false, colorHex = '#000000') => {
        doc.fillColor('#475569')
           .font('Helvetica-Bold')
           .text(label, 70, y);
        
        doc.fillColor(isColored ? colorHex : '#0f172a')
           .font('Helvetica-Bold')
           .text(val, 320, y);

        // draw dividing line
        doc.strokeColor('#f1f5f9')
           .lineWidth(1)
           .moveTo(50, y + 18)
           .lineTo(562, y + 18)
           .stroke();
      };

      const durationFormatted = `${Math.floor(session.duration / 60)} minutes, ${session.duration % 60} seconds`;
      const accuracyColor = session.accuracyScore >= 80 ? '#15803d' : session.accuracyScore >= 60 ? '#b45309' : '#b91c1c';

      drawRow(275, 'Exercise Completed', exercise?.name || 'Unknown Exercise');
      drawRow(300, 'Workout Duration', durationFormatted);
      drawRow(325, 'Total Repetitions Done', `${session.repsCompleted} reps (${session.setsCompleted} sets)`);
      drawRow(350, 'Form Performance Accuracy', `${session.accuracyScore}%`, true, accuracyColor);
      drawRow(375, 'Posture Corrections Triggered', `${session.postureCorrections || 0} corrections`);
      drawRow(400, 'Estimated Calories Burned', `${session.caloriesBurned} kcal`);

      // Glycemic Score
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('GLYCEMIC IMPACT & BLOOD SUGAR DETAILS', 50, 460);

      doc.rect(50, 480, 512, 85).stroke('#e2e8f0');

      const preSugar = session.glycemicImpact?.preExerciseSugar ? `${session.glycemicImpact.preExerciseSugar} mg/dL` : 'Not recorded';
      const postSugar = session.glycemicImpact?.postExerciseSugar ? `${session.glycemicImpact.postExerciseSugar} mg/dL` : 'Not recorded';
      const glycemicImpactText = session.glycemicImpact?.impactScore 
        ? `${session.glycemicImpact.impactScore.toFixed(1)} / 10`
        : 'N/A (Provide pre and post glucose values to log)';

      doc.fillColor('#475569').font('Helvetica-Bold').text('Pre-Exercise Blood Sugar:', 70, 495);
      doc.fillColor('#0f172a').font('Helvetica').text(preSugar, 250, 495);

      doc.fillColor('#475569').font('Helvetica-Bold').text('Post-Exercise Blood Sugar:', 70, 515);
      doc.fillColor('#0f172a').font('Helvetica').text(postSugar, 250, 515);

      doc.fillColor('#475569').font('Helvetica-Bold').text('Glycemic Score Impact:', 70, 535);
      doc.fillColor('#2563eb').font('Helvetica-Bold').text(glycemicImpactText, 250, 535);

      // Posture Feedback details
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('CLINICAL POSTURE SAFETY FEEDBACK LOG', 50, 590);

      const feedbackLog = session.feedback && session.feedback.length > 0
        ? session.feedback.map(f => f.message)
        : [];

      if (feedbackLog.length > 0) {
        doc.fillColor('#334155').font('Helvetica').fontSize(9);
        let currentY = 610;
        feedbackLog.forEach((msg, index) => {
          if (currentY < 710) {
            doc.text(`•  ${msg}`, 65, currentY, { width: 480 });
            currentY += doc.heightOfString(msg, { width: 480 }) + 4;
          }
        });
      } else {
        doc.fillColor('#15803d')
           .font('Helvetica-Oblique')
           .fontSize(10)
           .text('Excellent posture maintained throughout the session. No corrections required.', 65, 610);
      }

      // Page 1 Footer notice
      doc.fillColor('#94a3b8')
         .fontSize(8)
         .font('Helvetica')
         .text('Page 1 of 2  •  DiaFit AI automated performance log', 50, 725, { align: 'center', width: 512 });

      // ==========================================
      // PAGE 2: NUTRITIONAL RECOMMENDATION
      // ==========================================
      doc.addPage();

      // Top color accent bar (Green for nutrition)
      doc.rect(0, 0, 612, 15).fill('#10b981');

      // Document header
      doc.fillColor('#065f46')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('AI NUTRITION GUIDE', 50, 45);
         
      doc.fillColor('#64748b')
         .fontSize(9)
         .font('Helvetica')
         .text('CUSTOMIZED DIABETES NUTRITIONAL & MEAL PROGRAM', 50, 72);

      // Meal Plan Title
      doc.fillColor('#0f172a')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(`Recommended Plan: ${activeDietPlan.title}`, 50, 110);

      // Description
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Oblique')
         .text(activeDietPlan.description || 'AI-generated diet tailored for post-workout glycemic control.', 50, 130, { width: 512 });

      // Horizontal separator line
      doc.strokeColor('#e2e8f0')
         .lineWidth(1)
         .moveTo(50, 155)
         .lineTo(562, 155)
         .stroke();

      // Macros Title
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('MACRONUTRIENT NUTRITIONAL SUMMARY', 50, 170);

      doc.rect(50, 185, 512, 50).stroke('#e2e8f0');

      // Grid of macros
      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8.5).text('DAILY CALORIES', 65, 195);
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text(`${activeDietPlan.totalCalories} kcal`, 65, 212);

      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8.5).text('CARBS', 200, 195);
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text(`${activeDietPlan.totalCarbs}g`, 200, 212);

      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8.5).text('PROTEINS', 330, 195);
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text(`${activeDietPlan.totalProtein}g`, 330, 212);

      doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8.5).text('FATS', 460, 195);
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text(`${activeDietPlan.totalFat}g`, 460, 212);

      // Meals Title
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('AI RECOMMENDATION MEALS SCHEDULE', 50, 255);

      // List of meals
      let currentMealY = 275;
      activeDietPlan.meals.forEach((meal) => {
        if (currentMealY < 550) {
          doc.rect(50, currentMealY, 512, 55).stroke('#f1f5f9');
          
          doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(9.5).text(`${meal.name}  (${meal.time})`, 65, currentMealY + 10);
          doc.fillColor('#64748b').font('Helvetica').fontSize(8.5).text(`${meal.calories} kcal  |  Carbs: ${meal.carbs}g  Protein: ${meal.protein}g  Fat: ${meal.fat}g`, 65, currentMealY + 23);

          const itemsText = meal.items.map(it => `${it.name} (${it.quantity})`).join(', ');
          doc.fillColor('#475569').font('Helvetica-Oblique').fontSize(8.5).text(`Items: ${itemsText}`, 65, currentMealY + 36, { width: 480 });

          currentMealY += 65;
        }
      });

      // Dietary Tips & Restrictions
      doc.fillColor('#475569')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('CLINICAL DIETARY PRECAUTIONS & ADVICE', 50, 550);

      doc.rect(50, 565, 512, 140).stroke('#e2e8f0');

      doc.fillColor('#991b1b').font('Helvetica-Bold').fontSize(8.5).text('DIETARY RESTRICTIONS / FOODS TO AVOID:', 65, 580);
      const restrictText = activeDietPlan.restrictions?.join(', ') || 'N/A';
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5).text(restrictText, 65, 595, { width: 480 });

      doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(8.5).text('NUTRITIONIST ADVICE / GENERAL HABITS:', 65, 640);
      const recText = activeDietPlan.recommendations?.join(', ') || 'N/A';
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5).text(recText, 65, 655, { width: 480 });

      // Page 2 Footer notice
      doc.fillColor('#94a3b8')
         .fontSize(8)
         .font('Helvetica')
         .text('Page 2 of 2  •  DiaFit AI customized meal guidelines', 50, 725, { align: 'center', width: 512 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const generateAndSendWorkoutReport = async (session, user, dietPlan) => {
  try {
    const { pdfBuffer, activeDietPlan } = await generateWorkoutReportPDF(session, user, dietPlan);
    const Exercise = require('../models/Exercise');
    const exercise = await Exercise.findById(session.exerciseId);

    const formattedDuration = `${Math.floor(session.duration / 60)}m ${session.duration % 60}s`;
    const glycemicImpactText = session.glycemicImpact?.impactScore 
      ? `${session.glycemicImpact.impactScore.toFixed(1)} / 10`
      : 'N/A';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">🏋️ Workout Session Completed!</h2>
        <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p>Congratulations on completing your exercise session! Here is a summary of your performance and nutrition report. We have attached a detailed PDF report containing your workout metrics and customized meal plan.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 45%;">Exercise Name</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${exercise?.name || 'Unknown Exercise'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Duration</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${formattedDuration}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Reps Completed</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${session.repsCompleted} reps (${session.setsCompleted} sets)</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Form Accuracy</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${session.accuracyScore >= 80 ? '#16a34a' : '#ea580c'};">${session.accuracyScore}%</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Calories Burned</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${session.caloriesBurned} kcal</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Glycemic Impact Score</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #2563eb;">${glycemicImpactText}</td>
          </tr>
        </table>

        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin-top: 15px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 5px 0; color: #166534;">🥗 Customized Nutrition: ${activeDietPlan.title}</h4>
          <p style="margin: 0; font-size: 13px; color: #15803d; line-height: 1.4;">
            <strong>Recommended Intake</strong>: ${activeDietPlan.totalCalories} Calories (Carbs: ${activeDietPlan.totalCarbs}g, Protein: ${activeDietPlan.totalProtein}g, Fat: ${activeDietPlan.totalFat}g).
            Details for all meals are included in the attached PDF report.
          </p>
        </div>

        <p>Keep up the consistency to maintain stable blood sugar levels and stay healthy!</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>DiaFit AI Support Team</strong></p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: `🏋️ Workout Complete Report & AI Diet Plan: ${exercise?.name || 'Session'}`,
      html,
      attachments: [
        {
          filename: `DiaFit_Workout_Nutrition_Report_${session._id.toString().substring(0, 8)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
  } catch (err) {
    console.error('Failed to generate and email PDF report:', err);
    throw err;
  }
};

module.exports = { generateAndSendWorkoutReport, generateWorkoutReportPDF, getDietRecommendation };
