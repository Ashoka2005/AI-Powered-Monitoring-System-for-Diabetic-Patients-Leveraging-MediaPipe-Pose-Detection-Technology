import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
  });

  const handleSave = async () => {
    try {
      await api.put('/users/profile', {
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        phone: form.phone,
        gender: form.gender,
      });
      Alert.alert('Success', 'Profile updated!');
      setEditing(false);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Update failed');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const bmi = user?.height && user?.weight ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : null;

  const sections = [
    { icon: 'person-outline', label: 'Name', value: `${user?.firstName || ''} ${user?.lastName || ''}` },
    { icon: 'mail-outline', label: 'Email', value: user?.email },
    { icon: 'shield-checkmark-outline', label: 'Role', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
    { icon: 'call-outline', label: 'Phone', value: user?.phone || 'Not set' },
    { icon: 'transgender-outline', label: 'Gender', value: user?.gender || 'Not set' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.firstName || 'U')[0]}</Text>
          </View>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {bmi && (
            <View style={styles.bmiBadge}>
              <Text style={styles.bmiLabel}>BMI</Text>
              <Text style={styles.bmiValue}>{bmi}</Text>
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Profile Information</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={styles.editText}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {sections.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Ionicons name={item.icon} size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}

          {editing && (
            <View style={styles.editSection}>
              <TextInput style={styles.input} placeholder="Height (cm)" value={form.height} onChangeText={v => setForm({ ...form, height: v })} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Weight (kg)" value={form.weight} onChangeText={v => setForm({ ...form, weight: v })} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Phone" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} placeholderTextColor="#9CA3AF" />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Coming Soon', 'Notification settings coming soon!')}>
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Coming Soon', 'Privacy settings coming soon!')}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Privacy</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Coming Soon', 'Help center coming soon!')}>
            <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>DiaFit AI v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 12 },
  email: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  bmiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  bmiLabel: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },
  bmiValue: { fontSize: 14, color: '#4F46E5', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  editText: { color: '#4F46E5', fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF' },
  infoValue: { fontSize: 14, color: '#374151', fontWeight: '500' },
  editSection: { marginTop: 12, gap: 10 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  saveBtn: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  actionText: { flex: 1, fontSize: 15, color: '#374151' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FEF2F2', paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 20 },
});
