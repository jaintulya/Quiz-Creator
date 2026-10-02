# 🎯 QuizCraft — AI-Powered Interactive Quiz Platform

An intelligent, modern, and interactive quiz platform built with **React**, **Vite**, **Tailwind CSS**, and **Supabase (BaaS)**. QuizCraft allows students and educators to generate, take, manage, and analyze quizzes seamlessly with cloud persistence.

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Google OAuth & Username Sign-In**: Instant one-click Google login or robust Username/Password accounts with client-side SHA-256 password hashing.
- **User Profile Management**: View account stats, edit Full Name and Course/Program, and update passwords directly from the Profile page.

### 🤖 AI-Powered Quiz Creation
- **Prompt Generator**: Built-in AI prompt helper tailored for ChatGPT, Claude, and Gemini.
- **Instant JSON Import & Validation**: Paste generated question JSON with instant live syntax and schema validation.
- **Cloud Database Persistence**: Quizzes are automatically synced to Supabase PostgreSQL database with Row Level Security (RLS) ensuring strict per-user data isolation.

### 🎮 Dual Quiz Gameplay Modes
When starting a quiz, users can choose their preferred testing style:
1. **Solutions at End (Exam Mode)**:
   - Select answers without immediate feedback or spoilers.
   - Change answers freely before final submission.
   - Comprehensive score, accuracy percentage, and full question review revealed at completion.
2. **After Every Question (Instant Feedback)**:
   - Instant visual feedback (green/red indicators) upon selecting an answer.
   - Detailed explanations revealed immediately after each question.

### 📊 Palette & Analytics
- **Bounded Question Palette**: Smoothly scrollable question navigation palette that accommodates long exams (20, 50, 100+ questions) with active question auto-scrolling.
- **Detailed Score Summary**: Radial accuracy progress ring, time estimates, category badges, and in-depth question-by-question review.

---

## 🛠️ Technology Stack

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom warm dark glassmorphism design system
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend-as-a-Service (BaaS)**: [Supabase](https://supabase.com/)
  - **Auth**: Email Confirmation, Password Recovery, Google OAuth, Session persistence
  - **Database**: PostgreSQL with Row-Level Security (RLS)
  - **Realtime**: Live state updates across sessions

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm or yarn
- A free [Supabase](https://supabase.com/) account

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/quiz-creator.git
cd quiz-creator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root (copy from `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
VITE_SITE_URL=https://makeyourquiz.vercel.app
```

### 4. Setup Supabase Database & Auth

#### A. Database Schema
1. Open your **Supabase Dashboard** ➔ **SQL Editor** ➔ **New Query**.
2. Copy and execute the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. This creates the `quizzes` table and configures Row Level Security (RLS) policies.

#### B. URL Configuration & Redirect URLs (Critical)
In your Supabase Dashboard:
1. Go to **Authentication** ➔ **URL Configuration**.
2. Set **Site URL**:
   ```
   https://makeyourquiz.vercel.app
   ```
3. Add the following to **Redirect URLs**:
   ```
   https://makeyourquiz.vercel.app/**
   http://localhost:5173/**
   http://localhost:3000/**
   ```
4. Click **Save**.

#### C. Google OAuth (Optional)
To enable Google Login:
1. In Supabase Dashboard, go to **Authentication** ➔ **Providers** ➔ **Google**.
2. Enable Google provider and paste your Google Cloud Client ID & Client Secret.
3. Add `https://<your-project-id>.supabase.co/auth/v1/callback` to your authorized redirect URIs in Google Cloud Console.

### 5. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 6. Build for Production
```bash
npm run build
```
The production bundle will be generated in the `dist/` directory.

---

## 📁 Project Structure

```
quiz/
├── public/                      # Public static assets
├── src/
│   ├── components/
│   │   ├── auth/                # UserMenu
│   │   ├── common/              # Navbar, NotFound (404), ErrorBoundary, BadgeIcon
│   │   ├── hero/                # HeroSection
│   │   ├── quiz/                # QuestionPalette, Timer
│   │   └── ui/                  # QuizCard, StatCard
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication Provider & State Management
│   ├── pages/
│   │   ├── LandingPage.jsx      # Public Hero & Features (/)
│   │   ├── Dashboard.jsx        # Personalized Dashboard & Quick Launch (/dashboard)
│   │   ├── QuizList.jsx         # My Quizzes Explorer (/my-quizzes)
│   │   ├── CreateQuiz.jsx       # Quiz Creator & AI Generator (/create-quiz)
│   │   ├── QuizPlayer.jsx       # Multi-mode Quiz Player (/play)
│   │   ├── ResultPage.jsx       # Score Ring & Answer Review (/result)
│   │   ├── ResultsHistoryPage.jsx # Results History & Performance Tracking (/results)
│   │   ├── ProfilePage.jsx      # User Profile, Badges & Security (/profile)
│   │   └── LoginPage.jsx        # Username & Password Authentication (/login)
│   ├── services/
│   │   ├── supabase.js          # Supabase Client
│   │   ├── authService.js       # User Authentication & Database Sync
│   │   ├── quizService.js       # Cloud Quiz Storage & Code Regeneration
│   │   ├── resultsService.js    # Quiz Results History Persistence
│   │   ├── aiQuizGenerator.js   # AI Quiz Generation & Worksheets
│   │   └── gamificationService.js # Badges & XP Scoring
│   ├── utils/
│   │   ├── storage.js           # Local Storage & Schema Validation
│   │   ├── confetti.js          # Victory Effects
│   │   ├── soundEffects.js      # Interactive Audio Feedback
│   │   ├── useCountUp.js        # KPI Counter Hook
│   │   └── useScrollReveal.js   # Viewport Scroll Animations
│   ├── App.jsx                  # Application Router & Navigation System
│   ├── index.css                # Custom Design System & Glassmorphism Styles
│   └── main.jsx                 # React Entry Point
├── supabase/
│   └── schema.sql               # Database Table & RLS Setup
├── .env.example                 # Environment variables template
├── .gitignore                   # Strict security git ignore rules
├── vercel.json                  # SPA routing configuration for Vercel
├── tailwind.config.js           # Custom palette & animations
└── vite.config.js               # Vite configuration
```

---

## 🌐 Deployment (Vercel)

This repository includes [`vercel.json`](vercel.json) with client-side SPA rewrites:

1. Push your repository to GitHub / GitLab.
2. In Vercel, click **Add New Project** and select this repository.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase publishable/anon key
   - `VITE_SITE_URL` = `https://makeyourquiz.vercel.app`
4. Click **Deploy**.

---

## 🛡️ License

This project is open source and available under the [MIT License](LICENSE).
