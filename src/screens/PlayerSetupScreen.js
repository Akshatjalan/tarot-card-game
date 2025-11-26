// src/screens/PlayerSetupScreen.js
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../theme/styles";

export default function PlayerSetupScreen({ navigation, route }) {
  const mode = route?.params?.mode || "party";

  const [playerCount, setPlayerCount] = useState(4);
  const [names, setNames] = useState(
    Array.from({ length: 4 }, (_, i) => `Player ${i + 1}`)
  );

  // keep names array in sync with playerCount
  useEffect(() => {
    setNames((prev) => {
      const next = [...prev];
      if (playerCount > prev.length) {
        for (let i = prev.length; i < playerCount; i++) {
          next[i] = `Player ${i + 1}`;
        }
      } else if (playerCount < prev.length) {
        next.length = playerCount;
      }
      return next;
    });
  }, [playerCount]);

  function updateName(index, value) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function onContinue() {
    const trimmed = names.map((n, i) => {
      const t = (n || "").trim();
      return t.length ? t : `Player ${i + 1}`;
    });

    navigation.navigate("Game", {
      mode,
      players: playerCount,
      playerNames: trimmed,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.padded}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Player Setup</Text>
          <Text style={styles.smallMuted}>Mode: {mode}</Text>

          {/* Player count */}
          <View style={styles.counterRow}>
            <TouchableOpacity
              onPress={() =>
                setPlayerCount((p) => Math.max(2, Math.min(12, p - 1)))
              }
              style={styles.counterButton}
            >
              <Text style={styles.counterText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.counterValue}>{playerCount}</Text>

            <TouchableOpacity
              onPress={() =>
                setPlayerCount((p) => Math.max(2, Math.min(12, p + 1)))
              }
              style={styles.counterButton}
            >
              <Text style={styles.counterText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Names list */}
          <View style={{ marginTop: 10 }}>
            <Text style={[styles.smallMuted, { marginBottom: 6 }]}>
              Add player names (optional, but more fun 😉)
            </Text>

            {Array.from({ length: playerCount }).map((_, i) => (
              <View
                key={`player-${i}`}
                style={{
                  marginBottom: 8,
                  backgroundColor: "#0e1119",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <Text
                  style={{
                    color: "#9aa0a6",
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  Player {i + 1}
                </Text>
                <TextInput
                  placeholder={`Player ${i + 1}`}
                  placeholderTextColor="#5b6470"
                  value={names[i]}
                  onChangeText={(text) => updateName(i, text)}
                  style={{
                    color: "#ffffff",
                    fontSize: 15,
                    paddingVertical: 4,
                  }}
                  returnKeyType="next"
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 18 }]}
            onPress={onContinue}
          >
            <Text style={styles.primaryButtonText}>Start Game</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
