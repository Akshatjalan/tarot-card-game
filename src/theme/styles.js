// src/theme/styles.js (IMPROVED)
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // base containers
  container: { flex: 1, backgroundColor: "#070812" },
  containerGradient: { flex: 1 },

  // center / padding
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  padded: { flex: 1, padding: 20 },

  // typography
  title: { fontSize: 34, color: "#F8EBDD", fontWeight: "800", letterSpacing: 1, lineHeight: 40 },
  subtitle: { color: "#bfb8a3", marginTop: 6 },

  // primary CTA
  primaryButton: {
    backgroundColor: "#D6A84C",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#D6A84C",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6
  },
  primaryButtonText: { color: "#071018", fontWeight: "800", fontSize: 16 },

  primaryButtonSmall: {
    backgroundColor: "#D6A84C",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonTextSmall: { color: "#071018", fontWeight: "700", fontSize: 14 },

  // FAB (floating draw button)
  fab: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    backgroundColor: "#D6A84C",
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12
  },
  fabText: { color: "#071018", fontWeight: "900", fontSize: 14 },

  // Card
  cardContainer: { alignItems: "center" },
  card: {
    width: 320,
    height: 480,
    borderRadius: 18,
    backfaceVisibility: "hidden",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(214,168,76,0.08)", // faint gold rim
    backgroundColor: "#f7f3ee",
  },
  cardInner: { flex: 1, padding: 18, alignItems: "center" },
  cardArt: { width: 220, height: 220, borderRadius: 12, marginBottom: 12, resizeMode: "cover" },
  cardTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8, color: "#251C18" },
  cardGlyph: { position: "absolute", top: 18, left: 18, width: 28, height: 28, opacity: 0.95 },

  // rule area (improved contrast, auto-scaling)
  ruleBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fffaf0",
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center"
  },
  ruleText: { color: "#151515", textAlign: "center", fontSize: 16, lineHeight: 22 },

  // small helpers
  smallMuted: { color: "#9aa0a6" },
  smallText: { color: "#ddd" },

  // actions
  actionsRow: { flexDirection: "row", marginTop: 16, alignItems: "center", justifyContent: "center" },
  ghostButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginRight: 10 },
  ghostButtonText: { color: "#fff", fontWeight: "700" },

  // bottom bar
  bottomBar: { height: 64, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.03)", flexDirection: "row", alignItems: "center", justifyContent: "space-around" },

  // menu modal
  menuModal: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  menuContent: { backgroundColor: "#0b0f17", padding: 18, borderTopLeftRadius: 14, borderTopRightRadius: 14 },

  // badges / chips
  chip: { backgroundColor: "rgba(255,255,255,0.03)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },

  // history
  historyRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#0e1116" },
  historyTitle: { color: "#fff", fontWeight: "700" },
  historyPrompt: { color: "#cfcfcf" },

  // counters
  counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 20 },
  counterButton: { backgroundColor: "#111420", padding: 12, borderRadius: 8, marginHorizontal: 12 },
  counterText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  counterValue: { color: "#fff", fontSize: 20 },

  settingsButtonText: {
  color: "#E6E6E6",
  fontSize: 15,
  fontWeight: "600"
},

});

