import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Sample challenges
const challenges = {
  Java: [
    'Write a Java program to reverse a string.',
    'Create a Java method that checks for prime numbers.',
    'Implement a Java class for a basic calculator.',
    'Sort an array in ascending order using Java.',
    'Write a Java program to count vowels in a string.',
  ],
  PHP: [
    'Write a PHP script to find the factorial of a number.',
    'Create a PHP function to check for palindrome.',
    'Connect to a MySQL database using PHP.',
    'Write a PHP script to reverse a string.',
    'Implement a simple PHP login form.',
  ],
};

export default function DailyQuestScreen() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [challenge, setChallenge] = useState('');

  const getRandomChallenge = (category) => {
    const randomIndex = Math.floor(Math.random() * challenges[category].length);
    return challenges[category][randomIndex];
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    const randomChallenge = getRandomChallenge(category);
    setChallenge(randomChallenge);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Quest</Text>

      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'Java' && styles.selectedCategoryButton,
          ]}
          onPress={() => handleCategoryPress('Java')}
        >
          <Text style={styles.buttonText}>Java</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'PHP' && styles.selectedCategoryButton,
          ]}
          onPress={() => handleCategoryPress('PHP')}
        >
          <Text style={styles.buttonText}>PHP</Text>
        </TouchableOpacity>
      </View>

      {challenge !== '' && (
        <View style={styles.challengeBox}>
          <Text style={styles.challengeTitle}>Challenge ({selectedCategory}):</Text>
          <Text style={styles.challengeText}>{challenge}</Text>
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
    backgroundColor: '#A5D6A7', // light green
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#4CAF50', // dark green when selected
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  challengeText: {
    fontSize: 16,
    color: '#333',
  },
});
