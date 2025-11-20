import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { doc, setDoc, getDoc } from "firebase/firestore";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
  "825769971060-h4mn6egkamtbav9ankk15gnhkfvla541.apps.googleusercontent.com";

export default function AuthScreen({ onAuthSuccess }) {
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (idToken) handleGoogle(idToken);
    }
  }, [response]);

  const saveUserToFirestore = async (firebaseUser, extra = {}) => {
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);

    const existing = snap.exists() ? snap.data() : {};

    const profile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      username:
        extra.username ||
        existing.username ||
        firebaseUser.email.split("@")[0],
      fullName:
        extra.fullName ||
        existing.fullName ||
        firebaseUser.displayName ||
        "",
      role: existing.role || "user",
      xp: existing.xp ?? 0,
      score: existing.score ?? 0,
      completedLevels: existing.completedLevels ?? [],
      unlockedLevel: existing.unlockedLevel ?? 1,
      joinedAt: existing.joinedAt ?? Date.now(),
    };

    await setDoc(ref, profile, { merge: true });
    return profile;
  };

  const handleRegister = async () => {
    setErrorMessage("");

    if (!email || !password || !username || !fullName) {
      setErrorMessage("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(userCred.user, { username, fullName });

      setLoading(false);
      onAuthSuccess(userCred.user.uid);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message);
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Enter email & password.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(userCred.user);

      setLoading(false);
      onAuthSuccess(userCred.user.uid);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message);
    }
  };

  const handleGoogle = async (idToken) => {
    try {
      setLoading(true);

      const credential = GoogleAuthProvider.credential(idToken);
      const userCred = await signInWithCredential(auth, credential);

      await saveUserToFirestore(userCred.user);

      setLoading(false);
      onAuthSuccess(userCred.user.uid);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegistering ? "Create Account" : "Sign In"}</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {isRegistering && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#7fa3ab"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#7fa3ab"
            value={username}
            onChangeText={setUsername}
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#7fa3ab"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#7fa3ab"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#ffd54f" />
      ) : (
        <>
          {isRegistering ? (
            <>
              <TouchableOpacity style={styles.mainButton} onPress={handleRegister}>
                <Text style={styles.mainButtonText}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: "#123043" }]}
                onPress={() => setIsRegistering(false)}
              >
                <Text style={styles.mainButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.mainButton} onPress={handleLogin}>
                <Text style={styles.mainButtonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: "#db4437" }]}
                onPress={() => promptAsync({ useProxy: true })}
              >
                <Text style={styles.mainButtonText}>Sign in with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: "#0ea5a0" }]}
                onPress={() => setIsRegistering(true)}
              >
                <Text style={styles.darkText}>Create Email Account</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#081624",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#ffd54f",
    textAlign: "center",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#04131a",
    borderWidth: 1,
    borderColor: "#123043",
    borderRadius: 10,
    padding: 14,
    color: "#e6f7f5",
    marginBottom: 14,
    fontSize: 16,
  },

  mainButton: {
    backgroundColor: "#ffd54f",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  mainButtonText: {
    color: "#102020",
    fontWeight: "900",
    fontSize: 16,
  },

  darkText: {
    color: "#022c2c",
    fontWeight: "900",
    fontSize: 16,
  },

  error: {
    color: "#ff8a80",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
});
