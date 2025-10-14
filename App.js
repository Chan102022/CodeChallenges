// App.js
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

// Screens
function HomeScreen() {
  return <ScreenContainer title="Home" description="Welcome to the coding challenge platform!" />;
}
function AboutScreen() {
  return <ScreenContainer title="About" description="This app lets you test your coding skills." />;
}
function AdventureScreen() {
  return <ScreenContainer title="Adventure" description="Complete levels and progress your skills!" />;
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
          tabBarScrollEnabled: true,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#ccc',
          tabBarStyle: { backgroundColor: '#222' },
          tabBarIndicatorStyle: { backgroundColor: '#00aced' },
          tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="About" component={AboutScreen} />
        <Tab.Screen name="Adventure" component={AdventureScreen} />
        <Tab.Screen name="Daily Challenges" component={DailyChallengesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
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
});
