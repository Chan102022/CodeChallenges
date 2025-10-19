import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AuthScreen from "./Components/AuthScreen";
import HomeScreen from "./Components/HomeScreen";
import AdventureScreen from "./Components/AdventureScreen";
import LeaderboardScreen from "./Components/LeaderboardScreen";
import DailyQuestScreen from "./Components/DailyQuestScreen";
import ProfileScreen from "./Components/ProfileScreen";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [activeNav, setActiveNav] = useState("Home");

  // Auto-login if user already exists in AsyncStorage
  useEffect(() => {
    const checkUser = async () => {
      const userJson = await AsyncStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        setUsername(user.username);
        setIsAuthenticated(true);
      }
    };
    checkUser();
  }, []);

  // Logout logic - Changed: Removed invalid navigation.reset (not needed for custom navigation)
  const handleLogout = async () => {
    try {
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem("user");

      // Update authentication state and navigation
      setIsAuthenticated(false);
      setUsername("");
      setActiveNav("Home");

      // Show alert after logout
      Alert.alert("Logged out", "You have been logged out.", [
        {
          text: "OK",
          onPress: () => {
            // Additional actions can go here if necessary
          },
        },
      ]);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Render main screens after login
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
        return <ProfileScreen onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  // Render auth screen if not logged in
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onAuthSuccess={(name) => {
          setUsername(name);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Top Navigation */}
      <View style={styles.navBar}>
        {["Home", "Adventure", "DailyQuest", "Leaderboard", "Profile"].map(
          (item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setActiveNav(item)}
              style={[
                styles.navButton,
                activeNav === item && styles.navButtonActive,
              ]}
            >
              <Text
                style={[styles.navText, activeNav === item && styles.navTextActive]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Screen Content */}
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
});