import { StyleSheet, Text, View } from "react-native";

export default function TimerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>タイマー</Text>
      <Text style={styles.description}>MVPでは準備中です。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7eef2",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    color: "#5a5961",
    fontWeight: "700",
  },
  description: {
    marginTop: 8,
    fontSize: 16,
    color: "#7f7b84",
  },
});