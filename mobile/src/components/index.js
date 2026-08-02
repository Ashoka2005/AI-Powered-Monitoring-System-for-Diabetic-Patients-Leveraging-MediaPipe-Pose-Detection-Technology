import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function StatCard({ icon, label, value, color = '#4F46E5', onPress }) {
  const Content = (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress}>{Content}</TouchableOpacity> : Content;
}

export function ExerciseCard({ exercise, onPress }) {
  return (
    <TouchableOpacity style={styles.exerciseCard} onPress={onPress}>
      <View style={[styles.badge, { backgroundColor: getColor(exercise.category) }]}>
        <Text style={styles.badgeText}>{exercise.category}</Text>
      </View>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <View style={styles.meta}>
        <Ionicons name="time-outline" size={12} color="#9CA3AF" />
        <Text style={styles.metaText}>{exercise.duration} min</Text>
        <Ionicons name="flame-outline" size={12} color="#9CA3AF" style={{ marginLeft: 8 }} />
        <Text style={styles.metaText}>{(exercise.caloriesPerMin || 5) * (exercise.duration || 10)} cal</Text>
      </View>
    </TouchableOpacity>
  );
}

function getColor(cat) {
  const colors = { strength: '#4F46E520', cardio: '#EF444420', flexibility: '#10B98120', balance: '#F59E0B20', rehabilitation: '#8B5CF620' };
  return colors[cat] || '#6B728020';
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  value: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  label: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  exerciseCard: { width: 160, backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#4F46E5' },
  exerciseName: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  meta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, color: '#9CA3AF', marginLeft: 3 },
});
