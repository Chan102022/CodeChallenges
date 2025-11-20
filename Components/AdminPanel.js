import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function AdminPanel() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [updatedQuestion, setUpdatedQuestion] = useState("");
  const [updatedOutput, setUpdatedOutput] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const levelsRef = collection(db, "challenges", "Java", "levels");
    const snapshot = await getDocs(levelsRef);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setQuestions(list);
  };

  const saveUpdate = async () => {
    const ref = doc(db, "challenges", "Java", "levels", selected.id);
    await updateDoc(ref, {
      question: updatedQuestion,
      expectedOutput: updatedOutput,
    });
    alert("Updated!");
    setSelected(null);
    loadQuestions();
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={styles.title}>Admin: Edit Java Challenges</Text>

      {selected ? (
        <View>
          <Text style={styles.label}>Question:</Text>
          <TextInput
            style={styles.input}
            value={updatedQuestion}
            onChangeText={setUpdatedQuestion}
          />

          <Text style={styles.label}>Expected Output:</Text>
          <TextInput
            style={styles.input}
            value={updatedOutput}
            onChangeText={setUpdatedOutput}
          />

          <Button title="Save Changes" onPress={saveUpdate} />
          <Button title="Cancel" color="red" onPress={() => setSelected(null)} />
        </View>
      ) : (
        questions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => {
              setSelected(item);
              setUpdatedQuestion(item.question);
              setUpdatedOutput(item.expectedOutput);
            }}
          >
            <Text style={styles.cardTitle}>Level {item.id}</Text>
            <Text>{item.question}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#EEE",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: "bold", marginBottom: 6 },
  label: { marginTop: 10, fontWeight: "bold" },
  input: {
    backgroundColor: "#FFF",
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
  },
});
