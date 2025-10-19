import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput 
} from 'react-native';

export default function AdventureScreen({ username }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [executionResult, setExecutionResult] = useState(null);

  const getStorageKey = (category) => `${username}_${category}`;

  useEffect(() => {
    // Simulating loading progress from local storage or default state
    const loadProgress = () => {
      if (!selectedCategory) return;

      // Here, we simulate loading progress from local state
      const storedProgress = {
        unlockedLevel: 3,  // Example, can be adjusted
        completedLevels: [1, 2]  // Example, can be adjusted
      };

      setUnlockedLevel(storedProgress.unlockedLevel || 1);
      setCompletedLevels(storedProgress.completedLevels || []);
    };

    loadProgress();
  }, [username, selectedCategory]);

  const handleLevelPress = (level) => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category first (Java or PHP).');
      return;
    }

    if (level > unlockedLevel) {
      Alert.alert('Locked', `Complete Level ${level - 1} first.`);
      return;
    }

    // Simulate fetching a challenge for the selected category and level
    const simulatedChallenge = {
      question: `Solve a ${selectedCategory} level ${level} problem.`,
      testCases: [{ input: 'test input' }],
      template: `// Write your ${selectedCategory} code here`
    };

    setCurrentChallenge({
      level,
      question: simulatedChallenge.question,
      testCases: simulatedChallenge.testCases,
    });
    setCodeInput(simulatedChallenge.template);
    setExecutionResult(null);
  };

  const handleCompleteLevel = () => {
    if (!currentChallenge) return;

    const nextLevel = currentChallenge.level + 1;
    const score = Math.floor(Math.random() * 30) + 70;

    const newCompletedLevels = [...completedLevels, currentChallenge.level];
    const newUnlockedLevel = nextLevel > unlockedLevel ? nextLevel : unlockedLevel;

    setCompletedLevels(newCompletedLevels);
    setUnlockedLevel(newUnlockedLevel);

    // Simulate saving progress to local storage
    const newProgress = {
      unlockedLevel: newUnlockedLevel,
      completedLevels: newCompletedLevels,
    };

    // You can save this locally in AsyncStorage or elsewhere as needed

    setCurrentChallenge(null);
    Alert.alert('Great!', `Level ${currentChallenge.level} completed.`);
  };

  const handleRunCode = () => {
    // Simulate code execution and show the result
    const simulatedResult = { output: 'Code executed successfully!', stderr: '' };
    setExecutionResult(simulatedResult);
  };

  const handleReattemptLevel = (level) => {
    if (completedLevels.includes(level)) {
      Alert.alert('Reattempt', 'You have already completed this level.');
      return;
    }

    setCurrentChallenge({
      level,
      question: `Reattempt the level ${level} challenge.`,
      testCases: [],
    });
    setCodeInput('');
    setExecutionResult(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adventure Mode</Text>

      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'Java' && styles.selectedCategoryButton]}
          onPress={() => setSelectedCategory('Java')}
          disabled={!!currentChallenge} // Disable Java button if there's a current challenge
        >
          <Text style={styles.buttonText}>Java</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'PHP' && styles.selectedCategoryButton]}
          onPress={() => setSelectedCategory('PHP')}
          disabled={!!currentChallenge} // Disable PHP button if there's a current challenge
        >
          <Text style={styles.buttonText}>PHP</Text>
        </TouchableOpacity>
      </View>

      {selectedCategory && !currentChallenge && (
        <ScrollView contentContainerStyle={styles.levelContainer} showsVerticalScrollIndicator={false}>
          {Array.from({ length: 10 }, (_, i) => {
            const level = i + 1;
            const isUnlocked = level <= unlockedLevel;
            const isCompleted = completedLevels.includes(level);

            let displayText = `Level ${level}`;
            if (isCompleted) displayText += ' ✅';
            else if (!isUnlocked) displayText += ' 🔒';

            return (
              <TouchableOpacity
                key={level}
                style={[styles.levelButton, !isUnlocked && styles.lockedButton, isCompleted && styles.completedButton]}
                onPress={() => handleLevelPress(level)}
                disabled={!isUnlocked}
              >
                <Text style={styles.levelButtonText}>{displayText}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {currentChallenge && (
        <ScrollView style={styles.challengeBox}>
          <Text style={styles.challengeTitle}>Level {currentChallenge.level} Challenge</Text>
          <Text style={styles.challengeText}>{currentChallenge.question}</Text>

          <Text style={styles.codeLabel}>Code:</Text>
          <TextInput
            multiline
            value={codeInput}
            onChangeText={setCodeInput}
            style={styles.codeEditor}
            placeholder="Write your code here..."
          />

          <TouchableOpacity style={styles.runButton} onPress={handleRunCode}>
            <Text style={styles.buttonText}>Run Code ▶️</Text>
          </TouchableOpacity>

          {executionResult && (
            <View style={styles.outputBox}>
              <Text style={styles.outputTitle}>Output:</Text>
              <Text style={styles.outputText}>{executionResult.output || '[No Output]'}</Text>

              {executionResult.stderr ? (
                <>
                  <Text style={styles.outputTitle}>Error:</Text>
                  <Text style={styles.outputText}>{executionResult.stderr}</Text>
                </>
              ) : null}
            </View>
          )}

          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteLevel}>
            <Text style={styles.buttonText}>Mark as Done ✅</Text>
          </TouchableOpacity>

          {/* Button to reattempt a previous level */}
          {currentChallenge.level > 1 && (
            <TouchableOpacity style={styles.reattemptButton} onPress={() => handleReattemptLevel(currentChallenge.level - 1)}>
              <Text style={styles.buttonText}>Reattempt Level {currentChallenge.level - 1}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelContainer: {
    paddingBottom: 20,
  },
  levelButton: {
    backgroundColor: '#A5D6A7',
    paddingVertical: 15,
    marginVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  lockedButton: {
    backgroundColor: '#c8e6c9',
    opacity: 0.6,
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  levelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  challengeBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
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
  codeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  codeEditor: {
    height: 180,
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontFamily: 'monospace',
    marginBottom: 15,
    backgroundColor: '#f0fff0',
  },
  runButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  outputBox: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  outputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  outputText: {
    fontSize: 14,
    color: '#2e7d32',
    marginTop: 4,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
