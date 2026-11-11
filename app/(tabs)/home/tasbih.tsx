import { Image, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, SageButton, ScreenHeader } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts, shadows } from "@/src/theme/tokens";
import { SALAH_IDS, PRAYER_NAMES } from "@/src/prayer/times";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const beads = require("@/assets/images/tasbih-beads.png");
const PHRASES = ["SubhanAllah", "Alhamdulillah", "AllahuAkbar"];

export default function TasbihScreen() {
  const { state, bumpTasbih, resetTasbih, nextPhrase, toggleSalahMark } = useApp();
  const { count, target, phraseIndex, marks } = state.tasbih;
  const phrase = PHRASES[phraseIndex % PHRASES.length]!;

  const countPress = () => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    bumpTasbih();
  };

  return (
    <ScreenShell>
      <ScreenHeader title="Tasbih" subtitle="Morning dhikr · 33 counts" onBack={() => router.back()} />
      <View style={styles.body}>
        <View style={styles.marks}>
          {SALAH_IDS.map((id) => {
            const on = !!marks[id];
            return (
              <Pressable key={id} onPress={() => toggleSalahMark(id)} style={styles.markCell} accessibilityRole="button" accessibilityLabel={`${PRAYER_NAMES[id]} ${on ? "prayed" : "not marked"}`}>
                <AppText style={styles.markLabel}>{PRAYER_NAMES[id].toUpperCase()}</AppText>
                <View style={[styles.dot, on && styles.dotOn]} />
              </Pressable>
            );
          })}
        </View>
        <View style={styles.artWrap}>
          <Image source={beads} style={styles.art} resizeMode="contain" />
        </View>
        <AppText style={styles.phrase}>{phrase}</AppText>
        <AppText style={styles.count}>
          {count}<AppText style={styles.of}>/{target}</AppText>
        </AppText>
        <SageButton label="Count" onPress={countPress} style={styles.btn} />
        <View style={styles.links}>
          <Pressable onPress={resetTasbih} accessibilityRole="button"><AppText style={styles.link}>Reset</AppText></Pressable>
          <AppText style={styles.dotSep}>·</AppText>
          <Pressable onPress={nextPhrase} accessibilityRole="button"><AppText style={styles.link}>Next phrase</AppText></Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 20, alignItems: "center" },
  marks: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 6, width: "100%", boxShadow: shadows.card, marginBottom: 16 },
  markCell: { flex: 1, alignItems: "center", gap: 6 },
  markLabel: { fontFamily: fonts.semi, fontSize: 9, letterSpacing: 0.6, color: colors.inkMuted },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.6, borderColor: "#D4CBC3", backgroundColor: "transparent" },
  dotOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  artWrap: { width: "100%", height: 248, borderRadius: 22, overflow: "hidden", backgroundColor: "#F6E2CC", marginBottom: 6 },
  art: { width: "100%", height: "100%" },
  phrase: { fontFamily: fonts.semi, fontSize: 16, color: colors.sageDark, marginTop: 4 },
  count: { fontFamily: fonts.extra, fontSize: 64, color: colors.ink, letterSpacing: -1.5, lineHeight: 72 },
  of: { fontFamily: fonts.semi, fontSize: 28, color: colors.inkMuted },
  btn: { alignSelf: "stretch", marginTop: 8 },
  links: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
  link: { fontFamily: fonts.semi, fontSize: 15.5, color: colors.ink },
  dotSep: { fontFamily: fonts.semi, fontSize: 15.5, color: colors.ink },
});
