import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DonateScreen from '../screens/donor/DonateScreen';
import DonorHomeScreen from '../screens/donor/DonorHomeScreen';
import DonorProfileScreen from '../screens/donor/DonorProfileScreen';

const Tab = createBottomTabNavigator();

export default function DonorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#E53935",
        tabBarInactiveTintColor: "#8A8F98",
        tabBarStyle: { height: 60, paddingBottom: 6, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          let icon = "ellipse";
          if (route.name === "Home") icon = "home";
          if (route.name === "Donate") icon = "water";
          if (route.name === "Profile") icon = "person";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DonorHomeScreen} />
      <Tab.Screen name="Donate" component={DonateScreen} />
      <Tab.Screen name="Profile" component={DonorProfileScreen} />
    </Tab.Navigator>
  );
}
