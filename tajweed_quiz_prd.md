# Tajweed Quiz Teacher — Product Requirements Document (PRD)

## Product Overview
Tajweed Quiz Teacher is a mobile‑first web application designed for Quran and Tajweed teachers to create quizzes for their students. It features a premium "Al-Qalam" portal identity with a traditional "Manuscript" aesthetic, providing a high-end educational experience.

---

## Target Users
### Primary User
Quran and Tajweed teachers who want a professional, design-conscious tool to test students and track progress.

### Secondary Users
Students (ages 10–25+) who benefit from a beautiful, clear, and gamified learning environment.

---

## Design Principles
1. **Manuscript Aesthetic:** High-end traditional feel using parchment textures, elegant borders, and professional Arabic typography (Amiri Quran).
2. **Al-Qalam Identity:** A solid Olive Green (#666600) and Gold theme inspired by traditional Islamic stationery.
3. **Mobile‑First:** Tabbed interfaces for editing and one-tap previews optimized for touch devices.
4. **Gamified Learning:** Using leaderboards and achievement summaries to keep students motivated.

---

## Core Features (MVP)

### 1. Teacher Dashboard ("Al-Qalam" Portal)
- **Advanced Analytics:** Real-time visibility into student participation, and average performance.
- **Smart Quiz Feed:** Categorized list of quizzes with status indicators and quick-access results.
- **Learning Insights:** Automated tips based on student struggle points.

### 2. AI Chat Assistant
- **Content-to-Quiz:** Conversational interface where teachers can paste content and chat with the AI to extract Tajweed questions.
- **File Parsing:** Native PDF/Image parsing support with Arabic RTL extraction for seamless document analysis.
- **Smart Saving:** Direct buttons to save AI suggestions to the Question Bank.

### 3. Quiz Creation & Question Bank
- **Split-View / Tabbed Editor:** Real-time live preview of the "Manuscript" student view.
- **Question Types:** MCQs, True/False, Fill in the Blank, and Short Answer.
- **Image Support:** Direct uploads for Ayah reference images.

### 4. Student Experience
- **Gamified Portal:** Achievement summary (Lifetime points) and quiz leaderboards.
- **Manuscript Style:** Beautiful, authentic presentation of Quranic content.

---

## Technical Stack
- **Frontend:** Next.js 15, Tailwind CSS (Inter + Tajawal fonts).
- **Backend:** Supabase (Auth, DB, Storage).
- **AI:** OpenRouter (Gemma/Llama) & Google Gemini (Native API).

---

## Success Metrics
- Teacher productivity (AI-assisted question generation speed).
- Student engagement (Quiz completion and leaderboard participation).
