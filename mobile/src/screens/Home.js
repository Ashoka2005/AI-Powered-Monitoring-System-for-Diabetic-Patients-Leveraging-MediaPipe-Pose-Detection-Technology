import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Home({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, exRes] = await Promise.all([
        api.get('/exercises/sessions/history?limit=1').catch(() => ({ data: { data: [] } })),
        api.get('/exercises').catch(() => ({ data: { data: [] } })),
      ]);
      setExercises(exRes.data.data || []);
    } catch (err) { console.error(err); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const quickActions = [
    { icon: 'barbell', label: 'Start Exercise', color: '#4F46E5', screen: 'Exercise', tab: true },
    { icon: 'heart-pulse', label: 'Log Health', color: '#EF4444', screen: 'Health', tab: true },
    { icon: 'chatbubble-ellipses', label: 'AI Chat', color: '#10B981', screen: 'Chat' },
    { icon: 'calendar', label: 'Appointments', color: '#F59E0B', screen: 'Appointments' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName || 'User'}!</Text>
            <Text style={styles.subtext}>Ready for today's workout?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.firstName || 'U')[0]}</Text>
          </View>
        </View>

        {/* BMI Card */}
        {user?.height && user?.weight && (
          <View style={styles.bmiCard}>
            <Text style={styles.bmiLabel}>Your BMI</Text>
            <Text style={styles.bmiValue}>{(user.weight / ((user.height / 100) ** 2)).toFixed(1)}</Text>
            <Text style={styles.bmiCategory}>
              {(() => {
                const bmi = user.weight / ((user.height / 100) ** 2);
                if (bmi < 18.5) return 'Underweight';
                if (bmi < 25) return 'Normal';
                if (bmi < 30) return 'Overweight';
                return 'Obese';
              })()}
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => action.tab ? navigation.getParent()?.navigate(action.screen) : navigation.navigate(action.screen)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Available Exercises */}
        <Text style={styles.sectionTitle}>Exercises</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exerciseScroll}>
          {exercises.slice(0, 6).map((ex) => (
            <TouchableOpacity
              key={ex._id}
              style={styles.exerciseCard}
              onPress={() => navigation.getParent()?.navigate('Exercise', { exercise: ex })}
            >
              <View style={[styles.exerciseBadge, { backgroundColor: getCategoryColor(ex.category) }]}>
                <Text style={styles.exerciseBadgeText}>{ex.category}</Text>
              </View>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <View style={styles.exerciseMeta}>
                <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                <Text style={styles.exerciseMetaText}>{ex.duration} min</Text>
                <Ionicons name="flame-outline" size={12} color="#9CA3AF" style={{ marginLeft: 8 }} />
                <Text style={styles.exerciseMetaText}>{ex.caloriesPerMin * ex.duration} cal</Text>
              </View>
            </TouchableOpacity>
          ))}
          {exercises.length === 0 && <Text style={styles.emptyText}>No exercises available</Text>}
        </ScrollView>

        {/* Health Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={20} color="#F59E0B" />
          <Text style={styles.tipText}>
            Regular exercise can reduce blood sugar levels by up to 30%. Aim for at least 30 minutes of moderate activity daily.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getCategoryColor(cat) {
  const colors = { strength: '#4F46E5', cardio: '#EF4444', flexibility: '#10B981', balance: '#F59E0B', rehabilitation: '#8B5CF6' };
  return (colors[cat] || '#6B7280') + '20';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  subtext: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bmiCard: { backgroundColor: '#4F46E5', borderRadius: 16, padding: 20, marginBottom: 24, alignItems: 'center' },
  bmiLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  bmiValue: { color: '#fff', fontSize: 42, fontWeight: 'bold', marginTop: 4 },
  bmiCategory: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  exerciseScroll: { gap: 12, paddingBottom: 4, marginBottom: 24 },
  exerciseCard: { width: 160, backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  exerciseBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  exerciseBadgeText: { fontSize: 10, fontWeight: '600', color: '#4F46E5' },
  exerciseName: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  exerciseMeta: { flexDirection: 'row', alignItems: 'center' },
  exerciseMetaText: { fontSize: 11, color: '#9CA3AF', marginLeft: 3 },
  tipCard: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, gap: 10, borderWidth: 1, borderColor: '#FDE68A' },
  tipText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
});
