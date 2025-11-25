// src/screens/ModeSelectScreen.js
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../theme/styles";

const MODES = [
  { id: "party", title: "Party Mode", subtitle: "Fun random dares & actions", icon: "🎉" },
  { id: "truth_dare", title: "Truth or Dare", subtitle: "Tarot decides: Truth / Dare / Wild", icon: "❓" },
  { id: "couple", title: "Couple Mode", subtitle: "Sweet, romantic & playful", icon: "💞" },
  { id: "chaos", title: "Chaos Mode", subtitle: "Wild, unpredictable, crazy", icon: "⚡️" },
];

export default function ModeSelectScreen({ navigation, route }) {
  const defaultMode = route?.params?.default || null;
  const [selected, setSelected] = useState(defaultMode || "party");
  const [reduceMotion, setReduceMotion] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((r) => setReduceMotion(r));
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [selected, reduceMotion, scaleAnim]);

  function renderMode({ item }) {
    const active = item.id === selected;
    return (
      <TouchableOpacity
        key={item.id}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        activeOpacity={0.9}
        onPress={() => setSelected(item.id)}
        style={[local.card, active ? local.cardActive : null]}
      >
        <View style={local.left}>
          <View style={local.iconWrap}>
            <Text style={local.icon}>{item.icon}</Text>
          </View>
          <View style={local.textWrap}>
            <Text style={local.cardTitle}>{item.title}</Text>
            <Text style={local.cardSubtitle}>{item.subtitle}</Text>
          </View>
        </View>

        <View style={local.right}>
          {active ? <Text style={local.check}>✓</Text> : <View style={local.dot} />}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#071018", "#08101a"]} style={styles.containerGradient}>
        <View style={[styles.padded, { paddingTop: 28, paddingBottom: 100 }]}>
          <Text style={[styles.header, { color: "#fff", marginBottom: 6 }]}>Select Mode</Text>
          <Text style={{ color: "#9aa0a6", marginBottom: 18 }}>Choose how wild you want the night to be.</Text>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <FlatList
              data={MODES}
              renderItem={renderMode}
              keyExtractor={(it) => it.id}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              contentContainerStyle={{ paddingBottom: 12 }}
            />
          </Animated.View>

          {/* Continue button pinned near bottom of content */}
          <View style={{ marginTop: 26 }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("PlayerSetup", { mode: selected })}
              accessibilityRole="button"
              accessibilityLabel={`Continue with ${selected} mode`}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

/* Local styles for ModeSelectScreen (keeps theme file intact) */
const local = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardActive: {
    backgroundColor: "rgba(214,168,76,0.12)",
    borderColor: "rgba(214,168,76,0.22)",
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: { fontSize: 26 },
  textWrap: { flex: 1 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cardSubtitle: { color: "#bfc7cc", marginTop: 4, fontSize: 13 },

  right: { width: 36, alignItems: "center", justifyContent: "center" },
  check: { color: "#071018", backgroundColor: "#D6A84C", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: "800" },
  dot: { width: 10, height: 10, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.06)" },
});
