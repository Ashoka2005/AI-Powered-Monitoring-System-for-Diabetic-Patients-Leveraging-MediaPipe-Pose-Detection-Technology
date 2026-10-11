import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye,
  FiEyeOff,
  FiMail,
  FiShield,
  FiArrowLeft,
  FiLock,
  FiCheckCircle,
  FiPhone,
  FiUser,
  FiActivity,
  FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, requestLoginOtp, verifyLoginOtp, register } = useAuth();

  // Active top-level tab: 'signin' | 'register'
  const isRegisterRoute = location.pathname === '/register';
  const [activeTab, setActiveTab] = useState(isRegisterRoute ? 'register' : 'signin');

  // Sign In States
  const [signInMode, setSignInMode] = useState('password'); // 'password' | 'otp'
  const [signInIdentifier, setSignInIdentifier] = useState(''); // email or phone
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [otpStep, setOtpStep] = useState('request'); // 'request' | 'verify'
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Register Form States
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    diabetesType: 'type2',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    emergencyContactRelationship: 'Guardian/Family'
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // OTP Countdown Timer
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Handle Sign In with Password (supports email or phone number)
  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    const cleanId = signInIdentifier.trim();
    if (!cleanId) {
      toast.error('Please enter your email or phone number');
      return;
    }
    if (!signInPassword) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const data = await login(cleanId, signInPassword);
      toast.success(`Welcome back, ${data.user?.firstName || 'User'}!`);
      navigate(data.user?.role === 'admin' ? '/admin' : data.user?.role === 'doctor' ? '/doctor' : '/dashboard');
    } catch {
      // Toast error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP for Sign In
  const handleSendSignInOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = signInIdentifier.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid personal email address for OTP access');
      return;
    }

    setLoading(true);
    try {
      await requestLoginOtp(cleanEmail, '');
      setOtpStep('verify');
      setOtpCode('');
      setOtpCountdown(60);
      toast.success(`Verification code sent to ${cleanEmail}! Please check your email inbox.`, { duration: 6000 });
    } catch {
      // Toast handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP for Sign In
  const handleVerifySignInOtp = async (e) => {
    e.preventDefault();
    const cleanCode = (otpCode || '').trim();
    if (cleanCode.length !== 6) {
      toast.error('Please enter the 6-digit code sent to your email');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyLoginOtp(signInIdentifier.trim().toLowerCase(), cleanCode);
      const isProfileComplete = Boolean(
        data.user?.patientInfo?.diabetesType &&
        data.user?.profile?.emergencyContact?.email
      );

      if (data.isNewUser || !isProfileComplete) {
        toast.success('Please complete your health profile & emergency contact details.', { duration: 5000 });
        navigate('/profile');
      } else {
        toast.success(`Welcome back, ${data.user?.firstName || 'User'}!`);
        navigate(data.user?.role === 'admin' ? '/admin' : data.user?.role === 'doctor' ? '/doctor' : '/dashboard');
      }
    } catch {
      // Toast handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration Form Change
  const handleRegChange = (e) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
  };

  // Handle User Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!regForm.firstName.trim() || !regForm.lastName.trim()) {
      toast.error('Please enter both your first and last name');
      return;
    }
    if (!regForm.email.trim() || !regForm.email.includes('@')) {
      toast.error('Please provide a valid personal email address');
      return;
    }
    if (!regForm.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (regForm.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!regForm.emergencyContactEmail.trim() || !regForm.emergencyContactEmail.includes('@')) {
      toast.error('Please enter a valid Emergency Contact Email for camera safety monitoring');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: regForm.firstName.trim(),
        lastName: regForm.lastName.trim(),
        email: regForm.email.trim().toLowerCase(),
        phone: regForm.phone.trim(),
        password: regForm.password,
        role: 'patient',
        diabetesType: regForm.diabetesType,
        emergencyContactName: regForm.emergencyContactName.trim() || `${regForm.firstName}'s Contact`,
        emergencyContactPhone: regForm.emergencyContactPhone.trim() || regForm.phone.trim(),
        emergencyContactEmail: regForm.emergencyContactEmail.trim().toLowerCase(),
        emergencyContactRelationship: regForm.emergencyContactRelationship.trim() || 'Family'
      };

      await register(payload);
      toast.success('Account created successfully! Welcome to DiaFit AI.', { duration: 5000 });
      navigate('/dashboard');
    } catch (err) {
      // Toast handled by register function in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Medical Branding Panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-indigo-900 via-primary-800 to-slate-900 text-white p-12 relative overflow-hidden flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.25),transparent_70%)]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center font-black text-2xl backdrop-blur-md shadow-inner text-white">
              D
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight block">DiaFit AI</span>
              <span className="text-xs text-indigo-300 font-semibold tracking-wider uppercase">Clinical Diabetes & Posture Platform</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto py-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
            <FiActivity className="w-3.5 h-3.5 text-emerald-400" /> Advanced Patient Protection
          </span>
          <h2 className="text-4xl font-extrabold leading-tight text-white tracking-tight">
            Intelligent Rehabilitation & Real-Time Safety AI
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Google MediaPipe joint angle tracking, automated camera absence detection with Emergency Verification OTP dispatch, and clinical multi-page PDF progress reports.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <FiCheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Personal Data & Phone Security</p>
                <p className="text-[11px] text-indigo-200/80">Sign in with phone or email, protected by medical-grade authentication.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <FiShield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Automated Emergency Alert Dispatches</p>
                <p className="text-[11px] text-indigo-200/80">Immediate security OTP & live GPS map links emailed if user steps away from camera.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-indigo-300/80">
          &copy; {new Date().getFullYear()} DiaFit AI Healthcare Technologies. All rights reserved.
        </div>
      </div>

      {/* Right Interactive Form Container */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 my-auto"
        >
          {/* Header Switcher Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => { setActiveTab('signin'); setOtpStep('request'); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiLock className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiUser className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ============================================================== */}
            {/* TAB 1: SIGN IN (PASSWORD OR EMAIL OTP)                        */}
            {/* ============================================================== */}
            {activeTab === 'signin' && (
              <motion.div
                key="signin-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                {otpStep === 'request' ? (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Your Patient Portal</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Sign in using your phone number, personal email, or one-time verification code.
                      </p>
                    </div>

                    {/* Mode Pill Toggle */}
                    <div className="flex gap-2 mb-6">
                      <button
                        type="button"
                        onClick={() => setSignInMode('password')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                          signInMode === 'password'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Password Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignInMode('otp')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                          signInMode === 'otp'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        Email OTP Code
                      </button>
                    </div>

                    {signInMode === 'password' ? (
                      /* Password Login Form */
                      <form onSubmit={handlePasswordSignIn} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Email Address or Phone Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={signInIdentifier}
                              onChange={(e) => setSignInIdentifier(e.target.value)}
                              placeholder="e.g. you@example.com or +91 9876543210"
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                              required
                            />
                            <FiUser className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
                          </div>
                          <div className="relative">
                            <input
                              type={showSignInPassword ? 'text' : 'password'}
                              value={signInPassword}
                              onChange={(e) => setSignInPassword(e.target.value)}
                              placeholder="Enter your account password"
                              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                              required
                            />
                            <FiLock className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                            <button
                              type="button"
                              onClick={() => setShowSignInPassword(!showSignInPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                              {showSignInPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Signing In...</span>
                            </>
                          ) : (
                            <span>Sign In to Dashboard</span>
                          )}
                        </button>
                      </form>
                    ) : (
                      /* Email OTP Form */
                      <form onSubmit={handleSendSignInOtp} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Personal Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={signInIdentifier}
                              onChange={(e) => setSignInIdentifier(e.target.value)}
                              placeholder="e.g. yourname@gmail.com"
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                              required
                            />
                            <FiMail className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">We will dispatch a 6-digit one-time code to this email.</p>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || !signInIdentifier.trim()}
                          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Sending Code...</span>
                            </>
                          ) : (
                            <>
                              <FiShield className="w-4 h-4" />
                              <span>Send Verification OTP</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  /* OTP Verify Screen */
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => { setOtpStep('request'); setOtpCode(''); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
                      >
                        <FiArrowLeft className="h-5 w-5" />
                      </button>
                      <h2 className="text-2xl font-black text-slate-900">Enter Verification Code</h2>
                    </div>

                    <p className="text-slate-500 text-xs mb-6">
                      Enter the 6-digit OTP code sent to: <strong className="text-indigo-700">{signInIdentifier}</strong>. Please check your email inbox or spam folder.
                    </p>

                    <form onSubmit={handleVerifySignInOtp} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full py-3.5 bg-slate-50 border-2 border-indigo-200 rounded-2xl text-center font-mono text-3xl tracking-[0.4em] font-extrabold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                          placeholder="000000"
                          autoFocus
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otpCode.length !== 6}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP & Continue'}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={handleSendSignInOtp}
                          disabled={otpCountdown > 0 || loading}
                          className="text-xs font-bold text-indigo-600 hover:underline disabled:text-slate-400 cursor-pointer"
                        >
                          {otpCountdown > 0 ? `Resend Code in ${otpCountdown}s` : "Didn't get code? Resend OTP"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: REGISTER / CREATE ACCOUNT (FULL USER DATA & PHONE)     */}
            {/* ============================================================== */}
            {activeTab === 'register' && (
              <motion.div
                key="register-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Patient Account</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill in your user data, phone number, and emergency contact for full monitoring protection.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={regForm.firstName}
                        onChange={handleRegChange}
                        placeholder="e.g. Rahul"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={regForm.lastName}
                        onChange={handleRegChange}
                        placeholder="e.g. Sharma"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Personal Email *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={regForm.email}
                          onChange={handleRegChange}
                          placeholder="patient@example.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                        <FiMail className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={regForm.phone}
                          onChange={handleRegChange}
                          placeholder="+91 9876543210"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                        <FiPhone className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Diabetic Health Profile Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Diabetic Health Profile
                    </label>
                    <select
                      name="diabetesType"
                      value={regForm.diabetesType}
                      onChange={handleRegChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="type2">Type 2 Diabetes (Adult-Onset / Insulin Resistant)</option>
                      <option value="type1">Type 1 Diabetes (Insulin Dependent)</option>
                      <option value="prediabetes">Pre-diabetic / Elevated Glycemic Risk</option>
                      <option value="gestational">Gestational Diabetes (Pregnancy)</option>
                    </select>
                  </div>

                  {/* Emergency Contact Card (Highlighted for Camera Safety) */}
                  <div className="p-3.5 bg-red-50/60 border border-red-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                        <FiAlertCircle className="text-red-600" /> Emergency Alert Recipient
                      </span>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        Required for Camera Safety
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-red-800 mb-1">
                          Emergency Contact Name *
                        </label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={regForm.emergencyContactName}
                          onChange={handleRegChange}
                          placeholder="e.g. Parent, Doctor, Spouse"
                          className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-red-800 mb-1">
                          Emergency Contact Email *
                        </label>
                        <input
                          type="email"
                          name="emergencyContactEmail"
                          value={regForm.emergencyContactEmail}
                          onChange={handleRegChange}
                          placeholder="emergency@example.com"
                          className="w-full px-3 py-2 bg-white border border-red-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          name="password"
                          value={regForm.password}
                          onChange={handleRegChange}
                          placeholder="Min 8 characters"
                          minLength={8}
                          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                        <FiLock className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showRegPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={regForm.confirmPassword}
                          onChange={handleRegChange}
                          placeholder="Confirm password"
                          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                        <FiLock className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showRegConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Your Account...</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Register & Create Account</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
