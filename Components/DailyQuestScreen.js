// Components/DailyQuestScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";

import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";

/*
  Decorative image (local path you uploaded).
  Your environment/tooling will transform this local path into a usable URL.
*/
const DECORATIVE_IMAGE_URI =
  "/mnt/data/4fe62b9b-c86f-49b0-8d1e-6c87e40a489b.png";

const LANGS = ["Java", "Python", "JavaScript"];
const difficultyPoints = { Easy: 10, Medium: 20, Hard: 30 };

const normalize = (s = "") =>
  String(s).replace(/\r/g, "").trim().replace(/\s+/g, " ");

export default function DailyQuestScreen({
  language = "Java",
  goTo,
  goToLeaderboard,
}) {
  const [loading, setLoading] = useState(true);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dailyResult, setDailyResult] = useState(null); // { correct, pointsEarned, xpEarned }
  const [userScore, setUserScore] = useState(0);
  const [userXP, setUserXP] = useState(0);

  // helper to get the active uid (prefer auth.currentUser)
  const getUid = () => (auth.currentUser ? auth.currentUser.uid : null);

  useEffect(() => {
    loadDailyQuestion();
  }, []);

  // Main loader: either restore today's saved question or pick a random language+level
  const loadDailyQuestion = async () => {
    setLoading(true);
    try {
      const uid = getUid();
      if (!uid) {
        Alert.alert("Not logged in", "Please sign in to use Daily Quest.");
        setLoading(false);
        return;
      }

      // load user doc
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      setUserScore(userData.score ?? 0);
      setUserXP(userData.xp ?? 0);

      const today = new Date().toISOString().split("T")[0];

      // If user already has a daily question for today, try to load it
      if (
        userData.lastDailyDate === today &&
        userData.lastDailyQuestionId &&
        userData.lastDailyLanguage
      ) {
        const savedLang = userData.lastDailyLanguage;
        const lvlRef = doc(
          db,
          "challenges",
          savedLang,
          "levels",
          String(userData.lastDailyQuestionId)
        );
        const lvlSnap = await getDoc(lvlRef);
        if (lvlSnap.exists()) {
          const lvl = { id: Number(lvlSnap.id), ...lvlSnap.data() };
          setCurrentChallenge(lvl);
          setCurrentLanguage(savedLang);
          setSubmitted(!!userData.lastDailyAnswered);
          setDailyResult(userData.lastDailyResult ?? null);
          setLoading(false);
          return;
        }
        // if it doesn't exist, continue to pick a new one
      }

      // Otherwise pick a random language and then a random level from it
      const chosenLang = LANGS[Math.floor(Math.random() * LANGS.length)];
      const levelsRef = collection(db, "challenges", chosenLang, "levels");
      const snapshot = await getDocs(levelsRef);
      const list = snapshot.docs.map((d) => ({ id: Number(d.id), ...d.data() }));

      if (!list.length) {
        Alert.alert("No challenges", `No levels found for ${chosenLang}.`);
        setLoading(false);
        return;
      }

      const random = list[Math.floor(Math.random() * list.length)];

      // Save the selected daily question id, language and date to user doc (so they get the same one today)
      await updateDoc(userRef, {
        lastDailyDate: today,
        lastDailyQuestionId: random.id,
        lastDailyLanguage: chosenLang,
        // Do not mark answered yet
      });

      setCurrentChallenge(random);
      setCurrentLanguage(chosenLang);
      setUserAnswer("");
      setSubmitted(false);
      setDailyResult(null);
    } catch (err) {
      console.log("Daily load error:", err);
      Alert.alert("Error", "Failed to load daily question.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentChallenge) return;
    if (submitted) return;

    // normalize both
    const expected = normalize(currentChallenge.expectedOutput);
    const actual = normalize(userAnswer);

    const correct = expected === actual;
    const points = correct
      ? difficultyPoints[currentChallenge.difficulty] ?? 10
      : 0;
    const xpGained = points * 2; // XP = 2 * score

    try {
      const uid = getUid();
      if (!uid) {
        Alert.alert("Not logged in", "Please sign in to submit answer.");
        return;
      }

      // Update user doc: score, xp, and mark answered for today
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const existing = userSnap.exists() ? userSnap.data() : {};

      const newScore = (existing.score ?? 0) + points;
      const newXp = (existing.xp ?? 0) + xpGained;

      const today = new Date().toISOString().split("T")[0];

      await updateDoc(userRef, {
        score: newScore,
        xp: newXp,
        lastDailyDate: today,
        lastDailyQuestionId: currentChallenge.id,
        lastDailyLanguage: currentLanguage,
        lastDailyAnswered: true,
        lastDailyResult: { correct, pointsEarned: points, xpEarned: xpGained },
      });

      setUserScore(newScore);
      setUserXP(newXp);
      setSubmitted(true);
      setDailyResult({ correct, pointsEarned: points, xpEarned: xpGained });

      Alert.alert(
        correct ? "Correct!" : "Wrong",
        correct
          ? `You earned ${points} points (${xpGained} XP)`
          : `Correct output: ${currentChallenge.expectedOutput}`
      );
    } catch (err) {
      console.log("Submit daily error:", err);
      Alert.alert("Error", "Failed to submit daily answer.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffd54f" />
      </View>
    );
  }

  if (!currentChallenge) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Daily Quest</Text>
        <Text style={styles.subtitle}>No question available right now.</Text>
        <TouchableOpacity style={styles.button} onPress={loadDailyQuestion}>
          <Text style={styles.buttonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* decorative image (local uploaded file path) */}
      <Image
        source={{ uri: DECORATIVE_IMAGE_URI }}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Dynamic Title + Language Tag */}
      <Text style={styles.title}>Daily {currentLanguage} Quest</Text>
      <Text style={styles.langTag}>Language: {currentLanguage}</Text>

      <Text style={styles.subtitle}>
        {currentChallenge.difficulty} — Answer the expected output
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{userScore}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{userXP}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.qTitle}>Question</Text>
        <Text style={styles.qText}>{currentChallenge.question}</Text>

        <Text style={[styles.inputLabel, { marginTop: 14 }]}>
          Type expected output (exact):
        </Text>
        <TextInput
          value={userAnswer}
          onChangeText={setUserAnswer}
          editable={!submitted}
          multiline
          numberOfLines={4}
          style={styles.textInput}
          placeholder="e.g. Hello World"
          placeholderTextColor="#7fa3ab"
        />

        <TouchableOpacity
          style={[styles.submitBtn, submitted && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={submitted}
        >
          <Text style={styles.submitText}>
            {submitted ? "Answered" : "Submit Answer"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallBtn} onPress={loadDailyQuestion}>
          <Text style={styles.smallBtnText}>
            Get another (will save as today's question)
          </Text>
        </TouchableOpacity>

        {dailyResult && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              {dailyResult.correct
                ? `Correct! +${dailyResult.pointsEarned} pts (+${dailyResult.xpEarned} XP)`
                : `Wrong — correct output: ${currentChallenge.expectedOutput}`}
            </Text>
          </View>
        )}
      </View>

      <View style={{ height: 12 }} />
<TouchableOpacity
  style={[styles.leaderBtn, { backgroundColor: "#123043", borderWidth: 1, borderColor: "#1e3a45" }]}
  onPress={() => goTo && goTo("Home")}
>
  <Text style={[styles.leaderText, { color: "#cfeeea" }]}>◀ Back to Home</Text>
</TouchableOpacity>


      <View style={{ height: Platform.OS === "android" ? 48 : 24 }} />
    </ScrollView>
  );
}

/* --------------------------- STYLES --------------------------- */
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? 36 : 60,
    paddingHorizontal: 16,
    backgroundColor: "#081624",
    minHeight: "100%",
    alignItems: "center",
  },

  headerImage: {
    width: "92%",
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#123640",
  },

  title: {
    color: "#ffd54f",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
    textAlign: "center",
  },

  langTag: {
    color: "#0ea5a0",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    color: "#cfeeea",
    marginBottom: 14,
    fontSize: 13,
  },

  statsRow: {
    flexDirection: "row",
    width: "92%",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#08323f",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#123640",
    alignItems: "center",
  },
  statLabel: {
    color: "#98bfc3",
    fontSize: 12,
  },
  statValue: {
    color: "#0ea5a0",
    fontWeight: "900",
    fontSize: 18,
  },

  card: {
    width: "92%",
    backgroundColor: "#071826",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#123640",
  },

  qTitle: {
    color: "#ffd54f",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 8,
  },
  qText: {
    color: "#e6f7f5",
    fontSize: 15,
  },

  inputLabel: {
    color: "#98bfc3",
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
  },

  textInput: {
    minHeight: 80,
    backgroundColor: "#04131a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#08303a",
    padding: 10,
    color: "#e6f7f5",
    textAlignVertical: "top",
  },

  submitBtn: {
    marginTop: 12,
    backgroundColor: "#ffd54f",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitText: {
    color: "#102020",
    fontWeight: "900",
  },

  smallBtn: {
    marginTop: 10,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#123043",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e3a45",
  },
  smallBtnText: {
    color: "#cfeeea",
    fontWeight: "700",
    fontSize: 13,
  },

  resultBox: {
    marginTop: 12,
    backgroundColor: "#08323f",
    padding: 10,
    borderRadius: 8,
  },
  resultText: {
    color: "#e6f7f5",
    fontWeight: "700",
  },

  leaderBtn: {
    marginTop: 16,
    width: "92%",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#0ea5a0",
    alignItems: "center",
  },
  leaderText: {
    color: "#022c2c",
    fontWeight: "900",
  },

  button: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#0ea5a0",
  },
  buttonText: { color: "#022c2c", fontWeight: "900" },
});
