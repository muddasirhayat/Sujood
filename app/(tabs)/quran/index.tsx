import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card } from "@/src/components/ui";
import { SearchIcon } from "@/src/components/icons";
import { colors, fonts, shadows } from "@/src/theme/tokens";
import { SURAHS, searchSurahs } from "@/src/content/surahs";

export default function QuranList() {
  const [q, setQ] = useState("");
  const list = searchSurahs(q);

  return (
    <ScreenShell>
      <View style={styles.head}>
        <AppText style={styles.title}>Quran</AppText>
        <AppText style={styles.sub}>Arabic from Tanzil · Pickthall, 1930</AppText>
      </View>
      <View style={styles.searchWrap}>
        <SearchIcon />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search surahs"
          placeholderTextColor={colors.inkMuted}
          style={styles.search}
          accessibilityLabel="Search surahs"
        />
      </View>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <Card padded={false}>
          {list.map((s, i) => (
            <Pressable
              key={s.number}
              onPress={() => router.push(`/quran/${s.number}`)}
              style={[styles.row, i < list.length - 1 && styles.border]}
              accessibilityRole="button"
              accessibilityLabel={`${s.name}, ${s.ayahs} ayahs, ${s.revelation}`}
            >
              <View style={styles.num}><AppText style={styles.numTxt}>{s.number}</AppText></View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.name}>{s.name}</AppText>
                <AppText style={styles.meta}>{s.ayahs} ayahs · {s.revelation}</AppText>
              </View>
              <AppText style={styles.ar}>{s.arabic}</AppText>
            </Pressable>
          ))}
        </Card>
        <View style={{ height: 16 }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 6 },
  title: { fontFamily: fonts.extra, fontSize: 32, color: colors.ink, letterSpacing: -0.6 },
  sub: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  searchWrap: {
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 48,
    boxShadow: shadows.soft,
  },
  search: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.ink, paddingVertical: 8 },
  pad: { paddingHorizontal: 20, paddingBottom: 20 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, gap: 10 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  num: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.sageSoft, alignItems: "center", justifyContent: "center" },
  numTxt: { fontFamily: fonts.semi, fontSize: 13, color: colors.sageDark },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkSoft, marginTop: 1 },
  ar: { fontFamily: "NotoNaskhArabic_700Bold", fontSize: 16, color: colors.sageDark, writingDirection: "rtl", textAlign: "right", maxWidth: 140 },
});
