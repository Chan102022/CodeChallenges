import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ onLogout }) {
  const [selectedCategory, setSelectedCategory] = useState('Overview');
  const [userData, setUserData] = useState(null);
  const [editingCredentials, setEditingCredentials] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
  });
  const [oldUsername, setOldUsername] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const categories = ['Overview', 'Achievements', 'Stats', 'Edit Credentials'];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          const data = {
            fullName: user.fullName,
            username: user.username,
            email: user.email || '',
            password: user.password || '',
            level: 15,
            xp: 5000,
            achievements: [
              { id: 'a1', label: '🏆 Completed 20 Quests' },
              { id: 'a2', label: '🔥 7-Day Streak' },
              { id: 'a3', label: '💡 Solved 100 Challenges' },
            ],
            stats: {
              tasksCompleted: 150,
              accuracy: 85,
              fastestCompletion: '0m 45s',
            },
          };

          setUserData(data);
          setEditingCredentials({
            fullName: data.fullName,
            username: data.username,
            email: data.email,
            password: data.password,
          });
          setOldUsername(data.username);
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [selectedCategory]);

  const handleLogout = () => {
    onLogout();
  };

  const handleSave = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        const updatedUser = { ...user, ...editingCredentials };

        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

        if (updatedUser.username !== oldUsername) {
          await AsyncStorage.removeItem(oldUsername);
          await AsyncStorage.setItem(updatedUser.username, JSON.stringify(updatedUser));
        } else {
          await AsyncStorage.setItem(updatedUser.username, JSON.stringify(updatedUser));
        }

        setUserData({ ...userData, ...editingCredentials });
        setOldUsername(updatedUser.username);
        setSelectedCategory('Overview');

        // Show success message
        setSaveMessage('Credentials updated successfully!');

        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save user data:', err);
    }
  };

  const handleCancel = () => {
    setEditingCredentials({
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });
    setSelectedCategory('Overview');
  };

  const renderCategoryContent = () => {
    if (!userData) {
      return <Text style={styles.loadingText}>Loading...</Text>;
    }

    const { fullName, username, level, xp, achievements, stats } = userData;

    switch (selectedCategory) {
      case 'Overview':
        return (
          <>
            <Text style={styles.challengeTitle}>Full Name: {fullName}</Text>
            <Text style={styles.challengeText}>Username: {username}</Text>
            <Text style={styles.challengeText}>Level: {level}</Text>
            <Text style={styles.challengeText}>XP: {xp} / 5000</Text>
          </>
        );

      case 'Achievements':
        return (
          <>
            <Text style={styles.challengeTitle}>Achievements</Text>
            {achievements.map((achievement) => (
              <Text key={achievement.id} style={styles.challengeText}>
                {achievement.label}
              </Text>
            ))}
          </>
        );

      case 'Stats':
        return (
          <>
            <Text style={styles.challengeTitle}>Performance Stats</Text>
            <Text style={styles.challengeText}>Tasks Completed: {stats.tasksCompleted}</Text>
            <Text style={styles.challengeText}>Accuracy: {stats.accuracy}%</Text>
            <Text style={styles.challengeText}>Fastest Completion: {stats.fastestCompletion}</Text>
          </>
        );

      case 'Edit Credentials':
        return (
          <>
            <Text style={styles.challengeTitle}>Edit Credentials</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={editingCredentials.fullName}
              onChangeText={(text) =>
                setEditingCredentials({ ...editingCredentials, fullName: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={editingCredentials.username}
              onChangeText={(text) =>
                setEditingCredentials({ ...editingCredentials, username: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={editingCredentials.password}
              onChangeText={(text) =>
                setEditingCredentials({ ...editingCredentials, password: text })
              }
              secureTextEntry
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
        <Text style={styles.title}>Profile</Text>

        <View style={styles.categoryContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.buttonText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {saveMessage ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{saveMessage}</Text>
          </View>
        ) : null}

        <Animated.View style={[styles.challengeBox, { opacity: fadeAnim }]}>
          {renderCategoryContent()}
        </Animated.View>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.actionButton, { backgroundColor: '#f44336', marginTop: 20 }]}
        >
          <Text style={styles.actionButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    alignSelf: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#A5D6A7',
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  challengeBox: {
    marginTop: 30,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    elevation: 2,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  challengeText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  messageBox: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  messageText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
