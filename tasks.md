# Development Roadmap & Task Breakdown

## Phase 1: Foundation & Setup
- [ ] Initialize Next.js 15 project with Tailwind CSS & TypeScript.
- [ ] Configure RTL layout (`dir="rtl"`, `lang="ar"`) and Arabic typography (Uthmani font fallback).
- [ ] Setup `next-themes` for Dark/Light mode toggle.
- [ ] Apply Supabase SQL schema (`database_schema.sql`) to `Tajweed-quiz` project.
- [ ] Setup Supabase Client (`@supabase/ssr`) and environment variables.

## Phase 2: Authentication & Authorization
- [ ] Implement Teacher Registration & Login flow (UI + Supabase Auth).
- [ ] Implement Student Registration & Login flow.
- [ ] Create Route Middleware to protect `/teacher` and `/student` routes.
- [ ] Implement Profile creation trigger in Supabase (auto-insert into `profiles` table on signup).

## Phase 3: Teacher Dashboard (Core)
- [ ] Build mobile-responsive Teacher Dashboard layout with Sidebar/Bottom Nav.
- [ ] Implement Folders CRUD (Create, Read, Update, Delete).
- [ ] Implement Quizzes CRUD (Create title/desc, assign to folder, generate Share Code).
- [ ] Setup Supabase Storage bucket (`quiz-images`) and implement image upload UI.

## Phase 4: Question Management & AI
- [ ] Build Question Editor UI (Multiple Choice, True/False, Short Answer).
- [ ] Integrate OpenRouter API Route (`/api/ai/generate`) with system prompts for Tajweed/Quran context.
- [ ] Build AI Assistant UI inside Quiz Editor (Select topic -> generate -> review -> add to quiz).
- [ ] Implement "Save to Question Bank" and "Browse Question Bank" functionality.

## Phase 5: Student Experience
- [ ] Create Student Dashboard (List of available quizzes & past attempts).
- [ ] Build Guest access flow (Enter Share Code -> Enter Name -> Start Quiz).
- [ ] Build Quiz Taking UI:
  - Scrollable single-page format (mobile optimized).
  - Display Arabic text/images clearly.
  - Randomize question order and options (computed on the server/client).

## Phase 6: Submissions & Analytics
- [ ] Implement `POST /api/quiz/submit` to calculate score and insert `attempt_answers`.
- [ ] Build Student Results view (Show score, selected vs. correct answers).
- [ ] Build Teacher Results Dashboard (List of attempts, student names, scores, timestamps).
- [ ] Implement basic analytics (e.g., "Most missed questions" calculated via SQL view).

## Phase 7: Polish & PWA
- [ ] Configure `next-pwa` for manifest generation and service worker caching.
- [ ] Test application loading speeds on simulated slow networks.
- [ ] Ensure all Arabic text uses proper Uthmani fonts where ayat are displayed.
- [ ] Final UI/UX review for "extremely simple" design principles.
