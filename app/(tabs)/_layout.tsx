import { Pressable, StyleSheet, View, Platform } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { AppText } from "@/src/components/ui";
import { HomeIcon, TimesIcon, QuranIcon, LibraryIcon, SettingsIcon } from "@/src/components/icons";
import { colors, fonts } from "@/src/theme/tokens";

const ITEMS = [
  { name: "home", label: "Home", Icon: HomeIcon },
  { name: "times", label: "Times", Icon: TimesIcon },
  { name: "quran", label: "Quran", Icon: QuranIcon },
  { name: "library", label: "Library", Icon: LibraryIcon },
  { name: "settings", label: "Settings", Icon: SettingsIcon },
] as const;

function SujoodTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Platform.OS === "web" ? 14 : Math.max(insets.bottom, 10);
  return (
    <View style={[styles.wrap, { paddingBottom: bottom }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const item = ITEMS.find((e) => e.name === route.name) ?? ITEMS[0]!;
          const focused = state.index === index;
          const color = focused ? colors.sage : colors.tabInactive;
          const Icon = item.Icon;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: focused }}
              onPress={() => navigation.navigate(route.name)}
              style={styles.item}
            >
              <Icon color={color} filled={focused} size={23} />
              <AppText style={[styles.label, { color }]}>{item.label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <SujoodTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "transparent" } }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="times" />
      <Tabs.Screen name="quran" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.tabBar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(58,47,42,0.08)",
    boxShadow: "0px -6px 16px rgba(58,47,42,0.05)",
  },
  bar: { flexDirection: "row", alignItems: "flex-end", paddingTop: 6, height: 52, paddingHorizontal: 4 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, height: 52 },
  label: { fontFamily: fonts.semi, fontSize: 11, marginTop: 1 },
});
