import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

import api from '../../utils/api';

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [bloodGroup, setBloodGroup] = useState(BLOOD_GROUPS[0]);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !password || !role) {
      return Alert.alert("Validation", "Please fill all required fields");
    }

    if (role === "donor" && !bloodGroup) {
      return Alert.alert("Validation", "Please select blood group");
    }

    const payload = { name, phone, password, role };
    if (role === "donor") payload.blood_group = bloodGroup;

    try {
      setLoading(true);
      const res = await api.post("/auth/register", payload);

      if (res.data?.success) {
        Alert.alert("Success", "Registration successful", [
          { text: "OK", onPress: () => navigation.replace("Login") },
        ]);
      } else {
        Alert.alert("Error", res.data?.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", error?.response?.data?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={styles.label}>Role</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={role} onValueChange={setRole}>
          <Picker.Item label="Patient" value="patient" />
          <Picker.Item label="Donor" value="donor" />
        </Picker>
      </View>

      {role === "donor" && (
        <>
          <Text style={styles.label}>Blood Group *</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={bloodGroup} onValueChange={setBloodGroup}>
              {BLOOD_GROUPS.map((bg) => (
                <Picker.Item key={bg} label={bg} value={bg} />
              ))}
            </Picker>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center", backgroundColor: "#F5F6FA" },
  title: { fontSize: 26, fontWeight: "800", color: "#E53935", marginBottom: 16 },
  label: { fontSize: 14, color: "#4B5563", marginBottom: 6, marginTop: 6, fontWeight: "600" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, marginBottom: 12 },
  pickerWrap: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, overflow: "hidden", marginBottom: 12 },
  btn: { backgroundColor: "#E53935", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 6 },
  btnText: { color: "#fff", fontWeight: "700" },
});