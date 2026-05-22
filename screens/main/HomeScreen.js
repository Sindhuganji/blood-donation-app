import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BloodConnect Home</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("DonorList")}
      >
        <Text style={styles.btnText}>View Donors</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("RequestBlood")}
      >
        <Text style={styles.btnText}>Request Blood</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Availability")}
      >
        <Text style={styles.btnText}>Check Availability</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#E53935",
  },
  btn: {
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
