// src/screens/HomeScreen.js
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ModeChip from "../components/ModeChip";
import styles from "../theme/styles";

const IMAGE_SWITCH_INTERVAL = 2500; // ms

// Replace these with your real card images
const HERO_IMAGES = [
  require("../../assets/cards/fool_img.png"),
  require("../../assets/cards/death_img.png"),
  require("../../assets/cards/lovers_img.png"),
  require("../../assets/cards/tower_img.png"),
];

export default function HomeScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  // reduce-motion
  const reduceMotionRef = useRef(false);

  // animation refs
  // We'll use a stack of N layers (3 looks good)
  const LAYERS = 5;
  const layers = useRef(
    Array.from({ length: LAYERS }).map(() => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0), // degrees
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
    }))
  ).current;

  // base float animation for the whole visible card (subtle bob)
  const floatAnim = useRef(new Animated.Value(0)).current;

  // control whether an animation is running
  const animatingRef = useRef(false);

  // interval handle
  const intervalRef = useRef(null);

  useEffect(() => {
    // check reduce motion
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      reduceMotionRef.current = reduce;
      if (!reduce) startAutoCycle();
    });

    // start float (subtle) if motion allowed
    if (!reduceMotionRef.current) startFloat();

    return () => {
      stopAutoCycle();
      stopFloat();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAutoCycle() {
    stopAutoCycle();
    intervalRef.current = setInterval(() => {
      triggerShuffleToNext();
    }, IMAGE_SWITCH_INTERVAL);
  }
  function stopAutoCycle() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startFloat() {
    // gentle up/down loop for the top card
    floatAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: -1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }
  function stopFloat() {
    try { floatAnim.stopAnimation(); } catch (e) {}
  }

  // utility: set reset positions for layers
  function resetLayers() {
    for (let i = 0; i < LAYERS; i++) {
      const t = layers[i];
      t.translateX.setValue(0);
      t.translateY.setValue(i * 6); // slight stacked offset
      t.rotate.setValue( (i % 2 === 0 ? -4 : 4) ); // degrees
      t.scale.setValue(1 - i * 0.03);
      t.opacity.setValue(1 - i * 0.08);
    }
  }
  // init
  useEffect(() => {
    resetLayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // core: shuffle animation then set next index
  function triggerShuffleToNext() {
    if (animatingRef.current) return;
    if (reduceMotionRef.current) {
      // just quick fade if reduced motion
      const next = (indexRef.current + 1) % HERO_IMAGES.length;
      indexRef.current = next;
      setIndex(next);
      return;
    }

    animatingRef.current = true;

    // build animation sequence:
    // 1. top layer(s) fling right/up with rotation and fade
    // 2. middle layers shift forward to take top positions
    // 3. final settle: new top card pops in (scale/settle)
    const anims = [];

    // fling top layer(s)
    for (let i = 0; i < LAYERS; i++) {
      const layer = layers[i];
      const delay = i * 40; // small stagger
      // top card moves quickest and further
      const tx = 80 + i * 40;
      const ty = -40 - i * 8;
      const rot = (i % 2 === 0 ? 20 : -22);
      anims.push(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(layer.translateX, { toValue: tx, duration: 320 + i * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(layer.translateY, { toValue: ty, duration: 320 + i * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(layer.rotate, { toValue: rot, duration: 320 + i * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(layer.opacity, { toValue: 0, duration: 260 + i * 60, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(layer.scale, { toValue: 1.06, duration: 360 + i * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]),
        ])
      );
    }

    // run flings in parallel (but already staggered by delays)
    Animated.parallel(anims).start(() => {
      // After cards have flung away, advance index, reset layers off-screen then animate them back in
      const next = (indexRef.current + 1) % HERO_IMAGES.length;
      indexRef.current = next;
      setIndex(next);

      // Immediately reset layer values to slightly off-screen left for re-entry
      for (let i = 0; i < LAYERS; i++) {
        const layer = layers[i];
        // place offscreen left with low opacity and smaller scale
        layer.translateX.setValue(-100 - i * 20);
        layer.translateY.setValue(-20 + i * 6);
        layer.rotate.setValue((i % 2 === 0 ? -8 : 8));
        layer.scale.setValue(0.96 - i * 0.01);
        layer.opacity.setValue(0.0);
      }

      // animate layers back into stacked positions with staggered arrival
      const inAnims = [];
      for (let i = LAYERS - 1; i >= 0; i--) {
        const layer = layers[i];
        const toY = i * 6;
        const toRot = (i % 2 === 0 ? -6 : 20);
        const toScale = 1 - i * 0.03;
        const toOpacity = 1;
        inAnims.push(
          Animated.sequence([
            Animated.delay((LAYERS - 1 - i) * 60),
            Animated.parallel([
              Animated.timing(layer.translateX, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.timing(layer.translateY, { toValue: toY, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.timing(layer.rotate, { toValue: toRot, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.timing(layer.scale, { toValue: toScale, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.timing(layer.opacity, { toValue: toOpacity, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]),
          ])
        );
      }

      Animated.parallel(inAnims).start(() => {
        animatingRef.current = false;
      });
    });
  }

  // tap to trigger shuffle manually (also resets auto cycle)
  function onTapImage() {
    stopAutoCycle();
    triggerShuffleToNext();
    startAutoCycle();
  }

  // derive per-layer transforms
  function getLayerStyle(i) {
    const layer = layers[i];
    const rotateDeg = layer.rotate.interpolate({
      inputRange: [-360, 360],
      outputRange: ["-360deg", "360deg"],
    });
    return {
      transform: [
        { translateX: layer.translateX },
        { translateY: layer.translateY },
        { rotate: rotateDeg },
        { scale: layer.scale },
      ],
      opacity: layer.opacity,
      position: "absolute",
      width: 240,
      height: 240,
      alignItems: "center",
      justifyContent: "center",
    };
  }

  // subtle bob for the top-most visible layer via floatAnim (if not reduced)
  const bobTranslate = floatAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [6, 0, -6],
  });
  const bobRotate = floatAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-2deg", "0deg", "2deg"],
  });

  // render layers: we render same image into each layer so it looks like stacked cards of the same image
  // note: layers[0] is topmost in animation order
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#071018", "#0b0b12"]} style={styles.containerGradient}>
        <View style={[styles.center, { paddingHorizontal: 22 }]}>
          {/* Shuffleable hero stack */}
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={onTapImage}
            accessible={true}
            accessibilityLabel="Shuffle cards"
          >
            <View style={{ width: 240, height: 240, alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              {Array.from({ length: LAYERS }).map((_, i) => {
                // draw from bottom to top so i=LAYERS-1 is bottom
                const idx = index; // all layers show the same current image during animation
                const layerStyle = getLayerStyle(i);
                // If not reduced motion, apply bob on topmost only
                const extraTransform = i === 0 && !reduceMotionRef.current ? { transform: [{ translateY: bobTranslate }, { rotate: bobRotate }] } : null;

                return (
                  <Animated.View key={i} style={[layerStyle, extraTransform]}>
                    <Animated.Image
                      source={HERO_IMAGES[idx]}
                      style={{
                        width: 240,
                        height: 240,
                        borderRadius: 12,
                        resizeMode: "contain",
                        transform: [{ rotate: "-6deg" }],
                      }}
                    />
                  </Animated.View>
                );
              })}
            </View>
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={[styles.title, { textAlign: "center", marginBottom: 6 }]}
            accessibilityRole="header"
            accessibilityLabel="Tarot Party — Draw. Dare. Laugh."
          >
            Tarot Party
          </Text>

          <Text style={[styles.subtitle, { textAlign: "center", marginBottom: 18 }]}>
            Draw.  Dare.  Laugh.
          </Text>

          {/* Pulsing Start CTA */}
          <Animated.View style={{ transform: [{ scale: styles ? new Animated.Value(1) : 1 }] }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("ModeSelect")}
              accessibilityRole="button"
              accessibilityLabel="Start Game"
              activeOpacity={0.85}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.primaryButtonText}>Start Game</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick mode chips */}
          <View
            style={{
              flexDirection: "row",
              marginTop: 22,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ModeChip
              title="Party"
              onPress={() => navigation.navigate("Game", { mode: "party" })}
            />
            <ModeChip
              title="Truth / Dare"
              onPress={() => navigation.navigate("ModeSelect", { default: "truth_dare" })}
            />
            <ModeChip
              title="Couple"
              onPress={() => navigation.navigate("ModeSelect", { default: "couple" })}
            />
          </View>

          {/* Small hint */}
          <Text style={[styles.smallMuted, { marginTop: 18, textAlign: "center", maxWidth: 340 }]}>
            Tap the card to shuffle. Choose a mode or tap Start to pick one later.{'\n'}Tap ⚙️ for settings.
          </Text>
        </View>

        {/* Footer: Settings + version */}
        <View style={{ paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 28 : 18 }}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
            </TouchableOpacity>

            <Text style={{ color: "#6f7a82", fontSize: 12 }}>Made by Akshat Jalan</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
