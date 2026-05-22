import { useState } from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import api from '../../utils/api';

export default function RequestBloodScreen() {
  const [patientId, setPatientId] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [unitsRequired, setUnitsRequired] = useState("");
  const [priority, setPriority] = useState("normal");

  const submitRequest = async () => {
    try {
      const payload = {
        patient_id: Number(patientId),
        blood_group: bloodGroup,
        units_required: Number(unitsRequired),
        priority,
      };
      const res = await api.post("/requests", payload);
      console.log("REQUEST CREATED:", res.data);
      Alert.alert("Success", "Blood request created");
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create request",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Blood</Text>

      <TextInput
        style={styles.input}
        placeholder="Patient ID"
        value={patientId}
        onChangeText={setPatientId}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Blood Group (e.g. O+)"
        value={bloodGroup}
        onChangeText={setBloodGroup}
      />
      <TextInput
        style={styles.input}
        placeholder="Units Required"
        value={unitsRequired}
        onChangeText={setUnitsRequired}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Priority (critical/normal)"
        value={priority}
        onChangeText={setPriority}
      />

      <TouchableOpacity style={styles.btn} onPress={submitRequest}>
        <Text style={styles.btnText}>Submit Request</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18,
    color: "#E53935",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
  },
  btn: {
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
