import { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, Pill, ScreenHeader } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts } from "@/src/theme/tokens";
import { qiblaBearing, qiblaDistanceKm, roundedBearing, formatDistance, compassRotation, isFacingQibla, cardinalFromBearing, headingFromMagnetometer } from "@/src/prayer/qibla";

const compass = require("@/assets/images/qibla-compass.png");

export default function QiblaScreen() {
  const { state } = useApp();
  const { latitude, longitude, label } = state.location;
  const bearing = qiblaBearing(latitude, longitude);
  const rounded = roundedBearing(bearing);
  const km = qiblaDistanceKm(latitude, longitude);
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    let sub: { remove: () => void } | undefined;
    void (async () => {
      try {
        const Sensors = await import("expo-sensors");
        Sensors.Magnetometer.setUpdateInterval(120);
        sub = Sensors.Magnetometer.addListener((d) => {
          setHeading(headingFromMagnetometer(d.x, d.y));
        });
      } catch {
        /* no magnetometer */
      }
    })();
    return () => sub?.remove();
  }, []);

  const facing = heading == null ? true : isFacingQibla(bearing, heading);
  const rotation = heading == null ? 0 : compassRotation(bearing, heading);
  const cardLabel = facing ? "Facing Qibla" : "Turn toward Qibla";
  const dir = `${cardinalFromBearing(bearing)} from ${label}`;

  return (
    <ScreenShell>
      <ScreenHeader title="Qibla" subtitle={`${label} · ${formatDistance(km)} from the Kaaba`} onBack={() => router.back()} />
      <View style={styles.body}>
        <View style={styles.artWrap}>
          <Image source={compass} style={[styles.art, { transform: [{ rotate: `${rotation}deg` }] }]} resizeMode="contain" />
        </View>
        <Card style={styles.card} contentStyle={styles.cardInner}>
          <Pill label={cardLabel} />
          <AppText style={styles.deg}>{rounded}°</AppText>
          <AppText style={styles.dir}>{dir}</AppText>
        </Card>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 20, alignItems: "center" },
  artWrap: { width: "100%", aspectRatio: 1.05, borderRadius: 22, overflow: "hidden", backgroundColor: "#F6E2CC", marginBottom: 16, alignItems: "center", justifyContent: "center" },
  art: { width: "100%", height: "100%" },
  card: { alignSelf: "stretch" },
  cardInner: { alignItems: "center", paddingVertical: 22 },
  deg: { fontFamily: fonts.extra, fontSize: 64, color: colors.ink, letterSpacing: -1.5, marginTop: 8, lineHeight: 70 },
  dir: { fontFamily: fonts.medium, fontSize: 15, color: colors.inkSoft, marginTop: 2 },
});
