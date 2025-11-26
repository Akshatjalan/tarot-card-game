// src/screens/SettingsScreen.js
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "../theme/styles";

export default function SettingsScreen() {
  const [nsfw, setNsfw] = useState(false);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [miniGames, setMiniGames] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#071018", "#0b0b12"]} style={styles.containerGradient}>
        <StatusBar barStyle="light-content" />

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 18,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                color: "#F8EBDD",
                fontSize: 28,
                fontWeight: "800",
                letterSpacing: 0.5,
              }}
            >
              Settings
            </Text>
            <Text
              style={{
                color: "#9aa0a6",
                marginTop: 4,
                fontSize: 14,
              }}
            >
              Tune the vibes, difficulty, and chaos for your Tarot Party.
            </Text>
          </View>

          {/* Session section */}
          <View
            style={{
              backgroundColor: "rgba(9,14,24,0.95)",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#d5dde3",
                fontSize: 13,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Session
            </Text>

            {/* NSFW toggle */}
            <SettingRow
              label="NSFW / Spicy prompts"
              description="Turn on for bolder, more adult dares."
              value={nsfw}
              onValueChange={setNsfw}
            />

            {/* Mini-games */}
            <SettingRow
              label="Mini-games on special cards"
              description="Enable quick bonus challenges like timers & versus rounds."
              value={miniGames}
              onValueChange={setMiniGames}
            />
          </View>

          {/* Feedback section */}
          <View
            style={{
              backgroundColor: "rgba(9,14,24,0.95)",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#d5dde3",
                fontSize: 13,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Feedback
            </Text>

            <SettingRow
              label="Sound effects"
              description="Card flips, whooshes and subtle chimes."
              value={sound}
              onValueChange={setSound}
            />

            <SettingRow
              label="Vibration / Haptics"
              description={Platform.OS === "web" ? "Uses device support where available." : "Tiny bumps on card draw & reroll."}
              value={vibration}
              onValueChange={setVibration}
            />
          </View>

          {/* Accessibility section */}
          <View
            style={{
              backgroundColor: "rgba(9,14,24,0.95)",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color: "#d5dde3",
                fontSize: 13,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Accessibility
            </Text>

            <SettingRow
              label="High contrast mode"
              description="Stronger text contrast for low-light or small screens."
              value={highContrast}
              onValueChange={setHighContrast}
            />

            <View
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              <Text style={{ color: "#9aa0a6", fontSize: 12 }}>
                More options like font size and reduced motion will appear here in a future version.
              </Text>
            </View>
          </View>

          {/* Footer info */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 8,
              opacity: 0.8,
            }}
          >
            <Text style={{ color: "#6f7a82", fontSize: 12 }}>Tarot Party • v1.0.0</Text>
            <Text style={{ color: "#6f7a82", fontSize: 12, marginTop: 2 }}>
              Adjust settings per group before you start drawing cards.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

/**
 * Reusable row component: label + description + Switch
 */
function SettingRow({ label, description, value, onValueChange }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: "#ffffff", fontSize: 15, fontWeight: "600" }}>
          {label}
        </Text>
        {description ? (
          <Text
            style={{
              color: "#9aa0a6",
              fontSize: 12,
              marginTop: 3,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#3b4250", true: "#D6A84C55" }}
        thumbColor={value ? "#D6A84C" : "#f4f3f4"}
      />
    </TouchableOpacity>
  );
}
