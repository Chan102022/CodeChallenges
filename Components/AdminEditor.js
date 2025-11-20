// Components/AdminEditor.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

export default function AdminEditor({ goTo }) {
  const [selectedLanguage, setSelectedLanguage] = useState("Java");
  const [levels, setLevels] = useState([]);
  const [selectedLevelID, setSelectedLevelID] = useState(null);
  const [edited, setEdited] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const LANGS = ["Java", "Python", "JavaScript"];

  useEffect(() => {
    if (!selectedLanguage) return;
    const ref = collection(db, "challenges", selectedLanguage, "levels");
    const unsub = onSnapshot(ref, (snap) => {
      const arr = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => Number(a.id) - Number(b.id));
      setLevels(arr);
    });
    return () => unsub();
  }, [selectedLanguage]);

  const loadLevel = async (id) => {
    setSelectedLevelID(id);
    const ref = doc(db, "challenges", selectedLanguage, "levels", String(id));
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      Alert.alert("Not found", "This level doesn't exist.");
      return;
    }
    setEdited(snap.data());
  };

  const updateLevel = async () => {
    if (!edited || !selectedLevelID) return;
    try {
      await setDoc(
        doc(db, "challenges", selectedLanguage, "levels", String(selectedLevelID)),
        edited,
        { merge: true }
      );
      setSuccessMsg("Code updated successfully!");
      setTimeout(() => setSuccessMsg(""), 2000);
      Alert.alert("Success", "Code updated successfully!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const deleteLevel = async (id) => {
    Alert.alert("Delete Level?", `Delete level ${id}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const ref = doc(db, "challenges", selectedLanguage, "levels", String(id));
            const snap = await getDoc(ref);
            if (!snap.exists()) {
              Alert.alert("Not found", "Already removed.");
              return;
            }
            await deleteDoc(ref);
            if (selectedLevelID === id) {
              setSelectedLevelID(null);
              setEdited(null);
            }
            Alert.alert("Deleted", `Level ${id} deleted.`);
          } catch (err) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  const DEFAULTS = {
    Java: {
      language_id: 62,
      template: `class Main {\n  public static void main(String[] args) {\n    // your code here\n  }\n}`,
    },
    Python: { language_id: 71, template: `# your code here` },
    JavaScript: { language_id: 63, template: `// your code here` },
  };

  const createNewLevel = async () => {
    try {
      const newId = levels.length + 1;
      const ref = doc(db, "challenges", selectedLanguage, "levels", String(newId));
      const newData = {
        level: newId,
        question: "New Challenge",
        expectedOutput: "",
        difficulty: "Easy",
        ...DEFAULTS[selectedLanguage],
      };
      await setDoc(ref, newData);
      Alert.alert("Created", `Level ${newId} added.`);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <ScrollView style={styles.root}>

      {/* 🟡 BACK BUTTON — TOP LEFT */}
      <TouchableOpacity style={styles.backBtn} onPress={() => goTo("Home")}>
        <Text style={styles.backText}>◀ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Admin — Challenge Editor</Text>

      <View style={styles.langRow}>
        {LANGS.map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => {
              setSelectedLanguage(l);
              setSelectedLevelID(null);
              setEdited(null);
            }}
            style={[styles.langBtn, selectedLanguage === l && styles.langBtnActive]}
          >
            <Text
              style={[
                styles.langText,
                selectedLanguage === l && styles.langTextActive,
              ]}
            >
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={createNewLevel}>
        <Text style={styles.addText}>+ Add Level</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Levels</Text>

      {levels.map((lvl) => (
        <View key={lvl.id} style={styles.levelRow}>
          <TouchableOpacity
            style={styles.levelBtn}
            onPress={() => loadLevel(lvl.id)}
          >
            <Text style={styles.levelBtnText}>
              {selectedLanguage} {lvl.id} — {lvl.difficulty}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deleteLevel(lvl.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

      {edited && (
        <View style={styles.editor}>
          <Text style={styles.editorTitle}>
            Editing {selectedLanguage} Level {selectedLevelID}
          </Text>

          {successMsg !== "" && (
            <Text style={styles.successMsg}>{successMsg}</Text>
          )}

          <TextInput
            style={styles.input}
            value={edited.question}
            onChangeText={(v) => setEdited({ ...edited, question: v })}
            placeholder="Question"
          />

          <TextInput
            style={[styles.input, { height: 120 }]}
            multiline
            value={edited.template}
            onChangeText={(v) => setEdited({ ...edited, template: v })}
            placeholder="Template"
          />

          <TextInput
            style={styles.input}
            value={edited.expectedOutput}
            onChangeText={(v) => setEdited({ ...edited, expectedOutput: v })}
            placeholder="Expected Output"
          />

          <TextInput
            style={styles.input}
            value={edited.difficulty}
            onChangeText={(v) => setEdited({ ...edited, difficulty: v })}
            placeholder="Difficulty"
          />

          <TouchableOpacity style={styles.updateBtn} onPress={updateLevel}>
            <Text style={styles.updateText}>Update Level</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#071827",
    paddingTop: Platform.OS === "android" ? 24 : 48,
    paddingHorizontal: 16,
  },

  // 🔥 BACK BUTTON STYLE
  backBtn: {
    backgroundColor: "#123043",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#1e3a45",
    marginBottom: 10,
  },
  backText: {
    color: "#cfeeea",
    fontWeight: "800",
  },

  title: { color: "#FFD54F", fontSize: 20, fontWeight: "900", marginBottom: 12 },

  langRow: { flexDirection: "row", marginBottom: 10 },
  langBtn: {
    padding: 10,
    backgroundColor: "#16323b",
    borderRadius: 8,
    marginRight: 8,
  },
  langBtnActive: { backgroundColor: "#0ea5a0" },
  langText: { color: "#cfeeea", fontWeight: "700" },
  langTextActive: { color: "#022c2c" },

  addBtn: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  addText: { color: "#fff", fontWeight: "bold", textAlign: "center" },

  section: { color: "#cfeeea", fontSize: 16, marginBottom: 8, marginTop: 6 },

  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelBtn: {
    backgroundColor: "#08323f",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  levelBtnText: { color: "#e6f7f5", fontWeight: "700" },
  deleteText: { color: "#ff8a80", fontWeight: "700" },

  editor: {
    marginTop: 14,
    backgroundColor: "#0f2b33",
    padding: 12,
    borderRadius: 10,
  },
  editorTitle: { color: "#ffd54f", fontWeight: "900", marginBottom: 10 },
  successMsg: {
    color: "#b9f6ca",
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },

  input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, marginBottom: 10 },
  updateBtn: { backgroundColor: "#0288d1", padding: 12, borderRadius: 8 },
  updateText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
