import { useEffect } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Pill, SageButton } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts } from "@/src/theme/tokens";
import { PRAYER_NAMES, formatTime, type PrayerId, SALAH_IDS } from "@/src/prayer/times";
import { playAzan, stopAzan } from "@/src/audio/sounds";

const mihrab = require("@/assets/images/azan-mihrab.png");

export default function AzanScreen() {
  const params = useLocalSearchParams<{ prayer?: string; test?: string }>();
  const { today, state, next } = useApp();
  const tz = state.location.timezone;
  const requested = (params.prayer ?? next?.id ?? "fajr") as PrayerId;
  const prayer = (SALAH_IDS as string[]).includes(requested) ? (requested as Exclude<PrayerId, "sunrise">) : "fajr";
  const time = today ? formatTime(today[prayer], tz) : "";
  const sound = state.alerts.perPrayer[prayer]?.sound ?? "classic";

  useEffect(() => {
    void playAzan(sound);
    return () => {
      void stopAzan();
    };
  }, [sound]);

  const dismiss = () => {
    void stopAzan();
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };

  const snooze = () => {
    void stopAzan();
    dismiss();
  };

  return (
    <ScreenShell timeOverride={time ? time.replace(/^0/, "") : undefined}>
      <View style={styles.wrap}>
        <Image source={mihrab} style={styles.art} resizeMode="contain" />
        <Pill label={`${PRAYER_NAMES[prayer]} · ${time}`} tone="cream" style={styles.pill} textStyle={styles.pillText} />
        <AppText style={styles.name}>{PRAYER_NAMES[prayer]}</AppText>
        <AppText style={styles.sub}>It is time to pray</AppText>
        <SageButton label="I am praying" onPress={dismiss} style={styles.btn} />
        <Pressable onPress={snooze} style={styles.snooze} accessibilityRole="button">
          <AppText style={styles.snoozeText}>Remind me in 10 minutes</AppText>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 0 },
  art: { width: "108%", height: 430, marginTop: 0 },
  pill: { marginTop: 4, backgroundColor: colors.card, paddingHorizontal: 14, paddingVertical: 6 },
  pillText: { fontFamily: fonts.semi, fontSize: 12.5, color: colors.inkSoft },
  name: { fontFamily: fonts.extra, fontSize: 52, color: colors.ink, marginTop: 12, letterSpacing: -1 },
  sub: { fontFamily: fonts.medium, fontSize: 18, color: colors.sageDark, marginTop: 2, marginBottom: 24 },
  btn: { alignSelf: "stretch" },
  snooze: { paddingVertical: 16 },
  snoozeText: { fontFamily: fonts.semi, fontSize: 15, color: colors.sageDark },
});
