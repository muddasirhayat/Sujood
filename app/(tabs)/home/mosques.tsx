import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, ScreenHeader } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts } from "@/src/theme/tokens";
import { fetchMosques, OSM_ATTRIBUTION, type MosquesResult } from "@/src/location/mosques";

export default function MosquesScreen() {
  const { state } = useApp();
  const [result, setResult] = useState<MosquesResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await fetchMosques(state.location.latitude, state.location.longitude, state.location.label);
      if (!cancelled) setResult(r);
    })();
    return () => {
      cancelled = true;
    };
  }, [state.location.latitude, state.location.longitude, state.location.label]);

  return (
    <ScreenShell>
      <ScreenHeader title="Nearby mosques" subtitle={`${state.location.label} · OpenStreetMap`} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
        {!result ? (
          <ActivityIndicator color={colors.sage} style={{ marginTop: 24 }} />
        ) : result.ok ? (
          <Card padded={false}>
            {result.mosques.map((m, i) => (
              <View key={m.id} style={[styles.row, i < result.mosques.length - 1 && styles.border]}>
                <AppText style={styles.name}>{m.name}</AppText>
                <AppText style={styles.vic}>{m.vicinity}</AppText>
              </View>
            ))}
          </Card>
        ) : (
          <Card>
            <AppText style={styles.msg}>{result.message}</AppText>
          </Card>
        )}
        <AppText style={styles.attr}>{OSM_ATTRIBUTION}</AppText>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingBottom: 24 },
  row: { paddingHorizontal: 18, paddingVertical: 14 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  name: { fontFamily: fonts.bold, fontSize: 16.5, color: colors.ink },
  vic: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  msg: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.inkSoft, lineHeight: 21 },
  attr: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkMuted, marginTop: 12, marginLeft: 6 },
});
