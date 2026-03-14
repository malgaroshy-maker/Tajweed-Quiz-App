# Tajweed Quiz Teacher - System Architecture

## 1. Technology Stack (Free Tier Optimized)
- **Frontend Framework:** [Next.js 15 (App Router)](https://nextjs.org/) - React framework optimized for performance and SEO.
- **Language:** TypeScript for type safety.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) for fast, accessible, and customizable UI components. Support for RTL (Right-to-Left) via Tailwind logical properties.
- **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL, GoTrue Auth, Storage) - Fully manages DB, Auth, and Image Storage on the free tier.
- **AI Integration:** [OpenRouter API](https://openrouter.ai/) - Allows accessing free models (e.g., Google Gemini Flash or DeepSeek) without recurring costs to generate questions.
- **Hosting:** [Vercel](https://vercel.com/) (Free Tier) - Native support for Next.js, Edge Functions, and automatic HTTPS.
- **PWA (Progressive Web App):** `@ducanh2912/next-pwa` to enable "Add to Home Screen" support.

## 2. System Architecture
- **Client (Browser/Mobile):** Next.js Server & Client Components. Mobile-first layout emphasizing a clean, distraction-free Arabic interface.
- **State Management:** React Context (for global theme/auth) and Server-Side Rendering (SSR) via Next.js for initial data loads (fast on slow internet).
- **Authentication:** Supabase Auth handles email/password. Role-based access distinguishes between `Teacher` and `Student`. Anonymous guest attempts are also supported.
- **Data Access:** Supabase SDK (`@supabase/ssr`) is used securely from Next.js Server Components. Row Level Security (RLS) ensures teachers only see their own folders/quizzes, and students only see published quizzes they have access to.

## 3. API Structure
Since we use Supabase, most CRUD operations bypass a custom API layer and hit PostgreSQL directly via the Supabase Client. However, secure backend tasks require Next.js Route Handlers:

- **`POST /api/ai/generate`**: 
  - **Payload:** `{ topic: string, difficulty: string, count: number }`
  - **Action:** Securely calls OpenRouter API with a hidden system prompt instructing it to return an array of JSON objects (questions, options, correct answer, ayah examples).
- **`POST /api/quiz/submit`**: 
  - **Payload:** `{ attempt_id: uuid, answers: array }`
  - **Action:** Evaluates student answers securely on the server to prevent cheating (comparing against hidden `is_correct` database flags) and updates the `attempts` table.
