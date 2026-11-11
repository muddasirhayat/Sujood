import { Link, Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { AppText } from "@/src/components/ui";
import { Backdrop } from "@/src/components/Chrome";
import { colors, fonts } from "@/src/theme/tokens";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.wrap}>
        <Backdrop />
        <AppText style={styles.title}>This page is not in Sujood.</AppText>
        <Link href="/">
          <AppText style={styles.link}>Go home</AppText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.ink, marginBottom: 12 },
  link: { fontFamily: fonts.semi, fontSize: 16, color: colors.sage },
});
