import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import api from '../utils/api';

const { width } = Dimensions.get('window');

export default function HealthLog() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bloodSugar: '', bloodPressure: '', heartRate: '', weight: '', notes: '' });
  const [glycemicScore, setGlycemicScore] = useState(null);
  const [riskPrediction, setRiskPrediction] = useState(null);

  useEffect(() => { fetchHealthData(); }, []);

  const fetchHealthData = async () => {
    try {
      const [recordsRes, scoreRes] = await Promise.all([
        api.get('/health?limit=30').catch(() => ({ data: { data: [] } })),
        api.get('/health/glycemic-score').catch(() => ({ data: { data: null } })),
      ]);
      setRecords(recordsRes.data.data || []);
      setGlycemicScore(scoreRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleSubmit = async () => {
    if (!form.bloodSugar) { Alert.alert('Error', 'Blood sugar is required'); return; }
    try {
      await api.post('/health', {
        bloodSugar: parseFloat(form.bloodSugar),
        bloodPressure: form.bloodPressure,
        heartRate: form.heartRate ? parseInt(form.heartRate) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        notes: form.notes,
      });
      setForm({ bloodSugar: '', bloodPressure: '', heartRate: '', weight: '', notes: '' });
      setShowForm(false);
      fetchHealthData();
      Alert.alert('Success', 'Health record saved!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    }
  };

  const predictRisk = async () => {
    try {
      const { data } = await api.post('/health/predict-risk', {});
      setRiskPrediction(data.data);
    } catch (err) {
      Alert.alert('Error', 'Could not get risk prediction');
    }
  };

  const chartData = {
    labels: records.slice(-7).map(r => new Date(r.recordedAt || r.createdAt).toLocaleDateString('en', { weekday: 'short' })),
    datasets: [{ data: records.slice(-7).map(r => r.bloodSugar || 0) }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHealthData(); }} />}
        contentContainerStyle={styles.scroll}
      >
        {/* Glycemic Score */}
        {glycemicScore && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Glycemic Impact Score</Text>
            <Text style={[styles.scoreValue, { color: glycemicScore.score > 70 ? '#10B981' : glycemicScore.score > 40 ? '#F59E0B' : '#EF4444' }]}>
              {glycemicScore.score}/100
            </Text>
            <Text style={styles.scoreDesc}>{glycemicScore.level || 'Keep tracking for better insights'}</Text>
          </View>
        )}

        {/* Blood Sugar Chart */}
        {records.length > 1 && (
          <View style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Blood Sugar Trend</Text>
            <LineChart
              data={chartData}
              width={width - 48}
              height={200}
              chartConfig={{ backgroundColor: '#fff', backgroundGradientFrom: '#fff', backgroundGradientTo: '#F3F4F6',
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                propsForDots: { r: '5', strokeWidth: '2', stroke: '#4F46E5' }
              }}
              bezier style={{ borderRadius: 12, marginTop: 8 }}
            />
          </View>
        )}

        {/* Risk Prediction */}
        <TouchableOpacity style={styles.predictBtn} onPress={predictRisk}>
          <Ionicons name="analytics" size={20} color="#fff" />
          <Text style={styles.predictBtnText}>AI Diabetic Risk Prediction</Text>
        </TouchableOpacity>
        {riskPrediction && (
          <View style={styles.riskCard}>
            <Text style={styles.riskLevel}>Risk Level: <Text style={{ color: riskPrediction.level === 'high' ? '#EF4444' : riskPrediction.level === 'moderate' ? '#F59E0B' : '#10B981', fontWeight: 'bold' }}>{riskPrediction.level?.toUpperCase()}</Text></Text>
            <Text style={styles.riskScore}>Score: {riskPrediction.score}/100</Text>
            {riskPrediction.recommendations?.map((r, i) => <Text key={i} style={styles.riskRec}>• {r}</Text>)}
          </View>
        )}

        {/* Add Record Button */}
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#4F46E5" />
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : 'Log Health Data'}</Text>
        </TouchableOpacity>

        {/* Form */}
        {showForm && (
          <View style={styles.form}>
            {[
              { key: 'bloodSugar', label: 'Blood Sugar (mg/dL)', kb: 'numeric' },
              { key: 'bloodPressure', label: 'Blood Pressure (e.g. 120/80)' },
              { key: 'heartRate', label: 'Heart Rate (bpm)', kb: 'numeric' },
              { key: 'weight', label: 'Weight (kg)', kb: 'numeric' },
            ].map(field => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.label}
                  value={form[field.key]}
                  onChangeText={v => setForm({ ...form, [field.key]: v })}
                  keyboardType={field.kb || 'default'}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ))}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput style={[styles.input, { height: 80 }]} placeholder="Any notes..." value={form.notes} onChangeText={v => setForm({ ...form, notes: v })} multiline placeholderTextColor="#9CA3AF" />
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Save Record</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Records */}
        <Text style={styles.sectionTitle}>Recent Records</Text>
        {records.slice(0, 10).map(r => (
          <View key={r._id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordDate}>{new Date(r.recordedAt || r.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.recordBS}>{r.bloodSugar} mg/dL</Text>
            </View>
            <View style={styles.recordMeta}>
              {r.bloodPressure && <Text style={styles.recordMetaText}>BP: {r.bloodPressure}</Text>}
              {r.heartRate && <Text style={styles.recordMetaText}>HR: {r.heartRate} bpm</Text>}
              {r.weight && <Text style={styles.recordMetaText}>Wt: {r.weight} kg</Text>}
            </View>
          </View>
        ))}
        {records.length === 0 && !loading && <Text style={styles.emptyText}>No health records yet. Start logging!</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingBottom: 40 },
  scoreCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  scoreLabel: { fontSize: 14, color: '#6B7280' },
  scoreValue: { fontSize: 42, fontWeight: 'bold', marginTop: 4 },
  scoreDesc: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  predictBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12, marginBottom: 16 },
  predictBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  riskCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  riskLevel: { fontSize: 15, color: '#374151' },
  riskScore: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  riskRec: { fontSize: 13, color: '#4B5563', marginTop: 4, paddingLeft: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 2, borderColor: '#4F46E5', paddingVertical: 12, borderRadius: 12, marginBottom: 16 },
  addBtnText: { color: '#4F46E5', fontSize: 15, fontWeight: '600' },
  form: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  submitBtn: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  recordCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordDate: { fontSize: 13, color: '#6B7280' },
  recordBS: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5' },
  recordMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  recordMetaText: { fontSize: 12, color: '#9CA3AF' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 20 },
});
