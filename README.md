# VocabVault 📖

A personal vocabulary builder powered by **OpenRouter AI** and **Firebase Firestore**. Look up any word to get an AI-generated one-line definition, an example sentence, and synonyms — then save it to your personal vault.

## Features

- 🔍 **AI-powered word lookup** via OpenRouter (LangChain-compatible, GPT-4o-mini)
- 📝 **Custom meanings** — override the AI definition with your own notes
- 🔥 **Firebase Firestore** persistence — your vault lives in the cloud
- 📚 **Library view** — browse all saved words with search
- 📊 **Basic stats** — total words, AI definitions, custom notes count
- 🗑️ **Delete words** from your vault
- ⚡ Fully frontend-only (no backend server needed)

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd vocabvault
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database** (Start in production or test mode).
3. Go to **Project Settings → General → Your apps** and create a Web app.
4. Copy the config values.

**Firestore Security Rules** (for development):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
> For production, add proper authentication rules.

### 3. OpenRouter Setup

1. Sign up at [openrouter.ai](https://openrouter.ai/)
2. Go to **Keys** and create a new API key.
3. The app uses `openai/gpt-4o-mini` by default (cheap & fast). You can change the model in `src/lib/openrouter.ts`.

### 4. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Firebase
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123...:web:abc...

# OpenRouter
VITE_OPENROUTER_API_KEY=sk-or-v1-...
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Build for Production

```bash
npm run build
```

Output is in the `dist/` folder. Deploy to Vercel, Netlify, Firebase Hosting, etc.

---

## Project Structure

```
vocabvault/
├── src/
│   ├── components/
│   │   ├── WordCard.tsx       # AI result card + custom meaning
│   │   └── Library.tsx        # Vault browser with stats
│   ├── hooks/
│   │   └── useVocab.ts        # All state & data logic
│   ├── lib/
│   │   ├── firebase.ts        # Firestore CRUD
│   │   └── openrouter.ts      # AI lookup via OpenRouter API
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Changing the AI Model

In `src/lib/openrouter.ts`, change the `MODEL` constant:

```ts
const MODEL = 'openai/gpt-4o-mini';        // default (fast, cheap)
// const MODEL = 'anthropic/claude-3-haiku'; // alternative
// const MODEL = 'google/gemini-flash-1.5';  // another option
```

Browse all available models at [openrouter.ai/models](https://openrouter.ai/models).
