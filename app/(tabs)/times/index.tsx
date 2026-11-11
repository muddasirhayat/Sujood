import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, BackButton } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts, shadows } from "@/src/theme/tokens";
import {
  computeMonth,
  formatTime,
  monthDays,
  monthNameLong,
  weekdayShort,
  weekdaySundayZero,
  SALAH_IDS,
  PRAYER_NAMES,
} from "@/src/prayer/times";
import { toHijri, formatHijri, ymdInZone } from "@/src/prayer/hijri";
import type { DayTimes } from "@/src/prayer/times";

export default function TimesScreen() {
  const { state, now } = useApp();
  const tz = state.location.timezone;
  const todayYmd = ymdInZone(now, tz);
  const [cursor, setCursor] = useState({ year: todayYmd.year, month: todayYmd.month });
  const [selected, setSelected] = useState(todayYmd.day);

  const days = useMemo(
    () => computeMonth(cursor.year, cursor.month, state.location.latitude, state.location.longitude, state.method, state.madhab, state.offsets),
    [cursor, state.location.latitude, state.location.longitude, state.method, state.madhab, state.offsets],
  );
  const nDays = monthDays(cursor.year, cursor.month);
  const startWd = weekdaySundayZero(cursor.year, cursor.month, 1, tz);
  const sel = Math.min(selected, nDays);
  const selTimes = days[sel - 1];
  const selHijri = toHijri(cursor.year, cursor.month, sel);
  const monthHijri = toHijri(cursor.year, cursor.month, todayYmd.month === cursor.month ? todayYmd.day : 15);
  const isThisMonth = cursor.year === todayYmd.year && cursor.month === todayYmd.month;

  // table window: from today-2 to today+4, or selected-centred
  const tableStart = Math.max(1, (isThisMonth ? todayYmd.day : sel) - 2);
  const tableDays = days.filter((d) => d.date.day >= tableStart).slice(0, 6);

  return (
    <ScreenShell>
      <View style={styles.head}>
        <BackButton onPress={() => router.push("/home")} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <AppText style={styles.title}>{monthNameLong(cursor.month)} {cursor.year}</AppText>
          <AppText style={styles.sub}>{monthHijri.monthName} {monthHijri.year} · {state.location.label}, {state.madhab}</AppText>
        </View>
        <Pressable onPress={() => router.push("/times/qibla")} style={styles.qiblaBtn} accessibilityRole="button" accessibilityLabel="Qibla">
          <AppText style={styles.qiblaTxt}>Qibla</AppText>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <Card style={{ marginBottom: 12 }} contentStyle={{ paddingHorizontal: 10, paddingVertical: 10 }}>
          <View style={styles.wdRow}>
            {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
              <AppText key={i} style={styles.wd}>{l}</AppText>
            ))}
          </View>
          <View style={styles.cal}>
            {Array.from({ length: startWd }, (_, i) => <View key={"e" + i} style={styles.cell} />)}
            {Array.from({ length: nDays }, (_, i) => {
              const d = i + 1;
              const on = d === sel;
              const isToday = isThisMonth && d === todayYmd.day;
              return (
                <Pressable key={d} onPress={() => setSelected(d)} style={styles.cell}>
                  <View style={[styles.day, on && styles.dayOn]}>
                    <AppText style={[styles.dayTxt, on && styles.dayTxtOn, isToday && !on && styles.todayTxt]}>{d}</AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {selTimes ? <DayCard times={selTimes} hijri={selHijri} tz={tz} /> : null}

        <Card padded={false} style={{ marginTop: 12 }}>
          <View style={[styles.tRow, styles.tHead]}>
            <AppText style={[styles.tCell, styles.tLabel, { flex: 1.15 }]}>Day</AppText>
            {SALAH_IDS.map((id) => (
              <AppText key={id} style={[styles.tCell, styles.tLabel]}>{PRAYER_NAMES[id]}</AppText>
            ))}
          </View>
          {tableDays.map((t) => {
            const on = t.date.day === (isThisMonth ? todayYmd.day : sel);
            const wd = weekdayShort(t.date.year, t.date.month, t.date.day, tz);
            return (
              <View key={t.date.day} style={[styles.tRow, on && styles.tOn]}>
                <AppText style={[styles.tCell, styles.tDay, { flex: 1.15 }]}>{t.date.day} {wd}</AppText>
                {SALAH_IDS.map((id) => (
                  <AppText key={id} style={[styles.tCell, on && styles.tOnTxt]}>{formatTime(t[id], tz)}</AppText>
                ))}
              </View>
            );
          })}
        </Card>
        <View style={{ height: 16 }} />
      </ScrollView>
    </ScreenShell>
  );
}

function DayCard({ times, hijri, tz }: { times: DayTimes; hijri: ReturnType<typeof toHijri>; tz: string }) {
  const wd = weekdayShort(times.date.year, times.date.month, times.date.day, tz);
  // "Thursday 12" — use long weekday
  const names: Record<string, string> = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };
  const title = `${names[wd] ?? wd} ${times.date.day}`;
  const items: Array<{ id: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha" }> = [
    { id: "fajr" }, { id: "sunrise" }, { id: "dhuhr" }, { id: "asr" }, { id: "maghrib" }, { id: "isha" },
  ];
  return (
    <Card>
      <View style={styles.dayHead}>
        <AppText style={styles.dayTitle}>{title}</AppText>
        <AppText style={styles.dayHijri}>{formatHijri(hijri, "day-month")}</AppText>
      </View>
      <View style={styles.grid3}>
        {items.map((it) => (
          <View key={it.id} style={styles.gCell}>
            <AppText style={styles.gLabel}>{PRAYER_NAMES[it.id]}</AppText>
            <AppText style={styles.gTime}>{formatTime(times[it.id], tz)}</AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  title: { fontFamily: fonts.extra, fontSize: 26, color: colors.ink, letterSpacing: -0.4 },
  sub: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft, marginTop: 1 },
  qiblaBtn: { backgroundColor: colors.sageSoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  qiblaTxt: { fontFamily: fonts.semi, fontSize: 13, color: colors.sageDark },
  pad: { paddingHorizontal: 20, paddingBottom: 8 },
  wdRow: { flexDirection: "row", marginBottom: 4 },
  wd: { flex: 1, textAlign: "center", fontFamily: fonts.semi, fontSize: 12, color: colors.inkMuted },
  cal: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", height: 36, alignItems: "center", justifyContent: "center" },
  day: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  dayOn: { backgroundColor: colors.sage },
  dayTxt: { fontFamily: fonts.semi, fontSize: 15, color: colors.ink },
  dayTxtOn: { color: colors.white },
  todayTxt: { color: colors.sage },
  dayHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  dayTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  dayHijri: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft },
  grid3: { flexDirection: "row", flexWrap: "wrap" },
  gCell: { width: "33.33%", paddingVertical: 6 },
  gLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkSoft },
  gTime: { fontFamily: fonts.extra, fontSize: 20, color: colors.ink, marginTop: 2, letterSpacing: -0.3 },
  tRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 7 },
  tHead: { paddingTop: 12 },
  tOn: { backgroundColor: colors.sageSoft, borderRadius: 10, marginHorizontal: 6 },
  tCell: { flex: 1, fontFamily: fonts.medium, fontSize: 11.5, color: colors.inkSoft, textAlign: "center" },
  tLabel: { fontFamily: fonts.semi, fontSize: 11, color: colors.inkMuted },
  tDay: { textAlign: "left", fontFamily: fonts.bold, fontSize: 12.5, color: colors.ink, paddingLeft: 4 },
  tOnTxt: { color: colors.ink, fontFamily: fonts.semi },
});
