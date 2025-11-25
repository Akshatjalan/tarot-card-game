import { FlatList, SafeAreaView, Text, View } from "react-native";
import styles from "../theme/styles";

export default function HistoryScreen({ route }) {
  const history = route?.params?.history || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.padded}>
        <Text style={styles.header}>Card History</Text>
        <FlatList
          data={history}
          keyExtractor={(it) => String(it.ts)}
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <Text style={styles.historyTitle}>{item.card.name}</Text>
              <Text style={styles.historyPrompt}>{item.prompt}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.smallMuted}>No history yet.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}
