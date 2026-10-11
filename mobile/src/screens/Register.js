import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function Register({ navigation }) {
  const { register, sendRegisterOtp } = useAuth();
  const [step, setStep] = useState('info'); // 'info' | 'otp'
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'patient' });
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [fallbackNotice, setFallbackNotice] = useState(null);

  // Countdown timer for resend OTP cooldown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleRequestOtp = async () => {
    const cleanEmail = (form.email || '').trim().toLowerCase();
    if (!form.firstName || !form.lastName || !cleanEmail || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await sendRegisterOtp(cleanEmail);
      setStep('otp');
      setOtpCode('');
      setCountdown(60);
      if (res.fallbackCodeNotice) {
        setFallbackNotice(res.fallbackCodeNotice);
      } else {
        setFallbackNotice(null);
      }
      Alert.alert(
        'Verification Code Sent',
        res.fallbackCodeNotice
          ? `A code has been generated.\n\n${res.fallbackCodeNotice}`
          : `We sent a 6-digit verification code to ${cleanEmail}. Please check your email inbox.`
      );
    } catch (err) {
      Alert.alert('Registration Error', err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegister = async () => {
    const cleanCode = (otpCode || '').trim();
    if (cleanCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      await register({
        ...form,
        email: form.email.trim().toLowerCase(),
        otp: cleanCode,
      });
      // AuthContext handles setting user state and navigating
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await sendRegisterOtp(form.email.trim().toLowerCase());
      setCountdown(60);
      if (res.fallbackCodeNotice) {
        setFallbackNotice(res.fallbackCodeNotice);
      }
      Alert.alert('New Code Sent', 'A fresh 6-digit verification code was sent to your email.');
    } catch (err) {
      Alert.alert('Resend Failed', err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#4F46E5', '#7C3AED', '#2563EB']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>Join DiaFit AI</Text>
            <Text style={styles.subtitle}>Start your smart health journey</Text>
          </View>

          {step === 'info' ? (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="First"
                    value={form.firstName}
                    onChangeText={v => update('firstName', v)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Last"
                    value={form.lastName}
                    onChangeText={v => update('lastName', v)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={form.email}
                  onChangeText={v => update('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password (Min 8 characters)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChangeText={v => update('password', v)}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>I am a</Text>
                <View style={styles.roleRow}>
                  {['patient', 'doctor'].map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[styles.roleBtn, form.role === role && styles.roleBtnActive]}
                      onPress={() => update('role', role)}
                    >
                      <Text style={[styles.roleText, form.role === role && styles.roleTextActive]}>
                        {role === 'patient' ? 'Patient' : 'Doctor'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get Verification Code</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 14 }}>
                <Text style={styles.link}>
                  Already have an account? <Text style={styles.linkBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.title}>Enter Email Verification Code</Text>
              <Text style={styles.description}>
                A 6-digit verification code has been dispatched to:{'\n'}
                <Text style={{ fontWeight: 'bold', color: '#4F46E5' }}>{form.email.trim().toLowerCase()}</Text>
              </Text>

              {fallbackNotice && (
                <View style={styles.fallbackBox}>
                  <Text style={styles.fallbackTitle}>ℹ️ Notice</Text>
                  <Text style={styles.fallbackText}>{fallbackNotice}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-Digit OTP Code</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="000000"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor="#CBD5E1"
                  autoFocus
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleCompleteRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete Registration</Text>}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                <TouchableOpacity onPress={handleResendOtp} disabled={countdown > 0 || loading}>
                  <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
                    {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setStep('info');
                  setOtpCode('');
                  setFallbackNotice(null);
                }}
                style={{ marginTop: 16 }}
              >
                <Text style={styles.link}>
                  ← <Text style={styles.linkBold}>Back to Details</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  description: { fontSize: 14, color: '#6B7280', marginBottom: 18, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1, marginBottom: 14 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 5 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  otpInput: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 10,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
    color: '#312E81',
  },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  roleBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  roleText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  roleTextActive: { color: '#fff' },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resendRow: { alignItems: 'center', marginTop: 14 },
  resendText: { color: '#4F46E5', fontSize: 14, fontWeight: '600' },
  resendDisabled: { color: '#9CA3AF' },
  fallbackBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  fallbackTitle: { color: '#92400E', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  fallbackText: { color: '#92400E', fontSize: 12, lineHeight: 16 },
  link: { textAlign: 'center', color: '#6B7280', fontSize: 14 },
  linkBold: { color: '#4F46E5', fontWeight: '700' },
});
