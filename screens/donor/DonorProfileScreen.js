import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function DonorProfileScreen() {
  const { user } = useAuth();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        console.log("User object:", user);

        const res = await api.get(`/donor/profile/${user.user_id}`);
        console.log("Donor profile response:", res.data);

        setDonor(res.data?.data || null);
      } catch (e) {
        console.log("Donor fetch error:", e?.response?.data || e.message);
        setError("Donor profile not found");
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) load();
  }, [user?.user_id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#E53935" />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text>Name: {donor?.name || user?.name || "No data"}</Text>
        <Text>Phone: {donor?.phone || user?.phone || "No data"}</Text>
        <Text>Blood Group: {donor?.blood_group || "No data"}</Text>
        <Text>Health Status: {donor?.health_status || "No data"}</Text>
        <Text>Last Donation Date: {donor?.last_donation_date || "N/A"}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6FA", padding: 16 },
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 12 },
  error: { color: "red", marginBottom: 8 },
});