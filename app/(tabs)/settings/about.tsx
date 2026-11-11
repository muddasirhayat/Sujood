import { ScrollView, StyleSheet, Linking, Pressable, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, ScreenHeader } from "@/src/components/ui";
import { colors, fonts } from "@/src/theme/tokens";
import { QURAN_CREDITS } from "@/src/content/quran";
import { OSM_ATTRIBUTION } from "@/src/location/mosques";

export default function AboutScreen() {
  return (
    <ScreenShell>
      <ScreenHeader title="About" subtitle="Sujood, by Codixr" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        <Card style={{ marginBottom: 14 }}>
          <AppText style={styles.p}>Sujood is a calm, ad-free prayer companion. It is made by Codixr, a software agency. There is no account, no advertising, and no analytics broker. Location is used on this phone for prayer times, the Qibla and nearby mosques, and is never sent to a Sujood server.</AppText>
        </Card>
        <Card style={{ marginBottom: 14 }}>
          <AppText style={styles.h}>Arabic Quran text</AppText>
          <AppText style={styles.p}>{QURAN_CREDITS.arabic.notice}</AppText>
          <Link href="https://tanzil.net/">tanzil.net</Link>
        </Card>
        <Card style={{ marginBottom: 14 }}>
          <AppText style={styles.h}>English translations</AppText>
          <AppText style={styles.p}>{QURAN_CREDITS.pickthall.credit}</AppText>
          <AppText style={[styles.p, { marginTop: 8 }]}>{QURAN_CREDITS.itani.credit}. Licensed under CC BY-ND 4.0. Official Allah Edition from ClearQuran.com.</AppText>
        </Card>
        <Card style={{ marginBottom: 14 }}>
          <AppText style={styles.h}>Hadith</AppText>
          <AppText style={styles.p}>Collections are listed as classical public-domain works. No English hadith wording has been bundled, because a translator licence for redistribution was not verified.</AppText>
        </Card>
        <Card style={{ marginBottom: 14 }}>
          <AppText style={styles.h}>Nearby mosques</AppText>
          <AppText style={styles.p}>{OSM_ATTRIBUTION}</AppText>
        </Card>
        <Card style={{ marginBottom: 14 }}>
          <AppText style={styles.h}>Azan sounds</AppText>
          <AppText style={styles.p}>The Azan sounds in this version are gentle generated tones, not a recited Azan. They are original to Sujood. A royalty-free recited Azan was not bundled because a verifiable licence was not confirmed.</AppText>
        </Card>
        <Card>
          <AppText style={styles.h}>Prayer times</AppText>
          <AppText style={styles.p}>Times are calculated on the device with the adhan library (MIT licence). The default is the University of Islamic Sciences, Karachi method, with Hanafi Asr.</AppText>
        </Card>
        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenShell>
  );
}

function Link({ href, children }: { href: string; children: string }) {
  return (
    <Pressable onPress={() => void Linking.openURL(href)} accessibilityRole="link">
      <AppText style={styles.link}>{children}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingBottom: 20 },
  h: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, marginBottom: 6 },
  p: { fontFamily: fonts.medium, fontSize: 14, color: colors.inkSoft, lineHeight: 21 },
  link: { fontFamily: fonts.semi, fontSize: 14, color: colors.sage, marginTop: 8 },
});
