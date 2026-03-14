
# Tajweed Quiz Teacher — Product Requirements Document (PRD)

## Product Overview
Tajweed Quiz Teacher is a mobile‑first web application designed for Quran and Tajweed teachers to create quizzes for their students.

The application allows teachers to:
- Create quizzes about Quran and Tajweed topics
- Use an AI assistant to generate questions
- Add Arabic text or images of ayat
- Organize quizzes in folders
- Share quizzes with students
- View student results and performance

Students can:
- Log in and access available quizzes
- Answer questions
- View results and correct answers

The system is designed to be extremely simple for non‑technical teachers and optimized for mobile devices.

---

## Target Users

### Primary User
Quran and Tajweed teachers who teach students through platforms like Telegram groups and want a simple tool to test students.

### Secondary Users
Students learning Quran and Tajweed (typically ages 10–25+).

---

## Design Principles

1. Extremely simple UI
2. Mobile‑first design
3. Arabic interface
4. Minimal setup
5. Fast loading on slow internet
6. Works well on phones and tablets

---

## Core Features (MVP)

### Teacher Authentication
- Secure teacher login
- Access to teacher dashboard

### Student Accounts
Students create simple accounts with:
- First name
- Last name
- Password

Students may also access quizzes through a shared link without login (enter name manually).

---

## Teacher Dashboard

Main sections:
- Create Quiz
- My Quizzes
- Question Bank
- Results
- AI Assistant

Dashboard must be simple and mobile‑friendly.

---

## Quiz Creation

Teachers can create quizzes with:
- Quiz title
- Folder/category
- Optional description

Questions can be added by:
- Manual creation
- Question Bank
- AI generation

No time limit for quizzes.

---

## Quiz Organization (Folders)

Quizzes can be organized in nested folders.

Example:

Tajweed
  - Noon Sakinah
  - Meem Sakinah

Quran Memorization
  - Surah Al‑Baqarah
  - Surah Al‑Imran

---

## Question Types

Supported types:

- Multiple Choice
- True / False
- Short Answer
- Fill in the Blank
- Tajweed Rule Identification

---

## Ayah Content Support

Questions may include:
- Arabic Quran text
- Uploaded images of ayat

Teachers can upload images directly from their device.

---

## Quran Font

Arabic text should support **Uthmani Quran font** for accurate ayah display.

---

## Question Bank

Teachers can store reusable questions categorized by:

Topics example:
- Noon Sakinah
- Meem Sakinah
- Madd rules
- Ghunnah
- Makharij

Questions can later be reused in new quizzes.

---

## AI Question Assistant

The system includes an AI assistant that helps teachers generate quiz questions.

Functions:
- Generate Tajweed questions
- Suggest answer options
- Identify correct answers
- Provide explanations
- Generate ayah examples

Workflow:
Teacher selects topic, difficulty, and number of questions → AI generates editable questions inside the quiz editor.

---

## Student Quiz Experience

All questions appear on one page.

Students can:
- Scroll through questions
- Edit answers before submission

Security features:
- Random question order
- Random answer options

---

## Quiz Submission

After submitting, students see:
- Their score
- Correct answers
- Their selected answers

Example:

Score: 8 / 10

Question 3  
Your answer: إخفاء  
Correct answer: إدغام

---

## Retaking Quizzes

Students can retake quizzes.  
Each attempt is saved separately.

---

## Results Dashboard

Teachers can see:

- Student name
- Score
- Percentage
- Number of attempts

---

## Analytics

Teachers can see learning insights such as:

Most missed question example:
Question 4 — 70% incorrect

---

## Dark Mode

The interface must support:
- Light mode
- Dark mode

---

## PWA Support

The web app should support installation on phones via **Add to Home Screen**.

---

## Student Dashboard

Students can view:
- Available quizzes
- Completed quizzes
- Previous results

---

## Performance Requirements

The application must:
- Load quickly on slow internet
- Work well on mobile devices
- Support Arabic RTL layout

---

## Recommended Free Tech Stack

Frontend:
- Next.js
- Tailwind CSS

Backend:
- Supabase (database, authentication, storage)

AI:
- OpenRouter API (free models such as Gemini or DeepSeek)

Hosting:
- Vercel (free)

---

## Basic Database Structure

Teachers
- id
- name
- email
- password

Students
- id
- first_name
- last_name
- password

Folders
- id
- name
- parent_folder_id

Quizzes
- id
- title
- folder_id
- created_by

Questions
- id
- quiz_id
- question_text
- question_type
- image_url
- difficulty
- topic

Options
- id
- question_id
- option_text
- is_correct

Attempts
- id
- student_id
- quiz_id
- score
- date

Answers
- id
- attempt_id
- question_id
- selected_option

---

## MVP Scope

Initial release includes:

- Teacher login
- Student login
- Quiz creation
- AI question generation
- Question bank
- Quiz answering
- Results viewing
- Folder organization
- Image upload
- Dark mode
- PWA support

---

## Future Expansion

Potential future features:

- Audio recitation submissions
- Multiple teachers
- Student progress tracking
- Tajweed learning modules
- Quran memorization tracking
- Telegram integration
- Full Islamic education platform
