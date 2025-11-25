import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import styles from "../theme/styles";

export default function Header({
  leftAction,
  title = "",
  rightAction,
  leftLabel = "Home",
  showLeftLabel = true,
  leftElement = null,
  rightElement = null,
  testIDPrefix = "header",
}) {
  return (
    <SafeAreaView style={[styles.safeArea || localStyles.safeArea]}> 
      <View style={[styles.topBar, localStyles.topBarOverride]}>
        <Pressable
          onPress={leftAction}
          accessibilityRole="button"
          accessibilityLabel={showLeftLabel ? `Go to ${leftLabel}` : "Go back"}
          android_ripple={{ color: "rgba(0,0,0,0.08)" }}
          style={localStyles.side}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID={`${testIDPrefix}-left`}
        >
          {leftElement ? (
            leftElement
          ) : (
            <Text numberOfLines={1} style={[styles.topBarText, localStyles.sideText]}>
              {showLeftLabel ? ` ${leftLabel}` : "←"}
            </Text>
          )}
        </Pressable>

        <View style={localStyles.titleWrap} accessible accessibilityRole="header">
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.topBarText, localStyles.title]}
            testID={`${testIDPrefix}-title`}
          >
            {title}
          </Text>
        </View>

        <Pressable
          onPress={rightAction}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          android_ripple={{ color: "rgba(0,0,0,0.08)" }}
          style={[localStyles.side, localStyles.rightSide]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID={`${testIDPrefix}-right`}
        >
          {rightElement ? (
            rightElement
          ) : (
            <Text style={[styles.topBarText, localStyles.sideText]}>⋮</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: styles?.safeAreaColor || "#070812",
  },
  topBarOverride: {
    paddingHorizontal: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // subtle separation — your existing styles.topBar will remain primary
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.04)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  side: {
    width: 72, // consistent touch area without changing your theme object
    alignItems: "flex-start",
    justifyContent: "center",
  },
  rightSide: {
    alignItems: "flex-end",
  },
  sideText: {
    fontSize: 16,
    fontWeight: "600",
    color: styles?.topBarTextColor || "#D6A84C",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  title: {
    color: styles?.topBarTitleColor || "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

/*
Integration notes:
- This file intentionally uses your existing `styles.topBar` and `styles.topBarText` keys.
- If you want exact control over colors or spacing from a single theme file, add these optional tokens to `../theme/styles`:
  - safeAreaColor
  - topBarTextColor
  - topBarTitleColor
- To use icon libraries, pass `leftElement`/`rightElement` (e.g. <MyBackIcon />).
- If you prefer TouchableOpacity rather than Pressable (for older RN), replace Pressable with TouchableOpacity.
*/
