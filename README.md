<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Gemini_3.7_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />

  <br />
  <br />

  <h1 align="center">Al-Qalam (القلم) — Tajweed Quiz Platform v2.0</h1>
  <p align="center">
    A premium, AI-powered educational platform designed specifically for Quran and Tajweed teachers to create, organize, and administer interactive quizzes with traditional Islamic manuscript aesthetics, Quranic audio recitations, student voice recording, and Halaqat classroom management.
  </p>
  <p align="center">
    <a href="https://tajweed-quiz-app.vercel.app/" target="_blank"><strong>🌐 Live Demo: tajweed-quiz-app.vercel.app</strong></a>
  </p>
</div>

---

## 📖 Overview

**Al-Qalam (القلم)** bridges classical Quranic pedagogy with state-of-the-art web technology. It provides an authentic **"Manuscript" (مخطوطة)** interface utilizing Arabic typography (`Amiri Quran`, `Tajawal`) and parchment textures, powered by next-generation **Google Gemini 3.7 Flash** multimodal AI to convert Tajweed textbooks, PDFs, and notes directly into interactive audio and voice quizzes.

---

## ✨ Key Features (v2.0)

### 👩‍🏫 For Teachers
- **Next-Gen Gemini 3.7 Flash & 3.5 Flash-Lite AI**: Automated structured Tajweed exam generation from Arabic PDFs and images with dynamic reasoning tokens.
- **EveryAyah Quran Audio Integration**: Embed official recitations (*Mahmoud Khalil Al-Husary, Mohamed Siddiq El-Minshawi, Mishary Alafasy, Abdulbasit Abdulsamad*) with ayah repeat and speed controls.
- **Voice Recitation Grading Portal**: Dedicated teacher interface to listen to student voice submissions, assign scores, and leave constructive Tajweed feedback.
- **Halaqat (Classroom) Management**: Create distinct study groups (Halaqat), generate 6-character join codes (e.g. `H-AB12`), and assign targeted timed quizzes.
- **Printable Paper Exams**: High-DPI manuscript A4 exam sheet generator with Bismillah calligraphy and toggleable Teacher Answer Keys.
- **Split-View Quiz Editor**: Live Manuscript preview alongside question editing with drag/swap reordering.
- **Student Analytics & CSV Export**: Real-time attempt tracking, average score metrics, most-missed questions analysis, and downloadable gradebooks.

### 🎓 For Students
- **Islamic Gold Completion Certificates**: High-resolution ornate gold certificates with student name, score, and official stamp.
- **In-Browser Voice Recorder**: Record Quran recitation answers directly in the browser via Web Audio API.
- **EveryAyah Audio Playback**: Listen to master reciters while answering auditory Tajweed recognition questions.
- **Halaqat Portal**: Join teacher study groups via code and access scheduled class quizzes.
- **Manuscript Experience**: Clear, beautiful Uthmani script rendering for Quranic verses.
- **Timed Quizzes**: Live countdown timer with auto-submit upon exam time expiration.
- **Gamified Progress**: Lifetime Points, Achievement Medals, and celebratory confetti completion animations.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Radix UI Primitives (shadcn/ui)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL 17, Row Level Security, Storage Buckets `quiz-images`, `quiz-audio`)
- **AI Engines**: [Google GenAI SDK (`@google/genai`)](https://github.com/googleapis/js-genai) with **Gemini 3.7 Flash** & **Gemini 3.5 Flash-Lite**, plus [OpenRouter](https://openrouter.ai/) fallback
- **Multimedia**: EveryAyah Quran Audio API & Web Audio API MediaRecorder
- **Keep-Alive Automation**: GitHub Actions scheduled workflow + Daily Vercel Cron

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or later
- A free [Supabase](https://supabase.com/) account
- API keys for Google Gemini or OpenRouter

### 1. Clone & Install
```bash
git clone https://github.com/malgaroshy-maker/Tajweed-Quiz-App.git
cd Tajweed-Quiz-App
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# AI Providers (At least one is required)
GEMINI_API_KEY=your-gemini-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# Keep-Alive & Cron Secret
CRON_SECRET=your-random-cron-secret-token
```

### 3. Database Migration & Schema
Apply migrations using Supabase CLI:
```bash
npx supabase link --project-ref your-project-ref
npx supabase db query --linked --file supabase/migrations/20260830210000_v2_halaqat_audio_ai.sql
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 24/7 Automated Keep-Alive Setup

To ensure your free Supabase database is never paused due to inactivity:

1. In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
2. Add the following secrets:
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY`: `your-anon-publishable-key`
   - `CRON_SECRET`: *(Same secret token as in `.env.local`)*
   - `APP_URL`: `https://tajweed-quiz-app.vercel.app`
3. The GitHub Actions workflow ([`keep-alive.yml`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/.github/workflows/keep-alive.yml)) will automatically ping the database every 48 hours.

---

## 📄 License
This project is licensed under the MIT License.