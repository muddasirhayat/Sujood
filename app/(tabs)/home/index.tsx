import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, Pill } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts, shadows, radii } from "@/src/theme/tokens";
import { formatTime, formatRemaining, PRAYER_NAMES, SALAH_IDS, weekdayLong, monthNameLong } from "@/src/prayer/times";
import { formatHijri, ymdInZone } from "@/src/prayer/hijri";
import { DAILY_DUA } from "@/src/content/quran";
import { NAMES } from "@/src/content/names";
import { BOOKS } from "@/src/content/books";

export default function HomeScreen() {
  const { state, today, next, now, hijri, clockLabel } = useApp();
  const tz = state.location.timezone;
  const { year, month, day } = ymdInZone(now, tz);
  const weekday = weekdayLong(year, month, day, tz);
  const dateLine = `${weekday} ${day} ${monthNameLong(month)}`;
  const hijriLine = hijri ? `${formatHijri(hijri)} · ${state.location.label}` : state.location.label;
  const currentId = next?.id;

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <AppText style={styles.date}>{dateLine}</AppText>
        <View style={styles.titleRow}>
          <AppText style={styles.brand}>Sujood</AppText>
          <Pill label={state.madhab} />
        </View>
        <AppText style={styles.hijri}>{hijriLine}</AppText>

        <Card style={styles.nextCard} contentStyle={styles.nextInner}>
          <View style={styles.nextTop}>
            <Pill label="Next prayer" tone="gold" />
            <AppText style={styles.remain}>{next ? formatRemaining(next.remainingMs) : "—"}</AppText>
          </View>
          <View style={styles.nextBottom}>
            <View>
              <AppText style={styles.prayerName}>{next?.name ?? "Fajr"}</AppText>
              <AppText style={styles.atTime}>at {next?.startsAt ?? "—"}</AppText>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <AppText style={styles.nowTime}>{formatClock(clockLabel)}</AppText>
              <AppText style={styles.nowLabel}>now</AppText>
            </View>
          </View>
        </Card>

        <Card style={styles.rowCard} padded={false}>
          <View style={styles.salahRow}>
            {SALAH_IDS.map((id) => {
              const on = currentId === id;
              const time = today ? formatTime(today[id], tz) : "—";
              return (
                <View key={id} style={[styles.salahCell, on && styles.salahOn]}>
                  <AppText style={[styles.salahName, on && styles.salahNameOn]}>{PRAYER_NAMES[id]}</AppText>
                  <AppText style={[styles.salahTime, on && styles.salahTimeOn]}>{time}</AppText>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={styles.duaCard}>
          <View style={styles.duaTop}>
            <AppText style={styles.duaEyebrow}>Daily dua</AppText>
            <AppText style={styles.duaRef}>{DAILY_DUA.ref}</AppText>
          </View>
          <AppText style={styles.duaText}>{DAILY_DUA.text}</AppText>
          <AppText style={styles.duaCredit}>{DAILY_DUA.credit}</AppText>
        </Card>

        <View style={styles.grid}>
          <Tile title="Tasbih" sub={tasbihSub(state.tasbih.count, state.tasbih.target)} onPress={() => router.push("/home/tasbih")} />
          <Tile title="99 Names" sub={NAMES[0]!.transliteration} onPress={() => router.push("/home/names")} />
          <Tile title="Calendar" sub={hijri ? `${hijri.day} ${hijri.month === 6 ? "Jumada II" : hijri.monthShort}` : "Hijri"} onPress={() => router.push("/times")} />
          <Tile title="Mosques" sub={`Near ${state.location.label}`} onPress={() => router.push("/home/mosques")} />
          <Tile title="Hadith" sub="Of the day" onPress={() => router.push("/library/hadith")} />
          <Tile title="Books" sub={`${BOOKS.length} in library`} onPress={() => router.push("/library")} />
        </View>
        <View style={{ height: 4 }} />
      </ScrollView>
    </ScreenShell>
  );
}

function tasbihSub(count: number, target: number) {
  return `${count} of ${target}`;
}

function formatClock(label: string) {
  // clockLabel is "4:52"; the next-prayer card in the mockup uses "04:52" with a leading zero
  const [h, m] = label.split(":");
  return `${String(h).padStart(2, "0")}:${m}`;
}

function Tile({ title, sub, onPress }: { title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={styles.tile}>
      <AppText style={styles.tileTitle}>{title}</AppText>
      <AppText style={styles.tileSub}>{sub}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 2, paddingBottom: 8 },
  date: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.inkSoft },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 1 },
  brand: { fontFamily: fonts.extra, fontSize: 34, color: colors.ink, letterSpacing: -0.8 },
  hijri: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 1, marginBottom: 10 },
  nextCard: { marginBottom: 10 },
  nextInner: { paddingVertical: 14, paddingHorizontal: 18 },
  nextTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  remain: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.inkSoft },
  nextBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 },
  prayerName: { fontFamily: fonts.extra, fontSize: 38, color: colors.ink, letterSpacing: -0.8, lineHeight: 42 },
  atTime: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.inkSoft, marginTop: 1 },
  nowTime: { fontFamily: fonts.extra, fontSize: 34, color: colors.sage, letterSpacing: -0.6, lineHeight: 38 },
  nowLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 1 },
  rowCard: { marginBottom: 10 },
  salahRow: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 8, alignItems: "center" },
  salahCell: { flex: 1, alignItems: "center", paddingVertical: 6, borderRadius: 14 },
  salahOn: { backgroundColor: colors.sageSoft },
  salahName: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.inkSoft },
  salahNameOn: { color: colors.sageDark, fontFamily: fonts.semi },
  salahTime: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.ink, marginTop: 2 },
  salahTimeOn: { color: colors.sageDark },
  duaCard: { marginBottom: 10 },
  duaTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  duaEyebrow: { fontFamily: fonts.semi, fontSize: 11, letterSpacing: 1.1, color: colors.inkMuted, textTransform: "uppercase" },
  duaRef: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft },
  duaText: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, lineHeight: 22 },
  duaCredit: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted, marginTop: 8, fontStyle: "italic" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    boxShadow: shadows.card,
    minHeight: 76,
    justifyContent: "center",
  },
  tileTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  tileSub: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 3 },
});
