import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function DonateScreen({ navigation }) {
  const { user } = useAuth();

  const [donor, setDonor] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalId, setHospitalId] = useState("");
  const [units, setUnits] = useState("1");
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await api.get(`/donor/profile/${user.user_id}`);
        setDonor(res.data?.data || null);
      } catch (e) {
        console.log("Donor profile error:", e?.response?.data || e.message);
        setDonor(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    const loadHospitals = async () => {
      try {
        setLoadingHospitals(true);
        const res = await api.get("/admin/hospitals");
        const list = res.data?.data || [];
        setHospitals(list);
        if (list.length > 0) setHospitalId(String(list[0].hospital_id));
      } catch (e) {
        console.log("Hospitals fetch error:", e?.response?.data || e.message);
      } finally {
        setLoadingHospitals(false);
      }
    };

    if (user?.user_id) {
      loadProfile();
      loadHospitals();
    }
  }, [user?.user_id]);

  const handleSubmit = async () => {
    if (!donor?.donor_id || !donor?.blood_group) {
      return Alert.alert("Error", "Donor profile not found. Please complete profile first.");
    }
    if (!hospitalId) return Alert.alert("Validation", "Please select hospital");
    if (!units || Number(units) <= 0) {
      return Alert.alert("Validation", "Units must be greater than 0");
    }

    const payload = {
      donor_id: donor.donor_id,
      blood_group: donor.blood_group,
      hospital_id: Number(hospitalId),
      collection_date: collectionDate,
      units: Number(units),
    };

    try {
      setSubmitting(true);

      console.log("POST => /donor/donate");
      console.log("Payload =>", payload);

      const res = await api.post("/donor/donate", payload);

      console.log("Donate response =>", res.data);

      if (res.data?.success) {
        Alert.alert("Success", "Donation successful", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", res.data?.message || "Donation failed");
      }
    } catch (e) {
      console.log("Donate error full:", e?.response?.status, e?.response?.data, e?.message);
      Alert.alert("Error", e?.response?.data?.message || "Failed to submit donation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfile || loadingHospitals) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color="#E53935" style={{ marginTop: 30 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Donate Blood</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Blood Group</Text>
          <TextInput
            style={styles.input}
            editable={false}
            value={donor?.blood_group || "No data"}
          />

          <Text style={styles.label}>Hospital</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={hospitalId} onValueChange={(v) => setHospitalId(String(v))}>
              {hospitals.map((h) => (
                <Picker.Item key={h.hospital_id} label={h.name} value={String(h.hospital_id)} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Collection Date</Text>
          <TextInput
            style={styles.input}
            value={collectionDate}
            onChangeText={setCollectionDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Units</Text>
          <TextInput
            style={styles.input}
            value={units}
            onChangeText={setUnits}
            keyboardType="numeric"
            placeholder="Enter units"
          />

          <TouchableOpacity
            style={[styles.btn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Donate Now</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6FA" },
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#333", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, elevation: 3 },
  label: { marginTop: 8, marginBottom: 5, color: "#666", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  btn: {
    marginTop: 16,
    backgroundColor: "#E53935",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});