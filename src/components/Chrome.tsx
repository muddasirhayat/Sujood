import { type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "../theme/tokens";
import { AppText } from "./ui";
import { SignalIcons } from "./icons";
import { useClock } from "../state/AppProvider";

export function Backdrop() {
  return (
    <LinearGradient
      colors={[colors.cream, "#F7EFE4", colors.peachWash]}
      locations={[0, 0.42, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function StatusChrome({ timeOverride }: { timeOverride?: string }) {
  const insets = useSafeAreaInsets();
  const { clockLabel } = useClock();
  const isWeb = Platform.OS === "web";
  const top = isWeb ? 0 : insets.top;
  const height = isWeb ? space.status : Math.max(insets.top, 20) + 4;
  if (!isWeb && insets.top === 0) {
    // still paint a slim bar so web-like previews on emulators look consistent
  }
  return (
    <View style={[styles.status, { height: isWeb ? space.status : height, paddingTop: isWeb ? 14 : Math.max(top - 6, 0) }]} pointerEvents="none">
      <AppText style={styles.time}>{timeOverride ?? clockLabel}</AppText>
      {isWeb ? <SignalIcons color={colors.ink} /> : <View style={{ width: 66 }} />}
    </View>
  );
}

export function HomeIndicator() {
  if (Platform.OS !== "web") return null;
  return (
    <View style={styles.indicatorWrap} pointerEvents="none">
      <View style={styles.indicator} />
    </View>
  );
}

export function ScreenShell({
  children,
  footer,
  noStatus,
  timeOverride,
}: {
  children: ReactNode;
  footer?: ReactNode;
  noStatus?: boolean;
  timeOverride?: string;
}) {
  return (
    <View style={styles.shell}>
      <Backdrop />
      {noStatus ? null : <StatusChrome timeOverride={timeOverride} />}
      <View style={styles.body}>{children}</View>
      {footer}
      <HomeIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.cream },
  body: { flex: 1 },
  status: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  time: { fontFamily: fonts.semi, fontSize: 16, color: colors.ink, letterSpacing: 0.2 },
  indicatorWrap: { position: "absolute", left: 0, right: 0, bottom: 6, alignItems: "center" },
  indicator: { width: 126, height: 5, borderRadius: 3, backgroundColor: "rgba(58,47,42,0.28)" },
});
