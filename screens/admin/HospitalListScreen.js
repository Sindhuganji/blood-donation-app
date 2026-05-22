import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import api from '../../utils/api';

const COLORS = {
  primary: "#E53935",
  background: "#F5F6FA",
  card: "#FFFFFF",
  text: "#333",
  muted: "#8A8F98",
};

export default function HospitalListScreen() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/hospitals");
        setHospitals(res.data?.data || []);
      } catch (e) {
        console.log("Hospitals fetch error:", e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>Hospitals</Text>
        {hospitals.length === 0 ? (
          <Text style={styles.empty}>No data available</Text>
        ) : (
          <FlatList
            data={hospitals}
            keyExtractor={(item) => String(item.hospital_id)}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>Location: {item.location}</Text>
                <Text style={styles.meta}>Contact: {item.contact}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 14 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 10 },
  card: {
    backgroundColor: COLORS.card,
    marginVertical: 6,
    padding: 14,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  meta: { color: COLORS.muted },
  empty: { textAlign: "center", marginTop: 30, color: COLORS.muted },
});