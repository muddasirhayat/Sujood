import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, Pill, ScreenHeader } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts } from "@/src/theme/tokens";
import { surahByNumber } from "@/src/content/surahs";
import { readerAyahs, pickthallSurah } from "@/src/content/quran";

export default function QuranReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const num = Math.max(1, Math.min(114, Number(id) || 1));
  const meta = surahByNumber(num);
  const { state, setTranslationOn } = useApp();
  const ayahs = readerAyahs(num, "pickthall");
  const pick = pickthallSurah(num);
  const englishTitle = pick?.aligned ? englishOpening(num) : null;

  return (
    <ScreenShell>
      <ScreenHeader
        title={meta.name}
        subtitle={`${num}. ${englishTitle ?? meta.name} · ${meta.ayahs} ayahs · ${meta.revelation}`}
        onBack={() => router.back()}
      />
      <View style={styles.tools}>
        <Pill label="Pickthall, 1930" />
        <Pressable onPress={() => setTranslationOn(!state.translationOn)} accessibilityRole="button">
          <AppText style={styles.toggle}>{state.translationOn ? "Translation on" : "Translation off"}</AppText>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <Card padded={false}>
          {ayahs.map((a, i) => (
            <View key={a.number} style={[styles.ayah, i < ayahs.length - 1 && styles.border]}>
              <View style={styles.ayahHead}>
                <View style={styles.num}><AppText style={styles.numTxt}>{a.number}</AppText></View>
                <AppText style={styles.arabic}>{a.arabic}</AppText>
              </View>
              {state.translationOn ? (
                a.translation ? (
                  <AppText style={styles.tr}>{a.translation}</AppText>
                ) : (
                  <AppText style={styles.pending}>The 1930 Pickthall English for this ayah is not in the proofread set bundled with Sujood. The Arabic is from the Tanzil Project.</AppText>
                )
              ) : null}
            </View>
          ))}
        </Card>
        <AppText style={styles.credit}>Arabic Quran text from the Tanzil Project (tanzil.net), CC BY 3.0, verbatim. English: Marmaduke Pickthall, 1930, public domain.</AppText>
        <View style={{ height: 16 }} />
      </ScrollView>
    </ScreenShell>
  );
}

function englishOpening(n: number): string | null {
  if (n === 1) return "The Opening";
  return null;
}

const styles = StyleSheet.create({
  tools: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 8 },
  toggle: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft },
  pad: { paddingHorizontal: 20, paddingBottom: 8 },
  ayah: { paddingHorizontal: 14, paddingVertical: 8 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  ayahHead: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  num: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.sageSoft, alignItems: "center", justifyContent: "center", marginTop: 4 },
  numTxt: { fontFamily: fonts.semi, fontSize: 10.5, color: colors.sageDark },
  arabic: { flex: 1, fontFamily: "NotoNaskhArabic_700Bold", fontSize: 20, color: colors.ink, writingDirection: "rtl", textAlign: "right", lineHeight: 32 },
  tr: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.ink, lineHeight: 19, marginTop: 4, paddingLeft: 32 },
  pending: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18, marginTop: 4, paddingLeft: 32, fontStyle: "italic" },
  credit: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.inkMuted, marginTop: 10, lineHeight: 17, paddingHorizontal: 6 },
});
