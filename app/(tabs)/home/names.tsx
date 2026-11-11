import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, ScreenHeader } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme/tokens";
import { NAMES } from "@/src/content/names";

export default function NamesScreen() {
  return (
    <ScreenShell>
      <ScreenHeader title="99 Names" subtitle="A calm list to read and remember" onBack={() => router.back()} />
      <View style={styles.pad}>
        <Card padded={false} style={styles.listCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {NAMES.map((n, i) => (
              <View key={n.number} style={[styles.row, i < NAMES.length - 1 && styles.border]}>
                <AppText style={styles.num}>{String(n.number).padStart(2, "0")}</AppText>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.name}>{n.transliteration}</AppText>
                  <AppText style={styles.gloss}>{n.gloss}</AppText>
                </View>
              </View>
            ))}
          </ScrollView>
        </Card>
        <AppText style={styles.foot}>10 of 99</AppText>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: { flex: 1, paddingHorizontal: 20, paddingBottom: 12 },
  listCard: { flex: 1, maxHeight: 620, overflow: "hidden" },
  row: { flexDirection: "row", gap: 12, paddingHorizontal: 18, paddingVertical: 11, alignItems: "flex-start" },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  num: { fontFamily: fonts.semi, fontSize: 13, color: colors.sage, width: 28, marginTop: 3 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  gloss: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 1 },
  foot: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 10, marginLeft: 8 },
});
