<div align="center">
  <h1>🧠 SystemDesignLearner</h1>
  <p><strong>The only platform that teaches system design through phase-by-phase AI-evaluated practice.</strong></p>
  <p>No passive reading. No vague feedback. Real evaluation on every phase.</p>

  ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
  ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
  ![Ollama](https://img.shields.io/badge/AI-Ollama%20%2B%20Groq-6366f1)
</div>

---

## What is this?

SystemDesignLearner is a structured learning platform for **Low Level Design (LLD)** and **High Level Design (HLD)** interview preparation.

The key differentiator: **phase-locked progression**. You cannot move to the next phase of a question until an AI evaluates your current answer and scores it above the threshold. No skipping. No spoilers.

This mirrors how real system design skill is built — by being forced to think before you're shown the answer.

---

## Features

### 📚 Two Tracks

| Track | Questions | Phases per Question |
|-------|-----------|---------------------|
| **LLD** — Low Level Design | 13 questions (Beginner → Advanced) | 6 phases |
| **HLD** — High Level Design | 14 questions (Beginner → Advanced) | 5 phases |

### 🔐 Phase Engine
- Each phase is **locked** until the previous one passes AI evaluation
- Up to 4 attempts per phase; hints are revealed on attempt 3+
- After exhausting all attempts: model answer walkthrough unlocks, then proceed with 0 XP

### 🤖 AI Evaluation
- **Local-first**: uses [Ollama](https://ollama.com) (llama3.2:3b / llama3.1:8b) — private, free, offline
- **Cloud fallback**: [Groq API](https://console.groq.com) (llama-3.1-8b-instant) — fast, free tier
- Structured JSON output: score, strengths, missing elements, misconceptions, targeted feedback
- Each phase has a rubric baked into the system prompt — no vague "good try!" responses

### 🎮 Gamification
- XP system (earned per phase, scaled by difficulty and attempt number)
- Day streak tracking
- Completion celebration with confetti on finishing a question
- "Needed help" badge on phases where you used the walkthrough

### 🛡️ Admin Dashboard
- `/admin` — Overview with real-time stats (users, submissions today, pass rate)
- `/admin/evaluations` — Full evaluation log (model used, score, duration)
- `/admin/users` — All users with XP, streak, questions completed
- Admin account bypasses all attempt limits and phase locks (for testing)

### 🌗 Dark / Light Theme
- Defaults to dark mode
- Respects system preference
- Toggle in the navbar

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + custom dark/light theme |
| Database | PostgreSQL + Prisma v7 + PrismaPg adapter |
| Auth | NextAuth v5 (Credentials — email + password) |
| AI | Ollama (local) → Groq API (cloud fallback) |
| Testing | Vitest + React Testing Library (178 tests, ~98% coverage) |
| Deployment | Vercel + Neon PostgreSQL |

---

## Getting Started Locally

### Prerequisites
- Node.js 20+
- PostgreSQL (via Docker or local install)
- [Ollama](https://ollama.com/download) (optional — Groq fallback works without it)

### 1. Clone & install

```bash
git clone https://github.com/akshat12000/SystemDesignLearner.git
cd SystemDesignLearner
npm install
```

### 2. Environment setup

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/system_design_learner"
AUTH_SECRET="your-random-32-char-secret"
ADMIN_EMAIL="admin@sdl.local"
ADMIN_PASSWORD="admin1234"
GROQ_API_KEY="your-groq-api-key"   # free at console.groq.com
AI_USE_GROQ_FALLBACK="true"
```

### 3. Database setup

```bash
# Start PostgreSQL (Docker)
docker compose up -d

# Push schema + seed curriculum
npx prisma db push
npm run db:seed
npm run db:seed:admin
npm run db:seed:walkthroughs
```

### 4. Start AI (optional but recommended)

```bash
ollama serve
ollama pull llama3.2:3b    # fast evaluation model
ollama pull llama3.1:8b    # deep evaluation model (phases 4+)
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

```bash
npm run dev                  # Start development server
npm run build                # Production build (runs prisma generate first)
npm run test                 # Run unit tests
npm run test:coverage        # Run tests with coverage report

npm run db:seed              # Seed LLD + HLD curriculum
npm run db:seed:admin        # Create admin account
npm run db:seed:walkthroughs # Populate phase walkthroughs
npm run db:studio            # Open Prisma Studio (DB GUI)
npm run db:push              # Push schema changes to DB
```

---

## Deployment (Vercel + Neon)

1. Push to GitHub
2. Create a free PostgreSQL database at [neon.tech](https://neon.tech)
3. Import repo on [vercel.com](https://vercel.com) and set environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | Random 32-char string |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Your admin password |
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) |
| `AI_USE_GROQ_FALLBACK` | `true` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL |

4. Seed the cloud DB (with Neon URL in `.env`):

```bash
npx prisma db push
npm run db:seed
npm run db:seed:admin
npm run db:seed:walkthroughs
```

---

## LLD Question Bank

| Question | Difficulty |
|---|---|
| Design a Parking Lot System | Beginner |
| Design a Library Management System | Beginner |
| Design a Vending Machine | Beginner |
| Design an ATM Machine | Beginner |
| Design a Chess Game | Beginner |
| Design a Hotel Booking System | Intermediate |
| Design a Movie Ticket Booking System | Intermediate |
| Design an Online Shopping Cart | Intermediate |
| Design a Ride Sharing Matching Engine | Intermediate |
| Design a Food Delivery Order System | Intermediate |
| Design a Rate Limiter Library | Advanced |
| Design a Distributed Job Scheduler | Advanced |
| Design a Circuit Breaker Library | Advanced |

## HLD Question Bank

| Question | Difficulty |
|---|---|
| Design a URL Shortener (TinyURL) | Beginner |
| Design a Pastebin | Beginner |
| Design a Key-Value Store | Beginner |
| Design a Rate Limiter Service | Beginner |
| Design Twitter / X Feed | Intermediate |
| Design WhatsApp Messaging | Intermediate |
| Design YouTube Video Service | Intermediate |
| Design Google Drive / Dropbox | Intermediate |
| Design Search Autocomplete | Intermediate |
| Design a Notification System | Intermediate |
| Design a Distributed Cache (Redis) | Advanced |
| Design a Ride-Sharing Service (Uber) | Advanced |
| Design a Web Crawler | Advanced |
| Design a Payment Processing System | Advanced |

---

## Admin Access

Sign in at `/login` with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then visit `/admin`.

Admin privileges:
- Unlimited attempts on any phase
- No phase-locking (submit to any phase in any order)
- Full evaluation logs and user activity dashboard

---

## License

MIT — built for engineers who learn by doing.

# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
