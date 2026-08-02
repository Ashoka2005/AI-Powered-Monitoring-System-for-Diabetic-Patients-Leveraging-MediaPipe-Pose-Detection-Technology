/**
 * Calculate the angle between three 3D points (in degrees)
 * Used for joint angle calculation from MediaPipe landmarks
 */
function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle * 10) / 10;
}

/**
 * Calculate distance between two points
 */
function calculateDistance(a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow((b.z || 0) - (a.z || 0), 2));
}

/**
 * Calculate Glycemic Impact Score (0-100)
 * Based on blood sugar variability, time in range, and trends
 */
function calculateGlycemicImpactScore(records) {
  if (!records || records.length === 0) {
    return { score: 0, grade: 'N/A', factors: {} };
  }

  const values = records.map((r) => r.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // Time in range (70-180 mg/dL)
  const inRange = values.filter((v) => v >= 70 && v <= 180).length;
  const timeInRange = (inRange / values.length) * 100;

  // Coefficient of variation (variability)
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length);
  const cv = (stdDev / avg) * 100;

  // Scoring components
  const tirScore = Math.min(timeInRange, 100) * 0.4; // 40% weight
  const avgScore = avg >= 70 && avg <= 140 ? 30 : avg > 140 && avg <= 180 ? 20 : 10; // 30% weight
  const cvScore = cv < 36 ? 30 : cv < 50 ? 20 : 10; // 30% weight

  const totalScore = Math.round(tirScore + avgScore + cvScore);

  let grade = 'A+';
  if (totalScore < 90) grade = 'A';
  if (totalScore < 80) grade = 'B';
  if (totalScore < 70) grade = 'C';
  if (totalScore < 60) grade = 'D';
  if (totalScore < 50) grade = 'F';

  return {
    score: totalScore,
    grade,
    factors: {
      timeInRange: Math.round(timeInRange),
      averageGlucose: Math.round(avg),
      coefficientOfVariation: Math.round(cv * 10) / 10,
      estimatedA1c: Math.round(((avg + 46.7) / 28.7) * 10) / 10,
      totalReadings: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    },
  };
}

/**
 * Calculate Glycemic Impact for a single exercise session
 */
function calculateGlycemicImpact(preSugar, postSugar, durationSeconds) {
  const diff = preSugar - postSugar;
  const rate = diff / (durationSeconds / 60); // change per minute
  const impactScore = Math.min(Math.max(Math.round((diff / preSugar) * 100), 0), 100);
  return impactScore;
}

module.exports = { calculateAngle, calculateDistance, calculateGlycemicImpactScore, calculateGlycemicImpact };
