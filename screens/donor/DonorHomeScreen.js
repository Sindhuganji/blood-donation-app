import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const COLORS = {
  primary: "#E53935",
  background: "#F5F6FA",
  card: "#FFFFFF",
  text: "#333",
  muted: "#8A8F98",
};

export default function DonorHomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [donor, setDonor] = useState(null);
  const [error, setError] = useState("");

  const fetchDonorProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.user_id) {
        setDonor(null);
        setError("User not found");
        return;
      }

      // ✅ Use single source of truth for donor profile
      const res = await api.get(`/donor/profile/${user.user_id}`);
      console.log("Home profile response:", res.data);

      const profile = res.data?.data || null;
      setDonor(profile);
    } catch (e) {
      console.log("Donor profile fetch error:", e?.response?.data || e.message);
      setError(e?.response?.data?.message || "Failed to load donor profile");
      setDonor(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial + every focus refresh (after returning from Donate screen)
  useFocusEffect(
    useCallback(() => {
      fetchDonorProfile();
    }, [user?.user_id])
  );

  const bloodGroup = useMemo(() => donor?.blood_group || "N/A", [donor]);

  const formattedLastDonationDate = useMemo(() => {
    const raw = donor?.last_donation_date;
    if (!raw) return "N/A";

    // Handles DATE/DATETIME/string
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);

    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }, [donor?.last_donation_date]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.welcome}>Welcome, {user?.name || "Donor"} 👋</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.card}>
          <Text style={styles.label}>Blood Group</Text>
          <Text style={styles.value}>{bloodGroup}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{donor?.phone || user?.phone || "N/A"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Last Donation Date</Text>
          <Text style={styles.value}>{formattedLastDonationDate}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16, paddingBottom: 24 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  logoutText: { color: COLORS.primary, fontWeight: "700" },
  errorText: { color: "#B91C1C", marginBottom: 10 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  label: { fontSize: 13, color: COLORS.muted, marginBottom: 6 },
  value: { fontSize: 20, fontWeight: "800", color: COLORS.text },
});