import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

/*
  Uploaded file path (transform to URL if needed by your hosting/tool):
  /mnt/data/4fe62b9b-c86f-49b0-8d1e-6c87e40a489b.png
*/

export default function LeaderboardScreen({ goBack, goTo }) {
  const [users, setUsers] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10); // default Top 10
  const [loading, setLoading] = useState(true);
  const [selectedPageLabel, setSelectedPageLabel] = useState("Top 10");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);

      const list = snapshot.docs
        .map((d) => d.data())
        .map((u) => ({
          uid: u.uid,
          username: u.username || (u.email ? u.email.split("@")[0] : "player"),
          xp: u.xp ?? 0,
          score: u.score ?? 0,
        }))
        .sort((a, b) => (b.score || 0) - (a.score || 0)); // sort desc by score

      setUsers(list);
    } catch (err) {
      console.log("Leaderboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Level / XP system (DESIGNED)
  // -------------------------
  // Table:
  // Level 1: 0 - 99        (next level XP = 100)
  // Level 2: 100 - 249     (next level XP = 250)
  // Level 3: 250 - 499     (next level XP = 500)
  // Level 4: 500 - 999     (next level XP = 1000)
  // Level 5+: Use formula: nextXp = Math.floor(1000 * 1.5^(level-4))
  // This lets progression accelerate after level 4.
  const getLevelAndNext = (xp) => {
    if (xp < 100) return { level: 1, current: xp, nextXp: 100 };
    if (xp < 250) return { level: 2, current: xp - 100, nextXp: 250 - 100 };
    if (xp < 500) return { level: 3, current: xp - 250, nextXp: 500 - 250 };
    if (xp < 1000) return { level: 4, current: xp - 500, nextXp: 1000 - 500 };

    // For level >=5 compute iteratively
    let level = 5;
    let lower = 1000;
    while (true) {
      const gap = Math.floor(1000 * Math.pow(1.5, level - 5)); // gap for this level
      const upper = lower + gap;
      if (xp < upper) {
        return { level, current: xp - lower, nextXp: gap };
      }
      lower = upper;
      level++;
      // safety cap
      if (level > 1000) return { level, current: xp - lower, nextXp: Math.max(1, gap) };
    }
  };

  const percentFor = (xp) => {
    const info = getLevelAndNext(xp);
    const percent = Math.round((info.current / info.nextXp) * 100);
    return Math.max(0, Math.min(100, percent));
  };

  // -------------------------
  // Pagination handlers
  // -------------------------
  const setPage = (label) => {
    setSelectedPageLabel(label);
    switch (label) {
      case "Top 10":
        setVisibleCount(10);
        break;
      case "Top 50":
        setVisibleCount(50);
        break;
      case "Top 100":
        setVisibleCount(100);
        break;
      case "All":
      default:
        setVisibleCount(users.length || 9999);
        break;
    }
  };

  // -------------------------
  // Navigation back fix:
  // If goBack is provided (function), call it.
  // Else if goTo is provided, call goTo("DailyQuest")
  // -------------------------
  const handleBack = () => {
    if (typeof goBack === "function") {
      try {
        // Some callers might pass a simple callback (no args)
        goBack();
      } catch {
        // fallback: try goTo
        if (typeof goTo === "function") goTo("DailyQuest");
      }
    } else if (typeof goTo === "function") {
      goTo("DailyQuest");
    } else {
      // nothing to do
      console.warn("No navigation handler provided for leaderboard back button");
    }
  };

  // -------------------------
  // UI helpers
  // -------------------------
  const medalForIndex = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>

      {/* Pagination controls */}
      <View style={styles.pagerRow}>
        {["Top 10", "Top 50", "Top 100", "All"].map((label) => (
          <TouchableOpacity
            key={label}
            style={[
              styles.pagerButton,
              selectedPageLabel === label && styles.pagerButtonActive,
            ]}
            onPress={() => setPage(label)}
          >
            <Text
              style={[
                styles.pagerText,
                selectedPageLabel === label && styles.pagerTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ffd54f" style={{ marginTop: 30 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {users.slice(0, visibleCount).map((u, i) => {
            const percent = percentFor(u.xp ?? 0);
            const medal = medalForIndex(i);
            return (
              <View key={u.uid || u.username || i} style={styles.row}>
                <View style={styles.left}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <View style={styles.nameBlock}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{u.username}</Text>
                      {medal ? <Text style={styles.medal}>{medal}</Text> : null}
                    </View>

                    {/* level + xp small */}
                    <Text style={styles.levelText}>
                      Lv {getLevelAndNext(u.xp ?? 0).level} • {u.xp ?? 0} XP
                    </Text>
                  </View>
                </View>

                <View style={styles.right}>
                  <Text style={styles.score}>{u.score ?? 0}</Text>

                  {/* XP progress bar */}
                  <View style={styles.progressWrap}>
                    <View style={[styles.progressBar, { width: `${percent}%` }]} />
                  </View>

                  <Text style={styles.percentText}>{percent}%</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>⬅ Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={loadLeaderboard}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ----------------------------- STYLES ----------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#081624",
    paddingTop: 60,
    paddingHorizontal: 16,
  },

  title: {
    color: "#ffd54f",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },

  pagerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  pagerButton: {
    backgroundColor: "#123043",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e3a45",
    marginHorizontal: 4,
  },

  pagerButtonActive: {
    backgroundColor: "#0ea5a0",
    borderColor: "#0ea5a0",
  },

  pagerText: {
    color: "#cfeeea",
    fontWeight: "700",
    fontSize: 12,
  },

  pagerTextActive: {
    color: "#022c2c",
  },

  scrollContainer: {
    paddingBottom: 40,
    marginTop: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#08323f",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#123640",
    marginBottom: 10,
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  rank: {
    color: "#ffd54f",
    fontWeight: "900",
    fontSize: 18,
    width: 36,
  },

  nameBlock: { marginLeft: 6, flex: 1 },

  nameRow: { flexDirection: "row", alignItems: "center" },

  name: {
    color: "#cfeeea",
    fontWeight: "800",
    fontSize: 16,
  },

  medal: { marginLeft: 8, fontSize: 18 },

  levelText: { color: "#98bfc3", fontSize: 12, marginTop: 2 },

  right: {
    width: 160,
    alignItems: "flex-end",
  },

  score: { color: "#ffd54f", fontWeight: "900", fontSize: 18 },

  progressWrap: {
    marginTop: 8,
    height: 10,
    width: "100%",
    backgroundColor: "#04131a",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#08303a",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#0ea5a0",
  },

  percentText: {
    marginTop: 6,
    color: "#cfeeea",
    fontWeight: "700",
    fontSize: 12,
  },

  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  backButton: {
    flex: 1,
    backgroundColor: "#ffd54f",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  backText: { color: "#102020", fontWeight: "900" },

  refreshButton: {
    flex: 1,
    backgroundColor: "#0ea5a0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  refreshText: { color: "#022c2c", fontWeight: "900" },
});
