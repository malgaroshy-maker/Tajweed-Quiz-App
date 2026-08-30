# Tajweed Quiz Platform (Al-Qalam) — Product Requirements Document (PRD)

---

## 1. Product Overview

**Al-Qalam (القلم)** is a mobile-first web application engineered specifically for Quran and Tajweed teachers to create, organize, and administer interactive quizzes to their students. 

The platform features a distinct **"Manuscript" (مخطوطة)** aesthetic combining traditional Islamic calligraphy (Amiri Quran, Tajawal) and parchment textures with cutting-edge AI-assisted content extraction and real-time student performance analytics.

---

## 2. Target Users & Personas

### Primary Persona: The Quran & Tajweed Teacher (المعلم / المعلمة)
- **Profile**: Teaches Quran memorization, recitation rules (Ahkam At-Tajweed: Nun Sakinah, Meem Sakinah, Madd rules, Makhaarij, Sifaat) in physical or virtual study circles (Halaqat).
- **Core Needs**:
  - Fast question creation without manually retyping textbook exercises.
  - Ability to convert Tajweed PDFs and textbook excerpts directly into structured quizzes.
  - Question bank to reuse exercises across different groups.
  - Real-time visibility into which Tajweed rules students struggle with most.

### Secondary Persona: The Student (الطالب / الطالبة)
- **Profile**: Learning Quran recitation and Tajweed theory (ages 8 to 40+).
- **Core Needs**:
  - Distraction-free, beautiful Arabic interface with clear Quranic script (Uthmani).
  - Frictionless access (join by 6-character code or dedicated student login).
  - Instant score feedback, explanations, and gamified progress tracking (Lifetime points, medals).

---

## 3. Design Principles & Aesthetic Identity

| Principle | Description |
| :--- | :--- |
| **Manuscript Aesthetic (طابع المخطوطات)** | Elegant parchment backgrounds (`parchment-card`), golden accents, ornate borders, and authentic Arabic typography. |
| **Typography Hierarchy** | `Amiri Quran` for Quranic Ayahs, `Tajawal` for Arabic UI/questions, and `Inter` for numeric metrics and code. |
| **Mobile-First & Touch-Friendly** | Tabbed split-view editors, touch-optimized answer cards, and responsive navigation drawers. |
| **Native RTL Design** | 100% Right-to-Left design using Tailwind CSS logical layout properties (`ms-*`, `me-*`, `ps-*`, `pe-*`). |

---

## 4. Feature Inventory & Specifications

### 4.1. Teacher Portal (`/teacher`)
- **Smart Dashboard**:
  - Quick summary stats: Total Quizzes, Active Quizzes, Total Attempts, Average Score.
  - "Learning Insights" panel highlighting common student mistake areas based on the `most_missed_questions` view.
  - Status-aware quiz feed with instant publish toggle and direct link copying.
- **Folder & Category Management (`/teacher/folders`)**:
  - Nested folder organization for grouping quizzes by level, class, or topic (e.g. *Level 1: Ahkam Nun Sakinah*).
- **Quiz Editor (`/teacher/quizzes/[id]`)**:
  - **Split-View / Tabbed Interface**: Live Manuscript preview alongside the question editing form.
  - **Supported Question Types**:
    - Multiple Choice (MCQ) with 2 to 6 options.
    - True / False (صواب / خطأ).
    - Fill in the Blank (أكمل الفراغ).
    - Short Answer (إجابة قصيرة).
    - Specialized Tajweed Rule Selector (أحكام التجويد).
  - **Media Attachments**: Direct image upload to Supabase Storage (`quiz-images`) for Ayah diagrams and articulation illustrations (Makhaarij).
  - **Question Bank Integration**: Ability to import existing questions from the teacher's repository into any quiz.
  - **Reordering**: Index-based ordering to sequence questions logically.
- **Question Bank (`/teacher/questions`)**:
  - Central repository of all questions created by the teacher, filterable by topic, difficulty level (Easy, Medium, Hard), and question type.
- **Student Performance & Analytics (`/teacher/results`)**:
  - Granular breakdown of each quiz attempt: student/guest name, score percentage, timestamp, and duration.
  - Most missed questions ranking to pinpoint topics requiring classroom review.
  - **CSV Export**: Server-side CSV generation (`/api/teacher/results/export`) for gradebook integration.
- **AI Chat Assistant (`/teacher/ai`)**:
  - Conversational "Content-to-Quiz" chat backed by `ai_chat_sessions` and `ai_chat_messages`.
  - Multimodal PDF and image upload for automatic Arabic text extraction.
  - Direct "Add to Quiz" and "Add to Question Bank" buttons for generated questions.
- **Teacher Account Settings (`/teacher/settings`)**:
  - Profile update and single-use invitation code generation for onboarding assistant teachers.

### 4.2. Student Portal (`/student`)
- **Student Dashboard (`/student`)**:
  - Active quizzes assigned to the student.
  - Gamification metrics: **Lifetime Points**, **Attempt Count**, and **Achievement Medals**.
- **Join Quiz Flow (`/student/join` & `/take-quiz/[code]`)**:
  - 6-character short code input field for instant access without mandatory login.
  - Support for guest attempts (prompts for guest name).
- **Quiz Taking Experience (`/take-quiz/[code]`)**:
  - Single-question focused flow with progress bar.
  - Beautiful Arabic Ayah rendering with `.font-quran`.
  - Question randomization and timer support.
  - Immediate visual celebration (confetti animation) upon quiz completion.
- **Student Attempt History (`/student/history`)**:
  - Historical record of all completed quizzes, scores, and reviewable answers.
- **Student Settings (`/student/settings`)**:
  - Personal profile configuration and preferences.

---

## 5. Non-Functional & Reliability Requirements

### 1. 24/7 Zero-Cost High Availability
- The application MUST remain operational 24/7 on free-tier infrastructure.
- Automated keep-alive heartbeats MUST execute at least once every 48 hours to prevent Supabase database inactivity pauses.

### 2. Performance & Low Latency
- Quiz taking queries (share code resolution, question fetching) MUST respond in under 300ms.
- Client-side image compression MUST reduce uploaded diagrams under 500KB prior to storage transmission.

### 3. Anti-Cheating & Assessment Integrity
- Correct answer flags MUST NOT be transmitted to the client during active quiz attempts.
- Submission evaluation and score calculation MUST occur strictly server-side.

---

## 6. Success Metrics & KPIs

1. **AI Question Generation Efficiency**: Reduction in teacher quiz creation time from ~30 minutes to under 3 minutes per quiz.
2. **Student Completion Rate**: Over 85% completion rate on started quizzes due to the frictionless mobile UI.
3. **Zero Downtime**: 100% uptime on Supabase free tier through redundant keep-alive scheduling.
