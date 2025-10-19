import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AuthScreen from "./Components/AuthScreen";
import HomeScreen from "./Components/HomeScreen";
import AdventureScreen from "./Components/AdventureScreen";
import LeaderboardScreen from "./Components/LeaderboardScreen";
import DailyQuestScreen from "./Components/DailyQuestScreen";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        setUsername(parsed.username);
        setIsAuthenticated(true);  // If a user is already logged in
      }
    };
    checkLogin();
  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem("user");  // Log out by removing user data
    setIsAuthenticated(false);
    setUsername("");  // Reset username on sign out
  };

  const renderContent = () => {
    switch (activeNav) {
      case "Home":
        return <HomeScreen onStart={() => setActiveNav("Adventure")} />;
      case "Adventure":
        return <AdventureScreen username={username} />;
      case "DailyQuest":
        return <DailyQuestScreen />;
      case "Leaderboard":
        return <LeaderboardScreen />;
      case "Profile":
        return (
          <View>
            <Text style={styles.contentText}>Welcome, {username}</Text>
            <TouchableOpacity
              onPress={handleSignOut}
              style={[styles.navButton, { backgroundColor: "#f44336", marginTop: 20 }]}
            >
              <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onAuthSuccess={(name) => {
          setUsername(name);
          setIsAuthenticated(true);  // Set authenticated state
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Top Navigation */}
      <View style={styles.navBar}>
        {["Home", "Adventure", "DailyQuest", "Leaderboard", "Profile"].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setActiveNav(item)}
            style={[styles.navButton, activeNav === item && styles.navButtonActive]}
          >
            <Text style={[styles.navText, activeNav === item && styles.navTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: "#eee",
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  navButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "blue",
  },
  navText: {
    fontSize: 16,
    color: "#333",
  },
  navTextActive: {
    fontWeight: "bold",
    color: "blue",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentText: {
    fontSize: 18,
  },
});
