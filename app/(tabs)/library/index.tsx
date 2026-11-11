import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, Pill } from "@/src/components/ui";
import { colors, fonts, shadows } from "@/src/theme/tokens";
import { BOOKS } from "@/src/content/books";

export default function LibraryScreen() {
  return (
    <ScreenShell>
      <View style={styles.head}>
        <AppText style={styles.title}>Library</AppText>
        <AppText style={styles.sub}>Open-licence and public-domain works</AppText>
      </View>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        {BOOKS.map((b) => (
          <Pressable key={b.id} onPress={() => router.push(`/library/book/${b.id}`)} accessibilityRole="button" accessibilityLabel={b.title}>
            <Card style={styles.card} contentStyle={styles.inner}>
              <View style={[styles.cover, { backgroundColor: b.color }]} />
              <View style={{ flex: 1 }}>
                <AppText style={styles.name}>{b.title}</AppText>
                <AppText style={styles.meta}>{b.subtitle}</AppText>
                <Pill label={b.badge} style={{ marginTop: 8 }} />
              </View>
            </Card>
          </Pressable>
        ))}
        <Pressable onPress={() => router.push("/library/hadith")} style={styles.hadithLink} accessibilityRole="button">
          <AppText style={styles.hadithTxt}>Hadith collections →</AppText>
        </Pressable>
        <View style={{ height: 16 }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  title: { fontFamily: fonts.extra, fontSize: 32, color: colors.ink, letterSpacing: -0.6 },
  sub: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  pad: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  card: {},
  inner: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13 },
  cover: { width: 56, height: 72, borderRadius: 10 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  hadithLink: { alignItems: "center", paddingVertical: 8 },
  hadithTxt: { fontFamily: fonts.semi, fontSize: 14, color: colors.sageDark },
});
