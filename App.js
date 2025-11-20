import React, { useState, useEffect } from "react";
import { View } from "react-native";

import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import AuthScreen from "./Components/AuthScreen";
import HomeScreen from "./Components/HomeScreen";
import AdventureScreen from "./Components/AdventureScreen";
import LeaderboardScreen from "./Components/LeaderboardScreen";
import DailyQuestScreen from "./Components/DailyQuestScreen";
import ProfileScreen from "./Components/ProfileScreen";
import AdminEditor from "./Components/AdminEditor";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeScreen, setActiveScreen] = useState("Home");
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setIsAdmin(data.role === "admin");
        }

        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUserData(null);
        setIsAdmin(false);
      }
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setActiveScreen("Home");
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case "Home":
        return <HomeScreen goTo={setActiveScreen} isAdmin={isAdmin} />;

      case "Adventure":
        return (
          <AdventureScreen
            username={userData?.uid}   // ✔ using UID
            goTo={setActiveScreen}
          />
        );

     case "DailyQuest":
    return <DailyQuestScreen goTo={setActiveScreen} />;


      case "Leaderboard":
  return (
    <LeaderboardScreen
      goBack={() => setActiveScreen("Home")}
      goTo={setActiveScreen}
    />
  );


      case "Profile":
        return (
          <ProfileScreen
            user={userData}
            goTo={setActiveScreen}
            onLogout={logout}
          />
        );

      case "Admin":
        return <AdminEditor goTo={setActiveScreen} />;

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onAuthSuccess={(uid) => {
          setActiveScreen("Home");
        }}
      />
    );
  }

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
}
