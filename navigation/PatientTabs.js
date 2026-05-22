import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MyRequestsScreen from '../screens/patient/MyRequestsScreen';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import RequestBloodScreen from '../screens/patient/RequestBloodScreen';

const Tab = createBottomTabNavigator();

export default function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#E53935",
        tabBarInactiveTintColor: "#8A8F98",
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home",
            Request: "water",
            Requests: "list",
            Profile: "person",
          };
          return <Ionicons name={icons[route.name] || "ellipse"} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={PatientHomeScreen} />
      <Tab.Screen name="Request" component={RequestBloodScreen} />
      <Tab.Screen name="Requests" component={MyRequestsScreen} />
      <Tab.Screen name="Profile" component={PatientProfileScreen} />
    </Tab.Navigator>
  );
}