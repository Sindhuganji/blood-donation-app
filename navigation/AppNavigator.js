import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdminTabs from './AdminTabs';
import DonorTabs from './DonorTabs';
import PatientTabs from './PatientTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      <Stack.Screen name="DonorTabs" component={DonorTabs} />
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="PatientTabs" component={PatientTabs} />
    </Stack.Navigator>
  );
}
