import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const BANNER_HIDE_DELAY_MS = 5000;
const BANNER_HEIGHT = 96;
const HIDDEN_Y = -(BANNER_HEIGHT + 32);

export function NotificationDropBanner() {
  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visible, setVisible] = useState(false);

  const showBanner = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    setVisible(true);
    translateY.stopAnimation();
    Animated.timing(translateY, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      hideTimerRef.current = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: HIDDEN_Y,
          duration: 220,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
        });
      }, BANNER_HIDE_DELAY_MS);
    });
  }, [translateY]);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((event) => {
      const content = event.request.content;
      setTitle(content.title ?? "通知");
      setBody(content.body ?? "");
      showBanner();
    });

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      translateY.stopAnimation();
      subscription.remove();
    };
  }, [showBanner, translateY]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.banner,
          {
            transform: [{ translateY }],
            top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 8,
          },
        ]}
      >
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={2} style={styles.body}>
          {body}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  banner: {
    position: "absolute",
    left: 12,
    right: 12,
    minHeight: BANNER_HEIGHT,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff6fb",
    borderWidth: 1,
    borderColor: "#efbfd8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#593949",
  },
  body: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#4b3d45",
  },
});
