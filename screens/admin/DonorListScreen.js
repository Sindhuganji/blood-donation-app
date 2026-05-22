import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
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

export default function DonorListScreen() {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/donors");
        setDonors(res.data?.data || []);
      } catch (e) {
        console.log("Donor fetch error:", e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return donors;
    return donors.filter((d) =>
      `${d.name} ${d.blood_group} ${d.phone}`.toLowerCase().includes(q)
    );
  }, [search, donors]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>Donor List</Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name / blood group / phone"
          style={styles.search}
          placeholderTextColor="#9CA3AF"
        />

        {filtered.length === 0 ? (
          <Text style={styles.empty}>No data available</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.donor_id)}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>Blood Group: {item.blood_group}</Text>
                <Text style={styles.meta}>Phone: {item.phone}</Text>
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
  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
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
  meta: { color: COLORS.muted, fontSize: 14 },
  empty: { textAlign: "center", marginTop: 30, color: COLORS.muted },
});