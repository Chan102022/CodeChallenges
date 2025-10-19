import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./Components/HomeScreen";
import AdventureScreen from "./Components/AdventureScreen";
import LeaderboardScreen from "./Components/LeaderboardScreen";
import DailyQuestScreen from "./Components/DailyQuestScreen";

function AuthScreen({ onAuthSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    const storedUser = await AsyncStorage.getItem(username);
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.password === password) {
        await AsyncStorage.setItem("user", JSON.stringify(parsed)); // persist login
        onAuthSuccess(username);
      } else {
        alert("Incorrect password");
      }
    } else {
      alert("User not found");
    }
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Welcome</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={authStyles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={authStyles.input}
      />
      <TouchableOpacity onPress={handleSignIn} style={authStyles.button}>
        <Text style={authStyles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

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
        setIsAuthenticated(true);
      }
    };
    checkLogin();
  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem("user");
    setIsAuthenticated(false);
    setUsername("");
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
              style={[
                styles.navButton,
                {
                  backgroundColor: "#f44336",
                  marginTop: 20,
                  borderRadius: 6,
                },
              ]}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
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
                style={[
                  styles.navText,
                  activeNav === item && styles.navTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )
        )}
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

const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#4CAF50",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
