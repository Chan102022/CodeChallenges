import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";

export default function HomeScreen({ goTo, isAdmin }) {
  const [note, setNote] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>CodeQuest Arena</Text>
      <Text style={styles.subtitle}>Choose your path, challenger!</Text>

      {/* --- MAIN MENU BUTTONS --- */}
      <TouchableOpacity style={styles.menuBtn} onPress={() => goTo("Adventure")}>
        <Text style={styles.menuText}>⚔️ Adventure Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBtn} onPress={() => goTo("DailyQuest")}>
        <Text style={styles.menuText}>📅 Daily Quest</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBtn} onPress={() => goTo("Leaderboard")}>
        <Text style={styles.menuText}>🏆 Leaderboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuBtn} onPress={() => goTo("Profile")}>
        <Text style={styles.menuText}>👤 Profile</Text>
      </TouchableOpacity>

      {/* --- ADMIN BUTTON (Visible only if admin) --- */}
      {isAdmin && (
        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: "#FFD54F" }]}
          onPress={() => goTo("Admin")}
        >
          <Text style={[styles.menuText, { color: "#3a2d00" }]}>🛠️ Admin Panel</Text>
        </TouchableOpacity>
      )}

      {/* --- INFO BUTTONS --- */}
      <TouchableOpacity
        style={styles.smallBtn}
        onPress={() =>
          setNote(
            "📘 Instructions:\n\n1. Pick a mode.\n2. Solve coding challenges.\n3. Earn XP & unlock new levels.\n4. Check leaderboard for ranking!"
          )
        }
      >
        <Text style={styles.smallText}>📘 Instructions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.smallBtn}
        onPress={() =>
          setNote("🆘 Help:\n\nIf you encounter issues, restart the app or log in again.")
        }
      >
        <Text style={styles.smallText}>🆘 Help</Text>
      </TouchableOpacity>

      {/* --- ABOUT BUTTON (NEW) --- */}
      <TouchableOpacity
        style={styles.smallBtn}
        onPress={() =>
          setNote(
            "📌 About This App\n\n" +
            "Submitted to: Jay Ian Camelotes\n" +
            "Submitted By: Group 3\n\n" +
            "Leader: Manicio, Ray Christian\n" +
            "Members:\n" +
            "• Cambangay, Rica\n" +
            "• Añasco, Dennis\n" +
            "• Abayle, John Paul\n" +
            "• Añora, Jommel\n" +
            "• Cuyag, Kerwin\n" +
            "• Lomocho, Loudette\n" +
            "• Malnegro, Mark Luiz\n" +
            "• Pacumbaba, Rhea Jane\n" +
            "• Baculpo, John Noel"
          )
        }
      >
        <Text style={styles.smallText}>ℹ️ About</Text>
      </TouchableOpacity>

      {/* --- NOTE BOX --- */}
      {note !== "" && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{note}</Text>

          <TouchableOpacity onPress={() => setNote("")}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: "#081624",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  title: {
    color: "#FFD54F",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },
  subtitle: {
    color: "#b2ebf2",
    fontSize: 14,
    marginBottom: 30,
  },

  menuBtn: {
    backgroundColor: "#0ea5a0",
    width: "90%",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#0ea5a0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  menuText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#022c2c",
  },

  smallBtn: {
    backgroundColor: "#123043",
    width: "80%",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1b3945",
  },
  smallText: {
    color: "#b2ebf2",
    fontSize: 16,
    fontWeight: "700",
  },

  noteBox: {
    backgroundColor: "#0f2b33",
    padding: 18,
    borderRadius: 12,
    width: "95%",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#123640",
  },
  noteText: {
    color: "#e6f7f5",
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },

  closeText: {
    color: "#FFD54F",
    fontWeight: "700",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
