# Khush Jain — Portfolio (Firebase-backed admin panel)

## File structure

```
portfolio/
├─ index.html            → page markup, links css/styles.css and js/*
├─ css/
│  └─ styles.css          → all styling
├─ js/
│  ├─ firebase-config.js  → your Firebase project keys (fill these in)
│  ├─ main.js              → terminal typing animation, uptime, scroll reveal
│  ├─ render.js             → reads projects/certifications/publications
│  │                          from Firestore and renders them for everyone
│  └─ admin.js               → login, modals, add/remove (writes to Firestore)
├─ firestore.rules         → security rules (only you can write)
├─ firebase.json           → optional, only needed for Firebase Hosting
└─ README.md               → this file
```

Your 6 resume projects, 4 certifications, and 1 publication stay hardcoded
in `index.html` — those are permanent. Anything you add through the admin
panel is stored in Firestore and appears **for every visitor**, not just you.

## One-time setup (~10 minutes)

1. **Create a Firebase project** — [console.firebase.google.com](https://console.firebase.google.com) → Add project. Free "Spark" plan is enough.

2. **Enable Firestore** — Build → Firestore Database → Create database → start in *production mode* → pick any region.

3. **Enable Authentication** — Build → Authentication → Get started → enable the **Email/Password** provider.

4. **Create your admin account** — Authentication → Users tab → Add user → enter your own email + a strong password. This is the *only* account that will ever be able to log in as admin on your site.

5. **Get your Firebase config** — Project settings (⚙️ icon) → General → "Your apps" → Add app → Web (`</>`) → register it (any nickname) → copy the `firebaseConfig` object.

6. **Paste your config** into `js/firebase-config.js`, replacing the placeholder values (`YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc). These values are safe to ship publicly — they identify your project, they're not secret credentials.

7. **Lock down write access** — go back to Authentication → Users, copy your admin user's **UID**. Open `firestore.rules` and replace `YOUR_ADMIN_UID_HERE` (three occurrences) with that UID.

8. **Publish the rules** — Firestore Database → Rules tab → paste the contents of `firestore.rules` → Publish. (Or use the Firebase CLI: `firebase deploy --only firestore:rules`.)

9. **Deploy the site** — upload the whole `portfolio/` folder to Vercel (or wherever you host) exactly as-is. No build step needed — everything runs straight from these files.

## Using the admin panel

- Click the 🔒 icon (bottom-right) → sign in with the email/password you created in step 4.
- "+ add project / certification / research paper" buttons appear next to those sections.
- Anything you add shows up immediately for every visitor to the site.
- Click "✕ remove" on any admin-added item to delete it (asks for confirmation).
- Click the 🔒 icon again to log out.

## Notes

- Reads (viewing the site) are public for anyone — writes are locked to your UID via `firestore.rules`. Even if someone opens dev tools and tries to call Firestore directly, the rules block them.
- `firebase.json` is only needed if you choose to deploy via **Firebase Hosting** instead of Vercel. If you stay on Vercel, you can ignore/delete it.
