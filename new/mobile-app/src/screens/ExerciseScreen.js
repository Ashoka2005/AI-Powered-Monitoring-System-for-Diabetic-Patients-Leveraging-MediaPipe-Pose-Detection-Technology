import React, { useState } from 'react';
import { StyleSheet, ScrollView, Image, Alert } from 'react-native';
import {
  View,
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  List,
  Divider,
} from 'react-native-paper';
import { useUserStore } from '../store/userStore';
import { knowledgeBase } from '../data/exercises';

export default function ExerciseScreen({ navigation }) {
  const healthProfile = useUserStore((state) => state.healthProfile);
  const [expandedExercise, setExpandedExercise] = useState(null);

  const getExercises = () => {
    if (!healthProfile.condition || !healthProfile.bmiCategory) {
      return [];
    }

    const conditionExercises = knowledgeBase[healthProfile.condition];
    if (!conditionExercises) return [];

    return conditionExercises[healthProfile.bmiCategory] || [];
  };

  const exercises = getExercises();

  const getConditionName = () => {
    const conditions = {
      back_pain: 'Back Pain',
      knee_pain: 'Knee Pain',
      joint_pain: 'Joint Pain',
      obesity: 'Obesity',
      diabetes: 'Diabetes',
    };
    return conditions[healthProfile.condition] || healthProfile.condition;
  };

  if (!healthProfile.condition || !healthProfile.bmiCategory) {
    return (
      <View style={styles.center}>
        <Title style={styles.emptyTitle}>No Exercises Yet</Title>
        <Paragraph style={styles.emptyText}>
          Please complete your health profile to see personalized exercise
          recommendations
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Profile')}
          style={styles.button}
        >
          Complete Profile
        </Button>
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={styles.center}>
        <Title style={styles.emptyTitle}>No Exercises Available</Title>
        <Paragraph style={styles.emptyText}>
          No exercises found for your profile
        </Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏋️ Your Exercises</Text>
        <Text style={styles.headerSubtitle}>
          Personalized for {getConditionName()} ({healthProfile.bmiCategory})
        </Text>
      </View>

      {/* Exercise List */}
      {exercises.map((exercise, index) => (
        <Card key={index} style={styles.exerciseCard}>
          {/* Exercise Image */}
          <Image source={{ uri: exercise.img }} style={styles.exerciseImage} />

          <Card.Content>
            <Title style={styles.exerciseName}>{exercise.name}</Title>

            {/* Target Angles */}
            <View style={styles.anglesContainer}>
              <Text style={styles.anglesTitle}>🎯 Target Angles:</Text>
              {Object.entries(exercise.angles).map(([joint, angle]) => (
                <Chip key={joint} style={styles.angleChip} mode="outlined">
                  {joint}: {angle}°
                </Chip>
              ))}
            </View>

            <Divider style={styles.divider} />

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.sectionTitle}>📋 Instructions:</Text>
              <Paragraph style={styles.instructionText}>
                {exercise.instructions.en.start}
              </Paragraph>
            </View>

            {/* Expandable Benefits */}
            <List.Accordion
              title="✨ Benefits"
              titleStyle={styles.benefitsTitle}
              style={styles.benefitsAccordion}
              expanded={expandedExercise === index}
              onPress={() =>
                setExpandedExercise(expandedExercise === index ? null : index)
              }
            >
              {exercise.benefits.en.map((benefit, i) => (
                <Paragraph key={i} style={styles.benefitItem}>
                  ✓ {benefit}
                </Paragraph>
              ))}
            </List.Accordion>

            {/* Start Button */}
            <Button
              mode="contained"
              style={styles.startButton}
              contentStyle={styles.startButtonContent}
              onPress={() => {
                Alert.alert(
                  'Exercise Selected',
                  `Starting: ${exercise.name}\n\nPlace your phone camera to begin posture detection.`,
                  [{ text: 'OK' }]
                );
              }}
            >
              🚀 Start Exercise
            </Button>
          </Card.Content>
        </Card>
      ))}

      {/* Tips Card */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Title style={styles.tipsTitle}>💡 Exercise Tips</Title>
          <Paragraph style={styles.tipItem}>
            • Perform exercises slowly and carefully
          </Paragraph>
          <Paragraph style={styles.tipItem}>
            • Use the camera for real-time posture feedback
          </Paragraph>
          <Paragraph style={styles.tipItem}>
            • Stop if you feel any pain
          </Paragraph>
          <Paragraph style={styles.tipItem}>
            • Practice regularly for best results
          </Paragraph>
          <Paragraph style={styles.tipItem}>
            • Stay hydrated during exercise
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#667eea',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    margin: 15,
    marginTop: 0,
    elevation: 4,
    borderRadius: 15,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginTop: 10,
  },
  anglesContainer: {
    marginTop: 15,
  },
  anglesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  angleChip: {
    margin: 4,
  },
  divider: {
    marginVertical: 15,
    backgroundColor: '#e0e7ff',
  },
  instructionsContainer: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  benefitsAccordion: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    marginBottom: 10,
  },
  benefitItem: {
    fontSize: 13,
    color: '#555',
    marginLeft: 10,
    marginVertical: 3,
  },
  startButton: {
    marginTop: 15,
    backgroundColor: '#10b981',
    borderRadius: 10,
  },
  startButtonContent: {
    paddingVertical: 6,
  },
  tipsCard: {
    margin: 15,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 2,
  },
  tipsTitle: {
    fontSize: 18,
    color: '#f59e0b',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: '#92400e',
    marginVertical: 3,
  },
  bottomSpace: {
    height: 30,
  },
});
