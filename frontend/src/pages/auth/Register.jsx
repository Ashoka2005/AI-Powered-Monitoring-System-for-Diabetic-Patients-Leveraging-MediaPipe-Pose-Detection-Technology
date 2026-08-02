import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Email & Role, 2: OTP, 3: Profile Details
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    role: 'patient', 
    phone: '', 
    profession: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    emergencyContactRelationship: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Timer for OTP resend countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.email) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email: form.email });
      toast.success('Verification code sent! Please check your email.');
      setCountdown(60); // 60s cooldown
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: form.email, code: otpCode });
      toast.success('Email verified successfully!');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
   };

  const handleCompleteRegister = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (form.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, otp: otpCode });
      navigate('/dashboard');
    } catch (error) {
      // toast error handled by auth context register function
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-primary-600 items-center justify-center text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black text-2xl backdrop-blur-md shadow-inner">D</div>
            <span className="text-2xl font-black tracking-wide">DiaFit AI</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">Your Intelligent Diabetic Healthcare Assistant</h2>
          <p className="text-indigo-100 text-lg leading-relaxed font-medium">
            Register to experience AI-powered glycemic impact forecasts, real-time posture correcting exercise coaching, and curated prenatal plans.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Stepper Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              <span>Step {step} of 3</span>
              <span>
                {step === 1 && 'Email Verification'}
                {step === 2 && 'Enter Security Code'}
                {step === 3 && 'Profile Setup'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-black text-gray-900 mb-2">Start Registration</h1>
                <p className="text-sm text-gray-500 mb-6">Enter your email address to receive a secure verification code.</p>
                
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="name@example.com"
                      value={form.email} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Account Role</label>
                    <select 
                      name="role" 
                      value={form.role} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="patient">Patient / User</option>
                      <option value="doctor">Medical Healthcare Professional</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Sending code...' : 'Send Verification Code'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-black text-gray-900 mb-2">Check Your Email</h1>
                <p className="text-sm text-gray-500 mb-6">
                  We sent a 6-digit verification code to <span className="font-bold text-gray-800">{form.email}</span>.
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Verification Code</label>
                    <input 
                      type="text" 
                      maxLength="6"
                      placeholder="123456"
                      value={otpCode} 
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-center font-mono text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Code & Continue'}
                  </button>

                  <div className="flex flex-col gap-2 items-center text-xs mt-4">
                    <button
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={handleSendOtp}
                      className="text-primary-600 font-bold hover:underline disabled:text-gray-400"
                    >
                      {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-500 font-medium hover:underline"
                    >
                      Change Email Address
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-black text-gray-900 mb-2">Set Up Profile</h1>
                <p className="text-sm text-gray-500 mb-6">Complete your account details to finish setting up your account.</p>

                <form onSubmit={handleCompleteRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">First Name</label>
                      <input 
                        name="firstName" 
                        value={form.firstName} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Last Name</label>
                      <input 
                        name="lastName" 
                        value={form.lastName} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone Number (Optional)</label>
                    <input 
                      name="phone" 
                      placeholder="e.g. +1234567890"
                      value={form.phone} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Profession</label>
                    <input 
                      name="profession" 
                      placeholder="e.g. Software Engineer, Teacher"
                      value={form.profession} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="Minimum 8 characters"
                        value={form.password} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        minLength={8} 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Re-enter your password"
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        required 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {form.role === 'patient' && (
                    <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Emergency Contact (For Safety Alerts)</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Name</label>
                          <input 
                            name="emergencyContactName" 
                            placeholder="e.g. Jane Doe"
                            value={form.emergencyContactName} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Relationship</label>
                          <input 
                            name="emergencyContactRelationship" 
                            placeholder="e.g. Spouse, Parent"
                            value={form.emergencyContactRelationship} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Email</label>
                          <input 
                            type="email"
                            name="emergencyContactEmail" 
                            placeholder="guardian@example.com"
                            value={form.emergencyContactEmail} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Phone</label>
                          <input 
                            name="emergencyContactPhone" 
                            placeholder="e.g. +1234567890"
                            value={form.emergencyContactPhone} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
