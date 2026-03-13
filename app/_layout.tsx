import { Stack } from "expo-router";
import { ScheduleProvider } from "../src/context/ScheduleContext";
import { NotificationDropBanner } from "../src/components/NotificationDropBanner";

export default function RootLayout() {
  return (
    <ScheduleProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <NotificationDropBanner />
    </ScheduleProvider>
  );
}

