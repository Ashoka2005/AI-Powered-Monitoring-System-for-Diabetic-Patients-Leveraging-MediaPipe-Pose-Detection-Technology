/**
 * Calculate angle between three points (in degrees)
 * @param {Object} a - First point {x, y}
 * @param {Object} b - Middle point (vertex) {x, y}
 * @param {Object} c - Third point {x, y}
 */
export function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle * 10) / 10;
}

/**
 * Exercise detection state machine
 */
export class ExerciseCounter {
  constructor(exerciseType) {
    this.type = exerciseType;
    this.reps = 0;
    this.phase = 'rest'; // rest, up, down
    this.isCounting = false;
    this.feedback = [];
    
    // Advanced posture and range metrics
    this.postureScores = [];
    this.repScores = [];
    this.currentRepMinAngle = 180;
    this.currentRepMaxAngle = 0;
    
    // Maintain properties accessed outside this class
    this.totalAngleError = 0;
    this.frameCount = 0;
  }

  processFrame(landmarks, exerciseConfig) {
    this.frameCount++;
    const angles = this.getExerciseAngles(landmarks);
    if (!angles) return null;

    const { primaryAngle, feedback } = angles;
    const { minAngle = 30, maxAngle = 160 } = exerciseConfig;

    // Track min/max angles reached in the current rep cycle
    if (primaryAngle < this.currentRepMinAngle) this.currentRepMinAngle = primaryAngle;
    if (primaryAngle > this.currentRepMaxAngle) this.currentRepMaxAngle = primaryAngle;

    // Calculate frame posture stability
    const lm = landmarks;
    const shoulderDiff = Math.abs(lm[11].y - lm[12].y);
    const hipDiff = Math.abs(lm[23].y - lm[24].y);
    
    // Spine alignment deviation from straight upright
    const leftHipKneeAnkle = calculateAngle(lm[11], lm[23], lm[25]);
    const rightHipKneeAnkle = calculateAngle(lm[12], lm[24], lm[26]);
    const avgSpineAngle = (leftHipKneeAnkle + rightHipKneeAnkle) / 2;
    const spineDeviation = Math.max(0, 170 - avgSpineAngle);

    // Frame posture score (from 0 to 100)
    let framePostureScore = 100 - (shoulderDiff * 150) - (hipDiff * 150) - (spineDeviation * 0.4);
    framePostureScore = Math.max(0, Math.min(100, framePostureScore));
    this.postureScores.push(framePostureScore);

    // State machine for rep counting
    if (this.phase === 'rest') {
      if (primaryAngle > maxAngle * 0.85) {
        this.phase = 'up';
      }
    } else if (this.phase === 'up') {
      if (primaryAngle < minAngle * 1.3) {
        this.phase = 'down';
        
        // Evaluate range of the completed rep
        const minAngleError = Math.max(0, this.currentRepMinAngle - minAngle);
        const maxAngleError = Math.max(0, maxAngle - this.currentRepMaxAngle);
        const repScore = Math.max(0, 100 - (minAngleError * 1.5) - (maxAngleError * 1.5));
        this.repScores.push(repScore);

        this.reps++;
        this.isCounting = true;

        // Reset rep-level tracking
        this.currentRepMinAngle = 180;
        this.currentRepMaxAngle = 0;
      }
    } else if (this.phase === 'down') {
      if (primaryAngle > maxAngle * 0.85) {
        this.phase = 'up';
      }
    }

    // Compute overall accuracy
    const avgPosture = this.postureScores.reduce((a, b) => a + b, 0) / this.postureScores.length;
    const avgRepRange = this.repScores.length > 0 
      ? this.repScores.reduce((a, b) => a + b, 0) / this.repScores.length 
      : 100;

    // Blend: 40% posture, 60% rep execution range
    const accuracy = (this.repScores.length > 0)
      ? (avgPosture * 0.4 + avgRepRange * 0.6)
      : avgPosture;

    // Maintain legacy property value so summary displays correctly
    this.totalAngleError = (100 - accuracy) * this.frameCount / 2;

    return {
      reps: this.reps,
      phase: this.phase,
      primaryAngle,
      accuracy: Math.round(accuracy),
      feedback: feedback || [],
    };
  }

  getExerciseAngles(landmarks) {
    if (!landmarks || landmarks.length < 33) return null;

    const lm = landmarks;
    switch (this.type) {
      case 'bicep-curl':
      case 'bicep_curl': {
        const leftAngle = calculateAngle(lm[11], lm[13], lm[15]); // left shoulder-elbow-wrist
        const rightAngle = calculateAngle(lm[12], lm[14], lm[16]); // right shoulder-elbow-wrist
        const avgAngle = (leftAngle + rightAngle) / 2;
        const feedback = [];
        if (leftAngle < 25 || rightAngle < 25) feedback.push('Extend your arms more');
        return { primaryAngle: avgAngle, feedback };
      }
      case 'shoulder-press':
      case 'shoulder_press': {
        const leftAngle = calculateAngle(lm[11], lm[13], lm[15]); // left shoulder-elbow-wrist
        const rightAngle = calculateAngle(lm[12], lm[14], lm[16]); // right shoulder-elbow-wrist
        const avgAngle = (leftAngle + rightAngle) / 2;
        const feedback = [];
        if (avgAngle < 60) feedback.push('Bring weights down to shoulders');
        return { primaryAngle: avgAngle, feedback };
      }
      case 'squat': {
        const leftKnee = calculateAngle(lm[23], lm[25], lm[27]); // left hip-knee-ankle
        const rightKnee = calculateAngle(lm[24], lm[26], lm[28]); // right hip-knee-ankle
        const avgKnee = (leftKnee + rightKnee) / 2;
        const feedback = [];
        if (avgKnee < 70) feedback.push("Don't squat too deep");
        if (Math.abs(leftKnee - rightKnee) > 20) feedback.push('Keep knees level');
        return { primaryAngle: avgKnee, feedback };
      }
      case 'lateral-raise':
      case 'lateral_raise': {
        const leftShoulder = calculateAngle(lm[23], lm[11], lm[13]); // left hip-shoulder-elbow
        const rightShoulder = calculateAngle(lm[24], lm[12], lm[14]); // right hip-shoulder-elbow
        const avgShoulder = (leftShoulder + rightShoulder) / 2;
        const feedback = [];
        if (avgShoulder > 105) feedback.push('Keep arms parallel to floor');
        return { primaryAngle: avgShoulder, feedback };
      }
      case 'leg-raise':
      case 'leg_raise': {
        const leftHip = calculateAngle(lm[11], lm[23], lm[25]); // left shoulder-hip-knee
        const rightHip = calculateAngle(lm[12], lm[24], lm[26]); // right shoulder-hip-knee
        return { primaryAngle: (leftHip + rightHip) / 2, feedback: [] };
      }
      case 'wall-pushup':
      case 'wall_pushup': {
        const leftAngle = calculateAngle(lm[11], lm[13], lm[15]); // left shoulder-elbow-wrist
        const rightAngle = calculateAngle(lm[12], lm[14], lm[16]); // right shoulder-elbow-wrist
        return { primaryAngle: (leftAngle + rightAngle) / 2, feedback: [] };
      }
      case 'seated-march':
      case 'seated_march': {
        // Seated march: track hip angle left & right
        const leftHip = calculateAngle(lm[11], lm[23], lm[25]);
        const rightHip = calculateAngle(lm[12], lm[24], lm[26]);
        // Lifted knee decreases hip angle from 90 (seated) to ~55-60.
        const primaryAngle = Math.min(leftHip, rightHip);
        const feedback = [];
        if (primaryAngle < 45) feedback.push('Do not lift knees past hip height');
        return { primaryAngle, feedback };
      }
      case 'seated-twist':
      case 'seated_twist': {
        // Seated twist: shoulders twist relative to hip base
        const leftAngle = calculateAngle(lm[12], lm[11], lm[23]); // right_shoulder - left_shoulder - left_hip
        const rightAngle = calculateAngle(lm[11], lm[12], lm[24]); // left_shoulder - right_shoulder - right_hip
        const primaryAngle = (leftAngle + rightAngle) / 2;
        const feedback = [];
        return { primaryAngle, feedback };
      }
      case 'walking-place':
      case 'walking_place': {
        // Walking in place: marching knee lift
        const leftHip = calculateAngle(lm[11], lm[23], lm[25]);
        const rightHip = calculateAngle(lm[12], lm[24], lm[26]);
        // Standing is 170. Knee lift decreases hip angle to ~100-110.
        const primaryAngle = Math.min(leftHip, rightHip);
        const feedback = [];
        return { primaryAngle, feedback };
      }
      case 'arm-circle':
      case 'arm_circle': {
        const leftShoulder = calculateAngle(lm[23], lm[11], lm[13]);
        const rightShoulder = calculateAngle(lm[24], lm[12], lm[14]);
        return { primaryAngle: (leftShoulder + rightShoulder) / 2, feedback: [] };
      }
      case 'standing-knee-bend':
      case 'standing_knee_bend': {
        const leftKnee = calculateAngle(lm[23], lm[25], lm[27]);
        const rightKnee = calculateAngle(lm[24], lm[26], lm[28]);
        return { primaryAngle: Math.min(leftKnee, rightKnee), feedback: [] };
      }
      case 'ankle-pump':
      case 'ankle_pump': {
        const leftAnkle = calculateAngle(lm[25], lm[27], lm[31]);
        const rightAnkle = calculateAngle(lm[26], lm[28], lm[32]);
        return { primaryAngle: (leftAnkle + rightAnkle) / 2, feedback: [] };
      }
      default: {
        // Generic: use elbow angle
        const leftAngle = calculateAngle(lm[11], lm[13], lm[15]);
        const rightAngle = calculateAngle(lm[12], lm[14], lm[16]);
        return { primaryAngle: (leftAngle + rightAngle) / 2, feedback: [] };
      }
    }
  }

  reset() {
    this.reps = 0;
    this.phase = 'rest';
    this.isCounting = false;
    this.feedback = [];
    this.postureScores = [];
    this.repScores = [];
    this.currentRepMinAngle = 180;
    this.currentRepMaxAngle = 0;
    this.totalAngleError = 0;
    this.frameCount = 0;
  }
}

/**
 * Fall detection using pose landmarks
 */
export function detectFall(landmarks) {
  if (!landmarks || landmarks.length < 33) return false;

  const lm = landmarks;
  // Check if hips are low (close to ground) and body is horizontal
  const hipY = (lm[23].y + lm[24].y) / 2;
  const shoulderY = (lm[11].y + lm[12].y) / 2;
  const bodyAngle = Math.abs(Math.atan2(lm[23].y - lm[11].y, lm[23].x - lm[11].x) * (180 / Math.PI));

  // Fall if body is mostly horizontal (angle < 30 degrees) and hips are low
  return hipY > 0.7 && bodyAngle < 35;
}

/**
 * Get posture feedback from landmarks
 */
export function getPostureFeedback(landmarks) {
  if (!landmarks || landmarks.length < 33) return [];
  const lm = landmarks;
  const feedback = [];

  // Check shoulder alignment
  const shoulderDiff = Math.abs(lm[11].y - lm[12].y);
  if (shoulderDiff > 0.05) feedback.push('Keep your shoulders level');

  // Check hip alignment
  const hipDiff = Math.abs(lm[23].y - lm[24].y);
  if (hipDiff > 0.05) feedback.push('Keep your hips level');

  // Check spine angle
  const spineAngle = calculateAngle(lm[11], lm[23], lm[25]);
  if (spineAngle < 160) feedback.push('Keep your back straight');

  return feedback;
}
