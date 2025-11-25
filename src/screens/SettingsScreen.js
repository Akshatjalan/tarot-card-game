import { SafeAreaView, Text, View } from "react-native";
import styles from "../theme/styles";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.padded}>
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.small}>NSFW Toggle, Sound, Vibration, High Contrast, etc.</Text>
        <Text style={{ marginTop: 12, color: "#aaa" }}>Placeholder for settings controls (toggles, sliders).</Text>
      </View>
    </SafeAreaView>
  );
}
