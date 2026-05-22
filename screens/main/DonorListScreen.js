import {
  useEffect,
  useState,
} from 'react';

import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import api from '../../utils/api';

export default function DonorListScreen() {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const res = await api.get("/donors");
      setDonors(res.data.donors || []);
    } catch (error) {
      console.log("DONORS ERROR:", error?.response?.data || error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donor List</Text>
      <FlatList
        data={donors}
        keyExtractor={(item) => String(item.donor_id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Blood Group: {item.blood_group}</Text>
            <Text>Phone: {item.phone}</Text>
            <Text>Health: {item.health_status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E53935",
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "700" },
});
