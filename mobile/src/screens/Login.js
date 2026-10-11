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

export default function Login({ navigation }) {
  const { login, requestLoginOtp, verifyLoginOtp } = useAuth();
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleRequestOtp = async () => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      Alert.alert('Required', 'Please enter your email address');
      return;
    }
    if (!password) {
      Alert.alert('Required', 'Please enter your password');
      return;
    }
    setLoading(true);
    try {
      const res = await requestLoginOtp(cleanEmail, password);
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
      Alert.alert('Login Failed', err.response?.data?.message || 'Unable to send OTP. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanCode = (otpCode || '').trim();
    if (cleanCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      await verifyLoginOtp(email, cleanCode);
    } catch (err) {
      Alert.alert('Verification Failed', err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await requestLoginOtp(email, password);
      setCountdown(60);
      if (res.fallbackCodeNotice) {
        setFallbackNotice(res.fallbackCodeNotice);
      }
      Alert.alert(
        'New Code Sent',
        res.fallbackCodeNotice
          ? `New code generated.\n\n${res.fallbackCodeNotice}`
          : `A fresh 6-digit code has been sent to ${email.trim().toLowerCase()}.`
      );
    } catch (err) {
      Alert.alert('Resend Failed', err.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPasswordLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#4F46E5', '#7C3AED', '#2563EB']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>DiaFit AI</Text>
            <Text style={styles.subtitle}>AI-Powered Health & Fitness</Text>
          </View>

          {step === 'credentials' ? (
            <View style={styles.card}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.description}>Sign in to your account with email OTP verification</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleRequestOtp} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Get OTP in Mail & Sign In</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleDirectPasswordLogin} disabled={loading}>
                <Text style={styles.secondaryButtonText}>Quick Direct Password Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 12 }}>
                <Text style={styles.link}>
                  Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.description}>
                We sent a 6-digit OTP code to:{'\n'}
                <Text style={{ fontWeight: 'bold', color: '#4F46E5' }}>{email.trim().toLowerCase()}</Text>
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

              <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify & Sign In</Text>
                )}
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
                  setStep('credentials');
                  setOtpCode('');
                  setFallbackNotice(null);
                }}
                style={{ marginTop: 16 }}
              >
                <Text style={styles.link}>
                  ← <Text style={styles.linkBold}>Change Email / Back</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.demo}>Demo: demo@diafit.com / password123</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  description: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  primaryButton: {
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
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: { color: '#4B5563', fontSize: 13, fontWeight: '600' },
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
  demo: { textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginTop: 20, fontSize: 12 },
});
