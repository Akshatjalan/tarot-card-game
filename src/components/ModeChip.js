import { Text, TouchableOpacity } from "react-native";
import styles from "../theme/styles";

export default function ModeChip({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.modeChip} onPress={onPress}>
      <Text style={styles.modeChipText}>{title}</Text>
    </TouchableOpacity>
  );
}
