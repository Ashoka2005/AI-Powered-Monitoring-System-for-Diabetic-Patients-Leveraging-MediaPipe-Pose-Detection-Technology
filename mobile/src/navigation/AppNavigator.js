import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import Exercise from '../screens/Exercise';
import HealthLog from '../screens/HealthLog';
import Diet from '../screens/Diet';
import Chat from '../screens/Chat';
import Profile from '../screens/Profile';
import Appointments from '../screens/Appointments';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Exercise: focused ? 'barbell' : 'barbell-outline',
            Health: focused ? 'heart' : 'heart-outline',
            Diet: focused ? 'restaurant' : 'restaurant-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Exercise" component={Exercise} />
      <Tab.Screen name="Health" component={HealthLog} />
      <Tab.Screen name="Diet" component={Diet} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Chat" component={Chat} options={{ headerShown: true, title: 'AI Health Assistant', presentation: 'modal' }} />
            <Stack.Screen name="Appointments" component={Appointments} options={{ headerShown: true, title: 'Appointments', presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
