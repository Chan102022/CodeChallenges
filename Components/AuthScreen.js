import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function AuthScreen({ onAuthSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Track Sign In / Register state
  const [errorMessage, setErrorMessage] = useState("");

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
        onAuthSuccess(parsed.username); // Pass the correct username
      } else {
        alert("Incorrect password");
      }
    } else {
      alert("User not found");
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      alert("Please fill in both fields");
      return;
    }

    const storedUser = await AsyncStorage.getItem(username);
    if (storedUser) {
      alert("Username already exists");
    } else {
      const newUser = { username, password };
      await AsyncStorage.setItem(username, JSON.stringify(newUser));
      await AsyncStorage.setItem("user", JSON.stringify(newUser)); // persist login
      onAuthSuccess(newUser.username); // Pass the username on success
    }
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>
        {isRegistering ? "Create an Account" : "Log In"}
      </Text>

      {errorMessage && <Text style={authStyles.error}>{errorMessage}</Text>}

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

      {isRegistering ? (
        <>
          <TouchableOpacity onPress={handleRegister} style={authStyles.button}>
            <Text style={authStyles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsRegistering(false)} // Switch to Sign In
            style={[authStyles.button, { backgroundColor: "#4CAF50", marginTop: 10 }]}
          >
            <Text style={authStyles.buttonText}>
              Already have an account? Log In
            </Text>
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
            <Text style={authStyles.buttonText}>
              Don't have an account? Register
            </Text>
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
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
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

export default AuthScreen;
