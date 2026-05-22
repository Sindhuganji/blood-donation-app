import { useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function RequestBloodScreen() {
  const { user } = useAuth();

  const [bloodGroup, setBloodGroup] = useState("");
  const [units, setUnits] = useState("");
  const [hospital, setHospital] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    try {
      if (!user?.user_id) {
        return Alert.alert("Error", "User not logged in");
      }

      if (
        !bloodGroup.trim() ||
        !units.trim() ||
        !hospital.trim() ||
        !location.trim() ||
        !urgency.trim()
      ) {
        return Alert.alert("Validation", "Please fill all required fields");
      }

      if (Number(units) <= 0) {
        return Alert.alert("Validation", "Units must be greater than 0");
      }

      const payload = {
        user_id: Number(user.user_id),
        blood_group: bloodGroup.trim(),
        units: Number(units),
        hospital: hospital.trim(),
        location: location.trim(),
        urgency: urgency.trim(),
      };

      console.log("POST /patient/request payload =>", payload);

      setLoading(true);
      const res = await api.post("/patient/request", payload);

      if (res.data?.success) {
        Alert.alert("Success", "Request sent!");
        setBloodGroup("");
        setUnits("");
        setHospital("");
        setLocation("");
        setUrgency("Normal");
      } else {
        Alert.alert("Error", res.data?.message || "Failed to create request");
      }
    } catch (err) {
      console.log(
        "POST /patient/request error =>",
        err?.response?.status,
        err?.response?.data,
        err?.message,
      );
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to create request",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Request Blood</Text>

        <TextInput
          placeholder="Blood Group (e.g. O+)"
          style={styles.input}
          value={bloodGroup}
          onChangeText={setBloodGroup}
          autoCapitalize="characters"
        />
        <TextInput
          placeholder="Units"
          style={styles.input}
          value={units}
          onChangeText={setUnits}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Hospital"
          style={styles.input}
          value={hospital}
          onChangeText={setHospital}
        />
        <TextInput
          placeholder="Location"
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          placeholder="Urgency (Normal/Emergency)"
          style={styles.input}
          value={urgency}
          onChangeText={setUrgency}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleRequest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: "700",
    color: "#E53935",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "red",
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
