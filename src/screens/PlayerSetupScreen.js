// src/screens/PlayerSetupScreen.js
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import styles from "../theme/styles";

/**
 * Polished PlayerSetupScreen
 * - gradient background
 * - animated counter
 * - preset chips
 * - optional name inputs (toggle)
 * - pinned CTA
 */

const PRESETS = [2, 3, 4, 5, 6, 8];

export default function PlayerSetupScreen({ navigation, route }) {
  const mode = route?.params?.mode || "party";
  const [players, setPlayers] = useState(4);
  const [showNames, setShowNames] = useState(false);
  const [names, setNames] = useState([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((r) => setReduceMotion(r));
  }, []);

  useEffect(() => {
    // keep names array in sync with players count
    setNames((prev) => {
      const copy = prev.slice(0, players);
      while (copy.length < players) copy.push("");
      return copy;
    });
  }, [players]);

  function bump() {
    if (reduceMotion) return;
    scaleAnim.setValue(0.92);
    Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }

  function changePlayers(next) {
    setPlayers((p) => {
      const val = Math.max(2, Math.min(12, next));
      return val;
    });
    bump();
  }

  function inc() {
    changePlayers(players + 1);
  }
  function dec() {
    changePlayers(players - 1);
  }

  function applyPreset(n) {
    changePlayers(n);
  }

  function updateName(index, value) {
    setNames((prev) => {
      const copy = prev.slice();
      copy[index] = value;
      return copy;
    });
  }

  function startGame() {
    // pass names only if showNames is true and at least one name filled
    const payload = { mode, players };
    if (showNames) payload.names = names.map((n, i) => (n && n.trim() ? n.trim() : `Player ${i + 1}`));
    navigation.navigate("Game", payload);
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#071018", "#08101a"]} style={styles.containerGradient}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={[styles.padded, { paddingTop: 28 }]}>
            <Text style={[styles.header, { color: "#fff" }]}>Player Setup</Text>
            <Text style={{ color: "#9aa0a6", marginBottom: 14 }}>Mode: <Text style={{ color: "#fff", fontWeight: "700" }}>{mode}</Text></Text>

            {/* Preset chips */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => applyPreset(p)}
                  style={[
                    {
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      marginRight: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: players === p ? "rgba(214,168,76,0.9)" : "rgba(255,255,255,0.04)",
                      backgroundColor: players === p ? "rgba(214,168,76,0.12)" : "rgba(255,255,255,0.02)",
                    }
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Set players to ${p}`}
                >
                  <Text style={{ color: players === p ? "#FDF7E9" : "#dfe6ea", fontWeight: players === p ? "800" : "600" }}>{p} players</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Counter */}
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <Text style={{ color: "#bfc7cc", marginBottom: 8 }}>Number of players</Text>

              <Animated.View style={{ flexDirection: "row", alignItems: "center", transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  onPress={() => { dec(); }}
                  style={styles.counterButton}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease players"
                >
                  <Text style={styles.counterText}>−</Text>
                </TouchableOpacity>

                <View style={{ width: 92, alignItems: "center" }}>
                  <Text style={[styles.counterValue, { fontSize: 28 }]} accessibilityLiveRegion="polite">{players}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => { inc(); }}
                  style={styles.counterButton}
                  accessibilityRole="button"
                  accessibilityLabel="Increase players"
                >
                  <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Toggle for names */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <TouchableOpacity onPress={() => setShowNames((s) => !s)} style={{ paddingVertical: 8 }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{showNames ? "Edit Player Names" : "Add Player Names"}</Text>
                <Text style={{ color: "#9aa0a6", marginTop: 4, fontSize: 13 }}>{showNames ? "Tap a name to edit" : "Optional — show names during play"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowNames((s) => !s); }}
                accessibilityRole="switch"
                accessibilityState={{ checked: showNames }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: showNames ? "rgba(214,168,76,0.14)" : "rgba(255,255,255,0.02)"
                }}
              >
                <Text style={{ color: showNames ? "#FDF7E9" : "#dfe6ea", fontWeight: "700" }}>{showNames ? "ON" : "OFF"}</Text>
              </TouchableOpacity>
            </View>

            {/* Name inputs */}
            {showNames && (
              <View style={{ marginTop: 12 }}>
                {Array.from({ length: players }).map((_, i) => (
                  <View key={i} style={{ marginBottom: 10 }}>
                    <Text style={{ color: "#bfc7cc", marginBottom: 6, fontSize: 13 }}>Player {i + 1}</Text>
                    <TextInput
                      value={names[i] ?? ""}
                      onChangeText={(t) => updateName(i, t)}
                      placeholder={`Player ${i + 1}`}
                      placeholderTextColor="#7f8a91"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.02)",
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 10,
                        color: "#fff",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.03)"
                      }}
                      returnKeyType="done"
                      accessible
                      accessibilityLabel={`Name for player ${i + 1}`}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Spacer to push CTA down on tall screens */}
            <View style={{ flex: 1 }} />

            {/* Start CTA */}
            <View style={{ marginBottom: 12 }}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={startGame}
                accessibilityRole="button"
                accessibilityLabel={`Start game with ${players} players`}
              >
                <Text style={styles.primaryButtonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
