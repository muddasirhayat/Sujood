import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { ScreenShell } from "@/src/components/Chrome";
import { AppText, Card, Pill, SageButton, SectionLabel } from "@/src/components/ui";
import { useApp } from "@/src/state/AppProvider";
import { colors, fonts, shadows } from "@/src/theme/tokens";
import { METHODS, type MethodId, type MadhabId } from "@/src/prayer/times";
import { nearestCity, searchCities, type City } from "@/src/prayer/cities";
import { requestNotificationPermission } from "@/src/notifications/sync";
import { KARACHI } from "@/src/prayer/cities";

const ONBOARD_METHODS: MethodId[] = ["Karachi", "MuslimWorldLeague", "UmmAlQura"];

export default function Onboarding() {
  const params = useLocalSearchParams<{ step?: string }>();
  const { state, setLocation, setMethod, setMadhab, completeOnboarding, patch } = useApp();
  const initial = params.step ? Number(params.step) : state.onboardingStep || 2;
  const [step, setStep] = useState(initial === 1 || initial === 2 || initial === 3 ? initial : 2);
  const [picking, setPicking] = useState(false);
  const query = "";
  const [gpsBusy, setGpsBusy] = useState(false);

  const finish = () => {
    completeOnboarding();
    router.replace("/home");
  };

  const useGps = async () => {
    setGpsBusy(true);
    try {
      if (Platform.OS === "web") {
        setLocation({
          latitude: KARACHI.latitude,
          longitude: KARACHI.longitude,
          label: KARACHI.label,
          country: KARACHI.country,
          timezone: KARACHI.timezone,
          source: "gps",
        });
        return;
      }
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const near = nearestCity(pos.coords.latitude, pos.coords.longitude);
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        label: near.label,
        country: near.country,
        timezone: near.timezone,
        source: "gps",
      });
    } catch {
      // keep existing
    } finally {
      setGpsBusy(false);
    }
  };

  const pickCity = (city: City) => {
    setLocation({
      latitude: city.latitude,
      longitude: city.longitude,
      label: city.label,
      country: city.country,
      timezone: city.timezone,
      source: "manual",
    });
    setPicking(false);
  };

  return (
    <ScreenShell>
      {step === 1 ? (
        <View style={styles.pad}>
          <Pill label="Step 1 of 3" />
          <AppText style={styles.h1}>Welcome to Sujood</AppText>
          <AppText style={styles.lead}>A calm, ad-free companion for prayer. Location stays on this phone. It is never sent to us.</AppText>
          <SageButton label="Continue" onPress={() => { setStep(2); patch({ onboardingStep: 2 }); }} style={styles.bottomBtn} />
        </View>
      ) : null}

      {step === 2 ? (
        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <Pill label="Step 2 of 3" />
          <AppText style={styles.h1}>Set your times</AppText>
          <AppText style={styles.lead}>Location stays on this phone. It is never sent to us.</AppText>

          <Pressable onPress={() => setPicking((p) => !p)}>
            <Card style={styles.locCard} contentStyle={styles.locInner}>
              <View style={{ flex: 1 }}>
                <AppText style={styles.locLabel}>Location</AppText>
                <AppText style={styles.locValue}>{state.location.label}, {state.location.country}</AppText>
              </View>
              <Pressable onPress={useGps} style={styles.gpsPill}>
                <AppText style={styles.gpsText}>{gpsBusy ? "Locating…" : state.location.source === "gps" ? "Using GPS" : "Use GPS"}</AppText>
              </Pressable>
            </Card>
          </Pressable>
          {picking ? (
            <Card style={{ marginTop: -8, marginBottom: 14 }} padded={false}>
              {searchCities(query).slice(0, 8).map((c) => (
                <Pressable key={c.id} onPress={() => pickCity(c)} style={styles.cityRow}>
                  <AppText style={styles.cityName}>{c.label}</AppText>
                  <AppText style={styles.cityCountry}>{c.country}</AppText>
                </Pressable>
              ))}
            </Card>
          ) : null}

          <SectionLabel>Calculation method</SectionLabel>
          <Card padded={false} style={{ marginBottom: 18 }}>
            {ONBOARD_METHODS.map((id, i) => {
              const m = METHODS.find((x) => x.id === id)!;
              const on = state.method === id;
              return (
                <Pressable key={id} onPress={() => setMethod(id)} style={[styles.methodRow, i > 0 && styles.methodBorder]}>
                  <View style={{ flex: 1 }}>
                    <AppText style={styles.methodName}>{m.name}</AppText>
                    <AppText style={styles.methodDetail}>{m.detail}</AppText>
                  </View>
                  {on ? (
                    <View style={styles.check}><AppText style={styles.checkMark}>✓</AppText></View>
                  ) : (
                    <View style={styles.circle} />
                  )}
                </Pressable>
              );
            })}
          </Card>

          <SectionLabel>Asr school</SectionLabel>
          <View style={styles.madhabRow}>
            {(["Hanafi", "Shafi"] as MadhabId[]).map((id) => {
              const on = state.madhab === id;
              return (
                <Pressable key={id} onPress={() => setMadhab(id)} style={[styles.madhabCard, on && styles.madhabOn]}>
                  <AppText style={[styles.madhabName, on && styles.madhabNameOn]}>{id}</AppText>
                  <AppText style={styles.madhabSub}>{id === "Hanafi" ? "Later Asr" : "Standard Asr"}</AppText>
                </Pressable>
              );
            })}
          </View>

          <SageButton label="Continue" onPress={() => { setStep(3); patch({ onboardingStep: 3 }); }} style={{ marginTop: 10 }} />
          <Pressable onPress={finish} style={styles.skip} accessibilityRole="button" accessibilityLabel="Skip for now">
            <AppText style={styles.skipText}>Skip for now</AppText>
          </Pressable>
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : null}

      {step === 3 ? (
        <View style={styles.pad}>
          <Pill label="Step 3 of 3" />
          <AppText style={styles.h1}>Let the Azan arrive</AppText>
          <AppText style={styles.lead}>Allow notifications so prayer alerts can be scheduled on this phone. Nothing is sent to a server.</AppText>
          <SageButton
            label="Allow notifications"
            onPress={async () => {
              await requestNotificationPermission();
              finish();
            }}
            style={styles.bottomBtn}
          />
          <Pressable onPress={finish} style={styles.skip}>
            <AppText style={styles.skipText}>Skip for now</AppText>
          </Pressable>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, flexGrow: 1 },
  h1: { fontFamily: fonts.extra, fontSize: 32, color: colors.ink, marginTop: 12, letterSpacing: -0.6 },
  lead: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.inkSoft, marginTop: 8, marginBottom: 20, lineHeight: 21 },
  locCard: { marginBottom: 22 },
  locInner: { flexDirection: "row", alignItems: "center" },
  locLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkSoft },
  locValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.ink, marginTop: 2 },
  gpsPill: { backgroundColor: colors.sageSoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  gpsText: { fontFamily: fonts.semi, fontSize: 12, color: colors.sageDark },
  methodRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14 },
  methodBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lineStrong },
  methodName: { fontFamily: fonts.bold, fontSize: 15.5, color: colors.ink },
  methodDetail: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.sage, alignItems: "center", justifyContent: "center" },
  checkMark: { color: colors.white, fontSize: 13, fontFamily: fonts.bold, marginTop: -1 },
  circle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.6, borderColor: "#D4CBC3" },
  madhabRow: { flexDirection: "row", gap: 12, marginBottom: 22 },
  madhabCard: { flex: 1, backgroundColor: colors.card, borderRadius: 18, padding: 16, boxShadow: shadows.card, borderWidth: 1.5, borderColor: "transparent" },
  madhabOn: { borderColor: colors.sage },
  madhabName: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  madhabNameOn: { color: colors.ink },
  madhabSub: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 3 },
  skip: { alignItems: "center", paddingVertical: 16 },
  skipText: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  bottomBtn: { marginTop: "auto" },
  cityRow: { paddingHorizontal: 18, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  cityName: { fontFamily: fonts.semi, fontSize: 15 },
  cityCountry: { fontFamily: fonts.medium, fontSize: 12, color: colors.inkSoft },
});
