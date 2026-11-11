import { useEffect, type ReactNode } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_500Medium,
  NotoNaskhArabic_600SemiBold,
  NotoNaskhArabic_700Bold,
} from "@expo-google-fonts/noto-naskh-arabic";
import { AppProvider } from "@/src/state/AppProvider";
import { colors } from "@/src/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_500Medium,
    NotoNaskhArabic_600SemiBold,
    NotoNaskhArabic_700Bold,
  });

  useEffect(() => {
    if (!loaded) return;
    SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    let sub: { remove: () => void } | undefined;
    void (async () => {
      try {
        const Notifications = await import("expo-notifications");
        const { router } = await import("expo-router");
        sub = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as { kind?: string; prayer?: string };
          if (data?.kind === "azan") router.push({ pathname: "/azan", params: { prayer: data.prayer ?? "fajr" } });
        });
      } catch {
        /* ignore */
      }
    })();
    return () => sub?.remove();
  }, []);

  if (!loaded) return <View style={styles.boot} />;

  return (
    <GestureHandlerRootView style={styles.boot}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <PhoneFrame>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: colors.cream },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="azan" options={{ animation: "fade", gestureEnabled: false, presentation: "fullScreenModal" }} />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </PhoneFrame>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== "web" || width < 560) return <>{children}</>;
  const frameHeight = Math.min(height - 32, 900);
  return (
    <View style={styles.desk}>
      <View style={[styles.phone, { height: frameHeight }]}>
        <View style={styles.phoneInner}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.cream },
  desk: { flex: 1, backgroundColor: "#E8D5C4", alignItems: "center", justifyContent: "center" },
  phone: {
    width: 390,
    maxWidth: "100%",
    backgroundColor: colors.cream,
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  phoneInner: { flex: 1 },
});
