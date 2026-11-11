import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, ScreenHeader } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme/tokens";
import { bookById } from "@/src/content/books";
import { pickthallSurah, itaniAyahs, QURAN_CREDITS } from "@/src/content/quran";
import { SURAHS } from "@/src/content/surahs";

export default function BookReader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = bookById(String(id));

  if (!book) {
    return (
      <ScreenShell>
        <ScreenHeader title="Library" onBack={() => router.back()} />
        <AppText style={{ padding: 20 }}>This book is not in the library.</AppText>
      </ScreenShell>
    );
  }

  if (!book.licensed) {
    return (
      <ScreenShell>
        <ScreenHeader title={book.title} subtitle={book.subtitle} onBack={() => router.back()} />
        <View style={styles.pad}>
          <Card>
            <AppText style={styles.body}>{book.pendingNote}</AppText>
          </Card>
        </View>
      </ScreenShell>
    );
  }

  // Licensed readers: Pickthall continuous prose (Al-Fatiha first, then other complete chapters);
  // Itani verse-by-verse official Allah Edition with required credit.
  const isPickthall = book.id === "pickthall";
  const chapters = isPickthall
    ? SURAHS.map((s) => {
        const p = pickthallSurah(s.number);
        return p?.complete ? { n: s.number, title: s.name, body: p.prose, revealed: s.revelation } : null;
      }).filter(Boolean)
    : SURAHS.map((s) => ({
        n: s.number,
        title: s.name,
        body: itaniAyahs(s.number).join(" "),
        revealed: s.revelation,
      }));

  const first = chapters[0];
  const credit = isPickthall
    ? "The Meaning of the Glorious Koran, an explanatory translation by Marmaduke Pickthall, London, 1930. Public domain in the United States (Wikisource)."
    : QURAN_CREDITS.itani.credit + ". " + QURAN_CREDITS.itani.license + ". Official Allah Edition from ClearQuran.com.";

  return (
    <ScreenShell>
      <ScreenHeader
        title={isPickthall && first ? "The Opening" : book.title}
        subtitle={isPickthall ? "Pickthall, 1930 · The Glorious Koran" : "Talal Itani · ClearQuran.com"}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        {chapters.map((ch) => (
          <Card key={ch!.n} style={{ marginBottom: 14 }}>
            <AppText style={styles.eyebrow}>SURAH {toRoman(ch!.n)}</AppText>
            <AppText style={styles.chTitle}>{isPickthall && ch!.n === 1 ? "The Opening" : ch!.title}</AppText>
            <AppText style={styles.revealed}>{ch!.revealed ? `Revealed at ${normalizePlace(ch!.revealed)}` : ""}</AppText>
            <View style={styles.rule} />
            <AppText style={styles.body}>{ch!.body}</AppText>
            {ch!.n === 1 ? <AppText style={styles.credit}>{credit}</AppText> : null}
          </Card>
        ))}
        {chapters.length < 114 ? (
          <AppText style={styles.note}>
            {114 - chapters.length} chapters are not in this bundled 1930 proofread set. They will be added from the same public-domain edition when a complete proofread text is available. The Arabic Quran reader includes every surah.
          </AppText>
        ) : null}
        <View style={{ height: 16 }} />
      </ScrollView>
    </ScreenShell>
  );
}

function normalizePlace(s: string): string {
  const t = s.toLowerCase();
  if (t.startsWith("mec") || t === "makkah") return "Mecca";
  if (t.startsWith("med") || t.startsWith("mad") || t === "al") return "Medina";
  return s;
}

function toRoman(n: number): string {
  const map: Array<[number, string]> = [[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let x = n, out = "";
  for (const [v, s] of map) {
    while (x >= v) { out += s; x -= v; }
  }
  return out;
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingBottom: 20 },
  eyebrow: { fontFamily: fonts.semi, fontSize: 11, letterSpacing: 1.4, color: colors.inkMuted, textAlign: "center", textTransform: "uppercase" },
  chTitle: { fontFamily: fonts.extra, fontSize: 26, color: colors.ink, textAlign: "center", marginTop: 6, letterSpacing: -0.4 },
  revealed: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, textAlign: "center", marginTop: 2 },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong, marginVertical: 16 },
  body: { fontFamily: fonts.medium, fontSize: 16.5, color: colors.ink, lineHeight: 26 },
  credit: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted, marginTop: 18, lineHeight: 18 },
  note: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18, paddingHorizontal: 6 },
});
