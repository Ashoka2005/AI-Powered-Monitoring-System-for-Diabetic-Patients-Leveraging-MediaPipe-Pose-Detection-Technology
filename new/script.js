// Global variables
let selectedAsana = null;
let repCount = 0;
let phase = "";
let currentUserId = null;
let sessionStartTime = null;
let sessionAccuracies = [];
let currentAngles = {};
let sessionTimer = null;
let remainingTime = 0;
let selectedDuration = 60;
let lastGuidanceTime = 0;  // Track last voice guidance to avoid spam
let guidanceCooldown = 3000;  // 3 seconds between voice guidance
let lastSugarPrediction = null;
let initialSugarLevel = null;

const API_URL = 'http://localhost:3000/api';

// Initialize user session
function initUser() {
  currentUserId = localStorage.getItem('userId');
  
  if (currentUserId) {
    console.log('✅ User ID loaded from storage:', currentUserId);
    return;
  }
}

// Create or load user when name is entered
function createOrLoadUser() {
  const name = document.getElementById('nameInput').value;
  const age = document.getElementById('ageInput').value;
  const gender = document.getElementById('genderInput').value;
  
  if (!name) {
    console.log('⚠️ No name entered yet');
    return Promise.resolve(false);
  }
  
  // Create unique email from name
  const email = `${name.toLowerCase().replace(/\s/g, '_')}@health.com`;
  
  return fetch(`${API_URL}/users/${email}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        currentUserId = data.user._id;
        localStorage.setItem('userId', currentUserId);
        localStorage.setItem('userName', data.user.name);
        console.log('✅ User loaded:', data.user);
        return true;
      } else {
        // Create new user
        return fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            email, 
            age: parseInt(age) || 0,
            gender: gender || 'Not specified'
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            currentUserId = data.user._id;
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('userName', data.user.name);
            console.log('✅ New user created:', data.user);
            alert(`Welcome ${name}! Your profile has been created.`);
            return true;
          }
          return false;
        });
      }
    })
    .catch(err => {
      console.error('Error loading user:', err);
      return false;
    });
}

// BMI Calculation
document.getElementById("calcBMI").addEventListener("click", async () => {
  const weight = parseFloat(document.getElementById("weightInput").value);
  const height = parseFloat(document.getElementById("heightInput").value);
  const bmiResult = document.getElementById("bmiResult");

  if (!weight || !height) {
    bmiResult.textContent = "⚠️ Enter both weight and height.";
    bmiResult.style.background = "linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%)";
    bmiResult.style.display = "block";
    return;
  }

  const bmi = (weight / (height * height)).toFixed(1);
  let bmiCategory = bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : "overweight";
  bmiResult.innerHTML = `<strong>Your BMI: ${bmi}</strong> (${bmiCategory.toUpperCase()})`;
  bmiResult.style.background = "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)";
  bmiResult.style.display = "block";

  let bmiInput = document.getElementById("bmiInput");
  if (!bmiInput) {
    bmiInput = document.createElement("input");
    bmiInput.type = "hidden";
    bmiInput.id = "bmiInput";
    document.body.appendChild(bmiInput);
  }
  bmiInput.value = bmi;
  
  // Save BMI to localStorage
  localStorage.setItem('lastBMI', JSON.stringify({
    weight,
    height,
    bmi: parseFloat(bmi),
    category: bmiCategory
  }));
  
  // Create or load user first, then save BMI
  try {
    const userCreated = await createOrLoadUser();
    
    // Wait a bit for currentUserId to be set
    setTimeout(() => {
      if (currentUserId) {
        fetch(`${API_URL}/bmi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUserId,
            weight,
            height,
            bmi: parseFloat(bmi),
            category: bmiCategory
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('✅ BMI saved to database:', data.bmiRecord);
          }
        })
        .catch(err => console.error('❌ Error saving BMI:', err));
      } else {
        console.log('⚠️ BMI saved to localStorage only (no user ID)');
      }
    }, 500); // Wait 500ms for user creation
  } catch (err) {
    console.error('Error creating user:', err);
  }
});

// Get Exercise Recommendations
document.getElementById("suggestBtn").addEventListener("click", () => {
  const disease = document.getElementById("disease").value;
  const bmiValue = parseFloat(document.getElementById("bmiInput")?.value || 0);
  if (!disease) return alert("Please select a condition.");
  if (!bmiValue) return alert("Please calculate BMI first.");

  const bmiCategory = bmiValue < 18.5 ? "underweight" : bmiValue < 25 ? "normal" : "overweight";
  const asanas = knowledgeBase[disease][bmiCategory];
  
  // Update UI Branding for Diabetes
  if (disease.startsWith("diabetes")) {
    document.querySelector(".header h1").textContent = "🩺 AI-Powered Diabetes Monitoring";
    document.querySelector(".exercise-panel h2").textContent = "🧘 Diabetic Therapy Guide";
  } else {
    document.querySelector(".header h1").textContent = "🩺 AI-Powered Monitoring System";
    document.querySelector(".exercise-panel h2").textContent = "🏋️ Exercise Guide";
  }

  renderAsanas(asanas);
});

// Render exercise list
function renderAsanas(list) {
  const asanaList = document.getElementById("asanaList");
  asanaList.innerHTML = "";
  
  list.forEach((asana) => {
    const div = document.createElement("div");
    div.style.background = "white";
    div.style.padding = "12px";
    div.style.marginBottom = "10px";
    div.style.borderRadius = "8px";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    
    const name = document.createElement("span");
    name.textContent = asana.name;
    name.style.fontWeight = "600";
    
    const btn = document.createElement("button");
    btn.textContent = "Select";
    btn.className = "btn";
    btn.style.width = "auto";
    btn.style.padding = "8px 20px";
    btn.style.marginTop = "0";
    
    btn.onclick = () => {
      selectExercise(asana);
    };
    
    div.appendChild(name);
    div.appendChild(btn);
    asanaList.appendChild(div);
  });
}

// Select exercise
function selectExercise(asana) {
  selectedAsana = asana;
  repCount = 0;
  phase = "";
  currentAngles = {};
  
  console.log('=== SELECTING EXERCISE ===');
  console.log('Exercise Name:', asana.name);
  console.log('Image URL:', asana.img);
  
  // Show exercise image with fallback and cache-busting
  const asanaImg = document.getElementById("asanaImg");
  
  // Clear current image first
  asanaImg.src = '';
  asanaImg.style.display = "none";
  
  // Add timestamp to prevent caching
  const imageUrl = asana.img.includes('?') ? 
    `${asana.img}&t=${Date.now()}` : 
    `${asana.img}?t=${Date.now()}`;
  
  console.log('Loading URL:', imageUrl);
  
  // Set loading state
  asanaImg.classList.add('loading');
  asanaImg.src = imageUrl;
  
  // Add error handler for broken images
  asanaImg.onerror = function() {
    console.error('❌ Failed to load image for:', asana.name);
    console.error('Failed URL:', this.src);
    
    // Try without cache-busting as fallback
    this.onerror = function() {
      // If that also fails, use fallback
      if (asana.fallback_img) {
        this.src = asana.fallback_img;
      } else {
        this.src = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400";
      }
    };
    this.src = asana.img; // Try original URL
  };
  
  // Remove loading class when image loads
  asanaImg.onload = function() {
    this.classList.remove('loading');
    asanaImg.style.display = "block";
    console.log('✅ Successfully loaded:', asana.name);
  };
  
  // Force display after a short delay
  setTimeout(() => {
    if (asanaImg.src && asanaImg.src !== '') {
      asanaImg.style.display = "block";
    }
  }, 100);
  
  // Display benefits
  const benefitsSection = document.getElementById("benefitsSection");
  const benefitsList = document.getElementById("benefitsList");
  const benefitsTitle = document.getElementById("benefitsTitle");
  
  benefitsTitle.textContent = currentLanguage === 'en' ? 'Benefits' : 'ಪ್ರಯೋಜನಗಳು';
  benefitsList.innerHTML = "";
  
  const benefits = getBenefits(asana);
  benefits.forEach(benefit => {
    const li = document.createElement("li");
    li.textContent = benefit;
    benefitsList.appendChild(li);
  });
  
  benefitsSection.style.display = "block";
  
  // Display target angles
  displayTargetAngles(asana);
  
  // Update feedback
  document.getElementById("feedbackText").textContent = `Selected: ${asana.name}`;
  
  // Speak instructions
  const startInstruction = getInstruction(asana, 'start');
  if (startInstruction) {
    speak(startInstruction, true);
  }
}

// Display target angles
function displayTargetAngles(asana) {
  const targetAnglesDiv = document.getElementById("targetAngles");
  const targetGrid = document.getElementById("targetGrid");
  
  if (!asana || !asana.angles) {
    targetAnglesDiv.style.display = "none";
    return;
  }
  
  targetGrid.innerHTML = "";
  const angles = asana.angles;
  
  Object.keys(angles).forEach(angleName => {
    const targetValue = angles[angleName];
    const item = document.createElement("div");
    item.className = "target-item";
    item.innerHTML = `
      <div class="label">${angleName.toUpperCase()}</div>
      <div class="value">${targetValue}°</div>
    `;
    targetGrid.appendChild(item);
  });
  
  targetAnglesDiv.style.display = "block";
}

// Update live angles display
function updateLiveAngles() {
  const liveAnglesDiv = document.getElementById("liveAngles");
  
  if (!selectedAsana || Object.keys(currentAngles).length === 0) {
    liveAnglesDiv.style.display = "none";
    return;
  }
  
  liveAnglesDiv.innerHTML = "";
  const tolerance = selectedAsana.tolerance || 15;
  const targetAngles = selectedAsana.angles || {};
  
  Object.keys(currentAngles).forEach(angleName => {
    const currentValue = currentAngles[angleName];
    const targetValue = targetAngles[angleName];
    
    const card = document.createElement("div");
    card.className = "angle-card";
    
    let statusHTML = "";
    if (targetValue) {
      const difference = Math.abs(currentValue - targetValue);
      const isCorrect = difference <= tolerance;
      statusHTML = `
        <div class="angle-status ${isCorrect ? 'status-correct' : 'status-adjust'}">
          ${isCorrect ? '✅ Perfect!' : `⚠️ Off by ${difference.toFixed(0)}°`}
        </div>
      `;
    }
    
    card.innerHTML = `
      <h4>${angleName.toUpperCase()}</h4>
      <div class="angle-values">
        <div class="angle-value">
          <label>Target</label>
          <div class="number">${targetValue || '-'}°</div>
        </div>
        <div class="angle-value">
          <label>Current</label>
          <div class="number">${currentValue.toFixed(0)}°</div>
        </div>
      </div>
      ${statusHTML}
    `;
    
    liveAnglesDiv.appendChild(card);
  });
  
  liveAnglesDiv.style.display = "grid";
}

// Calculate angle between three points
function getAngle(a, b, c) {
  const AB = { x: a.x - b.x, y: a.y - b.y };
  const CB = { x: c.x - b.x, y: c.y - b.y };
  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
  const magCB = Math.sqrt(CB.x ** 2 + CB.y ** 2);
  const angle = Math.acos(dot / (magAB * magCB));
  return angle * (180 / Math.PI);
}

// Evaluate pose accuracy
function evaluatePose(landmarks, asana) {
  if (!landmarks || !asana) return;

  const tolerance = asana.tolerance || 15;
  const angles = asana.angles || {};
  
  // Reset current angles
  currentAngles = {};

  // Calculate current body angles with IMPROVED accuracy
  if (angles.shoulder) {
    const left = getAngle(landmarks[11], landmarks[13], landmarks[15]);
    const right = getAngle(landmarks[12], landmarks[14], landmarks[16]);
    currentAngles.shoulder = (left + right) / 2;
  }

  if (angles.elbow) {
    const left = getAngle(landmarks[13], landmarks[15], landmarks[17]);
    const right = getAngle(landmarks[14], landmarks[16], landmarks[18]);
    currentAngles.elbow = (left + right) / 2;
  }

  if (angles.hip) {
    const left = getAngle(landmarks[11], landmarks[23], landmarks[25]);
    const right = getAngle(landmarks[12], landmarks[24], landmarks[26]);
    currentAngles.hip = (left + right) / 2;
  }

  if (angles.knee) {
    const left = getAngle(landmarks[23], landmarks[25], landmarks[27]);
    const right = getAngle(landmarks[24], landmarks[26], landmarks[28]);
    currentAngles.knee = (left + right) / 2;
  }

  if (angles.ankle) {
    const left = getAngle(landmarks[25], landmarks[27], landmarks[29]);
    const right = getAngle(landmarks[26], landmarks[28], landmarks[30]);
    currentAngles.ankle = (left + right) / 2;
  }

  if (angles.spine) {
    const spineAngle = getAngle(landmarks[11], landmarks[23], landmarks[25]);
    currentAngles.spine = spineAngle;
    
    // Cat-Cow specific logic
    if (asana.name.includes("Cat-Cow")) {
      if (spineAngle > 160) {
        if (phase === "cat") {
          repCount++;
          speak(getInstruction(asana, 'cow'));
        }
        phase = "cow";
      } else if (spineAngle < 130) {
        if (phase === "cow") {
          speak(getInstruction(asana, 'cat'));
        }
        phase = "cat";
      }
      document.getElementById("repDisplay").textContent = `Reps: ${repCount}`;
    }
  }

  // Calculate accuracy with ENHANCED feedback
  let correctCount = 0;
  let totalAngles = 0;
  let feedback = [];
  let specificGuidance = [];

  Object.keys(angles).forEach(angleName => {
    const targetAngle = angles[angleName];
    const currentAngle = currentAngles[angleName];
    
    if (currentAngle !== undefined) {
      totalAngles++;
      const diff = Math.abs(currentAngle - targetAngle);
      
      if (diff <= tolerance) {
        correctCount++;
        specificGuidance.push(`${angleName}: ✓ Perfect`);
      } else {
        feedback.push(`adjust_${angleName}`);
        // Add specific guidance
        if (currentAngle < targetAngle) {
          specificGuidance.push(`${angleName}: Increase angle (current: ${currentAngle.toFixed(0)}°, target: ${targetAngle}°)`);
        } else {
          specificGuidance.push(`${angleName}: Decrease angle (current: ${currentAngle.toFixed(0)}°, target: ${targetAngle}°)`);
        }
      }
    }
  });

  const accuracy = totalAngles > 0 ? (correctCount / totalAngles) * 100 : 0;
  
  // Calculate Glycemic-Impact Score and Patient Level for Diabetic Patients
  const condition = document.getElementById("disease").value;
  if (condition.startsWith("diabetes")) {
    const glycemicScore = (accuracy * 0.8) + (Math.min(repCount, 10) * 2);
    
    // Determine Patient Level (1, 2, or 3)
    let patientLevel = 1;
    let levelColor = "#2e7d32";
    let levelText = "Level 1: Maintenance";
    
    if (glycemicScore < 40) {
      patientLevel = 3;
      levelColor = "#c62828";
      levelText = "Level 3: Strict Monitoring";
    } else if (glycemicScore < 70) {
      patientLevel = 2;
      levelColor = "#ef6c00";
      levelText = "Level 2: Targeted Therapy";
    }

    document.getElementById("accuracyScore").innerHTML = `
      <div style="font-size: 0.8rem; color: #666; cursor: help;" title="Glycemic-Impact Score estimates metabolic benefit.">Glycemic-Impact Score ℹ️</div>
      <div style="color: ${levelColor}; font-weight: bold; font-size: 1.4rem;">${glycemicScore.toFixed(1)} Pts</div>
      <div style="font-size: 0.75rem; color: ${levelColor}; font-weight: 600; margin-top: 4px; padding: 2px 8px; background: ${levelColor}22; border-radius: 4px; display: inline-block;">${levelText}</div>
    `;

    // Update Sugar Prediction
    if (initialSugarLevel) {
      updateSugarPrediction(initialSugarLevel, glycemicScore);
    }
  } else {
    document.getElementById("accuracyScore").textContent = `${accuracy.toFixed(1)}% Accuracy`;
  }
  
  // Track accuracy for session average
  if (sessionAccuracies.length < 200) {
    sessionAccuracies.push(accuracy);
  }

  // Provide DETAILED exercise-specific feedback with LIVE guidance
  let feedbackText = "";
  const now = Date.now();
  
  if (accuracy >= 90) {
    feedbackText = `✅ EXCELLENT! Perfect form! (${accuracy.toFixed(1)}%)`;
    // Praise user occasionally
    if (now - lastGuidanceTime > guidanceCooldown && Math.random() < 0.2) {
      speak("Perfect! Keep holding this position!");
      lastGuidanceTime = now;
    }
  } else if (accuracy >= 75) {
    feedbackText = `👍 Good! Minor adjustments needed (${accuracy.toFixed(1)}%)`;
    // Guide user with specific corrections
    if (now - lastGuidanceTime > guidanceCooldown && feedback.length > 0) {
      const firstFeedback = feedback[0];
      const guidance = getInstruction(asana, firstFeedback);
      if (guidance) {
        speak(guidance);
        lastGuidanceTime = now;
      }
    }
  } else if (accuracy >= 50) {
    feedbackText = `⚠️ Adjusting... Focus on form (${accuracy.toFixed(1)}%)`;
    // More frequent guidance when struggling
    if (now - lastGuidanceTime > guidanceCooldown && feedback.length > 0) {
      const firstFeedback = feedback[0];
      const guidance = getInstruction(asana, firstFeedback);
      if (guidance) {
        speak(guidance);
        lastGuidanceTime = now;
      }
    }
  } else {
    feedbackText = `❌ Needs improvement - Check angles (${accuracy.toFixed(1)}%)`;
    // Urgent guidance when form is poor
    if (now - lastGuidanceTime > guidanceCooldown && feedback.length > 0) {
      const firstFeedback = feedback[0];
      const guidance = getInstruction(asana, firstFeedback);
      if (guidance) {
        speak("Stop! " + guidance + " Let me guide you.");
        lastGuidanceTime = now;
      }
    }
  }
  
  document.getElementById("feedbackText").textContent = feedbackText;
  
  // Log detailed guidance to console for debugging
  if (specificGuidance.length > 0) {
    console.log('📐 Angle Guidance:', specificGuidance);
  }
}

// MediaPipe Pose Setup
const videoElem = document.getElementById("input");
const canvasElem = document.getElementById("output");
const ctx = canvasElem.getContext("2d");

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

pose.setOptions({
  modelComplexity: 2,              // 0=lite, 1=full, 2=heavy (MOST ACCURATE)
  smoothLandmarks: true,           // Smooth landmark positions across frames
  enableSegmentation: false,       // Disable for better performance
  smoothSegmentation: false,
  minDetectionConfidence: 0.8,     // Higher = more accurate initial detection
  minTrackingConfidence: 0.8,      // Higher = more stable tracking
});

pose.onResults((results) => {
  ctx.save();
  ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
  ctx.drawImage(results.image, 0, 0, canvasElem.width, canvasElem.height);
  
  if (results.poseLandmarks) {
    // Draw skeleton connections (THICK GREEN LINES for visibility)
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { 
      color: "#00FF00",     // Bright green
      lineWidth: 6          // Thick lines for clear visibility
    });
    
    // Draw landmarks/joints (RED CIRCLES at each joint)
    drawLandmarks(ctx, results.poseLandmarks, { 
      color: "#FF0000",     // Bright red
      fillColor: "#FF0000", // Red fill
      lineWidth: 2,         // Border thickness
      radius: 6             // Larger circles for visibility
    });
    
    // Evaluate pose
    evaluatePose(results.poseLandmarks, selectedAsana);
    
    // Update live angles
    updateLiveAngles();
    
    // Draw angles on skeleton (VISIBLE ON CAMERA)
    if (Object.keys(currentAngles).length > 0 && selectedAsana) {
      drawAnglesOnSkeleton(results.poseLandmarks);
    }
  }
  
  ctx.restore();
});

// Draw angles on skeleton with enhanced visibility
function drawAnglesOnSkeleton(landmarks) {
  // Enhanced angle labels at joint positions
  const drawAngleText = (landmark, angleName, angleValue) => {
    const x = landmark.x * canvasElem.width;
    const y = landmark.y * canvasElem.height;
    const text = `${angleName}: ${angleValue.toFixed(0)}°`;
    
    // Draw background box for text
    ctx.font = "bold 16px Arial";
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(x + 10, y - 28, textWidth + 10, 24);
    
    // Draw bright yellow text with black outline
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.strokeText(text, x + 15, y - 10);
    ctx.fillStyle = "#FFFF00";
    ctx.fillText(text, x + 15, y - 10);
  };
  
  // Draw angles at each joint with color-coded circles
  const drawJointIndicator = (landmark, isCorrect) => {
    const x = landmark.x * canvasElem.width;
    const y = landmark.y * canvasElem.height;
    
    // Draw pulsing circle around joint
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, 2 * Math.PI);
    ctx.strokeStyle = isCorrect ? "#00FF00" : "#FF9800";
    ctx.lineWidth = 3;
    ctx.stroke();
  };
  
  // Draw angles with indicators
  if (currentAngles.shoulder) {
    const target = selectedAsana?.angles.shoulder;
    const tolerance = selectedAsana?.tolerance || 15;
    const isCorrect = target ? Math.abs(currentAngles.shoulder - target) <= tolerance : false;
    drawAngleText(landmarks[13], "SHOULDER", currentAngles.shoulder);
    drawJointIndicator(landmarks[13], isCorrect);
  }
  if (currentAngles.elbow) {
    const target = selectedAsana?.angles.elbow;
    const tolerance = selectedAsana?.tolerance || 15;
    const isCorrect = target ? Math.abs(currentAngles.elbow - target) <= tolerance : false;
    drawAngleText(landmarks[15], "ELBOW", currentAngles.elbow);
    drawJointIndicator(landmarks[15], isCorrect);
  }
  if (currentAngles.hip) {
    const target = selectedAsana?.angles.hip;
    const tolerance = selectedAsana?.tolerance || 15;
    const isCorrect = target ? Math.abs(currentAngles.hip - target) <= tolerance : false;
    drawAngleText(landmarks[23], "HIP", currentAngles.hip);
    drawJointIndicator(landmarks[23], isCorrect);
  }
  if (currentAngles.knee) {
    const target = selectedAsana?.angles.knee;
    const tolerance = selectedAsana?.tolerance || 15;
    const isCorrect = target ? Math.abs(currentAngles.knee - target) <= tolerance : false;
    drawAngleText(landmarks[25], "KNEE", currentAngles.knee);
    drawJointIndicator(landmarks[25], isCorrect);
  }
  if (currentAngles.spine) {
    const target = selectedAsana?.angles.spine;
    const tolerance = selectedAsana?.tolerance || 15;
    const isCorrect = target ? Math.abs(currentAngles.spine - target) <= tolerance : false;
    drawAngleText(landmarks[23], "SPINE", currentAngles.spine);
  }
  
  // Draw enhanced angle summary box at top-left corner
  if (Object.keys(currentAngles).length > 0) {
    const boxX = 10;
    const boxY = 10;
    const boxWidth = 220;
    const lineHeight = 28;
    const boxHeight = (Object.keys(currentAngles).length + 1) * lineHeight + 20;
    
    // Draw shadow for depth
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(boxX + 3, boxY + 3, boxWidth, boxHeight);
    
    // Draw semi-transparent background
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // Draw glowing border
    ctx.strokeStyle = "#FFFF00";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#FFFF00";
    ctx.shadowBlur = 10;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.shadowBlur = 0;
    
    // Draw title with icon
    ctx.fillStyle = "#FFFF00";
    ctx.font = "bold 18px Arial";
    ctx.fillText("📐 LIVE ANGLES", boxX + 15, boxY + 25);
    
    // Draw separator line
    ctx.strokeStyle = "#FFFF00";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + 10, boxY + 35);
    ctx.lineTo(boxX + boxWidth - 10, boxY + 35);
    ctx.stroke();
    
    // Draw angle values with color-coded feedback
    ctx.font = "bold 15px Arial";
    let yOffset = boxY + 55;
    
    Object.keys(currentAngles).forEach(angleName => {
      const angleValue = currentAngles[angleName];
      const targetValue = selectedAsana?.angles[angleName];
      const tolerance = selectedAsana?.tolerance || 15;
      
      let color = "#FFFFFF";
      let status = "";
      
      if (targetValue) {
        const diff = Math.abs(angleValue - targetValue);
        if (diff <= tolerance) {
          color = "#00FF00";  // Perfect - Green
          status = "✓";
        } else if (diff <= tolerance * 1.5) {
          color = "#FFA500";  // Close - Orange
          status = "~";
        } else {
          color = "#FF4444";  // Needs work - Red
          status = "✗";
        }
      }
      
      ctx.fillStyle = color;
      ctx.fillText(`${status} ${angleName.toUpperCase()}: ${angleValue.toFixed(0)}°`, boxX + 15, yOffset);
      
      // Show target angle
      if (targetValue) {
        ctx.fillStyle = "#888888";
        ctx.font = "10px Arial";
        ctx.fillText(`(Target: ${targetValue}°)`, boxX + 15, yOffset + 12);
        ctx.font = "bold 15px Arial";
      }
      
      yOffset += lineHeight;
    });
  }
}

// Camera Control
const startBtn = document.getElementById("startCamera");
const stopBtn = document.getElementById("stopCamera");
const voiceBtn = document.getElementById("voiceToggle");
let camera;

startBtn.addEventListener("click", async () => {
  if (!selectedAsana) {
    alert("Please select an exercise first!");
    return;
  }
  
  try {
    // Get selected duration
    selectedDuration = parseInt(document.getElementById("durationSelect").value);
    remainingTime = selectedDuration;
    
    // Start session
    sessionStartTime = Date.now();
    sessionAccuracies = [];
    repCount = 0;
    
    // Announce start with voice guidance
    speak(`Starting ${selectedAsana.name}. Get ready!`);
    
    // Capture initial sugar level
    const sugarInput = document.getElementById('sugarLevelInput');
    initialSugarLevel = parseFloat(sugarInput.value) || null;
    if (initialSugarLevel) {
        console.log('📈 Initial Sugar Level Captured:', initialSugarLevel);
        document.getElementById('sugarPrediction').style.display = 'block';
        updateSugarPrediction(initialSugarLevel, 0);
    }

    setTimeout(() => {
      speak("Position yourself in front of the camera. I will guide you.");
    }, 2000);
    
    // Start camera with FULL HD resolution for better clarity
    camera = new Camera(videoElem, {
      onFrame: async () => await pose.send({ image: videoElem }),
      width: 1920,   // Full HD resolution for crystal clear camera
      height: 1080,  // 1080p quality
      facingMode: 'user'  // Front-facing camera
    });
    await camera.start();
    
    // Update UI
    startBtn.style.display = "none";
    stopBtn.style.display = "inline-block";
    voiceBtn.style.display = "inline-block";
    
    // Show target angles
    displayTargetAngles(selectedAsana);
    
    // Start timer
    startSessionTimer();
    
    // Initialize user if needed
    if (!currentUserId) initUser();
    
    speak(getInstruction(selectedAsana, 'start'), true);
    
  } catch (err) {
    alert("❌ Camera access denied. Please allow camera access.");
    console.error(err);
  }
});

stopBtn.addEventListener("click", () => {
  stopSession();
});

// Session timer
function startSessionTimer() {
  const timerDisplay = document.getElementById("timerDisplay");
  
  sessionTimer = setInterval(() => {
    remainingTime--;
    
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Voice reminders
    if (remainingTime === 30) {
      speak("30 seconds remaining", true);
    } else if (remainingTime === 10) {
      speak("10 seconds left", true);
    }
    
    if (remainingTime <= 0) {
      clearInterval(sessionTimer);
      timerDisplay.textContent = "Time's up!";
      speak("Session complete! Well done!", true);
      
      // Auto-stop after 2 seconds
      setTimeout(() => {
        stopSession();
      }, 2000);
    }
  }, 1000);
}

// Stop session
function stopSession() {
  if (camera) camera.stop();
  if (videoElem.srcObject) {
    videoElem.srcObject.getTracks().forEach((t) => t.stop());
  }
  
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
  
  stopBtn.style.display = "none";
  startBtn.style.display = "inline-block";
  voiceBtn.style.display = "none";
  
  // Save session and generate report
  if (sessionStartTime && selectedAsana) {
    saveSessionAndGenerateReport();
  }
}

// Save session and generate PDF report
function saveSessionAndGenerateReport() {
  const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
  const avgAccuracy = sessionAccuracies.length > 0
    ? sessionAccuracies.reduce((a, b) => a + b, 0) / sessionAccuracies.length
    : 0;
  
  const condition = document.getElementById("disease").value;
  const userName = document.getElementById("nameInput").value || "User";
  const age = document.getElementById("ageInput").value || "N/A";
  const gender = document.getElementById("genderInput").value || "N/A";
  const bmi = document.getElementById("bmiInput")?.value || "N/A";
  
  const sessionData = {
    condition,
    asanaName: selectedAsana.name,
    reps: repCount,
    accuracy: avgAccuracy,
    duration,
    timestamp: new Date().toISOString(),
    userName,
    age,
    gender,
    bmi
  };
  
  // Save to localStorage for dashboard access
  localStorage.setItem('lastSession', JSON.stringify(sessionData));
  console.log('💾 Session data saved to localStorage');
  // Save to backend
  if (currentUserId) {
    const sessionData = {
      userName,
      age,
      gender,
      bmi,
      condition,
      exercise: selectedAsana.name,
      duration,
      reps: repCount,
      accuracy: avgAccuracy,
      benefits: getBenefits(selectedAsana),
      sugarLevel: initialSugarLevel,
      predictedSugarLevel: lastSugarPrediction,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('lastSession', JSON.stringify(sessionData));

    fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUserId,
        condition,
        asanaName: selectedAsana.name,
        reps: repCount,
        accuracy: avgAccuracy,
        glycemicScore: (avgAccuracy * 0.8) + (Math.min(repCount, 10) * 2),
        duration,
        sugarLevel: initialSugarLevel,
        predictedSugarLevel: lastSugarPrediction
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Session saved to database:', data.session);
      } else {
        console.log('⚠️ Session saved locally only (database offline)');
      }
    })
    .catch(err => {
      console.warn('⚠️ Could not save to database:', err);
      console.log('💾 Data saved locally for dashboard access');
    });
  }
  
  // Ask user if they want PDF report
  const wantsPDF = confirm(`Session Complete!

Reps: ${repCount}
Accuracy: ${avgAccuracy.toFixed(1)}%
Duration: ${Math.floor(duration / 60)}m ${duration % 60}s

Would you like to download a PDF report?`);
  
  if (wantsPDF) {
    // Generate PDF Report
    generatePDFReport({
      userName,
      age,
      gender,
      bmi,
      condition,
      exercise: selectedAsana.name,
      duration,
      reps: repCount,
      accuracy: avgAccuracy,
      benefits: getBenefits(selectedAsana),
      sugarLevel: initialSugarLevel,
      predictedSugarLevel: lastSugarPrediction
    });
  } else {
    alert('✅ Session saved successfully! You can view your progress in the dashboard.');
  }
}

// Generate PDF Report
function generatePDFReport(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let yPos = 20;
  
  // Professional Header with background
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 45, 'F');
  
  // Title
  yPos = 18;
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text("Digital Health Solutions", 105, yPos, { align: "center" });
  
  yPos += 12;
  doc.setFontSize(14);
  doc.setFont(undefined, 'normal');
  doc.text("Professional Exercise Session Report", 105, yPos, { align: "center" });
  
  // Divider line
  yPos = 50;
  doc.setDrawColor(102, 126, 234);
  doc.setLineWidth(1);
  doc.line(20, yPos, 190, yPos);
  
  // User Information Section
  yPos += 12;
  doc.setFontSize(14);
  doc.setTextColor(102, 126, 234);
  doc.setFont(undefined, 'bold');
  doc.text("USER INFORMATION", 20, yPos);
  
  yPos += 10;
  doc.setFillColor(240, 243, 255);
  doc.roundedRect(20, yPos - 5, 170, 30, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${data.userName}`, 25, yPos + 2);
  doc.text(`Age: ${data.age} years`, 110, yPos + 2);
  yPos += 7;
  doc.text(`Gender: ${data.gender}`, 25, yPos);
  doc.text(`BMI: ${data.bmi}`, 110, yPos);
  yPos += 7;
  doc.text(`Health Condition: ${data.condition.replace('_', ' ').toUpperCase()}`, 25, yPos);
  
  // New Metabolic Progress Section in PDF
  if (data.condition.startsWith('diabetes')) {
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50); // Green for metabolism
    doc.setFont(undefined, 'bold');
    doc.text("METABOLIC PROGRESS SUMMARY", 20, yPos);
    
    yPos += 8;
    const glycemicScore = (data.accuracy * 0.8) + (Math.min(data.reps, 10) * 2);
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(20, yPos - 5, 170, 35, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(46, 125, 50);
    doc.setFont(undefined, 'bold');
    doc.text(`Glycemic-Impact Score: ${glycemicScore.toFixed(1)} Points`, 25, yPos + 2);
    
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.setFont(undefined, 'normal');
    if (data.sugarLevel) {
      doc.text(`Initial Sugar Level: ${data.sugarLevel} mg/dL`, 25, yPos + 10);
      const predicted = data.predictedSugarLevel || (data.sugarLevel - (glycemicScore/10)*5);
      doc.text(`Predicted Post-Exercise: ${predicted.toFixed(0)} mg/dL`, 25, yPos + 17);
      
      const drop = data.sugarLevel - predicted;
      doc.setTextColor(46, 125, 50);
      doc.text(`Estimated Reduction: ${drop.toFixed(1)} mg/dL achieved`, 110, yPos + 17);
    }
    yPos += 25;
  }
  
  // Session Details Section
  yPos += 15;
  doc.setFontSize(14);
  doc.setTextColor(102, 126, 234);
  doc.setFont(undefined, 'bold');
  doc.text("SESSION DETAILS", 20, yPos);
  
  yPos += 10;
  doc.setFillColor(240, 243, 255);
  doc.roundedRect(20, yPos - 5, 170, 30, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  doc.setFont(undefined, 'normal');
  doc.text(`Exercise: ${data.exercise}`, 25, yPos + 2);
  doc.text(`Duration: ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`, 110, yPos + 2);
  yPos += 7;
  doc.text(`Repetitions: ${data.reps}`, 25, yPos);
  yPos += 7;
  
  // Performance Score - Highlighted Box
  const accuracyColor = data.accuracy >= 80 ? [76, 175, 80] : 
                       data.accuracy >= 60 ? [255, 152, 0] : [244, 67, 54];
  
  doc.setFillColor(...accuracyColor);
  doc.roundedRect(20, yPos, 170, 15, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text(`Performance Score: ${data.accuracy.toFixed(1)}%`, 105, yPos + 10, { align: "center" });
  
  // Performance Rating Section
  yPos += 25;
  doc.setFontSize(14);
  doc.setTextColor(102, 126, 234);
  doc.setFont(undefined, 'bold');
  doc.text("PERFORMANCE RATING", 20, yPos);
  
  yPos += 10;
  
  let rating = "";
  let ratingDescription = "";
  let ratingColor = [];
  
  if (data.accuracy >= 85) {
    rating = "EXCELLENT";
    ratingDescription = "Perfect form maintained throughout the session. Outstanding performance!";
    ratingColor = [76, 175, 80];
  } else if (data.accuracy >= 70) {
    rating = "VERY GOOD";
    ratingDescription = "Good form with minor adjustments needed. Keep up the great work!";
    ratingColor = [139, 195, 74];
  } else if (data.accuracy >= 50) {
    rating = "GOOD";
    ratingDescription = "Decent performance. Continue practicing for better form and technique.";
    ratingColor = [255, 152, 0];
  } else {
    rating = "NEEDS IMPROVEMENT";
    ratingDescription = "Focus on proper technique. Review exercise guidelines and try again.";
    ratingColor = [244, 67, 54];
  }
  
  // Rating box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(20, yPos - 5, 170, 35, 3, 3, 'F');
  
  // Rating label
  doc.setFillColor(...ratingColor);
  doc.roundedRect(25, yPos, 50, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(rating, 50, yPos + 7, { align: "center" });
  
  // Rating score
  yPos += 13;
  doc.setTextColor(102, 126, 234);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`Score: ${data.accuracy.toFixed(1)} / 100`, 25, yPos);
  
  // Rating description
  yPos += 7;
  doc.setTextColor(85, 85, 85);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const descLines = doc.splitTextToSize(ratingDescription, 160);
  doc.text(descLines[0], 25, yPos);
  
  // Health Benefits Section
  yPos += 18;
  doc.setFontSize(14);
  doc.setTextColor(102, 126, 234);
  doc.setFont(undefined, 'bold');
  doc.text("HEALTH BENEFITS ACHIEVED", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.setFont(undefined, 'normal');
  
  data.benefits.slice(0, 5).forEach((benefit, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`${index + 1}. ${benefit}`, 25, yPos);
    yPos += 6;
  });
  
  // Recommendations Section
  yPos += 8;
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(102, 126, 234);
  doc.setFont(undefined, 'bold');
  doc.text("PROFESSIONAL RECOMMENDATIONS", 20, yPos);
  
  yPos += 10;
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(20, yPos - 5, 170, 50, 3, 3, 'F');
  
  yPos += 2;
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.setFont(undefined, 'normal');
  
  const recommendations = [
    "Practice this exercise 3-4 times per week for optimal results",
    "Focus on proper breathing techniques during each repetition",
    "Stay hydrated before, during, and after your exercise session",
    "Maintain consistency - regular practice leads to better outcomes",
    "Consult a healthcare professional for personalized guidance"
  ];
  
  recommendations.forEach((rec, index) => {
    doc.text(`${index + 1}. ${rec}`, 25, yPos);
    yPos += 8;
  });

  // Nutrition Advice Section (Specific for Diabetes)
  if (data.condition.startsWith('diabetes')) {
    yPos += 10;
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.setFont(undefined, 'bold');
    doc.text("PERSONALIZED NUTRITION ADVICE", 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.setFont(undefined, 'normal');
    
    const bmiVal = parseFloat(data.bmi);
    const bmiCat = bmiVal < 18.5 ? "underweight" : bmiVal < 25 ? "normal" : "overweight";
    const dietAdvice = dietDatabase[data.condition][bmiCat] || dietDatabase.general;
    
    dietAdvice.forEach((advice, index) => {
      const wrappedAdvice = doc.splitTextToSize(advice, 160);
      doc.text(`• ${wrappedAdvice[0]}`, 25, yPos);
      yPos += 6;
    });
  }
  
  // Professional Footer
  doc.setDrawColor(102, 126, 234);
  doc.setLineWidth(0.5);
  doc.line(20, 275, 190, 275);
  
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.setFont(undefined, 'italic');
  doc.text(`Report generated on: ${new Date().toLocaleString()}`, 105, 282, { align: "center" });
  doc.text("Digital Health Solutions - Your AI-Powered Health Partner", 105, 288, { align: "center" });
  
  // Save PDF with professional filename
  const date = new Date().toISOString().split('T')[0];
  const fileName = `Health_Report_${data.userName.replace(/\s/g, '_')}_${date}.pdf`;
  doc.save(fileName);
  
  alert(`Session Completed Successfully!

Performance Score: ${data.accuracy.toFixed(1)}%
Rating: ${rating}
Repetitions: ${data.reps}
Duration: ${Math.floor(data.duration / 60)}m ${data.duration % 60}s

Professional PDF report downloaded!`);
}

// Initialize canvas size to match Full HD camera
window.addEventListener('load', () => {
  canvasElem.width = 1920;   // Match Full HD camera width
  canvasElem.height = 1080;  // Match Full HD camera height
  initUser();
  displayCurrentUser();
  setupDiabeticFeatures();
});

// Setup new Diabetic Features
function setupDiabeticFeatures() {
  const dietBtn = document.getElementById('dietBtn');
  const reportBtn = document.getElementById('reportBtn');
  
  if (dietBtn) {
    dietBtn.addEventListener('click', showDietAdvice);
  }
  
  if (reportBtn) {
    reportBtn.addEventListener('click', () => {
      const lastSession = JSON.parse(localStorage.getItem('lastSession') || '{}');
      if (lastSession.userName) {
        generatePDFReport(lastSession);
      } else {
        alert('Please complete at least one exercise session to generate a full health report.');
      }
    });
  }
}

// Update Sugar Level Prediction
function updateSugarPrediction(current, glycemicPoints) {
  const predictionBox = document.getElementById('sugarPrediction');
  const predictionText = document.getElementById('predictionText');
  
  if (!current) return;
  
  // Heuristic: Each 10 glycemic points drop sugar by ~5 mg/dL (simplified AI model)
  const estimatedDrop = (glycemicPoints / 10) * 5;
  const predicted = current - estimatedDrop;
  lastSugarPrediction = predicted;
  
  predictionBox.style.display = 'block';
  predictionText.innerHTML = `
    <span style="color: #4f46e5;">Estimated Post-Exercise:</span> 
    <span style="color: #059669;">${predicted.toFixed(0)} mg/dL</span>
    <div style="font-size: 0.75rem; color: #666; margin-top: 5px;">
      *Prediction based on current intensity and exercise duration.
    </div>
  `;
}

// Show Diet Advice
function showDietAdvice() {
  const condition = document.getElementById('disease').value;
  const weight = parseFloat(document.getElementById('weightInput').value);
  const height = parseFloat(document.getElementById('heightInput').value);
  
  if (!condition || !condition.startsWith('diabetes')) {
    alert('Diet recommendations are currently optimized for Diabetic patients. Please select a Diabetes condition.');
    return;
  }
  
  if (!weight || !height) {
    alert('Please enter height and weight to receive BMI-specific diet advice.');
    return;
  }
  
  const bmi = (weight / (height * height)).toFixed(1);
  const bmiCategory = bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : "overweight";
  
  const recommendations = dietDatabase[condition][bmiCategory] || dietDatabase.general;
  
  // Create Modal for Diet Advice
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h2>🥗 Personalized Nutrition Guide</h2>
        <button class="close-btn" id="closeDiet">&times;</button>
      </div>
      <div class="modal-body">
        <div style="background: #f0fdf4; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
          <h4 style="color: #166534; margin: 0;">Target Profile</h4>
          <p style="margin: 5px 0 0 0; font-size: 0.9rem;">Condition: <strong>${condition.replace('_', ' ').toUpperCase()}</strong> | BMI: <strong>${bmi} (${bmiCategory.toUpperCase()})</strong></p>
        </div>
        <ul style="padding-left: 20px;">
          ${recommendations.map(r => `<li style="margin-bottom: 12px; line-height: 1.4;">${r}</li>`).join('')}
        </ul>
        <div style="margin-top: 20px; padding: 10px; background: #fffbeb; border-radius: 8px; font-size: 0.85rem; color: #92400e;">
          <strong>💡 AI Tip:</strong> Consistent meal timing combined with your exercise routine helps stabilize blood sugar more effectively.
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('closeDiet').onclick = () => {
    document.body.removeChild(modal);
  };
}

// Display current user name if logged in
function displayCurrentUser() {
  const userName = localStorage.getItem('userName');
  if (userName && currentUserId) {
    document.getElementById('currentUserInfo').style.display = 'block';
    document.getElementById('displayUserName').textContent = userName;
  }
}

// Switch to a different user
function switchUser() {
  const confirmSwitch = confirm('Are you sure you want to switch users? This will clear the current user data from this browser.');
  if (confirmSwitch) {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('lastSession');
    localStorage.removeItem('lastBMI');
    currentUserId = null;
    
    // Clear form
    document.getElementById('nameInput').value = '';
    document.getElementById('ageInput').value = '';
    document.getElementById('genderInput').value = 'Male';
    document.getElementById('weightInput').value = '';
    document.getElementById('heightInput').value = '';
    document.getElementById('bmiResult').style.display = 'none';
    document.getElementById('currentUserInfo').style.display = 'none';
    
    alert('User switched! Please enter new user details.');
    location.reload();
  }
}
