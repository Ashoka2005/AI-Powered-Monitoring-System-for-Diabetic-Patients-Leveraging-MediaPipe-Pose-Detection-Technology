const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'], trim: true, maxlength: 50 },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },

    // Profile fields
    profile: {
      dateOfBirth: { type: Date },
      gender: { type: String, enum: ['male', 'female', 'other', ''] },
      height: { type: Number }, // cm
      weight: { type: Number }, // kg
      bloodGroup: { type: String },
      address: { street: String, city: String, state: String, zip: String, country: String },
      emergencyContact: { name: String, phone: String, relationship: String, email: String },
      guardian: { name: { type: String, default: '' }, phone: { type: String, default: '' } },
      profession: { type: String, default: '' },
    },

    // Patient-specific
    patientInfo: {
      diabetesType: { type: String, enum: ['type1', 'type2', 'gestational', 'prediabetes', ''] },
      diagnosisDate: { type: Date },
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      medications: [{ name: String, dosage: String, frequency: String }],
      allergies: [String],
      conditions: [String],
      isPregnant: { type: Boolean, default: false },
      pregnancyWeeks: { type: Number, default: 0 },
    },

    // Doctor-specific
    doctorInfo: {
      specialization: { type: String },
      licenseNumber: { type: String },
      experience: { type: Number },
      consultationFee: { type: Number },
      availableSlots: [{ day: String, startTime: String, endTime: String }],
      rating: { type: Number, default: 0 },
    },

    // Refresh token
    refreshToken: { type: String },

    // Push notification token
    pushToken: { type: String },

    // IoT devices
    iotDevices: [
      {
        deviceId: String,
        deviceType: { type: String, enum: ['glucose_monitor', 'smartwatch', 'blood_pressure', 'other'] },
        deviceName: String,
        isActive: { type: Boolean, default: true },
        lastSync: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for BMI
userSchema.virtual('bmi').get(function () {
  if (!this.profile?.height || !this.profile?.weight) return null;
  const heightM = this.profile.height / 100;
  return parseFloat((this.profile.weight / (heightM * heightM)).toFixed(1));
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
