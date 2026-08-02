const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

const EXERCISE_TYPES = [
  'shoulder_press',
  'bicep_curl',
  'squat',
  'lateral_raise',
  'leg_raise',
  'wall_pushup',
  'seated_march',
  'arm_circle',
  'standing_knee_bend',
  'ankle_pump',
];

const HEALTH_METRICS = {
  BLOOD_SUGAR_FASTING: 'fasting',
  BLOOD_SUGAR_POSTPRANDIAL: 'postprandial',
  BLOOD_SUGAR_RANDOM: 'random',
  HBA1C: 'hba1c',
  HEART_RATE: 'heart_rate',
  BLOOD_PRESSURE: 'blood_pressure',
  WEIGHT: 'weight',
  SPO2: 'spo2',
};

const ALERT_TYPES = {
  FALL_DETECTED: 'fall_detected',
  HIGH_BLOOD_SUGAR: 'high_blood_sugar',
  LOW_BLOOD_SUGAR: 'low_blood_sugar',
  MISSED_MEDICATION: 'missed_medication',
  EMERGENCY: 'emergency',
};

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

module.exports = {
  ROLES,
  EXERCISE_TYPES,
  HEALTH_METRICS,
  ALERT_TYPES,
  APPOINTMENT_STATUS,
};
