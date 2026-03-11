import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";

const SPLASH_DURATION_MS = 2400;

export default function SplashRoute() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/campus-logo.png")}
        resizeMode="contain"
        style={styles.logo}
      />
      <Text style={styles.subText}>Campus Kanojo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8eef2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: "88%",
    maxWidth: 360,
    height: 180,
  },
  subText: {
    marginTop: 10,
    color: "#7e7481",
    fontSize: 18,
    letterSpacing: 1,
  },
});

