import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";

export function ConversationBox({
  name,
  message,
  style,
}: {
  name: string;
  message: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.nameBadge}>
        <Text style={styles.nameText}>{name}</Text>
      </View>
      <View style={styles.box}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
  },
  nameBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f5bdd8",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: "#ed9fc6",
  },
  nameText: {
    color: "#5f4e5b",
    fontSize: 22,
    fontWeight: "700",
  },
  box: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ed9fc6",
    backgroundColor: "#f7c9e2",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  message: {
    color: "#2e2730",
    fontSize: 18,
    lineHeight: 30,
  },
});