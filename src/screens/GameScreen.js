// src/screens/GameScreen.js
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Header";
import cardsData from "../data/cards.json";
import styles from "../theme/styles";
import { pickRandomPrompt } from "../utils/cardUtils";

/**
 * Responsive GameScreen:
 * - CARD size computed from screen width (keeps layout working on mobile & web)
 * - Vertical ScrollView so nothing gets clipped
 * - Controls row wraps on small widths
 * - Recent list constrained to card width
 * - No animations (per previous request)
 */

// compute responsive card size
const SCREEN_W = Math.max(Dimensions.get("window").width, 320);
const CARD_W_BASE = 320; // intended design width
const HORIZONTAL_GUTTER = 48; // total side padding
const CARD_W = Math.min(CARD_W_BASE, Math.round(SCREEN_W - HORIZONTAL_GUTTER));
const CARD_H = Math.round(CARD_W * 1.5);
const CARD_BORDER_RADIUS = 18;
const LAYERS = 3;

// local asset map (keep/extend as needed)
const ART_MAP = {
  major_00_fool: require("../../assets/cards/fool_img.png"),
  fool: require("../../assets/cards/fool_img.png"),
  major_13_death: require("../../assets/cards/death_img.png"),
  death: require("../../assets/cards/death_img.png"),
  major_06_lovers: require("../../assets/cards/lovers_img.png"),
  lovers: require("../../assets/cards/lovers_img.png"),
  major_16_tower: require("../../assets/cards/tower_img.png"),
  tower: require("../../assets/cards/tower_img.png"),
  wheel_img: require('../../assets/cards/wheel_fortune_img.png'),
  major_10_wheel_of_fortune: require('../../assets/cards/wheel_fortune_img.png'),
  judgement_img: require('../../assets/cards/judgement_img.png'),
  major_20_judgement: require('../../assets/cards/judgement_img.png'),
  hermit_img: require('../../assets/cards/hermit_img2.png'),
  major_09_hermit: require('../../assets/cards/hermit_img2.png'),
  devil_img: require('../../assets/cards/dev_img.png'),
  major_15_devil: require('../../assets/cards/dev_img.png'),
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
  const players = route?.params?.players || 4;
  const deck = cardsData || [];

  const [currentCard, setCurrentCard] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [history, setHistory] = useState([]); // newest first
  const [menuVisible, setMenuVisible] = useState(false);
  const [rerollsLeft, setRerollsLeft] = useState(1);

  useEffect(() => {
    // listen for orientation / size change if you want to re-calc CARD_W dynamically
    // for now we compute once at mount for simplicity
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

  async function shuffleThenReveal() {
    const card = pickCardFromDeck();
    if (!card) return;
    try { await Haptics.selectionAsync(); } catch (e) {}
    setCurrentCard(card);
    const prompt = pickRandomPrompt(card);
    setCurrentPrompt(prompt);
    setHistory((h) => [{ card, prompt, ts: Date.now() }, ...h].slice(0, 50));
  }

  async function onReroll() {
    if (rerollsLeft <= 0) return;
    try { await Haptics.impactAsync(); } catch (e) {}
    setRerollsLeft((r) => Math.max(0, r - 1));
    shuffleThenReveal();
  }

  function onDraw() { shuffleThenReveal(); }

  const currentTurn = (history.length % players) + 1;
  const backArtSrc = ART_MAP["cards_back"] || require("../../assets/cards/cards_back.png");
  const frontArtSrc = getLocalArt(currentCard);
  const recentItems = history.slice(0, 8);

  function renderLayerStatic(i, artSource) {
    const offsetY = i * 6;
    const offsetX = i % 2 === 0 ? -2 : 2;
    const scale = 1 - i * 0.02;
    const opacity = 1 - i * 0.06;
    return (
      <View
        key={`layer-${i}`}
        style={{
          position: "absolute",
          width: CARD_W,
          height: CARD_H,
          borderRadius: CARD_BORDER_RADIUS,
          overflow: "hidden",
          transform: [{ translateX: offsetX }, { translateY: offsetY }, { scale }],
          opacity,
          elevation: i === 0 ? 8 : 2,
          zIndex: 2 + i,
          backgroundColor: "#000",
        }}
        pointerEvents="none"
      >
        <Image source={artSource} style={{ width: CARD_W, height: CARD_H, resizeMode: "cover" }} accessible={false} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#071018", "#0b0b12"]} style={styles.containerGradient}>
        <StatusBar barStyle="light-content" />
        <Header leftAction={() => navigation.navigate("Home")} title="Tarot Party" rightAction={() => setMenuVisible(true)} />

        {/* vertical scroll so content never clips */}
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 36 : 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top: mode label */}
          <View style={{ width: CARD_W, marginTop: 10, alignItems: "flex-start" }}>
            <View style={{ backgroundColor: "rgba(214,168,76,0.08)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
              <Text style={{ color: "#D6A84C", fontWeight: "800" }}>{mode} Mode</Text>
            </View>
          </View>

          {/* turn */}
          <View style={{ width: CARD_W, marginTop: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#0f1720", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                <Text style={{ color: "#D6A84C", fontWeight: "800" }}>{currentTurn}</Text>
              </View>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Player {currentTurn}'s chance</Text>
            </View>
          </View>

          {/* Card title header outside card */}
          <View style={{ width: CARD_W, alignItems: "center", marginTop: 12 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 0.2 }}>
              {currentCard ? currentCard.name : "Tarot Party"}
            </Text>
            <View style={{ height: 8 }} />
            <View style={{ height: 4, width: 96, backgroundColor: "#D6A84C", borderRadius: 4, opacity: currentCard ? 1 : 0.36 }} />
          </View>

          {/* Card area */}
          <View style={{ width: CARD_W, height: CARD_H, alignItems: "center", justifyContent: "center", marginVertical: 14 }}>
            {Array.from({ length: LAYERS }).map((_, i) => renderLayerStatic(i, frontArtSrc))}

            {!currentCard && (
              <View style={{ position: "absolute", width: CARD_W, height: CARD_H, borderRadius: CARD_BORDER_RADIUS, overflow: "hidden", elevation: 8, zIndex: 10 }}>
                <Image source={backArtSrc} style={{ width: CARD_W, height: CARD_H, resizeMode: "cover" }} accessible={false} />
              </View>
            )}

            {currentCard && (
              <View style={{ position: "absolute", width: CARD_W, height: CARD_H, borderRadius: CARD_BORDER_RADIUS, overflow: "hidden", elevation: 12, zIndex: 11 }}>
                <Image source={frontArtSrc} style={{ width: CARD_W, height: CARD_H, resizeMode: "cover" }} accessible={false} />
              </View>
            )}

            {/* Draw button is visually centered but page scroll avoids clipping on small screens */}
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
                <Text style={{ color: "#071018", fontWeight: "900", fontSize: 18 }}>DRAW</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Prompt panel (separate) */}
          <View style={{ width: CARD_W, marginBottom: 14 }}>
            <LinearGradient colors={["rgba(255,255,255,0.015)", "rgba(255,255,255,0.015)"]} style={{ borderRadius: 14, padding: 14 }}>
              {currentPrompt ? (
                <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
                  <Text style={{ color: "#e6e6e6", fontSize: 16, lineHeight: 22, textAlign: "center", paddingHorizontal: 6 }}>
                    {currentPrompt}
                  </Text>
                </ScrollView>
              ) : (
                <Text style={{ color: "#9aa0a6", fontSize: 15, textAlign: "center" }}>Prompt will appear here after you draw a card.</Text>
              )}
            </LinearGradient>
          </View>

          {/* Controls row — responsive: wraps on small widths */}
          <View style={{ width: CARD_W, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
            <TouchableOpacity
              style={[
                styles.ghostButton,
                rerollsLeft <= 0 ? { opacity: 0.36 } : null,
                { marginRight: 8, marginBottom: 8 },
              ]}
              onPress={() => { if (rerollsLeft > 0) onReroll(); }}
              disabled={rerollsLeft <= 0}
              accessibilityRole="button"
            >
              <Text style={styles.ghostButtonText}>Reroll {rerollsLeft > 0 ? `(${rerollsLeft})` : ""}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.primaryButtonSmall, { marginBottom: 8 }]} onPress={() => { onDraw(); }} accessibilityRole="button">
              <Text style={styles.primaryButtonTextSmall}>Next</Text>
            </TouchableOpacity>
          </View>

          {/* Recent — constrained to CARD_W so it won't overflow */}
          <View style={{ width: CARD_W, marginBottom: 20 }}>
            <Text style={{ color: "#ddd", fontWeight: "700", marginBottom: 8 }}>Recent</Text>
            {recentItems.length === 0 ? (
              <View style={{ padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.015)" }}>
                <Text style={{ color: "#9aa0a6" }}>No cards drawn yet — draw to start the fun.</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
                {recentItems.map((h) => {
                  const art = getLocalArt(h.card);
                  return (
                    <View key={h.ts} style={{ minWidth: 200, marginRight: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.02)", padding: 10, borderRadius: 12 }}>
                        <View style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden" }}>
                          <Image source={art} style={{ width: 56, height: 56, resizeMode: "cover" }} accessible={false} />
                        </View>

                        <View style={{ marginLeft: 10, flex: 1 }}>
                          <Text style={{ color: "#fff", fontWeight: "800" }} numberOfLines={1}>{h.card?.name}</Text>
                          <Text style={{ color: "#cfcfcf", marginTop: 4 }} numberOfLines={2}>{h.prompt}</Text>
                        </View>

                        <Text style={{ color: "#9aa0a6", marginLeft: 8, fontSize: 11 }}>{timeLabel(h.ts)}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </ScrollView>

        {/* Menu modal */}
        <Modal visible={menuVisible} transparent animationType="slide">
          <View style={styles.menuModal}>
            <View style={styles.menuContent}>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Resume Game</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMenuVisible(false); setCurrentCard(null); setHistory([]); setRerollsLeft(1); }}>
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Restart Game</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate("ModeSelect"); }}>
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Change Mode</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate("History", { history }); }}>
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Card History</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate("Settings"); }}>
                <Text style={{ color: "#fff", paddingVertical: 10 }}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text style={{ color: "#888", paddingVertical: 10 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}
