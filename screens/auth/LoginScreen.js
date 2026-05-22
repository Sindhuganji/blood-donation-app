import { useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ROLE_ROUTE_MAP = {
  donor: "DonorTabs",
  admin: "AdminTabs",
  patient: "PatientTabs",
};

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!phone || !password) {
        return Alert.alert("Validation", "Phone and password are required");
      }

      setLoading(true);
      const res = await api.post("/auth/login", { phone, password });

      if (!res.data?.success || !res.data?.user) {
        return Alert.alert(
          "Login Failed",
          res.data?.message || "Invalid credentials",
        );
      }

      const user = res.data.user;
      login(user);

      const routeName = ROLE_ROUTE_MAP[user.role];

      if (routeName) {
        navigation.replace(routeName);
      } else {
        Alert.alert("Error", `Unsupported role: ${user.role}`);
      }
    } catch (error) {
      console.log("Login error:", error?.response?.data || error.message);
      Alert.alert("Error", error?.response?.data?.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blood Donation App</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Dont have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F5F6FA",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#E53935",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#E53935",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  link: {
    marginTop: 14,
    textAlign: "center",
    color: "#E53935",
    fontWeight: "600",
  },
});
