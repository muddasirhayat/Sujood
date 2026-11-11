import { type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, fonts, radii, shadows } from "../theme/tokens";
import { BackChevron } from "./icons";

export function AppText({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[{ fontFamily: fonts.regular, color: colors.ink }, style]} />;
}

export function Card({
  children,
  style,
  contentStyle,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={[padded && styles.cardPad, contentStyle]}>{children}</View>
    </View>
  );
}

export function SageButton({
  label,
  onPress,
  style,
  small,
}: {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.sageBtn, small && styles.sageBtnSmall, pressed && { opacity: 0.9 }, style]}
    >
      <AppText style={[styles.sageBtnText, small && { fontSize: 16 }]}>{label}</AppText>
    </Pressable>
  );
}

export function Pill({
  label,
  tone = "sage",
  style,
  textStyle,
}: {
  label: string;
  tone?: "sage" | "gold" | "cream";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const bg = tone === "gold" ? colors.goldSoft : tone === "cream" ? colors.creamMid : colors.sageSoft;
  const fg = tone === "gold" ? colors.goldDeep : colors.sageDark;
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <AppText style={[styles.pillText, { color: fg }, textStyle]}>{label}</AppText>
    </View>
  );
}

export function Toggle({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange?: (v: boolean) => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onValueChange?.(!value)}
      style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <AppText style={styles.section}>{children}</AppText>;
}

export function BackButton({ onPress, accessibilityLabel = "Back" }: { onPress?: () => void; accessibilityLabel?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={10}
      style={styles.back}
    >
      <BackChevron />
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      {onBack ? <BackButton onPress={onBack} /> : <View style={{ width: 36 }} />}
      <View style={styles.headerMid}>
        <AppText style={styles.headerTitle}>{title}</AppText>
        {subtitle ? <AppText style={styles.headerSub}>{subtitle}</AppText> : null}
      </View>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radio, selected && styles.radioOn]}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    boxShadow: shadows.card,
  },
  cardPad: { paddingHorizontal: 18, paddingVertical: 16 },
  sageBtn: {
    backgroundColor: colors.sage,
    borderRadius: radii.button,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: shadows.button,
  },
  sageBtnSmall: { height: 48 },
  sageBtnText: { fontFamily: fonts.semi, color: colors.white, fontSize: 18 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, alignSelf: "flex-start" },
  pillText: { fontFamily: fonts.semi, fontSize: 11.5 },
  toggle: { width: 48, height: 30, borderRadius: 15, padding: 3, justifyContent: "center" },
  toggleOn: { backgroundColor: colors.sage, alignItems: "flex-end" },
  toggleOff: { backgroundColor: colors.toggleOff, alignItems: "flex-start" },
  thumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white, boxShadow: "0px 1px 3px rgba(58,47,42,0.2)" },
  thumbOn: {},
  thumbOff: {},
  section: {
    fontFamily: fonts.semi,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.inkMuted,
    textTransform: "uppercase",
    marginBottom: 6,
    marginLeft: 4,
    marginTop: 2,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: shadows.soft,
  },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10, gap: 10 },
  headerMid: { flex: 1 },
  headerTitle: { fontFamily: fonts.extra, fontSize: 26, color: colors.ink, letterSpacing: -0.4 },
  headerSub: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft, marginTop: 1 },
  headerRight: { minWidth: 36, alignItems: "flex-end" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.6, borderColor: colors.inkMuted, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.sage, borderWidth: 0, backgroundColor: "transparent" },
  radioDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.sage, borderWidth: 6, borderColor: colors.sageSoft },
});
