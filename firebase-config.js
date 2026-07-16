// ============================================================
// firebase-config.js
// Initializes the Firebase app, Firestore, and Auth instances
// used by render.js and admin.js.
//
// SETUP — do this before deploying:
// 1. Go to https://console.firebase.google.com → Create project
//    (free "Spark" plan is enough for a portfolio site).
// 2. In your project: Build → Firestore Database → Create database
//    (start in "production mode", pick any region).
// 3. In your project: Build → Authentication → Get started →
//    enable the "Email/Password" sign-in provider.
// 4. Authentication → Users tab → Add user → create YOURSELF
//    as a user with your email + a strong password. This is the
//    only account that will be able to log in as admin.
// 5. Project settings (gear icon) → General → "Your apps" →
//    Add app → Web (</>) → register the app → copy the
//    firebaseConfig object it gives you → paste the VALUES below.
//    (These values are public/safe to ship in client code —
//    they identify your project, they are not secret keys.
//    Actual protection comes from firestore.rules.)
// 6. After creating your admin user, copy their UID from the
//    Authentication → Users table and paste it into
//    firestore.rules where it says YOUR_ADMIN_UID_HERE, then
//    deploy those rules (see firestore.rules for instructions).
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDoBp6SZD0mctn6VhDEeg2Sz_BkbrrcYOo",
  authDomain: "portfolio-fc6be.firebaseapp.com",
  projectId: "portfolio-fc6be",
  storageBucket: "portfolio-fc6be.firebasestorage.app",
  messagingSenderId: "920904398337",
  appId: "1:920904398337:web:bb4d453c7f65f48552f200",
  measurementId: "G-1LE6526GZ7"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
