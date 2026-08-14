import React from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import {
  View,
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
} from 'react-native-paper';
import { useUserStore } from '../store/userStore';
import { healthConditions } from '../data/exercises';

export default function HomeScreen({ navigation }) {
  const healthProfile = useUserStore((state) => state.healthProfile);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const getConditionLabel = (key) => {
    const condition = healthConditions.find((c) => c.key === key);
    return condition ? `${condition.icon} ${condition.label}` : 'Not selected';
  };

  const getBMICategoryColor = (category) => {
    switch (category) {
      case 'underweight':
        return '#f59e0b';
      case 'normal':
        return '#10b981';
      case 'overweight':
        return '#ef4444';
      default:
        return '#666';
    }
  };

  if (!isAuthenticated || !healthProfile.name) {
    return (
      <View style={styles.center}>
        <Title style={styles.welcomeTitle}>Welcome! 👋</Title>
        <Paragraph style={styles.welcomeText}>
          Please set up your health profile to get started
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Profile')}
          style={styles.button}
        >
          Create Profile
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {healthProfile.name}! 👋</Text>
        <Text style={styles.tagline}>Your Health Dashboard</Text>
      </View>

      {/* BMI Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>📊 Your BMI</Title>
          {healthProfile.bmi ? (
            <>
              <Text style={styles.bmiValue}>{healthProfile.bmi}</Text>
              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor: getBMICategoryColor(
                      healthProfile.bmiCategory
                    ),
                  },
                ]}
              >
                <Text style={styles.categoryText}>
                  {healthProfile.bmiCategory === 'underweight'
                    ? 'Underweight'
                    : healthProfile.bmiCategory === 'normal'
                    ? 'Normal Weight'
                    : 'Overweight'}
                </Text>
              </View>
            </>
          ) : (
            <Paragraph style={styles.placeholder}>No BMI data yet</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Health Condition Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>🏥 Health Condition</Title>
          <Chip
            mode="outlined"
            style={styles.conditionChip}
            textStyle={styles.conditionText}
          >
            {getConditionLabel(healthProfile.condition)}
          </Chip>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Profile')}
            style={styles.editButton}
          >
            Edit Profile
          </Button>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>⚡ Quick Actions</Title>
          
          <Button
            mode="contained"
            icon="fitness-center"
            onPress={() => navigation.navigate('Exercises')}
            style={[styles.actionButton, { backgroundColor: '#667eea' }]}
            contentStyle={styles.actionButtonContent}
          >
            🏋️ View Exercises
          </Button>

          <Button
            mode="contained"
            icon="camera"
            onPress={() => {
              Alert.alert(
                'Coming Soon',
                'Real-time posture detection will be available soon!',
                [{ text: 'OK' }]
              );
            }}
            style={[styles.actionButton, { backgroundColor: '#764ba2' }]}
            contentStyle={styles.actionButtonContent}
          >
            📷 Posture Detection
          </Button>

          <Button
            mode="contained"
            icon="video"
            onPress={() => {
              Alert.alert(
                'Coming Soon',
                'Video analysis will be available soon!',
                [{ text: 'OK' }]
              );
            }}
            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
            contentStyle={styles.actionButtonContent}
          >
            🎥 Upload Video
          </Button>
        </Card.Content>
      </Card>

      {/* Profile Summary */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>👤 Profile Summary</Title>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Name:</Text>
            <Text style={styles.summaryValue}>{healthProfile.name}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Age:</Text>
            <Text style={styles.summaryValue}>{healthProfile.age} years</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gender:</Text>
            <Text style={styles.summaryValue}>{healthProfile.gender}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Weight:</Text>
            <Text style={styles.summaryValue}>{healthProfile.weight} kg</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Height:</Text>
            <Text style={styles.summaryValue}>{healthProfile.height} m</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Coming Soon Features */}
      <Card style={[styles.card, styles.comingSoonCard]}>
        <Card.Content>
          <Title style={styles.cardTitle}>🚀 Coming Soon</Title>
          <Paragraph style={styles.comingSoonText}>
            ✓ Real-time posture monitoring
          </Paragraph>
          <Paragraph style={styles.comingSoonText}>
            ✓ AI-powered video analysis
          </Paragraph>
          <Paragraph style={styles.comingSoonText}>
            ✓ Posture quality scoring
          </Paragraph>
          <Paragraph style={styles.comingSoonText}>
            ✓ Instant alerts for poor posture
          </Paragraph>
          <Paragraph style={styles.comingSoonText}>
            ✓ Progress tracking & reports
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 5,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    margin: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#667eea',
  },
  bmiValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginVertical: 10,
  },
  categoryBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  categoryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conditionChip: {
    marginBottom: 10,
  },
  conditionText: {
    fontSize: 16,
  },
  editButton: {
    marginTop: 5,
  },
  actionButton: {
    marginBottom: 10,
    borderRadius: 10,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    backgroundColor: '#e0e7ff',
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  comingSoonCard: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
    borderWidth: 1,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#764ba2',
    marginVertical: 3,
  },
  button: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  bottomSpace: {
    height: 30,
  },
});
