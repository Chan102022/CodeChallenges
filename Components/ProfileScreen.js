import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  TextInput,
} from "react-native";

import { auth, db } from "../firebase";
import { signOut, updatePassword, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProfileScreen({ onLogout, username, isAdmin, goTo }) {
  const [selectedCategory, setSelectedCategory] = useState("Overview");
  const [userData, setUserData] = useState(null);

  const [editingCredentials, setEditingCredentials] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [saveMessage, setSaveMessage] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const categories = ["Overview", "Edit Credentials"];

  // Load from Firestore
  useEffect(() => {
    const loadUser = async () => {
      if (!auth.currentUser) return;

      const ref = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const user = snap.data();

        setUserData(user);
        setEditingCredentials({
          fullName: user.fullName || "",
          username: user.username || "",
          email: user.email || "",
          password: "",
        });
      }
    };

    loadUser();
  }, []);

  // Fade animation
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedCategory]);

  // Save changes
  const handleSave = async () => {
    try {
      const uid = auth.currentUser.uid;
      const ref = doc(db, "users", uid);

      const updatedData = {
        fullName: editingCredentials.fullName,
        username: editingCredentials.username,
        email: editingCredentials.email,
      };

      await updateDoc(ref, updatedData);

      if (editingCredentials.password) {
        await updatePassword(auth.currentUser, editingCredentials.password);
      }

      await updateProfile(auth.currentUser, {
        displayName: editingCredentials.username,
      });

      setUserData({ ...userData, ...updatedData });

      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);

      setSelectedCategory("Overview");
    } catch (err) {
      console.log("SAVE ERROR:", err);
      setSaveMessage("Error saving profile.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  const handleCancel = () => {
    setEditingCredentials({
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      password: "",
    });
    setSelectedCategory("Overview");
  };

  const renderCategoryContent = () => {
    if (!userData)
      return <Text style={styles.loadingText}>Loading profile...</Text>;

    switch (selectedCategory) {
      case "Overview":
        return (
          <>
            {/* XP & SCORE CARD */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Player Stats</Text>

              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>XP:</Text>
                <Text style={styles.statsValue}>{userData.xp ?? 0}</Text>
              </View>

              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Score:</Text>
                <Text style={styles.statsValue}>{userData.score ?? 0}</Text>
              </View>
            </View>

            {/* USER INFO */}
            <Text style={styles.infoText}>Full Name: {userData.fullName}</Text>
            <Text style={styles.infoText}>Username: {userData.username}</Text>
            <Text style={styles.infoText}>Email: {userData.email}</Text>
            <Text style={styles.infoText}>Role: {userData.role}</Text>

            {isAdmin ? (
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => goTo("Admin")}
              >
                <Text style={styles.adminText}>🛠️ Admin Panel</Text>
              </TouchableOpacity>
            ) : null}
          </>
        );

      case "Edit Credentials":
        return (
          <>
            <Text style={styles.editTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={editingCredentials.fullName}
              onChangeText={(t) =>
                setEditingCredentials({ ...editingCredentials, fullName: t })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={editingCredentials.username}
              onChangeText={(t) =>
                setEditingCredentials({ ...editingCredentials, username: t })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editingCredentials.email}
              onChangeText={(t) =>
                setEditingCredentials({ ...editingCredentials, email: t })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="New Password (optional)"
              secureTextEntry
              value={editingCredentials.password}
              onChangeText={(t) =>
                setEditingCredentials({ ...editingCredentials, password: t })
              }
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* BACK TO HOME BUTTON */}
        <TouchableOpacity style={styles.backBtn} onPress={() => goTo("Home")}>
          <Text style={styles.backText}>◀ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Player Profile</Text>

        <View style={styles.categoryContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {saveMessage ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{saveMessage}</Text>
          </View>
        ) : null}

        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {renderCategoryContent()}
        </Animated.View>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------- STYLES -------------------------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#081624" },
  container: { paddingTop: 40, paddingHorizontal: 16, paddingBottom: 60 },

  /* BACK BUTTON */
  backBtn: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#123043",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e3a45",
    zIndex: 999,
  },
  backText: {
    color: "#cfeeea",
    fontWeight: "800",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFD54F",
    textAlign: "center",
    marginBottom: 20,
  },

  categoryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },

  categoryButton: {
    backgroundColor: "#123043",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e3a45",
  },

  categoryActive: {
    backgroundColor: "#0ea5a0",
    borderColor: "#0ea5a0",
  },

  categoryText: {
    color: "#cfeeea",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#071826",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#123640",
  },

  statsCard: {
    backgroundColor: "#08323f",
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
  },
  statsTitle: {
    color: "#ffd54f",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statsLabel: {
    color: "#cfeeea",
    fontSize: 16,
    fontWeight: "600",
  },
  statsValue: {
    color: "#0ea5a0",
    fontSize: 16,
    fontWeight: "900",
  },

  infoText: {
    color: "#cfeeea",
    fontSize: 16,
    marginBottom: 8,
  },

  adminButton: {
    backgroundColor: "#ffd54f",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  adminText: { color: "#3a2d00", textAlign: "center", fontWeight: "900" },

  input: {
    backgroundColor: "#04131a",
    borderWidth: 1,
    borderColor: "#123043",
    color: "#e6f7f5",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 10,
    marginRight: 5,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e64a19",
    padding: 12,
    borderRadius: 10,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "900" },

  logoutButton: {
    marginTop: 25,
    backgroundColor: "#b71c1c",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "900" },

  messageBox: {
    backgroundColor: "#0ea5a0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: { color: "#022c2c", fontWeight: "900", textAlign: "center" },

  loadingText: { color: "#fff", textAlign: "center" },
});
