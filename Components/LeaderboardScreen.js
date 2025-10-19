import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const sampleData = {
  Java: [
    { username: 'Alice', score: 980 },
    { username: 'Bob', score: 950 },
    { username: 'Charlie', score: 910 },
    { username: 'David', score: 880 },
    { username: 'Eva', score: 860 },
    { username: 'Frank', score: 850 },
    { username: 'Grace', score: 830 },
    { username: 'Hank', score: 810 },
    { username: 'Ivy', score: 790 },
    { username: 'Jack', score: 770 },
    // Extra entries won't be shown
  ],
  PHP: [
    { username: 'Zoe', score: 970 },
    { username: 'Yann', score: 940 },
    { username: 'Xena', score: 900 },
    { username: 'Wade', score: 870 },
    { username: 'Vera', score: 860 },
    { username: 'Tom', score: 840 },
    { username: 'Sam', score: 820 },
    { username: 'Ron', score: 800 },
    { username: 'Quinn', score: 780 },
    { username: 'Pete', score: 760 },
  ],
};

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Java Leaderboard */}
        <Text style={styles.categoryTitle}>Java</Text>
        {sampleData.Java.slice(0, 10).map((player, index) => (
          <View key={`java-${index}`} style={styles.playerRow}>
            <Text style={styles.rank}>{index + 1}.</Text>
            <Text style={styles.username}>{player.username}</Text>
            <Text style={styles.score}>{player.score}</Text>
          </View>
        ))}

        {/* PHP Leaderboard */}
        <Text style={styles.categoryTitle}>PHP</Text>
        {sampleData.PHP.slice(0, 10).map((player, index) => (
          <View key={`php-${index}`} style={styles.playerRow}>
            <Text style={styles.rank}>{index + 1}.</Text>
            <Text style={styles.username}>{player.username}</Text>
            <Text style={styles.score}>{player.score}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // match AdventureScreen
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50', // same green
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 5,
  },
  rank: {
    color: 'white',
    fontWeight: 'bold',
    width: 30,
  },
  username: {
    color: 'white',
    flex: 1,
    fontWeight: 'bold',
  },
  score: {
    color: 'white',
    fontWeight: 'bold',
  },
});
