import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// User State Management
export const useUserStore = create((set, get) => ({
  // User Profile
  user: null,
  isAuthenticated: false,
  
  // Health Data
  healthProfile: {
    name: '',
    age: null,
    gender: 'Male',
    weight: null,
    height: null,
    bmi: null,
    bmiCategory: null,
    condition: ''
  },
  
  // Posture Sessions
  postureSessions: [],
  
  // Settings
  settings: {
    language: 'en',
    alertsEnabled: true,
    alertThreshold: 30,
    sensitivity: 'normal'
  },
  
  // Actions
  setUser: (userData) => {
    set({ user: userData, isAuthenticated: true });
    SecureStore.setItemAsync('user', JSON.stringify(userData));
  },
  
  updateHealthProfile: (profile) => {
    const bmi = calculateBMI(profile.weight, profile.height);
    const bmiCategory = getBMICategory(bmi);
    
    set({
      healthProfile: {
        ...get().healthProfile,
        ...profile,
        bmi,
        bmiCategory
      }
    });
  },
  
  addPostureSession: (session) => {
    set({
      postureSessions: [...get().postureSessions, session]
    });
  },
  
  updateSettings: (newSettings) => {
    set({
      settings: { ...get().settings, ...newSettings }
    });
  },
  
  // Load user data from storage
  loadUser: async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        set({ user: parsed, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  },
  
  // Logout
  logout: () => {
    set({ user: null, isAuthenticated: false, healthProfile: { name: '', age: null, gender: 'Male', weight: null, height: null, bmi: null, bmiCategory: null, condition: '' } });
    SecureStore.deleteItemAsync('user');
  }
}));

// Helper Functions
function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  return (weight / (height * height)).toFixed(1);
}

function getBMICategory(bmi) {
  if (!bmi) return null;
  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return 'underweight';
  if (bmiValue < 25) return 'normal';
  return 'overweight';
}
