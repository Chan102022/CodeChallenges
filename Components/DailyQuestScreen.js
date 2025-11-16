import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Standalone Java challenges
const JAVA_CHALLENGES = [
  {
    question: "What is the size of int in Java?",
    options: ["16 bit", "32 bit", "64 bit", "Depends on OS"],
    answer: "32 bit",
    difficulty: "Easy",
  },
  {
    question: "Which keyword is used to inherit a class in Java?",
    options: ["implements", "extends", "inherits", "super"],
    answer: "extends",
    difficulty: "Easy",
  },
  {
    question: "What is the default value of a boolean variable in Java?",
    options: ["true", "false", "0", "null"],
    answer: "false",
    difficulty: "Medium",
  },
  {
    question: "Which of these is not a Java access modifier?",
    options: ["private", "protected", "package", "publich"],
    answer: "publich",
    difficulty: "Medium",
  },
  {
    question: "What does JVM stand for?",
    options: ["Java Virtual Machine", "Java Verified Method", "Just Virtual Memory", "Java Variable Manager"],
    answer: "Java Virtual Machine",
    difficulty: "Hard",
  },
];

export default function DailyQuestScreen() {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState(null);
  const [lastPlayedDate, setLastPlayedDate] = useState(null);
  const [canPlay, setCanPlay] = useState(true);

  const difficultyPoints = { Easy: 10, Medium: 20, Hard: 30 };

  // Load user and last played date
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        setUsername(parsed.username);
        setScore(parsed.score || 0);
        setLastPlayedDate(parsed.lastPlayedDate || null);

        const today = new Date().toISOString().split("T")[0];
        if (parsed.lastPlayedDate === today) {
          setCanPlay(false);
        }
      }
    };
    loadUser();
  }, []);

  // Pick a random challenge
  const getRandomChallenge = () => {
    const random = JAVA_CHALLENGES[Math.floor(Math.random() * JAVA_CHALLENGES.length)];
    setCurrentChallenge(random);
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  // Submit answer
  const handleSubmit = async () => {
    if (!selectedAnswer) {
      Alert.alert("Select an answer", "Please choose an option before submitting.");
      return;
    }

    if (!currentChallenge || !canPlay) return;

    setSubmitted(true);

    const today = new Date().toISOString().split("T")[0];
    const isCorrect = selectedAnswer === currentChallenge.answer;
    let points = 0;

    if (isCorrect) {
      points = difficultyPoints[currentChallenge.difficulty] || 0;
      const newScore = score + points;
      setScore(newScore);
      Alert.alert("Correct!", `You earned ${points} points!`);
    } else {
      Alert.alert("Wrong!", `The correct answer was: ${currentChallenge.answer}`);
    }

    // Save updated user data
    if (username) {
      const userData = await AsyncStorage.getItem(username);
      const parsedUser = userData ? JSON.parse(userData) : { username, score: 0 };
      parsedUser.score = score + points;
      parsedUser.lastPlayedDate = today;
      await AsyncStorage.setItem(username, JSON.stringify(parsedUser));
      await AsyncStorage.setItem("user", JSON.stringify(parsedUser));
      setLastPlayedDate(today);
      setCanPlay(false);
    }
  };

  // Load first challenge
  useEffect(() => {
    if (canPlay) getRandomChallenge();
  }, [canPlay]);

  if (!currentChallenge) {
    return (
      <View style={styles.container}>
        <Text>Loading challenge...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Java Quest</Text>
      <Text style={styles.score}>Your Score: {score}</Text>

      {!canPlay ? (
        <Text style={styles.message}>
          You have already answered today's question. Come back tomorrow!
        </Text>
      ) : (
        <>
          <View style={styles.challengeBox}>
            <Text style={styles.challengeText}>{currentChallenge.question}</Text>

            {currentChallenge.options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionButton,
                  submitted
                    ? opt === currentChallenge.answer
                      ? { backgroundColor: "#4CAF50" } // correct green
                      : opt === selectedAnswer
                      ? { backgroundColor: "#F44336" } // wrong red
                      : {}
                    : selectedAnswer === opt
                    ? { backgroundColor: "#FFD700" } // selected before submit
                    : { backgroundColor: "#A5D6A7" }, // default
                ]}
                disabled={submitted}
                onPress={() => setSelectedAnswer(opt)}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  score: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginTop: 20,
  },
  challengeBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  challengeText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
