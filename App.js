// App.js
import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

// Screens
function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CodeChallenge</Text>
      <Text style={styles.description}>
        Welcome to the coding challenge platform! Where you test your coding skills everyday!
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.whiteButton}>
          <Text style={styles.darkButtonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.whiteButton}>
          <Text style={styles.darkButtonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.whiteButton}>
          <Text style={styles.darkButtonText}>Instructions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.whiteButton, styles.logoutButton]}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.aboutDescription}>
        This app is designed to help you test and improve your coding skills every day. Whether you're a
        beginner or an experienced developer, you'll find daily challenges and exercises that encourage
        consistent practice and problem-solving. Train regularly, track your progress, and level up your
        skills — one challenge at a time.
      </Text>
    </View>
  );
}

function AdventureScreen() {
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adventure Mode</Text>
      <Text style={styles.description}>Choose a level to start your journey!</Text>

      <ScrollView contentContainerStyle={styles.levelsContainer}>
        {levels.map((level) => (
          <TouchableOpacity key={level} style={styles.wideButton}>
            <Text style={styles.darkButtonText}>Level {level}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function DailyChallengesScreen() {
  return <ScreenContainer title="Daily Challenges" description="Try a new challenge every day." />;
}

function ProfileScreen() {
  return <ScreenContainer title="Profile" description="View your profile and achievements." />;
}

function LeaderboardScreen() {
  return <ScreenContainer title="Leaderboard" description="See where you rank among other coders!" />;
}

// Reusable screen layout
function ScreenContainer({ title, description }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#ccc',
          tabBarStyle: { backgroundColor: '#222' },
          tabBarIndicatorStyle: { backgroundColor: '#00aced' },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="About" component={AboutScreen} />
        <Tab.Screen name="Adv." component={AdventureScreen} />
        <Tab.Screen name="Daily" component={DailyChallengesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Rank" component={LeaderboardScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00aced',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  whiteButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    width: '85%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  wideButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    width: '95%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  darkButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderWidth: 2,
    borderColor: '#d9534f',
  },
  logoutButtonText: {
    color: '#d9534f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  aboutDescription: {
    fontSize: 18,
    color: '#eee',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 28,
    marginTop: 10,
  },
  levelsContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
});
