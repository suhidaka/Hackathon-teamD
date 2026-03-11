import { StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>設定</Text>
      <Text style={styles.description}>将来的な設定項目をここに追加します。</Text>
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