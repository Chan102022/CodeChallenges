import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LeaderboardScreen({ goBack }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const allUsernames = JSON.parse(await AsyncStorage.getItem("users") || "[]");
      const allData = [];

      for (const username of allUsernames) {
        const u = await AsyncStorage.getItem(username);
        if (u) allData.push(JSON.parse(u));
      }

      // Sort descending by score
      allData.sort((a, b) => (b.score || 0) - (a.score || 0));
      setUsers(allData);
    };
    loadUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {users.slice(0, 10).map((u, i) => (
          <View key={u.username} style={styles.row}>
            <Text style={styles.rank}>{i + 1}.</Text>
            <Text style={styles.name}>{u.username}</Text>
            <Text style={styles.score}>{u.score}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={goBack}>
        <Text style={styles.buttonText}>Back to Daily Quest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#4CAF50", textAlign: "center", marginBottom: 20 },
  scrollContainer: { paddingBottom: 40 },
  row: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#4CAF50", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginVertical: 5 },
  rank: { color: "#fff", fontWeight: "bold", width: 30 },
  name: { color: "#fff", flex: 1, fontWeight: "bold" },
  score: { color: "#fff", fontWeight: "bold" },
  button: { marginTop: 20, padding: 15, borderRadius: 8, backgroundColor: "#2196F3", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
