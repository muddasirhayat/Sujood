import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, ScreenHeader, SectionLabel, Toggle } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts } from "@/src/theme/tokens";

export default function AlertsScreen() {
  const { state, setAlerts } = useApp();
  const a = state.alerts;
  return (
    <ScreenShell>
      <ScreenHeader title="Alerts" subtitle="Azan, daily reminders, Ramadan" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <SectionLabel>Azan</SectionLabel>
        <Card padded={false} style={{ marginBottom: 22 }}>
          <Row title="Azan alerts" sub="At each prayer time" value={a.azanEnabled} on={ (v) => setAlerts({ azanEnabled: v }) } last={false} />
          <Row title="Pre-prayer reminder" sub="15 minutes before" value={a.preReminder} on={ (v) => setAlerts({ preReminder: v }) } last />
        </Card>

        <SectionLabel>Daily reminders</SectionLabel>
        <Card padded={false} style={{ marginBottom: 22 }}>
          <Row title="Daily ayah" sub="After Fajr" value={a.dailyAyah} on={ (v) => setAlerts({ dailyAyah: v }) } last={false} />
          <Row title="Hadith of the day" sub="Mid-morning" value={a.dailyHadith} on={ (v) => setAlerts({ dailyHadith: v }) } last={false} />
          <Row title="Jumu'ah reminder" sub="Friday at 11:30" value={a.jumuah} on={ (v) => setAlerts({ jumuah: v }) } last />
        </Card>

        <SectionLabel>Ramadan</SectionLabel>
        <Card padded={false} style={{ marginBottom: 16 }}>
          <Row title="Suhoor" sub="On during Ramadan" value={a.suhoor} on={ (v) => setAlerts({ suhoor: v }) } last={false} />
          <Row title="Iftar" sub="On during Ramadan" value={a.iftar} on={ (v) => setAlerts({ iftar: v }) } last />
        </Card>
        <AppText style={styles.foot}>Exact-alarm and battery settings are in Settings. Suhoor and Iftar turn on automatically when the Hijri month is Ramadan.</AppText>
        <View style={{ height: 16 }} />
      </ScrollView>
    </ScreenShell>
  );
}

function Row({ title, sub, value, on, last }: { title: string; sub: string; value: boolean; on: (v: boolean) => void; last: boolean }) {
  return (
    <View style={[styles.row, !last && styles.border]}>
      <View style={{ flex: 1 }}>
        <AppText style={styles.name}>{title}</AppText>
        <AppText style={styles.meta}>{sub}</AppText>
      </View>
      <Toggle value={value} onValueChange={on} accessibilityLabel={title} />
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingBottom: 20 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 13 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft, marginTop: 1 },
  foot: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18, paddingHorizontal: 6 },
});
