import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Sample challenges by level (can be more dynamic later)
const generateChallenge = (category, level) => {
  const difficulties = {
    1: 'Easy',
    2: 'Easy',
    3: 'Medium',
    4: 'Medium',
    5: 'Medium',
    6: 'Hard',
    7: 'Hard',
    8: 'Hard',
    9: 'Very Hard',
    10: 'Very Hard',
  };

  return `${category} Challenge - ${difficulties[level]} Level ${level}:\nSolve a ${difficulties[level]} problem.`;
};

export default function AdventureScreen({ username }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);

  // Create a unique key based on the category and username
  const getStorageKey = (category) => `progress_${username}_${category}`;

  // Load progress from AsyncStorage when category is selected or username changes
  useEffect(() => {
    const loadProgress = async () => {
      if (!selectedCategory) return;

      const storageKey = getStorageKey(selectedCategory);
      const data = await AsyncStorage.getItem(storageKey);

      if (data) {
        const parsed = JSON.parse(data);
        setUnlockedLevel(parsed.unlockedLevel || 1);
        setCompletedLevels(parsed.completedLevels || []);
      } else {
        setUnlockedLevel(1);  // Default starting point if no progress is found
        setCompletedLevels([]); // Empty levels
      }
    };

    loadProgress();
  }, [username, selectedCategory]); // Load progress when username or selectedCategory changes

  // Handle level selection
  const handleLevelPress = (level) => {
    if (level > unlockedLevel) {
      Alert.alert('Locked', `Complete Level ${level - 1} first.`);
      return;
    }

    const challenge = generateChallenge(selectedCategory, level);
    setCurrentChallenge({ level, text: challenge });
  };

  // Handle level completion and save progress
  const handleCompleteLevel = async () => {
    if (!currentChallenge) return;

    const nextLevel = currentChallenge.level + 1;
    const score = Math.floor(Math.random() * 30) + 70; // Example: random score for testing

    // Update the completed levels state
    const newCompletedLevels = [...completedLevels, currentChallenge.level];
    const newUnlockedLevel = nextLevel > unlockedLevel ? nextLevel : unlockedLevel;

    setCompletedLevels(newCompletedLevels);
    setUnlockedLevel(newUnlockedLevel);

    // Save the updated progress to AsyncStorage
    const storageKey = getStorageKey(selectedCategory);
    await AsyncStorage.setItem(
      storageKey,
      JSON.stringify({
        unlockedLevel: newUnlockedLevel,
        completedLevels: newCompletedLevels,
      })
    );

    // Submit score to leaderboard (optional)
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/leaderboard/submit',
        {
          category: selectedCategory,
          score: score,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Score submitted!');
    } catch (err) {
      console.error('Failed to submit score', err);
    }

    // Clear current challenge after completion
    setCurrentChallenge(null);
    Alert.alert('Great!', `Level ${currentChallenge.level} completed.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adventure Mode</Text>

      {/* Category Buttons */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'Java' && styles.selectedCategoryButton]}
          onPress={() => {
            setSelectedCategory('Java');
          }}
        >
          <Text style={styles.buttonText}>Java</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'PHP' && styles.selectedCategoryButton]}
          onPress={() => {
            setSelectedCategory('PHP');
          }}
        >
          <Text style={styles.buttonText}>PHP</Text>
        </TouchableOpacity>
      </View>

      {/* Levels */}
      {selectedCategory && !currentChallenge && (
        <ScrollView contentContainerStyle={styles.buttonContainer} showsVerticalScrollIndicator={false}>
          {Array.from({ length: 10 }, (_, i) => {
            const level = i + 1;
            const isUnlocked = level <= unlockedLevel;
            const isCompleted = completedLevels.includes(level);

            let displayText = `${selectedCategory} - Level ${level}`;
            if (isCompleted) {
              displayText += ' ✅';
            } else if (!isUnlocked) {
              displayText += ' 🔒';
            }

            return (
              <TouchableOpacity
                key={level}
                style={[styles.button, !isUnlocked && styles.lockedButton, isCompleted && styles.completedButton]}
                onPress={() => handleLevelPress(level)}
                disabled={!isUnlocked}
              >
                <Text style={styles.buttonText}>{displayText}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Challenge View */}
      {currentChallenge && (
        <View style={styles.challengeBox}>
          <Text style={styles.challengeTitle}>Level {currentChallenge.level} Challenge</Text>
          <Text style={styles.challengeText}>{currentChallenge.text}</Text>

          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteLevel}>
            <Text style={styles.buttonText}>Mark as Done ✅</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#A5D6A7',
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#4CAF50',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  lockedButton: {
    backgroundColor: '#BDBDBD',
  },
  completedButton: {
    backgroundColor: '#81C784',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  challengeBox: {
    marginTop: 30,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    elevation: 2,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  challengeText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
});

