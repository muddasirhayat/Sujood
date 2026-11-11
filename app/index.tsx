import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts } from "@/src/theme/tokens";

const logo = require("@/assets/images/splash-logo.png");

export default function Splash() {
  const { ready, state } = useApp();
  const params = useLocalSearchParams<{ stay?: string }>();
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeld(true), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || !held) return;
    if (params.stay) return;
    if (state.onboardingComplete) router.replace("/home");
    else router.replace("/onboarding");
  }, [ready, held, state.onboardingComplete, params.stay]);

  return (
    <ScreenShell>
      <View style={styles.center} accessibilityLabel="Sujood. Prayer, calmly.">
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <AppText style={styles.title}>Sujood</AppText>
        <AppText style={styles.tag}>Prayer, calmly.</AppText>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 },
  logo: { width: 236, height: 236, marginBottom: 28 },
  title: { fontFamily: fonts.extra, fontSize: 42, color: colors.ink, letterSpacing: -0.8 },
  tag: { fontFamily: fonts.medium, fontSize: 18, color: colors.inkSoft, marginTop: 8 },
});
