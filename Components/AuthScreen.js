import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthScreen({ onAuthSuccess }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async () => {
    if (!username || !password) {
      setErrorMessage("Enter username and password");
      return;
    }

    const storedUser = await AsyncStorage.getItem(username);
    if (!storedUser) {
      setErrorMessage("User not found");
      return;
    }

    const parsed = JSON.parse(storedUser);
    if (parsed.password !== password) {
      setErrorMessage("Incorrect password");
      return;
    }

    await AsyncStorage.setItem("user", JSON.stringify(parsed));
    onAuthSuccess(parsed.username);
  };

  const handleRegister = async () => {
    if (!fullName || !username || !password || !confirmPassword) {
      setErrorMessage("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const existingUser = await AsyncStorage.getItem(username);
    if (existingUser) {
      setErrorMessage("Username already exists");
      return;
    }

    const newUser = {
      fullName,
      username,
      password,
      score: 0,
      lastPlayedDate: null,
    };

    await AsyncStorage.setItem(username, JSON.stringify(newUser));
    await AsyncStorage.setItem("user", JSON.stringify(newUser));

    // Add username to master user list for leaderboard
    const allUsers = JSON.parse(await AsyncStorage.getItem("users") || "[]");
    if (!allUsers.includes(username)) {
      allUsers.push(username);
      await AsyncStorage.setItem("users", JSON.stringify(allUsers));
    }

    onAuthSuccess(username);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegistering ? "Register" : "Log In"}
      </Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {isRegistering && (
        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {isRegistering && (
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />
      )}

      {isRegistering ? (
        <>
          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setIsRegistering(false); setErrorMessage(""); }}
            style={[styles.button, { backgroundColor: "#4CAF50", marginTop: 10 }]}
          >
            <Text style={styles.buttonText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={handleSignIn} style={styles.button}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setIsRegistering(true); setErrorMessage(""); }}
            style={[styles.button, { backgroundColor: "#4CAF50", marginTop: 10 }]}
          >
            <Text style={styles.buttonText}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 40, backgroundColor: "#f5f5f5" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 40, textAlign: "center", color: "#4CAF50" },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
  input: { backgroundColor: "#fff", padding: 12, marginBottom: 20, borderRadius: 8, borderWidth: 1, borderColor: "#ccc" },
  button: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
