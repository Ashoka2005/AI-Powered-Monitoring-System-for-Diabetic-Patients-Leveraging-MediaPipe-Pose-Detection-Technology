import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function Register({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'patient' });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
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
            <Text style={styles.subtitle}>Start your health journey today</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>First Name</Text>
                <TextInput style={styles.input} placeholder="First" value={form.firstName} onChangeText={v => update('firstName', v)} placeholderTextColor="#9CA3AF" />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput style={styles.input} placeholder="Last" value={form.lastName} onChangeText={v => update('lastName', v)} placeholderTextColor="#9CA3AF" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} placeholder="Enter your email" value={form.email} onChangeText={v => update('email', v)} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9CA3AF" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Min 6 characters" value={form.password} onChangeText={v => update('password', v)} secureTextEntry placeholderTextColor="#9CA3AF" />
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

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
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
  logo: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1, marginBottom: 14 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 5 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#F9FAFB' },
  roleBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  roleText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  roleTextActive: { color: '#fff' },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#6B7280', marginTop: 16, fontSize: 14 },
  linkBold: { color: '#4F46E5', fontWeight: '600' },
});
