# Development Roadmap & Task Breakdown

## Phase 1: Foundation & Setup
- [x] Initialize Next.js 15 project with Tailwind CSS & TypeScript.
- [x] Configure RTL layout (`dir="rtl"`, `lang="ar"`) and Arabic typography (Uthmani font fallback).
- [x] Setup `next-themes` for Dark/Light mode toggle.
- [x] Apply Supabase SQL schema (`database_schema.sql`) to `Tajweed-quiz` project.
- [x] Setup Supabase Client (`@supabase/ssr`) and environment variables.

## Phase 2: Authentication & Authorization
- [x] Implement Teacher Registration & Login flow (UI + Supabase Auth).
- [x] Implement Student Registration & Login flow.
- [x] Create Route Middleware to protect `/teacher` and `/student` routes.
- [x] Implement Profile creation trigger in Supabase (auto-insert into `profiles` table on signup).

## Phase 3: Teacher Dashboard (Core)
- [x] Build mobile-responsive Teacher Dashboard layout with Sidebar/Bottom Nav.
- [x] Implement Folders CRUD (Create, Read, Update, Delete).
- [x] Implement Quizzes CRUD (Create title/desc, assign to folder, generate Share Code).
- [x] Setup Supabase Storage bucket (`quiz-images`) and implement image upload UI.

## Phase 4: Question Management & AI (Refining)
- [x] Build Question Editor UI (Multiple Choice, True/False, Short Answer).
- [x] Integrate OpenRouter API Route (`/api/ai/generate`).
- [x] Build AI Assistant UI inside Quiz Editor.
- [x] Basic Question Bank listing.

## Phase 5: Student Experience (Refining)
- [x] Create Student Dashboard.
- [x] Build Guest access flow.
- [x] Build Quiz Taking UI with randomization.
- [x] Ensure all Quranic content uses `.font-quran` class for Uthmani font.

## Phase 6: Submissions & Analytics (Refining)
- [x] Implement `POST /api/quiz/submit` to calculate score.
- [x] Build Student Results view.
- [x] Build Teacher Results Dashboard.
- [x] Implement "Most missed questions" SQL view.
- [x] **CSV Export:** Implement server-side CSV generation for quiz results.
- [x] **Advanced Analytics:** Add Average Score and Completion Rate metrics to teacher dashboard.

## Phase 7: Advanced Question Logic & Reuse
- [x] **Import from Bank:** Create a dialog in Quiz Editor to import questions from the teacher's bank.
- [x] **New Question Types:** Implement UI and auto-grading for "Fill in the Blank".
- [x] **Tajweed Template:** Create specialized MCQ UI for Tajweed rules (via topics and custom types).
- [x] **Question Ordering:** Implement reordering logic (drag & drop or index-based).

## Phase 8: Polish & Production Build Stabilization
- [-] **PWA Assets:** Skipped due to Turbopack / Vercel navigation instability.
- [-] **Offline Resilience:** Removed service worker caching. Focusing purely on standard online Next.js delivery.
- [x] Final UI/UX review for "extremely simple" design and accessibility.

## Phase 9: UI/UX Refinement (Stitch Design Integration)
- [x] Refactor `AppSidebar` with professional layout and teacher profile summary.
- [x] Rebuild Teacher Dashboard (`/teacher`) with advanced stats (Active Quizzes, Student Activity) and status-aware quiz feed.
- [x] Implement Split-View Question Editor with Manuscript-style Live Preview (parchment backgrounds, elegant borders).
- [x] Add "Learning Insights" panel to the results dashboard for automated student performance tips.

## Phase 10: AI Assistant Pivot (Chat-Based)
- [x] Enhance AI Assistant page with a conversational chat interface for "Content-to-Quiz" generation.
- [x] Allow teachers to paste text (from PDFs or books) for AI to process into questions.
- [x] Implement direct "Add to Quiz" and "Add to Bank" actions from AI chat suggestions.

## Phase 11: Missing MVP Pages & Polish
- [x] Create Student History page (`/student/history`) for tracking past attempts.
- [x] Create dedicated Student Join page (`/student/join`) for a focused entry experience.
- [x] Final visual pass for RTL consistency and high-end manuscript typography.
- [x] **Mobile Optimization:** Full pass for touch-friendly targets, tabbed editor views, and app-like layouts.

## Phase 12: Hardening & Gamification
- [x] **Student Achievement:** Add "Lifetime Points" and "Achievement Medals" to student dashboard.
- [x] **Quiz Leaderboards:** Implement a feature for students to see their rank within a quiz (optional toggle for teachers).
- [x] **Confetti Celebration:** Add visual reward animations on quiz completion.
- [-] **PWA Audit:** Skipped.

## Phase 13: QA & Hardening (Completed)
- [x] Systematically resolve all ESLint warnings (specifically `any` types and unused variables).
- [x] Monitor Vercel build logs for PDF parser dynamic import stability (Verified local production build).
- [x] Create professional README.md for GitHub.

## Next Steps
- [ ] Perform a final visual QA pass on 'Question Bank' and 'Teacher Dashboard' padding and mobile responsiveness.
- [ ] Monitor actual Vercel deployment logs for any edge-case environment errors.
