import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const statusColor = {
  Pending: "#D97706",
  Accepted: "#2563EB",
  Completed: "#16A34A",
};

export default function MyRequestsScreen({ navigation }) {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const loadRequests = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await api.get(`/patient/requests/${user.user_id}`);
      setData(res.data?.data || []);
    } catch (e) {
      console.log("MyRequests error:", e?.response?.data || e.message);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [user?.user_id]),
  );

  const filtered = useMemo(() => {
    return data
      .filter((r) => (filter === "All" ? true : r.status === filter))
      .filter((r) =>
        `${r.blood_group} ${r.hospital} ${r.location}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
  }, [data, filter, search]);

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#E53935" />
    );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>My Requests</Text>

        <TextInput
          placeholder="Search by blood group / hospital / location"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <View style={styles.filters}>
          {["All", "Pending", "Accepted", "Completed"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 ? (
          <Text style={styles.empty}>No requests yet</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.request_id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadRequests(true)}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate("RequestDetails", {
                    requestId: item.request_id,
                  })
                }
              >
                <Text style={styles.title}>
                  {item.blood_group} • {item.units} unit(s)
                </Text>
                <Text style={styles.meta}>{item.hospital}</Text>
                <Text style={styles.meta}>{item.location}</Text>
                <Text
                  style={[
                    styles.status,
                    { color: statusColor[item.status] || "#333" },
                  ]}
                >
                  {item.status}
                </Text>
                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6FA" },
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "800", color: "#333", marginBottom: 8 },
  search: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  filters: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  filterBtnActive: { backgroundColor: "#E53935", borderColor: "#E53935" },
  filterText: { color: "#374151", fontWeight: "600" },
  filterTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#333" },
  meta: { color: "#6B7280", marginTop: 2 },
  status: { fontWeight: "700", marginTop: 6 },
  date: { color: "#9CA3AF", marginTop: 4, fontSize: 12 },
  empty: { textAlign: "center", marginTop: 30, color: "#8A8F98" },
});
