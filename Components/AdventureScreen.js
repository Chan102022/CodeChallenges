// Components/AdventureScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";

import axios from "axios";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { doc, getDoc, updateDoc } from "firebase/firestore";


// Backend endpoint
const BASE = "https://myccbackend-2.onrender.com";

export default function AdventureScreen({ username, goTo }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [levels, setLevels] = useState([]);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState([]);

  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [executionResult, setExecutionResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [xp, setXp] = useState(0);
const [score, setScore] = useState(0);


  const [selectedLangTab, setSelectedLangTab] = useState("Java");

  // Difficulty color
  const difficultyColor = (diff) => {
    switch (diff) {
      case "Easy": return "#66bb6a";
      case "Medium": return "#ffa726";
      case "Hard": return "#ef5350";
      default: return "#90a4ae";
    }
  };

  // Load levels from Firestore
  const loadLevelsFromFirestore = async (category) => {
    setLoadingLevels(true);
    setLevels([]);

    try {
      const levelsRef = collection(db, "challenges", category, "levels");
      const snapshot = await getDocs(levelsRef);

      const list = snapshot.docs
        .map((doc) => ({ id: Number(doc.id), ...doc.data() }))
        .sort((a, b) => a.id - b.id);

      setLevels(list);
    } catch (error) {
      Alert.alert("Error", "Failed to load levels");
    }

    setLoadingLevels(false);
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedLangTab(category);
    loadLevelsFromFirestore(category);
  };

  useEffect(() => {
  loadUserProgress();
}, []);

const loadUserProgress = async () => {
  try {
    const userRef = doc(db, "users", username); // username = uid
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();

      setUnlockedLevel(data.unlockedLevel || 1);
      setCompletedLevels(data.completedLevels || []);
      setXp(data.xp || 0);
      setScore(data.score || 0);
    }
  } catch (err) {
    console.log("Failed to load user progress:", err);
  }
};


  // Play a level
  const handleLevelPress = (lvl) => {
    if (lvl > unlockedLevel) {
      Alert.alert("Locked", `Complete Level ${lvl - 1} first.`);
      return;
    }

    const data = levels.find((l) => l.id === lvl);
    setCurrentChallenge(data);
    setCodeInput(data.template || "");
    setExecutionResult(null);
  };

  // Run code
  const handleRunCode = async () => {
    if (!currentChallenge) return;
    setRunning(true);
    setExecutionResult(null);

    try {
      const response = await axios.post(`${BASE}/compile`, {
        source_code: codeInput,
        language_id: currentChallenge.language_id,
      });

      const { stdout, stderr, compile_output } = response.data;
      setExecutionResult({
        output: stdout || "",
        stderr: stderr || compile_output || "",
      });
    } catch {
      setExecutionResult({
        output: "",
        stderr: "Execution error.",
      });
    }

    setRunning(false);
  };

  // Normalize output
  const normalize = (s) =>
    String(s || "").replace(/\r/g, "").trim().replace(/\s+/g, " ");

  const outputsMatch = (actual, expected) =>
    normalize(actual) === normalize(expected);

  const scoreForDifficulty = (diff) => {
  switch (diff) {
    case "Easy": return 10;
    case "Medium": return 20;
    case "Hard": return 40;
    default: return 5;
  }
};
const xpForDifficulty = (diff) => {
  switch (diff) {
    case "Easy": return 20;   // Score 10 → XP 20
    case "Medium": return 40; // Score 20 → XP 40
    case "Hard": return 80;   // Score 40 → XP 80
    default: return 10;
  }
};


  // Complete level
 const handleCompleteLevel = async () => {
  if (!currentChallenge) return;

  try {
    const result = await axios.post(`${BASE}/submit-result`, {
      source_code: codeInput,
      expectedOutput: currentChallenge.expectedOutput,
      language_id: currentChallenge.language_id,
    });

    if (!result.data.ok || !result.data.passed) {
      Alert.alert("Incorrect", "Output does not match expected result.");
      return;
    }

    const next = currentChallenge.id + 1;

    // 🎯 Score reward based on difficulty
    const gainedScore = scoreForDifficulty(currentChallenge.difficulty);

    // 🎯 XP is *double* the score
    const gainedXP = gainedScore * 2;

    // Update local UI state
    const newCompleted = [...completedLevels, currentChallenge.id];
    setCompletedLevels(newCompleted);
    setUnlockedLevel(next);
    setScore(score + gainedScore);
    setXp(xp + gainedXP);

    // SAVE TO FIRESTORE (using username as you requested)
    const userRef = doc(db, "users", username);
    await updateDoc(userRef, {
      completedLevels: newCompleted,
      unlockedLevel: next,
      score: score + gainedScore,
      xp: xp + gainedXP,
    });

    Alert.alert("Great!", `Level ${currentChallenge.id} completed.`);
    setCurrentChallenge(null);

  } catch (err) {
    console.log("Complete Error:", err);
    Alert.alert("Error", "Something went wrong.");
  }
};




  const canProceed =
    executionResult &&
    !executionResult.stderr &&
    currentChallenge &&
    outputsMatch(executionResult.output, currentChallenge.expectedOutput);

  const LANGS = ["Java", "Python", "JavaScript"];

  return (
    <View style={styles.root}>
      {/* BACK TO HOME */}
      {!currentChallenge && (
        <TouchableOpacity
          style={styles.homeBackBtn}
          onPress={() => goTo("Home")}
        >
          <Text style={styles.homeBackText}>◀ Home</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.headerTitle}>Adventure Mode</Text>

      {/* Language Tabs */}
      <View style={styles.langRow}>
        {LANGS.map((lang) => {
          const active = selectedLangTab === lang;
          return (
            <TouchableOpacity
              key={lang}
              onPress={() => selectCategory(lang)}
              style={[styles.langTab, active && styles.langTabActive]}
            >
              <Text style={[styles.langText, active && styles.langTextActive]}>
                {lang}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Level List */}
      {!currentChallenge && (
        <View style={styles.levelsArea}>
          {loadingLevels ? (
            <ActivityIndicator size="large" color="#FFD54F" />
          ) : (
            <ScrollView style={{ flexGrow: 1 }} contentContainerStyle={styles.levelList}>
              {levels.length === 0 && (
                <View style={styles.emptyCard}>
                  <Text style={{ color: "#fff" }}>No levels available</Text>
                </View>
              )}

              {levels.map((lvl) => {
                const unlocked = lvl.id <= unlockedLevel;
                const completed = completedLevels.includes(lvl.id);
                return (
                  <View key={lvl.id} style={styles.levelCardWrap}>
                    <TouchableOpacity
                      disabled={!unlocked}
                      onPress={() => handleLevelPress(lvl.id)}
                      style={[
                        styles.levelCard,
                        !unlocked && styles.levelLocked,
                        completed && styles.levelCompleted,
                      ]}
                    >
                      <View style={styles.cardLeft}>
                        <View
                          style={[
                            styles.levelBadge,
                            { backgroundColor: difficultyColor(lvl.difficulty) },
                          ]}
                        >
                          <Text style={styles.levelBadgeText}>Lv {lvl.id}</Text>
                        </View>

                        <View style={{ marginLeft: 12 }}>
                          <Text style={styles.cardTitle}>
                            {lvl.question || `Challenge ${lvl.id}`}
                          </Text>
                          <Text style={styles.cardSub}>{lvl.difficulty}</Text>
                        </View>
                      </View>

                      <View style={styles.cardRight}>
                        {!unlocked ? (
                          <Text style={styles.lockText}>🔒</Text>
                        ) : completed ? (
                          <Text style={styles.completeText}>✓</Text>
                        ) : (
                          <Text style={styles.playText}>▶</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {/* CHALLENGE VIEW */}
      {currentChallenge && (
        <ScrollView style={styles.challengeBox}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>Level {currentChallenge.id}</Text>
            <Text style={styles.challengeSubtitle}>{currentChallenge.question}</Text>
          </View>

          <Text style={styles.editorLabel}>Your Code</Text>

          <TextInput
            multiline
            value={codeInput}
            onChangeText={setCodeInput}
            style={styles.codeEditor}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.runButton, running && styles.buttonDisabled]}
            onPress={handleRunCode}
            disabled={running}
          >
            {running ? (
              <ActivityIndicator color="#222" />
            ) : (
              <Text style={styles.runText}>Run Code</Text>
            )}
          </TouchableOpacity>

          {/* Output */}
          {executionResult && (
            <View
              style={[
                styles.outputBox,
                executionResult.stderr
                  ? styles.outputError
                  : styles.outputOk,
              ]}
            >
              <Text style={styles.outputTitle}>
                {executionResult.stderr ? "Error" : "Output"}
              </Text>
              <Text style={styles.outputText}>
                {executionResult.stderr || executionResult.output}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleCompleteLevel}
            disabled={!canProceed}
            style={[
              styles.proceedBtn,
              !canProceed && styles.proceedDisabled,
            ]}
          >
            <Text style={styles.proceedText}>
              {canProceed ? "Proceed to next level" : "Fix output to proceed"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setCurrentChallenge(null)}
          >
            <Text style={styles.backText}>Back to levels</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#081624",
    paddingTop: Platform.OS === "android" ? 30 : 60,
    paddingHorizontal: 16,
  },

  homeBackBtn: {
    position: "absolute",
    top: Platform.OS === "android" ? 35 : 60,
    left: 10,
    zIndex: 999,
    backgroundColor: "#123043",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e3a45",
  },
  homeBackText: {
    color: "#cfeeea",
    fontWeight: "800",
  },

  headerTitle: {
    color: "#FFD54F",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },

  langRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  langTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#123043",
    borderWidth: 1,
    borderColor: "#1e3a45",
  },
  langTabActive: {
    backgroundColor: "#0ea5a0",
    borderColor: "#0ea5a0",
  },
  langText: {
    color: "#cfeeea",
    fontWeight: "700",
  },
  langTextActive: {
    color: "#022c2c",
  },

  levelsArea: { flex: 1 },
  levelList: { paddingBottom: 40 },
  emptyCard: {
    backgroundColor: "#23303a",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },

  levelCardWrap: { marginBottom: 10 },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#08323f",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#113640",
  },
  levelLocked: { opacity: 0.4 },
  levelCompleted: {
    backgroundColor: "#092f1f",
    borderColor: "#064e2a",
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeText: {
    fontWeight: "900",
    color: "#fff",
  },

  cardTitle: {
    color: "#e6f7f5",
    fontWeight: "700",
    fontSize: 14,
  },
  cardSub: {
    color: "#98bfc3",
    fontSize: 12,
  },

  cardRight: { width: 60, alignItems: "flex-end" },
  lockText: { color: "#ff8a80" },
  completeText: { color: "#a6f3ae" },
  playText: { color: "#ffd54f", fontWeight: "bold" },

  challengeBox: {
    marginTop: 10,
    backgroundColor: "#071826",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#123640",
  },

  challengeHeader: { marginBottom: 10 },
  challengeTitle: { color: "#ffd54f", fontSize: 18, fontWeight: "900" },
  challengeSubtitle: { color: "#cfeeea", fontSize: 14, marginTop: 6 },

  editorLabel: { color: "#98bfc3", marginTop: 12, marginBottom: 6 },

  codeEditor: {
    minHeight: 160,
    backgroundColor: "#04131a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#08303a",
    padding: 12,
    color: "#e6f7f5",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  runButton: {
    marginTop: 12,
    backgroundColor: "#ffd54f",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },

  runText: { color: "#102020", fontWeight: "900" },

  outputBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#112b2f",
  },
  outputOk: { backgroundColor: "#e6f9ee" },
  outputError: { backgroundColor: "#fff0f0" },
  outputTitle: { fontWeight: "700", marginBottom: 8 },
  outputText: { color: "#222" },

  proceedBtn: {
    marginTop: 14,
    backgroundColor: "#4caf50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  proceedDisabled: { backgroundColor: "#7f8c8d" },
  proceedText: { color: "#fff", fontWeight: "900" },

  backBtn: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#26343a",
  },
  backText: { color: "#cfeeea" },
});
