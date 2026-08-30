<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />

  <br />
  <br />

  <h1 align="center">Al-Qalam (القلم) — Tajweed Quiz Platform</h1>
  <p align="center">
    A premium, AI-powered educational platform designed specifically for Quran and Tajweed teachers to create, organize, and administer interactive quizzes with traditional Islamic manuscript aesthetics.
  </p>
  <p align="center">
    <a href="https://tajweed-quiz-app.vercel.app/" target="_blank"><strong>🌐 Live Demo: tajweed-quiz-app.vercel.app</strong></a>
  </p>
</div>

---

## 📖 Overview

**Al-Qalam (القلم)** bridges traditional Quranic education with modern web technology. It provides a distraction-free **"Manuscript" (مخطوطة)** interface utilizing authentic Arabic typography (`Amiri Quran`, `Tajawal`) and parchment textures, powered by multimodal AI to convert Tajweed PDFs, textbooks, and notes directly into structured quizzes.

---

## ✨ Key Features

### 👩‍🏫 For Teachers
- **AI Chat Assistant (Content-to-Quiz)**: Upload Tajweed PDFs or paste text, and let Gemini 2.0 Flash extract MCQs, True/False, and Fill-in-the-Blank questions with Harakat.
- **Split-View Quiz Editor**: Live Manuscript preview alongside question editing with drag/swap reordering.
- **Question Bank & Folder Organization**: Organize quizzes into nested folders and build a reusable question repository.
- **Student Analytics & CSV Export**: Real-time attempt tracking, average score metrics, most-missed questions analysis, and downloadable gradebooks.
- **Image Attachments**: Direct upload of Ayah references and articulation diagrams (Makhaarij).

### 🎓 For Students
- **Manuscript Experience**: Clear, beautiful Uthmani script rendering for Quranic verses.
- **Frictionless Entry**: Join by 6-character code (`/take-quiz/[code]`) with or without an account.
- **Gamified Progress**: Lifetime Points, Achievement Medals, and celebratory completion animations.
- **Attempt History & Settings**: Review previous quiz submissions and manage profile preferences.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Radix UI Primitives (shadcn/ui)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL 17, Row Level Security, Storage)
- **AI Engines**: [Google Gemini 2.0 Flash](https://aistudio.google.com/) (Native Arabic Vision & PDF parsing) & [OpenRouter](https://openrouter.ai/)
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

| Variable | Required | Purpose |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Your Supabase project REST URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Public anonymous client API key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Secret admin key for verifying teacher invitation codes. |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for native PDF vision and question generation. |
| `OPENROUTER_API_KEY` | Optional | OpenRouter API key for LLM question generation fallback. |
| `CRON_SECRET` | **Yes** | Bearer authentication token protecting the `/api/cron/keep-alive` route. |

### 3. Database Initialization
Open the **SQL Editor** in your Supabase Dashboard and run [`database_schema.sql`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/database_schema.sql) to set up all tables, views, storage buckets, and RLS policies.

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

## 🔒 Security & Architecture

For detailed architecture diagrams, database ERD, and security specifications, refer to:
- 📐 [**System Architecture Documentation** (`architecture.md`)](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/architecture.md)
- 📋 [**Product Requirements Document** (`tajweed_quiz_prd.md`)](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/tajweed_quiz_prd.md)
- 🗺️ [**Development Roadmap** (`tasks.md`)](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/tasks.md)

---

<div align="center">
  Made with ❤️ for Quran educators worldwide.
</div>