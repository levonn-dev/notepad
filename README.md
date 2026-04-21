# Notepad

A local-first, collaborative notepad app with four editor variants (rich text, plain code, Ace, and a user-list demo), all synced through Firebase Realtime Database. 
Built as a stripped-down fork of Google's now-archived [Firepad](https://github.com/FirebaseExtended/firepad) examples page.

**What this gives you:**

- Four collaborative editors that share edits in real time across everyone signed in
- Google sign-in gate with an email-based allowlist enforced by Firebase Security Rules
- Zero build step — plain HTML/CSS/JS static files

## How it works

- **Client:** `index.html` loads vendored libraries from `vendor/` and your source from `files/`. 
  The page is gated behind a "Sign in with Google" button; after auth, a DB probe read verifies rule-based access before any editor initializes. 
  If your account isn't allowed, the editors stay hidden and a red "No database access." note appears next to the sign-out button.
- **Backend:** Firebase Realtime Database stores the edit history for each notepad under `/notepads/<id>/<variant>/...`. Firebase Auth handles Google OAuth. 
  Access is enforced entirely by Firebase Security Rules — there is no server-side code in this repo.
- **Serving:** Any static file server works; see the Run section below.

## Setup

You'll need your own Firebase project — the repo ships no credentials.

### 1. Create a Firebase project

1. Go to <https://console.firebase.google.com/> → **Add project**.
2. Create a **Realtime Database** (Build → Realtime Database → Create Database).
3. Enable **Google sign-in** (Build → Authentication → Sign-in method → Google → Enable → set a project support email → Save).

### 2. Configure database rules

Paste the following into Build → Realtime Database → **Rules**, replacing `you@gmail.com` with your Google account email:

```json
{
  "rules": {
    "notepads": {
      ".read":  "auth != null && auth.token.email_verified == true && auth.token.email == 'you@gmail.com'",
      ".write": "auth != null && auth.token.email_verified == true && auth.token.email == 'you@gmail.com'"
    }
  }
}
```

For multiple allowed accounts, chain with `||`:

```json
".read": "auth != null && auth.token.email_verified == true && (auth.token.email == 'a@gmail.com' || auth.token.email == 'b@gmail.com')"
```

Click **Publish**.

### 3. Authorize your hosting domain

Build → Authentication → **Settings** tab → **Authorized domains** → add every hostname you'll serve from. `localhost` is pre-added; 
add any LAN IP (e.g. `192.168.1.1`) and any deployed hostname (e.g. `<user>.github.io`) you plan to use. Enter just the hostname with no port, no scheme.

### 4. Configure the client

```
cp files/firebase-config.example.js files/firebase-config.js
```

Open `files/firebase-config.js` and paste in the values from your Firebase project settings 
(Project Settings → **General** tab → Your apps → Web app SDK setup → Config object). 
You need `apiKey`, `authDomain`, and `databaseURL`.

`files/firebase-config.js` is gitignored. The Firebase client `apiKey` is *not* a secret under Firebase's security model, 
access is enforced by rules + authorized domains, but it is always good to keep it out of the repo

### 5. Run

Any static file server will do. Pick one:

**Python:**

```
python3 -m http.server 8080
```

**Node:**

```
npx serve -l 8080
```

Open `http://127.0.0.1:8080/` (or whichever host you served on, remember to add it to Firebase Authorized domains) and click "Sign in with Google".

## Deploying

For a free, low-admin deployment with HTTPS (required by Firebase Auth):

- **GitHub Pages:** push to `main`, then in repo Settings → Pages → "Deploy from a branch" → `main` / `/ (root)`. Add `<user>.github.io` (or your custom domain) to Firebase Authorized domains.
- **Cloudflare Pages / Netlify / Firebase Hosting** also work and have generous free tiers; see each vendor's docs.

## Project layout

```
files/                           your source
  notepads.js                    editors, auth gate, DB probe, URL routing
  global.css                     page + gate + bottom bar styles
  firebase-config.js             gitignored; your real Firebase config
  firebase-config.example.js     committed; template with placeholders

vendor/                          third-party libs (see VENDORED.md)
  ace/  bootstrap/  codemirror/
  firebase/  firepad/  jquery/

index.html                       page shell
```

## Third-party libraries

See [`VENDORED.md`](VENDORED.md) for each vendored library's version, license, and upstream link.

## License

MIT — see [`LICENSE`](LICENSE). Third-party libraries under `vendor/` retain their own licenses.
