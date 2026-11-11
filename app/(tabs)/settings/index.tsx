import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, SageButton, SectionLabel, Toggle } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts } from "@/src/theme/tokens";
import { SALAH_IDS, PRAYER_NAMES, METHODS } from "@/src/prayer/times";
import { openExactAlarmSettings, openBatterySettings } from "@/src/notifications/sync";
import type { AzanSound } from "@/src/prayer/schedule";

const SOUND_LABEL: Record<AzanSound, string> = { dawn: "Soft dawn", classic: "Classic", dusk: "Soft dusk" };
const SOUND_CYCLE: AzanSound[] = ["dawn", "classic", "dusk"];

export default function SettingsScreen() {
  const { state, setPrayerAlert, setOffset } = useApp();
  const methodName = METHODS.find((m) => m.id === state.method)?.name ?? state.method;
  // short name for subtitle as in mockup: "University of Islamic Sciences"
  const shortMethod = state.method === "Karachi" ? "University of Islamic Sciences" : methodName;

  const cycleSound = (id: typeof SALAH_IDS[number]) => {
    const cur = state.alerts.perPrayer[id].sound;
    const next = SOUND_CYCLE[(SOUND_CYCLE.indexOf(cur) + 1) % SOUND_CYCLE.length]!;
    setPrayerAlert(id, { sound: next });
  };

  return (
    <ScreenShell>
      <View style={styles.head}>
        <AppText style={styles.title}>Settings</AppText>
        <AppText style={styles.sub}>{state.location.label} · {shortMethod}</AppText>
      </View>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <SectionLabel>Azan sound per prayer</SectionLabel>
        <Card padded={false} style={{ marginBottom: 14 }}>
          {SALAH_IDS.map((id, i) => {
            const pref = state.alerts.perPrayer[id];
            return (
              <View key={id} style={[styles.row, i < SALAH_IDS.length - 1 && styles.border]}>
                <Pressable onPress={() => cycleSound(id)} style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={`${PRAYER_NAMES[id]} sound`}>
                  <AppText style={styles.name}>{PRAYER_NAMES[id]}</AppText>
                  <AppText style={styles.meta}>{SOUND_LABEL[pref.sound]}</AppText>
                </Pressable>
                <Toggle value={pref.enabled} onValueChange={(v) => setPrayerAlert(id, { enabled: v })} accessibilityLabel={`${PRAYER_NAMES[id]} Azan`} />
              </View>
            );
          })}
        </Card>
        <SageButton label="Test Azan" small onPress={() => router.push({ pathname: "/azan", params: { test: "1" } })} style={{ marginBottom: 10, height: 46 }} />

        <SectionLabel>Mosque offsets (minutes)</SectionLabel>
        <Card padded={false} style={{ marginBottom: 12 }}>
          {SALAH_IDS.map((id, i) => (
            <View key={id} style={[styles.row, i < SALAH_IDS.length - 1 && styles.border]}>
              <AppText style={[styles.name, { flex: 1 }]}>{PRAYER_NAMES[id]}</AppText>
              <View style={styles.stepper}>
                <Pressable onPress={() => setOffset(id, state.offsets[id] - 1)} style={styles.stepBtn} accessibilityLabel={`Decrease ${PRAYER_NAMES[id]} offset`}>
                  <AppText style={styles.stepTxt}>−</AppText>
                </Pressable>
                <AppText style={styles.offset}>{state.offsets[id]}</AppText>
                <Pressable onPress={() => setOffset(id, state.offsets[id] + 1)} style={styles.stepBtn} accessibilityLabel={`Increase ${PRAYER_NAMES[id]} offset`}>
                  <AppText style={styles.stepTxt}>+</AppText>
                </Pressable>
              </View>
            </View>
          ))}
        </Card>

        <SectionLabel>On this phone</SectionLabel>
        <Card padded={false} style={{ marginBottom: 12 }}>
          <Pressable onPress={() => void openExactAlarmSettings()} style={[styles.block, styles.border]}>
            <AppText style={styles.blockTitle}>Allow exact alarms</AppText>
            <AppText style={styles.blockSub}>Opens Alarms and reminders so the Azan can arrive on time.</AppText>
          </Pressable>
          <Pressable onPress={() => void openBatterySettings()} style={styles.block}>
            <AppText style={styles.blockTitle}>Ignore battery optimisation</AppText>
            <AppText style={styles.blockSub}>Stops some phones from silencing alerts while asleep.</AppText>
          </Pressable>
        </Card>

        <Pressable onPress={() => router.push("/settings/alerts")} style={styles.linkRow} accessibilityRole="button">
          <AppText style={styles.link}>Alerts and reminders</AppText>
          <AppText style={styles.chev}>›</AppText>
        </Pressable>
        <Pressable onPress={() => router.push("/settings/about")} style={styles.linkRow} accessibilityRole="button">
          <AppText style={styles.link}>About and credits</AppText>
          <AppText style={styles.chev}>›</AppText>
        </Pressable>
        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingTop: 2, paddingBottom: 4 },
  title: { fontFamily: fonts.extra, fontSize: 30, color: colors.ink, letterSpacing: -0.6 },
  sub: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  pad: { paddingHorizontal: 20, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 6 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft, marginTop: 1 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.sageSoft, alignItems: "center", justifyContent: "center" },
  stepTxt: { fontFamily: fonts.semi, fontSize: 16, color: colors.sageDark, marginTop: -1 },
  offset: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, width: 28, textAlign: "center" },
  block: { paddingHorizontal: 18, paddingVertical: 9 },
  blockTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  blockSub: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 2, lineHeight: 18 },
  linkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 6 },
  link: { fontFamily: fonts.semi, fontSize: 15.5, color: colors.ink },
  chev: { fontFamily: fonts.medium, fontSize: 22, color: colors.inkMuted },
});
