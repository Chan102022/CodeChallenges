import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCi_0vg-83DiZobEEGY2tTtizt_TVFig2I",
  authDomain: "codechallenges-324db.firebaseapp.com",
  projectId: "codechallenges-324db",
  storageBucket: "codechallenges-324db.firebasestorage.app",
  messagingSenderId: "825769971060",
  appId: "1:825769971060:web:92d205306df6aade72b021",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
