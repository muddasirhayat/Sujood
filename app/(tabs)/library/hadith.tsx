import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, Pill, ScreenHeader, SectionLabel } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme/tokens";
import { HADITH_COLLECTIONS } from "@/src/content/books";

export default function HadithScreen() {
  return (
    <ScreenShell>
      <View style={styles.head}>
        <AppText style={styles.title}>Hadith</AppText>
        <AppText style={styles.sub}>Collections and a daily reminder</AppText>
      </View>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.dailyTop}>
            <Pill label="Hadith of the day" />
            <AppText style={styles.src}>Sahih al-Bukhari</AppText>
          </View>
          <AppText style={styles.pending}>
            An English edition has not been bundled, because no translator licence was verified for redistribution. The classical Arabic compilations are public-domain works. Collections are listed below, and the body will appear here when a licensed edition is available.
          </AppText>
          <AppText style={styles.credit}>Sahih al-Bukhari · Book of Revelation</AppText>
        </Card>

        <SectionLabel>Collections</SectionLabel>
        <Card padded={false}>
          {HADITH_COLLECTIONS.map((c, i) => (
            <Pressable
              key={c.id}
              onPress={() => (c.bookId ? router.push(`/library/book/${c.bookId}`) : undefined)}
              style={[styles.row, i < HADITH_COLLECTIONS.length - 1 && styles.border]}
              accessibilityRole="button"
              accessibilityLabel={c.title}
            >
              <View style={{ flex: 1 }}>
                <AppText style={styles.name}>{c.title}</AppText>
                <AppText style={styles.meta}>{c.subtitle}</AppText>
              </View>
              <AppText style={styles.chev}>›</AppText>
            </Pressable>
          ))}
        </Card>
        <View style={{ height: 16 }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  title: { fontFamily: fonts.extra, fontSize: 32, color: colors.ink, letterSpacing: -0.6 },
  sub: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  pad: { paddingHorizontal: 20, paddingBottom: 20 },
  dailyTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  src: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft },
  pending: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink, lineHeight: 22 },
  credit: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted, marginTop: 12 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 10 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  meta: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  chev: { fontFamily: fonts.medium, fontSize: 22, color: colors.inkMuted, marginTop: -2 },
});
