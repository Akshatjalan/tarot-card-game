import { Image, Text, View } from "react-native";
import styles from "../theme/styles";
import { cardImages } from "../utils/cardImages";

/**
 * CardView - improved visuals:
 * - shows art (or placeholder)
 * - glyph overlay (top-left)
 * - auto-scaling prompt font size based on length
 */

function scaledFontSize(text, base = 16) {
  if (!text) return base;
  const len = text.length;
  if (len > 220) return base - 4;
  if (len > 180) return base - 3;
  if (len > 140) return base - 2;
  if (len > 90) return base - 1;
  return base;
}

export default function CardView({ card = {}, prompt = "" }) {
  // art should be a require(...) path in cards.json or null -> fallback
  let artSource;
  try {
    artSource = card?.art ? cardImages[card.art] : require("../../assets/cards/cards_back.png");
  } catch (e) {
    artSource = require("../../assets/cards/cards_back.png");
  }

  // glyph: small icon (use card-back or separate glyph asset)
  let glyphSource;
  try {
    glyphSource = require("../../assets/cards/cards_back.png");
  } catch (e) {
    glyphSource = null;
  }

  return (
    <View style={styles.cardInner}>
      <Image source={artSource} style={styles.cardArt} />

      {glyphSource ? <Image source={glyphSource} style={styles.cardGlyph} /> : null}

      <Text style={styles.cardTitle}>{card?.name || "Unknown Card"}</Text>

      <View style={styles.ruleBox}>
        <Text
          style={[styles.ruleText, { fontSize: scaledFontSize(prompt, 16) }]}
          numberOfLines={6}
          ellipsizeMode="tail"
        >
          {prompt}
        </Text>
      </View>
    </View>
  );
}
