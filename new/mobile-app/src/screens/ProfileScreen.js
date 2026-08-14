import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  View,
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  HelperText,
  Chip,
} from 'react-native-paper';
import { useUserStore } from '../store/userStore';
import { healthConditions } from '../data/exercises';

export default function ProfileScreen({ navigation }) {
  const updateHealthProfile = useUserStore((state) => state.updateHealthProfile);
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [condition, setCondition] = useState('');
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!age || parseInt(age) < 1 || parseInt(age) > 120) newErrors.age = 'Valid age is required';
    if (!weight || parseFloat(weight) <= 0) newErrors.weight = 'Valid weight is required';
    if (!height || parseFloat(height) <= 0) newErrors.height = 'Valid height is required';
    if (!condition) newErrors.condition = 'Please select a health condition';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all fields correctly');
      return;
    }

    updateHealthProfile({
      name: name.trim(),
      age: parseInt(age),
      gender,
      weight: parseFloat(weight),
      height: parseFloat(height),
      condition,
    });

    Alert.alert(
      'Success!',
      `Profile saved!\nBMI: ${calculateBMI(parseFloat(weight), parseFloat(height))}`,
      [{ text: 'Continue', onPress: () => navigation.navigate('Home') }]
    );
  };

  const calculateBMI = (weight, height) => {
    return (weight / (height * height)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    return 'Overweight';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title style={styles.title}>👤 Health Profile</Title>
          <Paragraph style={styles.subtitle}>
            Enter your details for personalized recommendations
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Personal Information</Title>
            
            {/* Name */}
            <View style={styles.inputGroup}>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
              />
              {errors.name && (
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name}
                </HelperText>
              )}
            </View>

            {/* Age */}
            <View style={styles.inputGroup}>
              <TextInput
                label="Age"
                value={age}
                onChangeText={setAge}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.age}
              />
              {errors.age && (
                <HelperText type="error" visible={!!errors.age}>
                  {errors.age}
                </HelperText>
              )}
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.chipContainer}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <Chip
                    key={g}
                    selected={gender === g}
                    onPress={() => setGender(g)}
                    style={[
                      styles.chip,
                      gender === g && styles.chipSelected,
                    ]}
                  >
                    {g}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Health Details</Title>
            
            {/* Weight */}
            <View style={styles.inputGroup}>
              <TextInput
                label="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
                error={!!errors.weight}
              />
              {errors.weight && (
                <HelperText type="error" visible={!!errors.weight}>
                  {errors.weight}
                </HelperText>
              )}
            </View>

            {/* Height */}
            <View style={styles.inputGroup}>
              <TextInput
                label="Height (meters)"
                value={height}
                onChangeText={setHeight}
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="e.g., 1.70"
                error={!!errors.height}
              />
              {errors.height && (
                <HelperText type="error" visible={!!errors.height}>
                  {errors.height}
                </HelperText>
              )}
              <HelperText type="info">
                Enter height in meters (e.g., 1.70 for 170cm)
              </HelperText>
            </View>

            {/* Health Condition */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Health Condition</Text>
              <View style={styles.conditionsContainer}>
                {healthConditions.map((cond) => (
                  <Chip
                    key={cond.key}
                    selected={condition === cond.key}
                    onPress={() => setCondition(cond.key)}
                    style={[
                      styles.conditionChip,
                      condition === cond.key && styles.conditionChipSelected,
                    ]}
                    mode="outlined"
                  >
                    {cond.icon} {cond.label}
                  </Chip>
                ))}
              </View>
              {errors.condition && (
                <HelperText type="error" visible={!!errors.condition}>
                  {errors.condition}
                </HelperText>
              )}
            </View>

            {/* BMI Preview */}
            {weight && height && (
              <Card style={styles.bmiCard}>
                <Card.Content>
                  <Title style={styles.bmiTitle}>Your BMI</Title>
                  <Text style={styles.bmiValue}>
                    {calculateBMI(parseFloat(weight), parseFloat(height))}
                  </Text>
                  <Text style={styles.bmiCategory}>
                    {getBMICategory(
                      calculateBMI(parseFloat(weight), parseFloat(height))
                    )}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonLabel}
        >
          💾 Save Profile & Continue
        </Button>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#667eea',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 5,
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
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#667eea',
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionChip: {
    marginBottom: 8,
    marginRight: 8,
  },
  conditionChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  bmiCard: {
    marginTop: 15,
    backgroundColor: '#e0e7ff',
    borderColor: '#667eea',
    borderWidth: 2,
  },
  bmiTitle: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginVertical: 10,
  },
  bmiCategory: {
    fontSize: 18,
    color: '#764ba2',
    textAlign: 'center',
    fontWeight: '600',
  },
  saveButton: {
    margin: 15,
    borderRadius: 10,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 30,
  },
});
