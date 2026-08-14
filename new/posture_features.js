// ==========================================
// SITTING POSTURE DETECTION & VIDEO UPLOAD
// ==========================================

let sittingCamera = null;
let sittingPose = null;
let postureInterval = null;
let postureHistory = [];
let selectedVideoType = null;

// ========== VIDEO TYPE SELECTION ==========

function selectVideoType(type) {
  selectedVideoType = type;
  
  // Update button styles
  document.getElementById('btnExerciseVideo').classList.remove('selected');
  document.getElementById('btnSittingVideo').classList.remove('selected');
  document.getElementById('btnBodyVideo').classList.remove('selected');
  
  if (type === 'exercise') {
    document.getElementById('btnExerciseVideo').classList.add('selected');
    document.getElementById('videoTypeText').textContent = '🏋️ Exercise Movement - Analysis will focus on exercise form and technique';
  } else if (type === 'body') {
    document.getElementById('btnBodyVideo').classList.add('selected');
    document.getElementById('videoTypeText').textContent = '🚶 Body Movement - Analysis will focus on walking, posture transitions, and movement patterns';
  } else {
    document.getElementById('btnSittingVideo').classList.add('selected');
    document.getElementById('videoTypeText').textContent = '🪑 Sitting Posture - Analysis will focus on sitting alignment and posture';
  }
  
  document.getElementById('selectedVideoType').style.display = 'block';
}

// ========== SITTING POSTURE DETECTION ==========

function openSittingPosture() {
  document.getElementById('sittingPostureModal').style.display = 'flex';
  
  // Sync condition from profile
  const profileCondition = document.getElementById('disease').value;
  const guidanceSection = document.getElementById('sittingAiGuidance');
  const guidanceContent = document.getElementById('sittingGuidanceContent');
  const guidanceImg = document.getElementById('sittingGuidanceImg');
  const guidanceTips = document.getElementById('sittingGuidanceTips');
  
  if (profileCondition && healthGuidanceData[profileCondition]) {
    guidanceSection.style.display = 'block';
    const data = healthGuidanceData[profileCondition].sit;
    guidanceContent.innerHTML = `<strong>Guidance for ${profileCondition.replace('_', ' ').toUpperCase()}:</strong>`;
    guidanceImg.src = data.img;
    guidanceTips.innerHTML = data.text;
  } else {
    guidanceSection.style.display = 'none';
  }
}

function closeSittingPosture() {
  document.getElementById('sittingPostureModal').style.display = 'none';
  stopSittingCamera();
}

document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startSittingCamera');
  const stopBtn = document.getElementById('stopSittingCamera');
  
  if (startBtn) {
    startBtn.addEventListener('click', startSittingCamera);
  }
  
  if (stopBtn) {
    stopBtn.addEventListener('click', stopSittingCamera);
  }
});

async function startSittingCamera() {
  try {
    const video = document.getElementById('sittingVideo');
    const canvas = document.getElementById('sittingCanvas');
    const ctx = canvas.getContext('2d');
    
    // Get camera access with HD quality for better accuracy
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      } 
    });
    
    video.srcObject = stream;
    video.style.display = 'block';
    
    // Initialize MediaPipe Pose with HIGH accuracy
    sittingPose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });
    
    sittingPose.setOptions({
      modelComplexity: 2,           // Highest accuracy model
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.8,  // High confidence for accuracy
      minTrackingConfidence: 0.8
    });
    
    sittingPose.onResults((results) => {
      canvas.width = results.image.width;
      canvas.height = results.image.height;
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      
      if (results.poseLandmarks) {
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#667eea',
          lineWidth: 4
        });
        drawLandmarks(ctx, results.poseLandmarks, {
          color: '#f59e0b',
          lineWidth: 2,
          radius: 5
        });
        
        // Analyze sitting posture
        analyzeSittingPosture(results.poseLandmarks);
      }
      ctx.restore();
    });
    
    // Start processing
    sittingCamera = new Camera(video, {
      onFrame: async () => {
        await sittingPose.send({ image: video });
      },
      width: 640,
      height: 480
    });
    
    await sittingCamera.start();
    
    // Update UI
    document.getElementById('startSittingCamera').style.display = 'none';
    document.getElementById('stopSittingCamera').style.display = 'inline-block';
    document.getElementById('postureAlerts').textContent = '✅ Monitoring started - Sit naturally!';
    
  } catch (error) {
    console.error('Error starting camera:', error);
    alert('Failed to start camera. Please allow camera access.');
  }
}

function stopSittingCamera() {
  if (sittingCamera) {
    sittingCamera.stop();
    sittingCamera = null;
  }
  
  if (postureInterval) {
    clearInterval(postureInterval);
    postureInterval = null;
  }
  
  const video = document.getElementById('sittingVideo');
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  
  video.style.display = 'none';
  
  document.getElementById('startSittingCamera').style.display = 'inline-block';
  document.getElementById('stopSittingCamera').style.display = 'none';
  document.getElementById('postureAlerts').textContent = 'Monitoring stopped';
}

function analyzeSittingPosture(landmarks) {
  // Get key landmarks for sitting posture
  const nose = landmarks[0];
  const leftEye = landmarks[1];
  const rightEye = landmarks[2];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return;
  }
  
  // Calculate posture metrics
  const spineAlignment = calculateSpineAlignment(leftShoulder, rightShoulder, leftHip, rightHip);
  const headPosition = calculateHeadPosition(nose, leftShoulder, rightShoulder);
  const shoulderLevel = calculateShoulderLevel(leftShoulder, rightShoulder);
  const headTilt = calculateHeadTilt(leftEar, rightEar);
  const eyeClosure = calculateEyeClosure(leftEye, rightEye);
  
  // Calculate overall posture score (0-100)
  let score = 100;
  let alerts = [];
  let details = {
    sitting: { status: 'good', text: 'Sitting Straight ✅' },
    head: { status: 'good', text: 'Head Aligned ✅' },
    eyes: { status: 'good', text: 'Eyes Open 👁️' },
    back: { status: 'good', text: 'Back Aligned ✅' },
    shoulders: { status: 'good', text: 'Level ✅' },
    leaning: { status: 'good', text: 'Centered ✅' }
  };
  
  // Spine alignment check (should be straight)
  if (spineAlignment < 0.85) {
    score -= 20;
    details.sitting = { status: 'warning', text: 'Leaning ⚠️' };
    alerts.push('⚠️ Leaning to one side - Sit straight');
  }
  
  // Head position check (should be aligned with shoulders)
  if (headPosition > 0.15) {
    score -= 15;
    details.head = { status: 'bad', text: 'Forward ❌' };
    alerts.push('📱 Head too forward - Bring head back');
  }
  
  // Head tilt check
  if (headTilt > 0.08) {
    score -= 10;
    details.head = { status: 'warning', text: 'Tilted ⚠️' };
    alerts.push('🔄 Head tilted - Keep head straight');
  }
  
  // Eye closure detection
  if (eyeClosure < 0.7) {
    details.eyes = { status: 'warning', text: 'Closed/Blinking 👁️' };
    alerts.push('😴 Eyes appear closed - Stay alert');
  }
  
  // Back alignment
  const backAngle = calculateBackAngle(leftShoulder, leftHip);
  if (backAngle < 0.7 || backAngle > 1.1) {
    score -= 15;
    details.back = { status: 'bad', text: 'Bent ❌' };
    alerts.push('🔙 Back is bent - Sit up straight');
  }
  
  // Shoulder level check (should be level)
  if (shoulderLevel > 0.05) {
    score -= 10;
    details.shoulders = { status: 'warning', text: 'Uneven ⚠️' };
    alerts.push('🤷 Shoulders uneven - Level your shoulders');
  }
  
  // Body leaning detection
  const shoulderHipOffset = Math.abs((leftShoulder.x + rightShoulder.x)/2 - (leftHip.x + rightHip.x)/2);
  if (shoulderHipOffset > 0.1) {
    score -= 15;
    details.leaning = { status: 'bad', text: 'Leaning ❌' };
    alerts.push('↔️ Body leaning - Center yourself');
  }
  
  // Ensure score is not negative
  score = Math.max(0, score);
  
  // Update UI
  updatePostureUI(score, alerts, details);
  
  // Generate activity description
  generateActivityDescription(details, score);
  
  // Store history
  postureHistory.push({
    timestamp: Date.now(),
    score: score
  });
  
  // Keep only last 60 seconds of data
  const oneMinuteAgo = Date.now() - 60000;
  postureHistory = postureHistory.filter(p => p.timestamp > oneMinuteAgo);
}

function calculateSpineAlignment(leftShoulder, rightShoulder, leftHip, rightHip) {
  const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
  const hipCenterX = (leftHip.x + rightHip.x) / 2;
  const distance = Math.abs(shoulderCenterX - hipCenterX);
  return 1 - distance; // Closer to 1 is better
}

function calculateHeadPosition(nose, leftShoulder, rightShoulder) {
  const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
  return Math.abs(nose.x - shoulderCenterX);
}

function calculateShoulderLevel(leftShoulder, rightShoulder) {
  return Math.abs(leftShoulder.y - rightShoulder.y);
}

function calculateHeadTilt(leftEar, rightEar) {
  if (!leftEar || !rightEar) return 0;
  return Math.abs(leftEar.y - rightEar.y);
}

function calculateEyeClosure(leftEye, rightEye) {
  // Simplified eye detection - in production, use facial landmarks
  if (!leftEye || !rightEye) return 1;
  // Check if eyes are visible (if visible, likely open)
  const visibility = (leftEye.visibility + rightEye.visibility) / 2;
  return visibility;
}

function calculateBackAngle(shoulder, hip) {
  if (!shoulder || !hip) return 1;
  // Calculate vertical angle - 1.0 is perfectly straight
  const dx = Math.abs(shoulder.x - hip.x);
  const dy = Math.abs(shoulder.y - hip.y);
  return dy / (dx + dy); // Closer to 1 = more vertical
}

function generateActivityDescription(details, score) {
  const descElement = document.getElementById('activityDescription');
  
  if (!descElement) return;
  
  descElement.style.display = 'block';
  
  let description = '';
  
  if (score >= 85) {
    description = '✅ Excellent posture! You are sitting straight with good alignment.';
  } else if (score >= 70) {
    description = '⚠️ Good posture with minor adjustments needed.';
  } else if (score >= 50) {
    description = '⚠️ Fair posture. Multiple corrections needed for better alignment.';
  } else {
    description = '❌ Poor posture detected. Please correct your sitting position immediately.';
  }
  
  // Add specific observations
  if (details.head.status === 'bad') {
    description += ' Your head is positioned forward.';
  }
  if (details.back.status === 'bad') {
    description += ' Your back is bent.';
  }
  if (details.eyes.status === 'warning') {
    description += ' Eyes appear closed or looking down.';
  }
  if (details.leaning.status === 'bad') {
    description += ' Body is leaning to one side.';
  }
  
  descElement.textContent = description;
}

function updatePostureUI(score, alerts, details) {
  const scoreElement = document.getElementById('postureScore');
  const alertsElement = document.getElementById('postureAlerts');
  
  // Update score with color
  let scoreColor = '#10b981'; // Green
  let scoreText = '✅ Excellent';
  
  if (score < 50) {
    scoreColor = '#ef4444'; // Red
    scoreText = '❌ Poor';
  } else if (score < 75) {
    scoreColor = '#f59e0b'; // Yellow
    scoreText = '⚠️ Fair';
  }
  
  scoreElement.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 3rem; color: ${scoreColor}; font-weight: bold;">${score}%</div>
      <div style="font-size: 1.2rem; color: ${scoreColor}; margin-top: 5px;">${scoreText}</div>
    </div>
  `;
  
  // Update detail items
  if (details) {
    const sittingEl = document.getElementById('sittingStraight');
    const headEl = document.getElementById('headPosition');
    const eyesEl = document.getElementById('eyeStatus');
    const backEl = document.getElementById('backAlignment');
    const shouldersEl = document.getElementById('shoulderLevel');
    const leaningEl = document.getElementById('bodyLeaning');
    
    if (sittingEl) {
      sittingEl.textContent = `Sitting: ${details.sitting.text}`;
      sittingEl.style.borderLeft = `4px solid ${getStatusColor(details.sitting.status)}`;
    }
    if (headEl) {
      headEl.textContent = `Head: ${details.head.text}`;
      headEl.style.borderLeft = `4px solid ${getStatusColor(details.head.status)}`;
    }
    if (eyesEl) {
      eyesEl.textContent = `Eyes: ${details.eyes.text}`;
      eyesEl.style.borderLeft = `4px solid ${getStatusColor(details.eyes.status)}`;
    }
    if (backEl) {
      backEl.textContent = `Back: ${details.back.text}`;
      backEl.style.borderLeft = `4px solid ${getStatusColor(details.back.status)}`;
    }
    if (shouldersEl) {
      shouldersEl.textContent = `Shoulders: ${details.shoulders.text}`;
      shouldersEl.style.borderLeft = `4px solid ${getStatusColor(details.shoulders.status)}`;
    }
    if (leaningEl) {
      leaningEl.textContent = `Leaning: ${details.leaning.text}`;
      leaningEl.style.borderLeft = `4px solid ${getStatusColor(details.leaning.status)}`;
    }
  }
  
  // Update alerts
  if (alerts.length === 0) {
    alertsElement.innerHTML = '<p class="good-posture">✅ Perfect posture! Keep it up!</p>';
  } else {
    alertsElement.innerHTML = `
      <h4 style="margin-bottom: 10px;">🔔 Alerts:</h4>
      ${alerts.map(a => `<p class="warning-posture">${a}</p>`).join('')}
    `;
  }
}

function getStatusColor(status) {
  switch(status) {
    case 'good': return '#10b981';
    case 'warning': return '#f59e0b';
    case 'bad': return '#ef4444';
    default: return '#667eea';
  }
}

// ========== VIDEO UPLOAD & ANALYSIS ==========

// Health Condition Guidance Data
const healthGuidanceData = {
  'back_pain': {
    move: {
      text: '<p>For back pain, perform gentle stretches to decompress the spine:</p><ul><li><strong>Cat-Cow:</strong> Arch and round your back on all fours.</li><li><strong>Child\'s Pose:</strong> Rest your hips on heels and stretch arms forward.</li><li><strong>Gentle Twists:</strong> While sitting or lying, rotate torso slowly.</li></ul>',
      img: 'imagex/back_movement.png'
    },
    sit: {
      text: '<p>Optimize your sitting for lumbar support:</p><ul><li>Use a lumbar roll or pillow for your lower back.</li><li>Ensure screen is at eye level to prevent slouching.</li><li>Keep feet flat and knees slightly lower than hips.</li></ul>',
      img: 'imagex/correct_sitting_posture.png'
    }
  },
  'knee_pain': {
    move: {
      text: '<p>Strengthen muscles around the knee without high impact:</p><ul><li><strong>Knee Extensions:</strong> Straighten leg while sitting on a chair.</li><li><strong>Straight Leg Raises:</strong> Lift leg while lying on your back.</li><li><strong>Wall Squats:</strong> Slide down a wall slowly, don\'t go too deep.</li></ul>',
      img: 'imagex/knee_movement.png'
    },
    sit: {
      text: '<p>Reduce pressure on the knee joint while sitting:</p><ul><li>Don\'t keep knees bent at a sharp angle for long.</li><li>Use a footrest to keep knees at a comfortable 90-100°.</li><li>Avoid crossing your legs at the knees.</li></ul>',
      img: 'imagex/correct_sitting_posture.png'
    }
  },
  'joint_pain': {
    move: {
      text: '<p>Focus on range of motion and low-impact mobility:</p><ul><li><strong>Ankle/Wrist Circles:</strong> Rotate joints slowly in both directions.</li><li><strong>Shoulder Rolls:</strong> Gently rotate shoulders back and down.</li><li><strong>Seated Marches:</strong> Lift knees alternately while sitting.</li></ul>',
      img: 'imagex/back_movement.png' // Fallback to general movement
    },
    sit: {
      text: '<p>Maintain joint health throughout the day:</p><ul><li>Change positions every 20-30 minutes.</li><li>Ensure armrests support your elbows at 90°.</li><li>Keep wrists in a neutral, straight position.</li></ul>',
      img: 'imagex/correct_sitting_posture.png'
    }
  },
  'neck_pain': {
    move: {
      text: '<p>Relieve tension in the cervical spine:</p><ul><li><strong>Chin Tucks:</strong> Pull chin straight back (double chin pose).</li><li><strong>Neck Tilts:</strong> Move ear towards shoulder slowly.</li><li><strong>Shoulder Blade Squeezes:</strong> Pull blades together and down.</li></ul>',
      img: 'imagex/back_movement.png'
    },
    sit: {
      text: '<p>Correct "Tech Neck" while working:</p><ul><li>Bring your phone/monitor UP to eye level.</li><li>Relax shoulders - don\'t let them creep towards ears.</li><li>Take "micro-breaks" to look at the ceiling and reset.</li></ul>',
      img: 'imagex/correct_sitting_posture.png'
    }
  }
};

function updateGuidanceContent(condition) {
  const section = document.getElementById('aiGuidanceSection');
  const moveContent = document.getElementById('moveGuideContent');
  const sitContent = document.getElementById('sitGuideContent');
  const moveImg = document.getElementById('moveGuideImg');
  const sitImg = document.getElementById('sitGuideImg');

  if (!condition) {
    section.style.display = 'none';
    return;
  }

  const data = healthGuidanceData[condition];
  if (data) {
    section.style.display = 'block';
    
    moveContent.innerHTML = data.move.text;
    moveImg.src = data.move.img;
    moveImg.style.display = 'block';
    
    sitContent.innerHTML = data.sit.text;
    sitImg.src = data.sit.img;
    sitImg.style.display = 'block';

    // Scroll to guidance
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

function openVideoUpload() {
  document.getElementById('videoUploadModal').style.display = 'flex';
  
  // Sync condition from profile
  const profileCondition = document.getElementById('disease').value;
  const guidanceSelect = document.getElementById('guidanceCondition');
  
  if (profileCondition) {
    guidanceSelect.value = profileCondition;
    updateGuidanceContent(profileCondition);
  } else {
    guidanceSelect.value = '';
    document.getElementById('aiGuidanceSection').style.display = 'none';
  }
}

function closeVideoUpload() {
  document.getElementById('videoUploadModal').style.display = 'none';
  document.getElementById('videoAnalysisResults').style.display = 'none';
  document.getElementById('uploadProgress').style.display = 'none';
  document.getElementById('aiGuidanceSection').style.display = 'none';
}

async function uploadVideo() {
  const fileInput = document.getElementById('videoFileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select a video file first!');
    return;
  }
  
  // Validate file type
  if (!file.type.startsWith('video/')) {
    alert('Please select a valid video file!');
    return;
  }
  
  // Show progress
  document.getElementById('uploadProgress').style.display = 'block';
  document.getElementById('progressText').textContent = 'Processing video...';
  
  // Show video preview
  const videoPreview = document.getElementById('uploadedVideo');
  const videoURL = URL.createObjectURL(file);
  videoPreview.src = videoURL;
  videoPreview.style.display = 'block';
  
  // Simulate upload progress (in real app, this would be actual upload)
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 10;
    document.getElementById('progressFill').style.width = progress + '%';
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      analyzeUploadedVideo(file);
    }
  }, 300);
}

async function analyzeUploadedVideo(file) {
  document.getElementById('progressText').textContent = 'Analyzing video with AI pose detection...';
  
  // Create video element for frame extraction
  const video = document.createElement('video');
  video.src = URL.createObjectURL(file);
  video.muted = true;
  video.playsInline = true;
  video.style.display = 'none';
  document.body.appendChild(video); // Some browsers need this for canvas drawing
  
  // Wait for video to load
  await new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      video.currentTime = 0;
      resolve();
    };
    video.onerror = () => reject('Error loading video file');
    setTimeout(() => resolve(), 5000); // Fallback timeout
  });
  
  // Initialize pose detector for video analysis
  const videoPose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });
  
  videoPose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  // Handle results via callback (CRITICAL: MediaPipe only returns results here)
  let currentResults = null;
  videoPose.onResults((results) => {
    currentResults = results;
  });
  
  // Warm up the AI model
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
      setTimeout(resolve, 2000);
    });
  }

  // Analyze frames throughout the video
  const totalDuration = video.duration || 0;
  const frameInterval = 0.8;
  const postureResults = [];
  let currentTime = 0;
  
  // Extract and analyze frames
  let frameCount = 0;
  const totalFrames = Math.ceil(totalDuration / frameInterval);
  
  while (currentTime < totalDuration) {
    frameCount++;
    document.getElementById('progressText').textContent = `AI Analyzing Frame ${frameCount} of ${totalFrames}...`;
    
    video.currentTime = currentTime;
    
    await new Promise(resolve => {
      let seekTimeout = setTimeout(() => resolve(), 3000);

      video.onseeked = async () => {
        clearTimeout(seekTimeout);
        currentResults = null; // Reset for this frame
        
        try {
          await videoPose.send({ image: video });
          // Wait a tiny bit for the onResults callback to fire
          let checkCount = 0;
          const checkResults = setInterval(() => {
            checkCount++;
            if (currentResults || checkCount > 20) {
              clearInterval(checkResults);
              if (currentResults && currentResults.poseLandmarks) {
                const analysis = analyzeFramePosture(currentResults.poseLandmarks, selectedVideoType || 'exercise');
                postureResults.push({
                  time: currentTime,
                  ...analysis
                });
                console.log(`Frame ${frameCount}: Pose detected!`);
              } else {
                console.warn(`Frame ${frameCount}: No landmarks found`);
              }
              resolve();
            }
          }, 50);
        } catch (err) {
          console.error(`AI Error at ${currentTime}s:`, err);
          resolve();
        }
      };
    });
    
    currentTime += frameInterval;
    const progress = (currentTime / totalDuration) * 100;
    document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
  }
  
  // Generate comprehensive results
  if (postureResults.length > 0) {
    const results = generateAccurateVideoAnalysis(postureResults, totalDuration, selectedVideoType);
    displayAnalysisResults(results);
    
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('videoAnalysisResults').style.display = 'block';
  } else {
    alert('Could not detect any poses in the video. Please ensure the full body is visible and you are in a well-lit area.');
    document.getElementById('uploadProgress').style.display = 'none';
  }

  // Cleanup
  document.body.removeChild(video);
}

function analyzeFramePosture(landmarks, videoType) {
  const condition = document.getElementById('guidanceCondition').value;
  const vType = videoType || 'exercise';
  
  // Get key landmarks (ensure they exist)
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const nose = landmarks[0];
  
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return { posture: 'fair', issues: ['Partial body visible'] };
  
  // Calculate spine angle (Angle between shoulders-midpoint and hips-midpoint relative to vertical)
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipMidX = (leftHip.x + rightHip.x) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;
  
  const spineAngle = Math.abs(Math.atan2(hipMidX - shoulderMidX, hipMidY - shoulderMidY) * 180 / Math.PI);
  
  // Calculate shoulder alignment
  const shoulderAngle = Math.abs(Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x) * 180 / Math.PI);
  
  // Calculate head position relative to shoulders
  const headForward = Math.abs(nose.x - shoulderMidX);
  
  let posture = 'good';
  let issues = [];
  
  // Condition Specific Logic
  if (condition === 'knee_pain') {
    if (leftKnee && leftAnkle && leftHip) {
      const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      if (kneeAngle < 155) {
        posture = 'fair';
        issues.push('Knee not fully locked in extension');
      }
    }
  } else if (condition === 'back_pain') {
    if (spineAngle > 12) {
      posture = 'poor';
      issues.push('Excessive spinal curvature/lean');
    }
  }

  // Base Analysis by Video Type
  if (vType === 'sitting') {
    if (spineAngle > 15) {
      posture = 'poor';
      issues.push('Slumping or excessive lean');
    }
    if (headForward > 0.15) {
      if (posture === 'good') posture = 'fair';
      issues.push('Forward head posture detected');
    }
  } else if (vType === 'exercise') {
    if (shoulderAngle > 15) {
      posture = 'fair';
      issues.push('Imbalanced shoulder alignment');
    }
  } else if (vType === 'body') { // WALKING ANALYSIS
    // 1. Step Symmetry (Left vs Right Knee Extension)
    if (leftKnee && rightKnee && leftAnkle && rightAnkle) {
      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      const symmetryDiff = Math.abs(leftKneeAngle - rightKneeAngle);
      
      if (symmetryDiff > 25) {
        posture = 'fair';
        issues.push('Uneven gait detected (Asymmetric step)');
      }
    }
    
    // 2. Trunk Stability (Sway)
    if (spineAngle > 10) {
      posture = 'poor';
      issues.push('Excessive trunk sway during walking');
    }
    
    // 3. Shoulder Leveling (Limping detection)
    if (shoulderAngle > 8) {
      posture = 'fair';
      issues.push('Shoulder tilting (Potential limp or imbalance)');
    }
  }
  
  return { posture, issues, spineAngle, shoulderAngle, headForward };
}

// Helper to calculate angle between three points
function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

function generateAccurateVideoAnalysis(postureResults, totalDuration, videoType) {
  const totalFrames = postureResults.length;
  const goodFrames = postureResults.filter(r => r.posture === 'good').length;
  const fairFrames = postureResults.filter(r => r.posture === 'fair').length;
  const poorFrames = postureResults.filter(r => r.posture === 'poor').length;
  
  const overallScore = Math.round((goodFrames / totalFrames) * 100);
  
  // Collect all unique issues
  const allIssues = [];
  const issueTimestamps = {};
  
  postureResults.forEach(result => {
    result.issues.forEach(issue => {
      if (!issueTimestamps[issue]) {
        issueTimestamps[issue] = [];
      }
      issueTimestamps[issue].push(result.time);
    });
  });
  
  // Generate issue descriptions with timestamps
  Object.keys(issueTimestamps).forEach(issue => {
    const times = issueTimestamps[issue];
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minutes = Math.floor(avgTime / 60);
    const seconds = Math.floor(avgTime % 60);
    allIssues.push(`${issue} at ${minutes}:${seconds.toString().padStart(2, '0')}`);
  });
  
  // Generate specific recommendations based on analysis
  const recommendations = generateRecommendations(videoType, postureResults);
  
  const videoTypeLabels = {
    'exercise': 'Exercise Movement',
    'sitting': 'Sitting Posture',
    'body': 'Body Movement'
  };
  
  return {
    overallScore: overallScore,
    duration: `${Math.floor(totalDuration / 60)}:${Math.floor(totalDuration % 60).toString().padStart(2, '0')}`,
    framesAnalyzed: totalFrames,
    videoType: videoTypeLabels[videoType] || 'General',
    postureBreakdown: {
      good: Math.round((goodFrames / totalFrames) * 100),
      fair: Math.round((fairFrames / totalFrames) * 100),
      poor: Math.round((poorFrames / totalFrames) * 100)
    },
    issues: allIssues.length > 0 ? allIssues : ['No major issues detected - Good posture!'],
    recommendations: recommendations,
    accuracy: `${(overallScore >= 95 ? 99 : overallScore >= 85 ? 95 : overallScore >= 70 ? 90 : 85)}%`
  };
}

function generateRecommendations(videoType, postureResults) {
  const recommendations = [];
  
  if (videoType === 'sitting') {
    const poorFrames = postureResults.filter(r => r.posture === 'poor').length;
    const poorPercentage = (poorFrames / postureResults.length) * 100;
    
    if (poorPercentage > 30) {
      recommendations.push('Significant posture issues detected - Consider ergonomic adjustments');
    }
    
    const hasHeadForward = postureResults.some(r => r.headForward > 0.1);
    if (hasHeadForward) {
      recommendations.push('Keep your screen at eye level to avoid forward head posture');
    }
    
    recommendations.push('Take breaks every 30 minutes to stretch and reset posture');
    recommendations.push('Use lumbar support to maintain natural spine curve');
    recommendations.push('Keep feet flat on the floor and knees at 90 degrees');
  } else if (videoType === 'exercise') {
    const fairFrames = postureResults.filter(r => r.posture === 'fair').length;
    const fairPercentage = (fairFrames / postureResults.length) * 100;
    
    if (fairPercentage > 40) {
      recommendations.push('Focus on maintaining proper form throughout the exercise');
    }
    
    recommendations.push('Start with lighter movements to perfect your technique');
    recommendations.push('Engage your core for better stability');
    recommendations.push('Breathe steadily - exhale during exertion, inhale during relaxation');
  } else {
    recommendations.push('Maintain balanced posture during all movements');
    recommendations.push('Practice mindful walking with engaged core');
    recommendations.push('Keep shoulders relaxed and back straight');
  }
  
  return recommendations;
}

function generateVideoAnalysis() {
  // Simulated analysis results based on selected video type
  // In production, this would come from server-side AI processing
  
  if (selectedVideoType === 'exercise') {
    return {
      overallScore: Math.floor(Math.random() * 30) + 60,
      duration: '2:35',
      framesAnalyzed: 1550,
      videoType: 'Exercise Movement',
      postureBreakdown: {
        good: Math.floor(Math.random() * 30) + 50,
        fair: Math.floor(Math.random() * 20) + 10,
        poor: Math.floor(Math.random() * 15) + 5
      },
      issues: [
        'Form incorrect at 0:45 - shoulders too high',
        'Range of motion limited at 1:23',
        'Breathing pattern off at 1:56'
      ],
      recommendations: [
        'Maintain proper form throughout the exercise',
        'Increase range of motion gradually',
        'Focus on controlled breathing',
        'Keep core engaged for stability'
      ]
    };
  } else if (selectedVideoType === 'body') {
    // Body movement analysis
    return {
      overallScore: Math.floor(Math.random() * 30) + 60,
      duration: '3:45',
      framesAnalyzed: 2250,
      videoType: 'Body Movement',
      postureBreakdown: {
        good: Math.floor(Math.random() * 30) + 50,
        fair: Math.floor(Math.random() * 20) + 10,
        poor: Math.floor(Math.random() * 15) + 5
      },
      issues: [
        'Uneven gait pattern at 0:30',
        'Shoulder imbalance during movement at 1:15',
        'Poor posture transition at 2:10',
        'Limited arm swing at 2:50'
      ],
      recommendations: [
        'Maintain balanced weight distribution while walking',
        'Keep shoulders level during movement',
        'Practice smooth posture transitions',
        'Allow natural arm swing for better balance',
        'Engage core while moving'
      ]
    };
  } else {
    // Sitting posture analysis
    return {
      overallScore: Math.floor(Math.random() * 30) + 60,
      duration: '5:12',
      framesAnalyzed: 3120,
      videoType: 'Sitting Posture',
      postureBreakdown: {
        good: Math.floor(Math.random() * 30) + 50,
        fair: Math.floor(Math.random() * 20) + 10,
        poor: Math.floor(Math.random() * 15) + 5
      },
      issues: [
        'Head forward posture at 1:15',
        'Shoulders rounded at 2:30',
        'Back bent at 3:45',
        'Leaning to left at 4:20'
      ],
      recommendations: [
        'Keep head aligned with shoulders',
        'Pull shoulders back and down',
        'Maintain straight back against chair',
        'Sit centered with weight evenly distributed',
        'Take breaks every 30 minutes'
      ]
    };
  }
}

function displayAnalysisResults(results) {
  const content = document.getElementById('analysisContent');
  const condition = document.getElementById('guidanceCondition').value;
  const userName = localStorage.getItem('userName') || 'Valued User';
  const date = new Date().toLocaleDateString();
  
  const overallColor = results.overallScore >= 75 ? '#10b981' : 
                       results.overallScore >= 60 ? '#f59e0b' : '#ef4444';
  
  // Get guidance images for comparison
  let guideImgHtml = '';
  if (condition && healthGuidanceData[condition]) {
    guideImgHtml = `
      <div class="report-section no-print">
        <h4 class="report-section-title">🎯 Reference Standard</h4>
        <div class="comparison-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
          <div class="comp-item">
            <p style="font-size: 0.8rem; margin-bottom: 5px; color: #666;">Movement Ideal:</p>
            <img src="${healthGuidanceData[condition].move.img}" style="width: 100%; border-radius: 8px; border: 1px solid #ddd;" />
          </div>
          <div class="comp-item">
            <p style="font-size: 0.8rem; margin-bottom: 5px; color: #666;">Sitting Ideal:</p>
            <img src="${healthGuidanceData[condition].sit.img}" style="width: 100%; border-radius: 8px; border: 1px solid #ddd;" />
          </div>
        </div>
      </div>
    `;
  }

  content.innerHTML = `
    <div class="health-report-container" id="printableReport">
      <!-- Report Header -->
      <div class="report-header">
        <div class="report-title-block">
          <h2>AI Health Monitoring Report</h2>
          <p>Generated by Smart Monitoring System</p>
        </div>
        <div class="report-meta">
          <p><strong>User:</strong> ${userName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Condition:</strong> ${condition ? condition.replace('_', ' ').toUpperCase() : 'General Posture'}</p>
        </div>
      </div>

      <div class="report-grid">
        <!-- Accuracy Rate Block -->
        <div class="report-card accuracy-card">
          <h4 class="report-section-title">🎯 Overall Accuracy Rate</h4>
          <div class="accuracy-viz">
            <div class="accuracy-circle" style="border-color: ${overallColor};">
              <span style="color: ${overallColor};">${results.overallScore}%</span>
            </div>
            <div class="accuracy-text">
              <h3 style="color: ${overallColor};">${results.overallScore >= 85 ? 'OPTIMAL' : results.overallScore >= 65 ? 'ACCEPTABLE' : 'CRITICAL'}</h3>
              <p>${results.overallScore >= 85 ? 'Your movement patterns align perfectly with clinical standards.' : 
                   results.overallScore >= 65 ? 'Good effort. Some deviations detected from the recommended form.' : 
                   'Significant deviations detected. Please review the guidance below.'}</p>
            </div>
          </div>
        </div>

        <!-- Breakdown Block -->
        <div class="report-card">
          <h4 class="report-section-title">📊 Movement Quality Breakdown</h4>
          <div class="breakdown-list">
            <div class="breakdown-item">
              <span>Excellent Form</span>
              <div class="bar-bg"><div class="bar-fill" style="width: ${results.postureBreakdown.good}%; background: #10b981;"></div></div>
              <span>${results.postureBreakdown.good}%</span>
            </div>
            <div class="breakdown-item">
              <span>Minor Deviations</span>
              <div class="bar-bg"><div class="bar-fill" style="width: ${results.postureBreakdown.fair}%; background: #f59e0b;"></div></div>
              <span>${results.postureBreakdown.fair}%</span>
            </div>
            <div class="breakdown-item">
              <span>Correction Needed</span>
              <div class="bar-bg"><div class="bar-fill" style="width: ${results.postureBreakdown.poor}%; background: #ef4444;"></div></div>
              <span>${results.postureBreakdown.poor}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparison Section -->
      ${guideImgHtml}

      <!-- Findings Section -->
      <div class="report-section">
        <h4 class="report-section-title">⚠️ Clinical Findings (Problems Detected)</h4>
        <div class="findings-box">
          ${results.issues.length > 0 ? `
            <ul class="findings-list">
              ${results.issues.map(issue => `<li><strong>Issue:</strong> ${issue}</li>`).join('')}
            </ul>
          ` : '<p class="no-issues">✅ No significant postural issues detected during this session.</p>'}
        </div>
      </div>

      <!-- Action Plan Section -->
      <div class="report-section">
        <h4 class="report-section-title">💡 Recovery Action Plan</h4>
        <div class="action-grid">
          ${results.recommendations.map(rec => `
            <div class="action-item">
              <span class="action-icon">🧘</span>
              <p>${rec}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="report-footer">
        <p>This report is AI-generated for educational purposes. Consult a medical professional for clinical diagnosis.</p>
        <div class="report-actions no-print">
          <button onclick="window.print()" class="btn print-btn">📥 Download Detailed PDF Report</button>
        </div>
      </div>
    </div>
  `;
}

// Close modals when clicking outside
window.onclick = function(event) {
  const sittingModal = document.getElementById('sittingPostureModal');
  const videoModal = document.getElementById('videoUploadModal');
  
  if (event.target === sittingModal) {
    closeSittingPosture();
  }
  
  if (event.target === videoModal) {
    closeVideoUpload();
  }
}
