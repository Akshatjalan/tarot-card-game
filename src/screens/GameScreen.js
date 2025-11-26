// src/screens/GameScreen.js
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MiniGameOverlay from "../components/MiniGameOverlay";
import cardsData from "../data/cards.json";
import styles from "../theme/styles";
import { pickRandomPrompt } from "../utils/cardUtils";

/**
 * GameScreen:
 * - Player names from PlayerSetup
 * - Prompts with {player}, {next}, {someone}, {random}, {you}
 * - Mini-games via card.miniGame
 * - Clean card flip animation (no ghost card)
 * - Responsive + scroll-safe layout
 */

// responsive card size
const SCREEN_W = Math.max(Dimensions.get("window").width, 320);
const CARD_W_BASE = 320;
const HORIZONTAL_GUTTER = 48;
const CARD_W = Math.min(CARD_W_BASE, Math.round(SCREEN_W - HORIZONTAL_GUTTER));
const CARD_H = Math.round(CARD_W * 1.5);
const CARD_BORDER_RADIUS = 18;

// local assets map
const ART_MAP = {
  major_00_fool: require("../../assets/cards/fool_img.png"),
  fool: require("../../assets/cards/fool_img.png"),
  major_13_death: require("../../assets/cards/death_img.png"),
  death: require("../../assets/cards/death_img.png"),
  major_06_lovers: require("../../assets/cards/lovers_img.png"),
  lovers: require("../../assets/cards/lovers_img.png"),
  major_16_tower: require("../../assets/cards/tower_img.png"),
  tower: require("../../assets/cards/tower_img.png"),
  wheel_img: require("../../assets/cards/wheel_fortune_img.png"),
  major_10_wheel_of_fortune: require("../../assets/cards/wheel_fortune_img.png"),
  judgement_img: require("../../assets/cards/judgement_img.png"),
  major_20_judgement: require("../../assets/cards/judgement_img.png"),
  hermit_img: require("../../assets/cards/hermit_img2.png"),
  major_09_hermit: require("../../assets/cards/hermit_img2.png"),
  devil_img: require("../../assets/cards/dev_img.png"),
  major_15_devil: require("../../assets/cards/dev_img.png"),
  cards_back: require("../../assets/cards/cards_back.png"),
};

function timeLabel(ts) {
  if (!ts) return "";
  const delta = Math.floor((Date.now() - ts) / 1000);
  if (delta < 5) return "just now";
  if (delta < 60) return `${delta}s`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h`;
  const d = new Date(ts);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function GameScreen({ navigation, route }) {
  const rawMode = route?.params?.mode || "party";
  const mode = rawMode
    .split("_")
    .map((t) => (t ? t[0].toUpperCase() + t.slice(1) : ""))
    .join(" / ");

  const playerCountParam = route?.params?.players || 4;
  const playerNamesParam = Array.isArray(route?.params?.playerNames)
    ? route.params.playerNames
    : [];

  // stable players array
  const players = playerNamesParam.length
    ? playerNamesParam
    : Array.from({ length: playerCountParam }, (_, i) => `Player ${i + 1}`);

  const totalPlayers = players.length || 1;
  const deck = cardsData || [];

  const [currentCard, setCurrentCard] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [history, setHistory] = useState([]); // { card, prompt, ts, playerIndex }
  const [menuVisible, setMenuVisible] = useState(false);
  const [rerollsLeft, setRerollsLeft] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState(null); // { config, playerIndex }

  const flipAnim = useRef(new Animated.Value(0)).current; // 0 = back, 1 = front
  const popAnim = useRef(new Animated.Value(1)).current;

  const MINIGAME_PROBABILITY = 0.4;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((r) => setReduceMotion(!!r))
      .catch(() => { });
  }, []);

  function pickCardFromDeck() {
    const filtered = deck.filter((c) => c.modes && c.modes.includes(rawMode));
    const source = filtered.length ? filtered : deck;
    if (!source.length) return null;
    const idx = Math.floor(Math.random() * source.length);
    return source[idx];
  }

  function getLocalArt(card) {
    const fallback = ART_MAP["cards_back"];
    if (!card) return fallback;
    if (card.id && ART_MAP[card.id]) return ART_MAP[card.id];

    if (card.id) {
      const parts = String(card.id).split("_");
      const last = parts[parts.length - 1];
      if (ART_MAP[last]) return ART_MAP[last];
    }

    if (card.name) {
      const norm = String(card.name).toLowerCase().replace(/[^a-z0-9]+/g, "_");
      if (ART_MAP[norm]) return ART_MAP[norm];
      const short = norm.replace(/^(the_|card_)/, "");
      if (ART_MAP[short]) return ART_MAP[short];
    }

    if (card.art && typeof card.art !== "string") return card.art;
    return fallback;
  }

  // placeholder → name
  function personalizePrompt(rawPrompt, turnIndex) {
    if (!rawPrompt) return rawPrompt;
    const me = players[turnIndex] || `Player ${turnIndex + 1}`;
    const next = players[(turnIndex + 1) % totalPlayers] || me;
    const others =
      totalPlayers > 1
        ? players.filter((_, i) => i !== turnIndex)
        : [me];
    const randomOther =
      others[Math.floor(Math.random() * others.length)] || me;

    return rawPrompt
      .replace(/\{player\}/gi, me)
      .replace(/\{you\}/gi, me)
      .replace(/\{next\}/gi, next)
      .replace(/\{someone\}/gi, randomOther)
      .replace(/\{random\}/gi, randomOther);
  }

  function runFlipAnimation() {
    if (reduceMotion) {
      flipAnim.setValue(1);
      popAnim.setValue(1);
      return;
    }

    flipAnim.setValue(0);
    popAnim.setValue(0.96);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(flipAnim, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(popAnim, {
          toValue: 1.04,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(popAnim, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }

  async function shuffleThenReveal() {
    const card = pickCardFromDeck();
    if (!card) return;

    try {
      await Haptics.selectionAsync();
    } catch (e) { }

    const turnIndex = history.length % totalPlayers;
    const rawPrompt = pickRandomPrompt(card);
    const personalized = personalizePrompt(rawPrompt, turnIndex);

    const hasMiniGame = !!card.miniGame;
    const shouldTriggerMini =
      hasMiniGame && Math.random() < MINIGAME_PROBABILITY;

    // Update card + history
    setCurrentCard(card);

    // Decide what goes into the visible prompt & history
    if (shouldTriggerMini) {
      // For mini-game: no big prompt block, mini-game overlay handles the logic
      setCurrentPrompt("");

      setHistory((h) =>
        [
          {
            card,
            // store something meaningful for history view
            prompt: `Mini-game: ${card.miniGame.title || "Bonus challenge"}`,
            ts: Date.now(),
            playerIndex: turnIndex,
            kind: "minigame",
          },
          ...h,
        ].slice(0, 50)
      );

      setActiveMiniGame({
        config: card.miniGame,
        playerIndex: turnIndex,
      });
    } else {
      // Normal prompt-only flow
      setCurrentPrompt(personalized);

      setHistory((h) =>
        [
          {
            card,
            prompt: personalized,
            ts: Date.now(),
            playerIndex: turnIndex,
            kind: "prompt",
          },
          ...h,
        ].slice(0, 50)
      );

      setActiveMiniGame(null);
    }

    // Run the flip animation (or instant if reduceMotion)
    runFlipAnimation();
  }


  async function onReroll() {
    if (rerollsLeft <= 0) return;
    try {
      await Haptics.impactAsync();
    } catch (e) { }
    setRerollsLeft((r) => Math.max(0, r - 1));
    shuffleThenReveal();
  }

  function onDraw() {
    shuffleThenReveal();
  }

  const currentTurnIndex = history.length % totalPlayers;
  const currentTurnNumber = currentTurnIndex + 1;
  const currentPlayerName =
    players[currentTurnIndex] || `Player ${currentTurnNumber}`;

  const backArtSrc = ART_MAP["cards_back"] || require("../../assets/cards/cards_back.png");
  const frontArtSrc = getLocalArt(currentCard);
  const recentItems = history.slice(0, 8);

  // flip style
  const scaleX = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, -1],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5001, 1],
    outputRange: [0, 0, 1, 1],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.4999, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  const cardTransformStyle = {
    transform: [{ scaleX }, { scale: popAnim }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#071018", "#0b0b12"]} style={styles.containerGradient}>

        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 20,
            paddingBottom: Platform.OS === "ios" ? 36 : 24,
            paddingTop: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Mode badge */}
          <View style={{ width: CARD_W, marginTop: 10, alignItems: "center" }}>
            <View
              style={{
                backgroundColor: "rgba(214,168,76,0.08)",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: "#D6A84C", fontWeight: "800", fontSize: "20" }}>{mode} Mode</Text>
            </View>
          </View>

          {/* Current turn */}
          <View style={{ width: CARD_W, marginTop: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#0f1720",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Text style={{ color: "#D6A84C", fontWeight: "800" }}>
                  {currentTurnNumber}
                </Text>
              </View>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                {currentPlayerName}&apos;s turn
              </Text>
            </View>
          </View>

          {/* Card title header */}
          <View style={{ width: CARD_W, alignItems: "center", marginTop: 12 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 0.2 }}>
              {currentCard ? currentCard.name : "Tarot Party"}
            </Text>
            <View style={{ height: 8 }} />
            <View
              style={{
                height: 4,
                width: 96,
                backgroundColor: "#D6A84C",
                borderRadius: 4,
                opacity: currentCard ? 1 : 0.5,
              }}
            />
          </View>

          {/* Card area */}
          <View
            style={{
              width: CARD_W,
              height: CARD_H,
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 14,
            }}
          >
            {/* BACK face */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: CARD_W,
                  height: CARD_H,
                  borderRadius: CARD_BORDER_RADIUS,
                  overflow: "hidden",
                  elevation: 8,
                  zIndex: 10,
                  backgroundColor: "#000",
                },
                cardTransformStyle,
                { opacity: backOpacity },
              ]}
            >
              <Image
                source={backArtSrc}
                style={{ width: CARD_W, height: CARD_H, resizeMode: "cover" }}
                accessible={false}
              />
            </Animated.View>

            {/* FRONT face */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: CARD_W,
                  height: CARD_H,
                  borderRadius: CARD_BORDER_RADIUS,
                  overflow: "hidden",
                  elevation: 12,
                  zIndex: 11,
                  backgroundColor: "#000",
                },
                cardTransformStyle,
                { opacity: frontOpacity },
              ]}
            >
              {/* Inner wrapper counter-flips the art so it isn't mirrored */}
              <View style={{ flex: 1, transform: [{ scaleX: -1 }] }}>
                <Image
                  source={frontArtSrc}
                  style={{ width: CARD_W, height: CARD_H, resizeMode: "cover" }}
                  accessible={false}
                />
              </View>
            </Animated.View>


            {/* Centered DRAW button when no card */}
            {!currentCard && (
              <TouchableOpacity
                onPress={onDraw}
                activeOpacity={0.9}
                style={{
                  position: "absolute",
                  width: Math.min(160, CARD_W - 40),
                  height: 56,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#D6A84C",
                  zIndex: 20,
                }}
                accessibilityRole="button"
                accessibilityLabel="Draw a card"
              >
                <Text style={{ color: "#071018", fontWeight: "900", fontSize: 18 }}>
                  DRAW
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Prompt panel */}
          <View style={{ width: CARD_W, marginBottom: 14 }}>
            <View
              style={{
                borderRadius: 14,
                padding: 14,
                backgroundColor: "rgba(0,0,0,0.66)",
              }}
            >
              {currentPrompt ? (
                <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
                  <Text
                    style={{
                      color: "#e6e6e6",
                      fontSize: 16,
                      lineHeight: 22,
                      textAlign: "center",
                      paddingHorizontal: 6,
                    }}
                  >
                    {currentPrompt}
                  </Text>
                </ScrollView>
              ) : (
                <Text style={{ color: "#9aa0a6", fontSize: 15, textAlign: "center" }}>
                  Prompt will appear here after you draw a card.
                </Text>
              )}
            </View>
          </View>

          {/* Controls */}
          <View
            style={{
              width: CARD_W,
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              style={[
                styles.ghostButton,
                rerollsLeft <= 0 ? { opacity: 0.36 } : null,
                { marginRight: 8, marginBottom: 8 },
              ]}
              onPress={() => {
                if (rerollsLeft > 0) onReroll();
              }}
              disabled={rerollsLeft <= 0}
              accessibilityRole="button"
            >
              <Text style={styles.ghostButtonText}>
                Reroll {rerollsLeft > 0 ? `(${rerollsLeft})` : ""}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButtonSmall, { marginBottom: 8 }]}
              onPress={onDraw}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonTextSmall}>Next</Text>
            </TouchableOpacity>
          </View>

          {/* Recent */}
          <View style={{ width: CARD_W, marginBottom: 20 }}>
            <Text style={{ color: "#ddd", fontWeight: "700", marginBottom: 8 }}>
              Recent
            </Text>
            {recentItems.length === 0 ? (
              <View
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.015)",
                }}
              >
                <Text style={{ color: "#9aa0a6" }}>
                  No cards drawn yet — draw to start the fun.
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 6 }}
              >
                {recentItems.map((h) => {
                  const art = getLocalArt(h.card);
                  const who =
                    typeof h.playerIndex === "number"
                      ? players[h.playerIndex] || `Player ${h.playerIndex + 1}`
                      : null;

                  return (
                    <View key={h.ts} style={{ minWidth: 220, marginRight: 10 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "rgba(255,255,255,0.02)",
                          padding: 10,
                          borderRadius: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 8,
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            source={art}
                            style={{ width: 56, height: 56, resizeMode: "cover" }}
                            accessible={false}
                          />
                        </View>

                        <View style={{ marginLeft: 10, flex: 1 }}>
                          <Text
                            style={{ color: "#fff", fontWeight: "800" }}
                            numberOfLines={1}
                          >
                            {h.card?.name}
                          </Text>
                          {who && (
                            <Text
                              style={{
                                color: "#9aa0a6",
                                fontSize: 11,
                                marginTop: 2,
                              }}
                              numberOfLines={1}
                            >
                              For: {who}
                            </Text>
                          )}
                          <Text
                            style={{ color: "#cfcfcf", marginTop: 4 }}
                            numberOfLines={2}
                          >
                            {h.prompt}
                          </Text>
                        </View>

                        <Text
                          style={{ color: "#9aa0a6", marginLeft: 8, fontSize: 11 }}
                        >
                          {timeLabel(h.ts)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </ScrollView>

        {/* Menu */}
        <Modal visible={menuVisible} transparent animationType="slide">
          <View style={styles.menuModal}>
            <View style={styles.menuContent}>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Resume Game</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  setCurrentCard(null);
                  setCurrentPrompt("");
                  setHistory([]);
                  setRerollsLeft(1);
                  flipAnim.setValue(0);
                  popAnim.setValue(1);
                  setActiveMiniGame(null);
                }}
              >
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Restart Game</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("ModeSelect");
                }}
              >
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Change Mode</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("History", { history });
                }}
              >
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Card History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Settings");
                }}
              >
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={{ color: "#888", paddingVertical: 10 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Mini-game overlay */}
        {activeMiniGame && (
          <MiniGameOverlay
            miniGame={activeMiniGame.config}
            players={players}
            playerIndex={activeMiniGame.playerIndex}
            onClose={() => setActiveMiniGame(null)}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
