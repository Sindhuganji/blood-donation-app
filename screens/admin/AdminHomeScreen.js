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
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const COLORS = {
  primary: "#E53935",
  background: "#F5F6FA",
  card: "#FFFFFF",
  text: "#333",
  muted: "#8A8F98",
};

export default function AdminHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ requests: 0, donors: 0, hospitals: 0 });

  const loadStats = async () => {
    try {
      setLoading(true);
      const [r1, r2, r3] = await Promise.all([
        api.get("/admin/requests"),
        api.get("/admin/donors"),
        api.get("/admin/hospitals"),
      ]);

      setStats({
        requests: r1.data?.data?.length || 0,
        donors: r2.data?.data?.length || 0,
        hospitals: r3.data?.data?.length || 0,
      });
    } catch (e) {
      console.log("Dashboard load error:", e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

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

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={styles.welcome}>Welcome, {user?.name || "Admin"} 👋</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
        ) : (
          <>
            <StatCard title="Total Requests" value={stats.requests} />
            <StatCard title="Total Donors" value={stats.donors} />
            <StatCard title="Total Hospitals" value={stats.hospitals} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ title, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
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
  welcome: { fontSize: 22, fontWeight: "800", color: COLORS.text, flex: 1, marginRight: 10 },
  logout: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardTitle: { fontSize: 13, color: COLORS.muted, marginBottom: 6 },
  cardValue: { fontSize: 30, fontWeight: "800", color: COLORS.text },
});