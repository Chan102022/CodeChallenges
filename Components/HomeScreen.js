import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ onStart }) {
  const [note, setNote] = useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          setNote(
            'Instructions:\n1. Press Start to begin.\n2. Answer questions carefully.\n3. Check your score after completing.'
          )
        }
      >
        <Text style={styles.buttonText}>Instruction</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          setNote(
            'Help:\nIf you face issues, make sure you are logged in. Contact support if needed.'
          )
        }
      >
        <Text style={styles.buttonText}>Help</Text>
      </TouchableOpacity>

      {/* Note display */}
      {note ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{note}</Text>
          <TouchableOpacity onPress={() => setNote('')}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',  
    alignItems: 'center',      
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
    width: '70%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noteBox: {
    marginTop: 20,
    backgroundColor: '#e0f2f1',
    padding: 15,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  noteText: {
    color: '#004d40',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  closeText: {
    color: '#00796b',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
