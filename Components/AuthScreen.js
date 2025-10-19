import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

function AuthScreen({ onAuthSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Track Register/Login state
  const [errorMessage, setErrorMessage] = useState(""); // For error messages

  const handleSignIn = async () => {
    // Reset error message
    setErrorMessage("");

    // Validate inputs
    if (!username || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    const storedUser = await AsyncStorage.getItem(username);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.password === password) {
        await AsyncStorage.setItem("user", JSON.stringify(parsedUser)); // persist login
        onAuthSuccess(username); // On success, pass username to onAuthSuccess
      } else {
        setErrorMessage("Invalid password.");
      }
    } else {
      setErrorMessage("User not found, please register.");
    }
  };

  const handleRegister = async () => {
    // Reset error message
    setErrorMessage("");

    // Validate inputs
    if (!username || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    const storedUser = await AsyncStorage.getItem(username);
    if (storedUser) {
      setErrorMessage("Username already exists. Please choose another one.");
    } else {
      const newUser = { username, password };
      await AsyncStorage.setItem(username, JSON.stringify(newUser));
      await AsyncStorage.setItem("user", JSON.stringify(newUser)); // persist login
      onAuthSuccess(username);
    }
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>{isRegistering ? "Create an Account" : "Log In"}</Text>

      {/* Username and Password Inputs */}
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

      {/* Error Message */}
      {errorMessage ? <Text style={authStyles.errorText}>{errorMessage}</Text> : null}

      {/* Conditional buttons based on the state */}
      {isRegistering ? (
        <>
          <TouchableOpacity onPress={handleRegister} style={authStyles.button}>
            <Text style={authStyles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsRegistering(false)} // Switch to Log In
            style={[authStyles.button, { backgroundColor: "#4CAF50", marginTop: 10 }]}
          >
            <Text style={authStyles.buttonText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={handleSignIn} style={authStyles.button}>
            <Text style={authStyles.buttonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsRegistering(true)} // Switch to Register
            style={[authStyles.button, { backgroundColor: "#4CAF50", marginTop: 10 }]}
          >
            <Text style={authStyles.buttonText}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

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
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
});

export default AuthScreen;
