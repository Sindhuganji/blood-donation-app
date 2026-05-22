import {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function PatientHomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, fulfilled: 0 });
  const [bloodGroup, setBloodGroup] = useState("N/A");

  const loadData = async () => {
    try {
      setLoading(true);

      const [reqRes, donorsRes] = await Promise.all([
        api.get(`/patient/requests/${user.user_id}`),
        api.get("/admin/donors"), // fallback source for blood group if patient table absent
      ]);

      const requests = reqRes.data?.data || [];
      const donor = (donorsRes.data?.data || []).find(
        (d) =>
          Number(d.user_id) === Number(user.user_id) ||
          String(d.phone) === String(user.phone),
      );

      setBloodGroup(donor?.blood_group || "N/A");
      setStats({
        total: requests.length,
        pending: requests.filter((r) => r.status === "Pending").length,
        fulfilled: requests.filter((r) => r.status === "Completed").length,
      });
    } catch (e) {
      console.log("PatientHome load error:", e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user?.user_id]),
  );

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#E53935" />
    );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.welcome}>Welcome, {user?.name} 👋</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Blood Group</Text>
          <Text style={styles.value}>{bloodGroup}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Total Requests Made</Text>
          <Text style={styles.value}>{stats.total}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Pending Requests</Text>
          <Text style={styles.value}>{stats.pending}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Fulfilled Requests</Text>
          <Text style={styles.value}>{stats.fulfilled}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6FA" },
  container: { padding: 16, paddingBottom: 24 },
  welcome: { fontSize: 22, fontWeight: "800", color: "#333", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
  },
  label: { fontSize: 13, color: "#8A8F98", marginBottom: 4 },
  value: { fontSize: 20, fontWeight: "800", color: "#333" },
});
