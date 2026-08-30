# Development Roadmap & Task Breakdown

---

## Phase 1: Foundation & Project Setup (Completed)
- [x] Initialize Next.js 16 project with Tailwind CSS & TypeScript.
- [x] Configure RTL layout (`dir="rtl"`, `lang="ar"`) and Arabic typography (`Tajawal`, `Amiri Quran`).
- [x] Setup `next-themes` for Dark / Light mode toggle.
- [x] Apply Supabase SQL schema (`database_schema.sql`).
- [x] Setup Supabase Client (`@supabase/ssr`) and environment variable configuration.

---

## Phase 2: Authentication & Authorization (Completed)
- [x] Implement Teacher Registration & Login flow (UI + Supabase Auth).
- [x] Implement Student Registration & Login flow.
- [x] Create Route Middleware to protect `/teacher` and `/student` routes.
- [x] Implement Profile creation trigger in Supabase (auto-insert into `profiles` on signup).
- [x] Implement administrative Invitation Code system for Teacher onboarding (`invitation_codes`).

---

## Phase 3: Teacher Dashboard (Core) (Completed)
- [x] Build mobile-responsive Teacher Dashboard layout with `AppSidebar`.
- [x] Implement Folders CRUD (Create, Read, Update, Delete).
- [x] Implement Quizzes CRUD (Create title/desc, assign to folder, generate 6-character Share Code).
- [x] Setup Supabase Storage bucket (`quiz-images`) with image compression and upload UI.

---

## Phase 4: Question Management & AI Integration (Completed)
- [x] Build Split-View Question Editor with Manuscript-style live preview.
- [x] Support question types: Multiple Choice (MCQ), True/False, Fill in Blank, Short Answer, Tajweed Rule.
- [x] Integrate OpenRouter API Route (`/api/ai/generate`).
- [x] Integrate Google Gemini 2.0 Flash for native Arabic PDF/image vision parsing.
- [x] Build persistent Question Bank listing (`/teacher/questions`).

---

## Phase 5: Student Portal & Quiz Taking (Completed)
- [x] Create Student Dashboard (`/student`).
- [x] Build frictionless Guest access flow with 6-character share code (`/take-quiz/[code]`).
- [x] Build Single-Question Quiz Taking UI with progress indicators and question randomization.
- [x] Ensure all Quranic verses render with `.font-quran` (`Amiri Quran`).
- [x] Create Student History page (`/student/history`) for tracking past attempts.
- [x] Create Student Settings page (`/student/settings`) for profile preferences.

---

## Phase 6: Submissions & Analytics (Completed)
- [x] Implement secure server-side answer evaluation (`/take-quiz/[code]/actions.ts`).
- [x] Build Student Results view with breakdown and explanations.
- [x] Build Teacher Results Dashboard (`/teacher/results`) with Average Score & Completion Rate.
- [x] Implement `most_missed_questions` SQL view for pinpointing common student errors.
- [x] Implement CSV Export Route (`/api/teacher/results/export`) for gradebook download.

---

## Phase 7: Advanced Question Logic & Ordering (Completed)
- [x] Import from Question Bank dialog inside Quiz Editor.
- [x] Specialized Tajweed Rule MCQ templates.
- [x] Reorder questions by index (`order_index` swap action).
- [x] Automatic client-side image compression with `browser-image-compression`.

---

## Phase 8: AI Chat Assistant (Content-to-Quiz) (Completed)
- [x] Conversational AI Chat interface (`/teacher/ai`) with session management (`ai_chat_sessions`, `ai_chat_messages`).
- [x] Direct "Add to Quiz" and "Add to Bank" actions from AI chat suggestions.
- [x] Dual-engine PDF parsing (`pdf-parse`, `pdf2json`, and Gemini API vision).

---

## Phase 9: Gamification & UX Polish (Completed)
- [x] Student "Lifetime Points" and "Achievement Medals".
- [x] Confetti reward animation on quiz completion (`canvas-confetti`).
- [x] High-end Islamic Manuscript styling (`parchment-card`, gold accents, dark mode support).
- [x] Touch-friendly mobile optimization and RTL logical CSS properties.

---

## Phase 10: 24/7 Automated Keep-Alive & Performance (Completed)
- [x] Implement redundant GitHub Actions workflow ([`keep-alive.yml`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/.github/workflows/keep-alive.yml)) running every 48 hours.
- [x] Upgrade Vercel Cron to daily schedule (`0 0 * * *`).
- [x] Upgrade API route ([`/api/cron/keep-alive`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/src/app/api/cron/keep-alive/route.ts)) with `CRON_SECRET` authentication and multi-table queries.
- [x] Create direct standalone database pinger ([`ping-supabase.js`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/scripts/ping-supabase.js)).
- [x] Add composite PostgreSQL performance indexes across all foreign keys.
- [x] Create comprehensive database health audit tool ([`check-database-health.js`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/scripts/check-database-health.js)).

---

## Phase 11: Audio Recitation & Multimedia Enhancements (Completed)
- [x] **Audio Playback:** Embed official Quranic recitations (EveryAyah API with Al-Husary, El-Minshawi, Alafasy, Abdulbasit) directly inside quiz questions to test auditory Tajweed recognition.
- [x] **Voice Answer Recording:** Allow students to record their voice recitation using browser MediaRecorder and save to Supabase storage.
- [x] **Teacher Manual Grading:** Specialized teacher portal to listen to student recitation recordings, assign marks, and write constructive Tajweed feedback.

---

## Phase 12: Classroom & Halaqah Management (Completed)
- [x] **Halaqat Subsystem:** Teacher dashboard for creating distinct Halaqat with 6-character student join codes.
- [x] **Student Roster:** Management of enrolled students per Halaqah with removal actions.
- [x] **Timed Quizzes:** Countdown timer with visual tick and auto-submission on exam time expiration.

---

## Phase 13: Printable Exams & Certified Reports (Completed)
- [x] **Printable Paper Exam Generator:** High-DPI manuscript A4 exam sheet generator with toggleable Teacher Answer Key (`/teacher/quizzes/[id]/print`).
- [x] **Islamic Gold Completion Certificates:** High-resolution decorative gold completion certificate modal with Arabic calligraphy and print/PDF export for passing students.

---

## Phase 14: Next-Gen AI & Stack Modernization (Completed)
- [x] Upgraded AI Engine to Google's official **`@google/genai`** SDK with structured JSON schemas and Gemini 2.0 Flash multimodal vision.
- [x] Retained OpenRouter multi-model router as resilient fallback.
- [x] Added `halaqat` and `halaqah_members` to redundant 24/7 keep-alive heartbeats.
