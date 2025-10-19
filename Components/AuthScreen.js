import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function AuthScreen({ onAuthSuccess }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async () => {
    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      return;
    }

    const storedUser = await AsyncStorage.getItem(username);
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.password === password) {
        await AsyncStorage.setItem("user", JSON.stringify(parsed));
        onAuthSuccess(parsed.username);
      } else {
        setErrorMessage("Incorrect password");
      }
    } else {
      setErrorMessage("User not found");
    }
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

    const newUser = { fullName, username, password };
    await AsyncStorage.setItem(username, JSON.stringify(newUser));
    await AsyncStorage.setItem("user", JSON.stringify(newUser));
    onAuthSuccess(newUser.username);
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>
        {isRegistering ? "Create an Account" : "Log In"}
      </Text>

      {errorMessage ? <Text style={authStyles.error}>{errorMessage}</Text> : null}

      {isRegistering && (
        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={authStyles.input}
        />
      )}

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

      {isRegistering && (
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={authStyles.input}
        />
      )}

      {isRegistering ? (
        <>
          <TouchableOpacity onPress={handleRegister} style={authStyles.button}>
            <Text style={authStyles.buttonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsRegistering(false);
              setErrorMessage("");
            }}
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
            onPress={() => {
              setIsRegistering(true);
              setErrorMessage("");
            }}
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
