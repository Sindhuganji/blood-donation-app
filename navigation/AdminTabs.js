import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import DonorListScreen from '../screens/admin/DonorListScreen';
import HospitalListScreen from '../screens/admin/HospitalListScreen';
import ManageRequestsScreen from '../screens/admin/ManageRequestsScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#E53935",
        tabBarInactiveTintColor: "#8A8F98",
        tabBarIcon: ({ color, size }) => {
          const map = {
            Dashboard: "speedometer",
            Requests: "list",
            Donors: "people",
            Hospitals: "business",
          };
          return (
            <Ionicons
              name={map[route.name] || "ellipse"}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminHomeScreen} />
      <Tab.Screen name="Requests" component={ManageRequestsScreen} />
      <Tab.Screen name="Donors" component={DonorListScreen} />
      <Tab.Screen name="Hospitals" component={HospitalListScreen} />
    </Tab.Navigator>
  );
}
