// src/components/MiniGameOverlay.js
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function substitutePlaceholders(text, players, playerIndex) {
  if (!text) return text;
  const me = players[playerIndex] || `Player ${playerIndex + 1}`;
  const next = players[(playerIndex + 1) % players.length] || me;
  const others =
    players.length > 1
      ? players.filter((_, i) => i !== playerIndex)
      : [me];
  const randomOther =
    others[Math.floor(Math.random() * others.length)] || me;

  return text
    .replace(/\{player\}/gi, me)
    .replace(/\{you\}/gi, me)
    .replace(/\{next\}/gi, next)
    .replace(/\{someone\}/gi, randomOther)
    .replace(/\{random\}/gi, randomOther);
}

export default function MiniGameOverlay({
  miniGame,
  players,
  playerIndex,
  onClose,
}) {
  const [secondsLeft, setSecondsLeft] = useState(
    miniGame.type === "timer_challenge" ? miniGame.durationSec || 30 : 0
  );

  // simple countdown for timer_challenge
  useEffect(() => {
    if (miniGame.type !== "timer_challenge") return;
    if (!secondsLeft || secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, miniGame.type]);

  const title = substitutePlaceholders(miniGame.title, players, playerIndex);
  const description = substitutePlaceholders(
    miniGame.description,
    players,
    playerIndex
  );

  function renderTimer() {
    return (
      <View style={{ alignItems: "center", marginTop: 18 }}>
        <Text style={{ color: "#9aa0a6", marginBottom: 4 }}>Time left</Text>
        <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800" }}>
          {secondsLeft}s
        </Text>
      </View>
    );
  }

  function renderVote() {
    const options = miniGame.options || [];
    return (
      <View style={{ marginTop: 14 }}>
        {options.map((opt, idx) => {
          const label = substitutePlaceholders(opt, players, playerIndex);
          return (
            <TouchableOpacity
              key={`${opt}-${idx}`}
              style={{
                marginBottom: 8,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
              onPress={onClose}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  function renderVersus() {
    const me = players[playerIndex] || `Player ${playerIndex + 1}`;
    const others =
      players.length > 1
        ? players.filter((_, i) => i !== playerIndex)
        : [me];
    const opponent =
      others[Math.floor(Math.random() * others.length)] || me;

    return (
      <View style={{ marginTop: 16 }}>
        <Text
          style={{
            color: "#9aa0a6",
            fontSize: 13,
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          Group decides the winner 👇
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {[me, opponent].map((name) => (
            <TouchableOpacity
              key={name}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.06)",
                alignItems: "center",
              }}
              onPress={onClose}
            >
              <Text
                style={{ color: "#fff", fontWeight: "800" }}
                numberOfLines={1}
              >
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  function renderContent() {
    switch (miniGame.type) {
      case "timer_challenge":
        return (
          <>
            {renderTimer()}
            <TouchableOpacity
              onPress={onClose}
              style={{ marginTop: 20, alignSelf: "center" }}
            >
              <Text style={{ color: "#D6A84C", fontWeight: "700" }}>Done</Text>
            </TouchableOpacity>
          </>
        );
      case "vote":
        return renderVote();
      case "versus":
        return renderVersus();
      default:
        return (
          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 18, alignSelf: "center" }}
          >
            <Text style={{ color: "#D6A84C", fontWeight: "700" }}>Close</Text>
          </TouchableOpacity>
        );
    }
  }

  return (
    <Modal transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <LinearGradient
          colors={["#10141f", "#05070b"]}
          style={{
            width: "100%",
            borderRadius: 18,
            padding: 18,
            maxHeight: "75%",
          }}
        >
          {/* header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "800",
                fontSize: 18,
                flex: 1,
                marginRight: 10,
              }}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: "#9aa0a6", fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* description */}
          <ScrollView
            style={{ maxHeight: 160, marginBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {description ? (
              <Text
                style={{
                  color: "#cfd3d8",
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {description}
              </Text>
            ) : null}
          </ScrollView>

          {renderContent()}
        </LinearGradient>
      </View>
    </Modal>
  );
}
