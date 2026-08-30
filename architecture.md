# Tajweed Quiz Platform (Al-Qalam) — System Architecture

This document describes the end-to-end software architecture, data models, AI integrations, security mechanisms, and 24/7 automated keep-alive infrastructure of the **Al-Qalam (القلم) Tajweed Quiz Platform**.

---

## 1. Technology Stack

| Layer | Technology | Purpose / Highlights |
| :--- | :--- | :--- |
| **Frontend Framework** | **[Next.js 16](https://nextjs.org/)** (App Router, Turbopack) | Server Components (RSC), Server Actions, Route Handlers, SSR & streaming. |
| **Language & Tooling** | **TypeScript 5** | Strict type safety across frontend components, database types, and API routes. |
| **Styling & Design System** | **Tailwind CSS v4** + **Radix UI** (shadcn/ui) | Manuscript-inspired Islamic aesthetic (Olive Green `#666600`, Gold, Parchment textures). Full native Right-to-Left (RTL) Arabic typography (`Tajawal`, `Amiri Quran`). |
| **Backend & Database** | **[Supabase](https://supabase.com/)** (PostgreSQL 17) | Relational database, GoTrue Auth (JWT/cookies), Row Level Security (RLS), and S3-compatible Storage (`quiz-images`, `quiz-audio`). |
| **AI Question Engine** | **Google GenAI SDK (`@google/genai`)** & **OpenRouter** | Next-gen unified Google GenAI SDK with Gemini 2.0 Flash schema output, native multimodal vision, and resilient OpenRouter routing. |
| **Multimedia & Quran Audio** | **EveryAyah API & Web Audio API** | Real-time Quranic recitations (Al-Husary, El-Minshawi, Alafasy) and student voice recording with teacher manual grading portal. |
| **Classroom & Printable Exams** | **Halaqat & High-DPI Vector Print Engine** | Class grouping by join code, timed countdown quizzes, printable A4 paper exams with Answer Keys, and Gold Completion Certificates. |
| **Hosting & Deployment** | **[Vercel](https://vercel.com/)** | Edge network, serverless function execution, automatic SSL, and scheduled cron jobs. |
| **Automated Keep-Alive** | **GitHub Actions** + **Vercel Cron** | Scheduled heartbeat runner ensuring 100% free tier uptime without Supabase inactivity pauses. |

---

## 2. High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph Clients["Clients & Users"]
        Teacher["👩‍🏫 Teacher (Browser / Mobile)"]
        Student["🎓 Student / Guest (Browser / Mobile)"]
    end

    subgraph Hosting["Vercel Hosting & Serverless"]
        direction TB
        NextApp["Next.js 16 App Router\n(RSC & Client Components)"]
        ServerActions["Server Actions\n(/teacher, /student, /take-quiz)"]
        RouteHandlers["Route Handlers\n(/api/ai/*, /api/cron/*, /api/teacher/*)"]
        VercelCron["Vercel Daily Cron\n(0 0 * * *)"]
    end

    subgraph AI["AI Generation Pipeline"]
        Gemini["Google Gemini 2.0 Flash\n(Native Vision & Arabic PDF Parser)"]
        OpenRouter["OpenRouter API\n(LLM Question Generator & Chat)"]
    end

    subgraph Database["Supabase Cloud (PostgreSQL 17)"]
        Auth["Supabase Auth (GoTrue)"]
        Postgres["PostgreSQL Database\n(10 Tables + Views + RLS)"]
        Storage["Storage Bucket\n(quiz-images)"]
    end

    subgraph KeepAlive["24/7 Keep-Alive Automation"]
        GHAction["GitHub Actions Workflow\n(Scheduled every 2 days)"]
        PingScript["ping-supabase.js\n(Direct REST API Pinger)"]
    end

    Teacher -->|Auth & Management| NextApp
    Student -->|Take Quiz & History| NextApp
    NextApp --> ServerActions
    NextApp --> RouteHandlers

    RouteHandlers -->|Prompt & Extract| Gemini
    RouteHandlers -->|Prompt & Extract| OpenRouter

    ServerActions -->|SSR / Mutations| Postgres
    RouteHandlers -->|SSR / Direct Queries| Postgres
    NextApp -->|JWT Session Refresh| Auth
    Teacher -->|Ayah Image Upload| Storage

    VercelCron -->|Daily HTTP Ping| RouteHandlers
    GHAction -->|HTTP Ping with Token| RouteHandlers
    GHAction -->|Direct Database Ping| Postgres
```

---

## 3. 24/7 Zero-Cost Keep-Alive Subsystem

To overcome Supabase free-tier 7-day inactivity pausing without incurring monthly hosting fees, the application utilizes a **redundant multi-layer automated keep-alive system**:

```mermaid
sequenceDiagram
    autonumber
    participant GH as GitHub Actions (Every 2 Days)
    participant VC as Vercel Daily Cron (00:00 UTC)
    participant API as Next.js API (/api/cron/keep-alive)
    participant Direct as Direct Node Script (ping-supabase.js)
    participant DB as Supabase PostgreSQL

    alt Layer 1: Vercel Daily Cron
        VC->>API: GET /api/cron/keep-alive (Bearer CRON_SECRET)
        API->>DB: Query 6 key tables (HEAD / SELECT)
        DB-->>API: 200/206 Response (Activity Logged)
    end

    alt Layer 2: GitHub Actions Scheduled Workflow
        GH->>API: GET /api/cron/keep-alive
        API->>DB: Query 6 key tables
        DB-->>API: Activity Logged
        GH->>Direct: Execute node scripts/ping-supabase.js
        Direct->>DB: Direct PostgREST queries across tables
        DB-->>Direct: 200/206 OK (Direct Activity Recorded)
    end
```

### Key Components:
1. **GitHub Actions Workflow ([`.github/workflows/keep-alive.yml`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/.github/workflows/keep-alive.yml))**: Scheduled at `0 0 */2 * *` (runs every 48 hours). Executes both HTTP ping and direct database queries using repository secrets.
2. **Direct Ping Script ([`scripts/ping-supabase.js`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/scripts/ping-supabase.js))**: Uses native fetch to send lightweight PostgREST count requests across `quizzes`, `questions`, `profiles`, `folders`, `invitation_codes`, and `ai_chat_sessions`.
3. **Route Handler ([`src/app/api/cron/keep-alive/route.ts`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/src/app/api/cron/keep-alive/route.ts))**: Validates `CRON_SECRET` via header or URL parameter and queries database health.
4. **Vercel Cron ([`vercel.json`](file:///c:/Users/masal/Documents/opencode/tajweed-quiz-app/vercel.json))**: Configured for daily midnight execution (`0 0 * * *`).

---

## 4. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    PROFILES ||--o{ FOLDERS : "owns"
    PROFILES ||--o{ QUIZZES : "creates"
    PROFILES ||--o{ QUESTIONS : "owns (bank)"
    PROFILES ||--o{ ATTEMPTS : "submits"
    PROFILES ||--o{ AI_CHAT_SESSIONS : "starts"
    
    FOLDERS ||--o{ QUIZZES : "contains"
    
    QUIZZES ||--o{ QUESTIONS : "includes"
    QUIZZES ||--o{ ATTEMPTS : "receives"
    
    QUESTIONS ||--o{ OPTIONS : "has"
    QUESTIONS ||--o{ ATTEMPT_ANSWERS : "evaluated in"
    
    ATTEMPTS ||--o{ ATTEMPT_ANSWERS : "contains"
    
    AI_CHAT_SESSIONS ||--o{ AI_CHAT_MESSAGES : "holds"

    PROFILES {
        uuid id PK
        user_role role
        text first_name
        text last_name
        timestamptz created_at
        timestamptz updated_at
    }

    INVITATION_CODES {
        uuid id PK
        text code UK
        boolean used
        timestamptz created_at
    }

    FOLDERS {
        uuid id PK
        uuid teacher_id FK
        text name
        uuid parent_id FK
        timestamptz created_at
    }

    QUIZZES {
        uuid id PK
        uuid teacher_id FK
        uuid folder_id FK
        text title
        text description
        text share_code UK
        boolean is_published
        timestamptz created_at
        timestamptz updated_at
    }

    QUESTIONS {
        uuid id PK
        uuid teacher_id FK
        uuid quiz_id FK
        question_type type
        text text
        text image_url
        text topic
        difficulty_level difficulty
        text explanation
        integer order_index
        timestamptz created_at
    }

    OPTIONS {
        uuid id PK
        uuid question_id FK
        text text
        boolean is_correct
        timestamptz created_at
    }

    ATTEMPTS {
        uuid id PK
        uuid quiz_id FK
        uuid student_id FK
        text guest_name
        numeric score
        integer total_questions
        timestamptz started_at
        timestamptz completed_at
    }

    ATTEMPT_ANSWERS {
        uuid id PK
        uuid attempt_id FK
        uuid question_id FK
        uuid selected_option_id FK
        text text_answer
        boolean is_correct
        timestamptz created_at
    }

    AI_CHAT_SESSIONS {
        uuid id PK
        uuid teacher_id FK
        text title
        timestamptz created_at
        timestamptz updated_at
    }

    AI_CHAT_MESSAGES {
        uuid id PK
        uuid session_id FK
        text role
        text content
        timestamptz created_at
    }
```

---

## 5. Security & Access Control Model

### 1. Role-Based Access Control (RBAC)
- **Teacher**: Full access to dashboard (`/teacher`), folder management, quiz creation, AI question generation, question bank, student analytics, and CSV exports.
  - *Teacher Registration Guard*: Requires a single-use administrative invitation code (`invitation_codes` table). Verified securely on the server via `SUPABASE_SERVICE_ROLE_KEY`.
- **Student**: Access to student portal (`/student`), enrolled quizzes, quiz-taking interface (`/take-quiz/[code]`), personal attempt history (`/student/history`), and profile settings (`/student/settings`).
- **Guest**: Can join published quizzes with a 6-character alphanumeric share code (`/take-quiz/[code]`) without creating an account.

### 2. Row Level Security (RLS)
PostgreSQL Row Level Security is strictly enabled across all tables:
- Teachers can only view, edit, and delete their own folders, quizzes, questions, options, and chat sessions.
- Students can only view their own attempts and published quizzes.
- Anonymous / guest users can insert quiz attempts and answers for published quizzes, but cannot read draft quizzes or teacher banks.

### 3. Anti-Cheating Quiz Evaluation
Student answer submissions are processed server-side via Server Actions / Route Handlers. Correct answer flags (`options.is_correct`) are never leaked to the client during active quiz taking; scores and feedback are computed securely after submission.

---

## 6. AI Question Engine Architecture

```mermaid
flowchart LR
    PDF[Tajweed PDF / Image / Text] --> ParseEngine{Extraction Method}
    
    ParseEngine -->|Native Vision / RTL| Gemini[Google Gemini 2.0 Flash]
    ParseEngine -->|Text Buffer Fallback| LocalParser[pdf-parse / pdf2json]
    
    Gemini --> PromptPipeline[System Prompt & Tajweed Schema Validator]
    LocalParser --> OpenRouter[OpenRouter LLM Pipeline]
    
    OpenRouter --> PromptPipeline
    PromptPipeline --> StructuredOutput[Array of Structured Questions\nMCQ, True/False, Fill in Blank]
    StructuredOutput --> Editor[Split-View Question Editor / Bank]
```

1. **Multimodal Document Ingestion**: Uploaded Tajweed textbook pages or notes are passed to Google Gemini 2.0 Flash, which accurately parses Right-to-Left Arabic text, diacritics (Harakat), and Tajweed symbols.
2. **AI Chat Assistant (`/teacher/ai`)**: A conversational interface backed by `ai_chat_sessions` and `ai_chat_messages` allowing interactive question refinement.
3. **Direct Saving**: One-click actions to inject AI-generated questions directly into a quiz or the teacher's persistent Question Bank.
