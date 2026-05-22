import React from 'react';

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DonorListScreen from '../screens/admin/DonorListScreen';
import DonorHomeScreen from '../screens/donor/DonorHomeScreen';
import DonorProfileScreen from '../screens/donor/DonorProfileScreen';
import RequestBloodScreen from '../screens/main/RequestBloodScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#E53935",
        tabBarInactiveTintColor: "#8A8F98",
        tabBarIcon: ({ color, size }) => {
          let icon = "ellipse";
          if (route.name === "Home") icon = "home";
          if (route.name === "Donors") icon = "people";
          if (route.name === "Request") icon = "medical";
          if (route.name === "Profile") icon = "person";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DonorHomeScreen} />
      <Tab.Screen name="Donors" component={DonorListScreen} />
      <Tab.Screen name="Request" component={RequestBloodScreen} />
      <Tab.Screen name="Profile" component={DonorProfileScreen} />
    </Tab.Navigator>
  );
}