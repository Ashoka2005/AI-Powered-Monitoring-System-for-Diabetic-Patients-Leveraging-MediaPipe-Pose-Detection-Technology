import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [aptRes, docRes] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: { data: [] } })),
        api.get('/appointments/doctors').catch(() => ({ data: { data: [] } })),
      ]);
      setAppointments(aptRes.data.data || []);
      setDoctors(docRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const bookAppointment = async () => {
    if (!selectedDoctor || !date || !time) {
      Alert.alert('Error', 'Please select doctor, date, and time');
      return;
    }
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        date,
        time,
        type: 'telemedicine',
        reason: 'General consultation',
      });
      Alert.alert('Success', 'Appointment booked!');
      setShowBook(false);
      setSelectedDoctor(null);
      setDate('');
      setTime('');
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Booking failed');
    }
  };

  const cancelAppointment = async (id) => {
    Alert.alert('Cancel', 'Cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          await api.put(`/appointments/${id}/cancel`);
          fetchData();
        } catch (err) { Alert.alert('Error', 'Cancel failed'); }
      }},
    ]);
  };

  const statusColors = {
    scheduled: '#4F46E5', completed: '#10B981', cancelled: '#EF4444', pending: '#F59E0B',
  };

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        contentContainerStyle={styles.scroll}
      >
        {!showBook ? (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.title}>My Appointments</Text>
              <TouchableOpacity style={styles.bookBtn} onPress={() => setShowBook(true)}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.bookBtnText}>Book</Text>
              </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} /> : (
              <>
                {appointments.map(apt => (
                  <View key={apt._id} style={styles.aptCard}>
                    <View style={styles.aptHeader}>
                      <View>
                        <Text style={styles.doctorName}>Dr. {apt.doctorId?.firstName} {apt.doctorId?.lastName}</Text>
                        <Text style={styles.specialization}>{apt.doctorId?.doctorInfo?.specialization || 'General'}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: (statusColors[apt.status] || '#6B7280') + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColors[apt.status] || '#6B7280' }]}>{apt.status}</Text>
                      </View>
                    </View>
                    <View style={styles.aptDetails}>
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text style={styles.aptDetail}>{new Date(apt.date).toLocaleDateString()}</Text>
                      <Ionicons name="time-outline" size={14} color="#6B7280" style={{ marginLeft: 12 }} />
                      <Text style={styles.aptDetail}>{apt.time}</Text>
                      <Ionicons name="videocam-outline" size={14} color="#6B7280" style={{ marginLeft: 12 }} />
                      <Text style={styles.aptDetail}>{apt.type}</Text>
                    </View>
                    {apt.status === 'scheduled' && (
                      <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelAppointment(apt._id)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {appointments.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No appointments yet</Text>
                    <TouchableOpacity style={styles.bookBtn2} onPress={() => setShowBook(true)}>
                      <Text style={styles.bookBtn2Text}>Book Your First Appointment</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setShowBook(false)}>
                <Text style={styles.cancelLink}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Select Doctor</Text>
            {doctors.map(doc => (
              <TouchableOpacity
                key={doc._id}
                style={[styles.doctorCard, selectedDoctor?._id === doc._id && styles.doctorCardSelected]}
                onPress={() => setSelectedDoctor(doc)}
              >
                <View style={styles.doctorAvatar}>
                  <Text style={styles.doctorAvatarText}>{doc.firstName[0]}</Text>
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName2}>Dr. {doc.firstName} {doc.lastName}</Text>
                  <Text style={styles.doctorSpec}>{doc.doctorInfo?.specialization || 'General'}</Text>
                  {doc.doctorInfo?.rating && <Text style={styles.doctorRating}>Rating: {doc.doctorInfo.rating}/5</Text>}
                </View>
              </TouchableOpacity>
            ))}
            {doctors.length === 0 && <Text style={styles.emptyText}>No doctors available</Text>}

            <Text style={styles.label}>Date</Text>
            <View style={styles.dateRow}>
              {['Today', 'Tomorrow', 'Day After'].map((d, i) => {
                const dt = new Date();
                dt.setDate(dt.getDate() + i);
                const dateStr = dt.toISOString().split('T')[0];
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dateChip, date === dateStr && styles.dateChipActive]}
                    onPress={() => setDate(dateStr)}
                  >
                    <Text style={[styles.dateChipText, date === dateStr && styles.dateChipTextActive]}>{d}</Text>
                    <Text style={[styles.dateChipSub, date === dateStr && styles.dateChipTextActive]}>{dt.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Time Slot</Text>
            <View style={styles.timeRow}>
              {timeSlots.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, time === t && styles.timeChipActive]}
                  onPress={() => setTime(t)}
                >
                  <Text style={[styles.timeChipText, time === t && styles.timeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={bookAppointment} disabled={!selectedDoctor || !date || !time}>
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#4F46E5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  bookBtnText: { color: '#fff', fontWeight: '600' },
  cancelLink: { color: '#6B7280', fontWeight: '600' },
  aptCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  aptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  doctorName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  specialization: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  aptDetails: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, flexWrap: 'wrap' },
  aptDetail: { fontSize: 13, color: '#6B7280' },
  cancelBtn: { alignSelf: 'flex-end', marginTop: 8 },
  cancelText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#9CA3AF', marginTop: 12, fontSize: 15 },
  bookBtn2: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  bookBtn2Text: { color: '#fff', fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 12 },
  doctorCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
  doctorCardSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  doctorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  doctorAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  doctorInfo: { flex: 1 },
  doctorName2: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
  doctorSpec: { fontSize: 13, color: '#6B7280' },
  doctorRating: { fontSize: 12, color: '#F59E0B', marginTop: 2 },
  dateRow: { flexDirection: 'row', gap: 8 },
  dateChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  dateChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  dateChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  dateChipTextActive: { color: '#fff' },
  dateChipSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  timeChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  timeChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  timeChipTextActive: { color: '#fff' },
  confirmBtn: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
