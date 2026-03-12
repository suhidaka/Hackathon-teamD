import { router } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8eef2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  logo: {
    width: "140%",
    height: 460,
  },
});


