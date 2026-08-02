import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

export default function Diet() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchDietPlan(); }, []);

  const fetchDietPlan = async () => {
    try {
      const { data } = await api.get('/diet/recommend');
      setPlan(data.data);
    } catch (err) { console.error('Diet error:', err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const refresh = () => { setRefreshing(true); fetchDietPlan(); };

  const mealIcons = { breakfast: 'cafe-outline', lunch: 'restaurant-outline', snack: 'ice-cream-outline', dinner: 'moon-outline' };
  const mealColors = { breakfast: '#F59E0B', lunch: '#10B981', snack: '#8B5CF6', dinner: '#3B82F6' };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Your Diet Plan</Text>
        <Text style={styles.subtitle}>Personalized AI-powered meal recommendations</Text>

        {/* Daily Summary */}
        {plan?.dailyCalories && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Daily Target</Text>
            <Text style={styles.summaryValue}>{plan.dailyCalories} cal</Text>
            {plan.macros && (
              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroVal}>{plan.macros.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroVal}>{plan.macros.carbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroVal}>{plan.macros.fat}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Meals */}
        {plan?.meals?.map((meal, idx) => (
          <View key={idx} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View style={[styles.mealIcon, { backgroundColor: (mealColors[meal.type] || '#6B7280') + '15' }]}>
                <Ionicons name={mealIcons[meal.type] || 'restaurant'} size={22} color={mealColors[meal.type] || '#6B7280'} />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealType}>{meal.type?.charAt(0).toUpperCase() + meal.type?.slice(1)}</Text>
                <Text style={styles.mealCal}>{meal.calories} cal</Text>
              </View>
            </View>
            {meal.items?.map((item, i) => (
              <View key={i} style={styles.foodItem}>
                <View style={styles.foodLeft}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  {item.gi !== undefined && (
                    <Text style={[styles.giTag, { color: item.gi <= 55 ? '#10B981' : item.gi <= 70 ? '#F59E0B' : '#EF4444' }]}>
                      GI: {item.gi}
                    </Text>
                  )}
                </View>
                <Text style={styles.foodCal}>{item.calories} cal</Text>
              </View>
            ))}
            {meal.note && <Text style={styles.mealNote}>{meal.note}</Text>}
          </View>
        ))}

        {/* No plan state */}
        {!plan?.meals && (
          <View style={styles.emptyCard}>
            <Ionicons name="nutrition-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No diet plan available yet</Text>
            <Text style={styles.emptySubtext}>Log your health data to get personalized recommendations</Text>
            <TouchableOpacity style={styles.genBtn} onPress={fetchDietPlan}>
              <Text style={styles.genBtnText}>Generate Plan</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={18} color="#F59E0B" />
          <Text style={styles.tipText}>Choose low-GI foods (GI under 55) to maintain stable blood sugar levels throughout the day.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 20 },
  summaryCard: { backgroundColor: '#4F46E5', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 4 },
  macrosRow: { flexDirection: 'row', gap: 24, marginTop: 12 },
  macroItem: { alignItems: 'center' },
  macroVal: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  macroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  mealCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  mealIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  mealInfo: { flex: 1 },
  mealType: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  mealCal: { fontSize: 13, color: '#6B7280' },
  foodItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  foodLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  foodName: { fontSize: 14, color: '#374151' },
  giTag: { fontSize: 11, fontWeight: '600' },
  foodCal: { fontSize: 13, color: '#9CA3AF' },
  mealNote: { fontSize: 12, color: '#6B7280', fontStyle: 'italic', marginTop: 8, padding: 8, backgroundColor: '#F9FAFB', borderRadius: 8 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 40, alignItems: 'center', marginTop: 20 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
  genBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  genBtnText: { color: '#fff', fontWeight: 'bold' },
  tipCard: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, gap: 10, borderWidth: 1, borderColor: '#FDE68A', marginTop: 8 },
  tipText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18 },
});
