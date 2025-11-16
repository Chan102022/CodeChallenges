import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Java-only challenges
export const CHALLENGES = {
  Java: {
    1: { question: "Print 'Hello World'", template: `class Main {\n  public static void main(String[] args) {\n    // your code here\n  }\n}`, expectedOutput: "Hello World", language_id: 62, difficulty: "Easy" },
    2: { question: "Add two numbers (a=2, b=3) and print the sum", template: `class Main {\n  public static void main(String[] args) {\n    int a = 2, b = 3;\n    // your code here\n  }\n}`, expectedOutput: "5", language_id: 62, difficulty: "Easy" },
    3: { question: "Print all even numbers from 1 to 10", template: `class Main {\n  public static void main(String[] args) {\n    // your code here\n  }\n}`, expectedOutput: "2 4 6 8 10", language_id: 62, difficulty: "Medium" },
    4: { question: "Calculate factorial of 5", template: `class Main {\n  public static void main(String[] args) {\n    int n = 5;\n    // your code here\n  }\n}`, expectedOutput: "120", language_id: 62, difficulty: "Medium" },
    5: { question: "Check if a number (7) is prime", template: `class Main {\n  public static void main(String[] args) {\n    int n = 7;\n    // your code here\n  }\n}`, expectedOutput: "Prime", language_id: 62, difficulty: "Medium" },
    6: { question: "Reverse a string 'Java'", template: `class Main {\n  public static void main(String[] args) {\n    String str = "Java";\n    // your code here\n  }\n}`, expectedOutput: "avaJ", language_id: 62, difficulty: "Medium" },
    7: { question: "Find the largest element in array [4,7,1,9,2]", template: `class Main {\n  public static void main(String[] args) {\n    int[] arr = {4,7,1,9,2};\n    // your code here\n  }\n}`, expectedOutput: "9", language_id: 62, difficulty: "Hard" },
    8: { question: "Sum of digits of 12345", template: `class Main {\n  public static void main(String[] args) {\n    int n = 12345;\n    // your code here\n  }\n}`, expectedOutput: "15", language_id: 62, difficulty: "Hard" },
    9: { question: "Fibonacci series up to 10 terms", template: `class Main {\n  public static void main(String[] args) {\n    int n = 10;\n    // your code here\n  }\n}`, expectedOutput: "0 1 1 2 3 5 8 13 21 34", language_id: 62, difficulty: "Hard" },
    10: { question: "Check if a string 'racecar' is a palindrome", template: `class Main {\n  public static void main(String[] args) {\n    String str = "racecar";\n    // your code here\n  }\n}`, expectedOutput: "Palindrome", language_id: 62, difficulty: "Hard" }
  }
};

export default function AdventureScreen({ username }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [running, setRunning] = useState(false);

  // FIX: Add missing function
  const difficultyColor = (diff) => {
    switch (diff) {
      case "Easy": return "#81C784";
      case "Medium": return "#FFB74D";
      case "Hard": return "#E57373";
      default: return "#B0BEC5";
    }
  };

  const getStorageKey = (category) => `${username}_${category}_progress`;

  useEffect(() => {
    if (!selectedCategory) return;
    const loadProgress = async () => {
      try {
        const stored = await AsyncStorage.getItem(getStorageKey(selectedCategory));
        if (stored) {
          const { unlockedLevel: ul, completedLevels: cl } = JSON.parse(stored);
          setUnlockedLevel(ul || 1);
          setCompletedLevels(cl || []);
        }
      } catch (error) { console.log('AsyncStorage load error:', error); }
    };
    loadProgress();
  }, [selectedCategory]);

  const saveProgress = async (ul, cl) => {
    try {
      await AsyncStorage.setItem(getStorageKey(selectedCategory), JSON.stringify({ unlockedLevel: ul, completedLevels: cl }));
    } catch (error) { console.log('AsyncStorage save error:', error); }
  };

  const handleLevelPress = (level) => {
    if (!selectedCategory) { Alert.alert('Error', 'Please select Java first.'); return; }
    if (level > unlockedLevel) { Alert.alert('Locked', `Complete Level ${level - 1} first.`); return; }

    const challengeData = CHALLENGES.Java[level];
    setCurrentChallenge({ level, ...challengeData });
    setCodeInput(challengeData.template);
    setExecutionResult(null);
  };

  const handleRunCode = async () => {
    if (!currentChallenge) return;
    setRunning(true);
    setExecutionResult(null);

    try {
      const response = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
        {
          source_code: codeInput,
          language_id: currentChallenge.language_id,
          stdin: ''
        },
        {
          headers: {
            'X-RapidAPI-Key': '4686562434msh8a4eb7c471e9dd5p13d70djsn85f1723cc6a5',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json',
          }
        }
      );

      const { stdout, stderr, compile_output, status } = response.data;
      setExecutionResult({
        output: stdout || '',
        stderr: stderr || compile_output || '',
        status: status?.description || 'Unknown'
      });

    } catch (error) {
      console.log('Judge0 error', error);
      setExecutionResult({ output: '', stderr: 'Error executing code.', status: 'Error' });
    }

    setRunning(false);
  };

  const handleCompleteLevel = () => {
    if (!executionResult || executionResult.stderr) {
      Alert.alert("Error", "Fix the errors first.");
      return;
    }

    if (executionResult.output.trim() !== currentChallenge.expectedOutput.trim()) {
      Alert.alert("Incorrect", "Output does not match expected result.");
      return;
    }

    const next = currentChallenge.level + 1;
    const updatedCompleted = [...completedLevels, currentChallenge.level];
    const updatedUnlocked = Math.max(unlockedLevel, next);

    setCompletedLevels(updatedCompleted);
    setUnlockedLevel(updatedUnlocked);
    saveProgress(updatedUnlocked, updatedCompleted);

    setCurrentChallenge(null);
    Alert.alert("Great!", `Level ${currentChallenge.level} completed.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adventure Mode</Text>

      {/* Java only */}
      {!currentChallenge && (
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'Java' && styles.selectedCategoryButton]}
          onPress={() => setSelectedCategory('Java')}
        >
          <Text style={styles.buttonText}>Java</Text>
        </TouchableOpacity>
      )}

      {/* Levels */}
      {selectedCategory && !currentChallenge && (
        <ScrollView contentContainerStyle={styles.levelContainer}>
          {Object.keys(CHALLENGES.Java).map((lvl) => {
            const level = Number(lvl);
            const challenge = CHALLENGES.Java[level];
            const isUnlocked = level <= unlockedLevel;
            const isCompleted = completedLevels.includes(level);

            return (
              <TouchableOpacity
                key={level}
                disabled={!isUnlocked}
                onPress={() => handleLevelPress(level)}
                style={[
                  styles.levelButton,
                  !isUnlocked && styles.lockedButton,
                  isCompleted && styles.completedButton,
                  { borderLeftColor: difficultyColor(challenge.difficulty), borderLeftWidth: 6 }
                ]}
              >
                <Text style={styles.levelButtonText}>
                  Level {level} ({challenge.difficulty}) {isCompleted ? "✅" : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Challenge */}
      {currentChallenge && (
        <ScrollView style={styles.challengeBox}>
          <Text style={styles.challengeTitle}>Level {currentChallenge.level}</Text>
          <Text style={styles.challengeText}>{currentChallenge.question}</Text>

          <TextInput
            multiline
            value={codeInput}
            onChangeText={setCodeInput}
            style={styles.codeEditor}
          />

          <TouchableOpacity
            style={styles.runButton}
            onPress={handleRunCode}
            disabled={running}
          >
            {running ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Run Code ▶️</Text>}
          </TouchableOpacity>

          {executionResult && (
            <View style={[
              styles.outputBox,
              executionResult.stderr ? { backgroundColor: "#ffebee" } : { backgroundColor: "#e8f5e9" }
            ]}>
              <Text style={styles.outputText}>{executionResult.output}</Text>
              {executionResult.stderr ? (
                <Text style={{ color: "red" }}>{executionResult.stderr}</Text>
              ) : null}
            </View>
          )}

          <TouchableOpacity
            onPress={handleCompleteLevel}
            disabled={!executionResult || executionResult.stderr}
            style={styles.completeButton}
          >
            <Text style={styles.buttonText}>Mark as Done ✅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reattemptButton, { backgroundColor: "#999" }]}
            onPress={() => setCurrentChallenge(null)}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: 20 },

  categoryButton: { backgroundColor: '#A5D6A7', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  selectedCategoryButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  levelContainer: { paddingBottom: 20 },
  levelButton: { backgroundColor: '#A5D6A7', paddingVertical: 15, marginVertical: 6, borderRadius: 8, alignItems: 'center' },
  lockedButton: { backgroundColor: '#c8e6c9', opacity: 0.6 },
  completedButton: { backgroundColor: '#4CAF50' },
  levelButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  challengeBox: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  challengeTitle: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginBottom: 10 },
  challengeText: { fontSize: 16, color: '#333', marginBottom: 20 },

  codeEditor: { height: 200, borderColor: '#4CAF50', borderWidth: 1, borderRadius: 8, padding: 10, backgroundColor: '#f0fff0', fontFamily: 'monospace' },

  runButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  outputBox: { padding: 15, borderRadius: 8, marginTop: 15 },
  outputText: { fontSize: 14 },

  completeButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  reattemptButton: { backgroundColor: '#FFA726', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
});
