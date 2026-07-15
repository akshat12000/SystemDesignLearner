# SystemDesignLearner — Complete Product & Engineering Plan

> Written from the perspective of 20+ years in the industry.
> The #1 mistake every "system design course" makes: they dump theory at students
> and call it "preparation." Real prep is iterative, uncomfortable, and forces you
> to THINK before you're given the answer. That's what this platform does.

---

## Table of Contents

1. [Vision & Core Philosophy](#1-vision--core-philosophy)
2. [Pedagogical Framework — Progressive Overloading](#2-pedagogical-framework)
3. [Curriculum Structure](#3-curriculum-structure)
4. [AI Evaluation Engine Design](#4-ai-evaluation-engine-design)
5. [Tech Stack & Architecture Decisions](#5-tech-stack--architecture-decisions)
6. [Database Schema](#6-database-schema)
7. [Application Architecture](#7-application-architecture)
8. [UI/UX Design System](#8-uiux-design-system)
9. [Development Roadmap & Milestones](#9-development-roadmap--milestones)
10. [File & Folder Structure](#10-file--folder-structure)

---

## 1. Vision & Core Philosophy

**Problem with existing resources:**
- Grokking the System Design: Too much reading, no testing
- YouTube tutorials: Passive consumption, no feedback loop
- Mock interviews: Expensive, inconsistent evaluators, no curriculum

**Our differentiation:**
- **Phase-locked progression**: You cannot skip phases. The AI gate ensures you actually understood Phase 1 before unlocking Phase 2
- **No spoilers**: The platform never shows you the "answer" until you've genuinely attempted it
- **Precise, non-vague feedback**: "Your answer lacks a discussion of read/write ratios" not "Good try!"
- **Curriculum follows mental model building**: Start with *why* before *what*

---

## 2. Pedagogical Framework

### Progressive Overloading Ladder

```
Level 1 — GUIDED       (AI gives hints, evaluation is lenient)
Level 2 — SUPPORTED    (AI only validates, minimal hints)
Level 3 — INDEPENDENT  (AI evaluates strictly, no hints)
Level 4 — CHALLENGER   (AI plays devil's advocate, pokes holes)
```

Each question/problem exists at all 4 levels. A student must pass Level 1 → 2 → 3 → 4 for each concept before it's marked complete. This mirrors how muscles are built: same movement, increasing resistance.

### The Phase Engine (per question)

Each design question (LLD or HLD) is broken into **mandatory, sequential phases**:

```
Phase unlocked → Student submits response → AI evaluates (score + feedback)
→ Score >= threshold? → Unlock next phase
→ Score < threshold?  → Show targeted feedback, allow re-attempt (max 3 attempts per phase)
→ 3 failed attempts?  → Show guided hint + allow 1 more attempt
```

No phase can be skipped. No next-phase answer is visible until current phase passes.

---

## 3. Curriculum Structure

### Track A: LLD (Low Level Design)

**Philosophy:** LLD is about translating requirements into clean, maintainable code structure.
The student must learn to *think in objects and contracts*, not jump to code.

#### Module 1 — Foundation (No design questions yet)
| Lesson | Topic | Exercise Type |
|--------|-------|---------------|
| 1.1 | OOP: Encapsulation, Abstraction, Inheritance, Polymorphism | MCQ + Code fill-in |
| 1.2 | SOLID — Single Responsibility | Identify violations in code snippets |
| 1.3 | SOLID — Open/Closed | Refactor exercises |
| 1.4 | SOLID — Liskov Substitution | Bug-hunt exercises |
| 1.5 | SOLID — Interface Segregation | Design exercise (guided) |
| 1.6 | SOLID — Dependency Inversion | Dependency graph exercises |
| 1.7 | UML Class Diagrams (read + write) | Diagram completion |
| 1.8 | UML Sequence Diagrams | Flow tracing + creation |

#### Module 2 — Design Patterns (Phased Practice)
| Pattern | Category | LLD Question to practice on |
|---------|----------|------------------------------|
| Factory / Abstract Factory | Creational | Design a Notification System |
| Builder | Creational | Design a Query Builder |
| Singleton | Creational | Design a Config Manager (with thread safety) |
| Adapter | Structural | Integrate a legacy payment gateway |
| Decorator | Structural | Design a Pizza Ordering System |
| Facade | Structural | Design a Hotel Booking API |
| Observer | Behavioral | Design a Stock Price Alert System |
| Strategy | Behavioral | Design a Sorting Library |
| Command | Behavioral | Design an Undo/Redo System |
| Iterator | Behavioral | Design a Custom Collection |

#### Module 3 — Core LLD Design Questions (Progressive)

Each question has **6 standard phases**:

```
Phase 1 — Requirements Gathering
  "What are the functional and non-functional requirements?"
  Student must identify: core features, actors, constraints, scale hints

Phase 2 — Entity Identification  
  "Identify all entities (classes/objects) and their attributes"
  Student must name entities with justification, not just list everything

Phase 3 — Relationships & Responsibilities
  "Define relationships between entities (is-a, has-a, uses-a)"
  Student defines associations, aggregations, compositions

Phase 4 — Class Diagram
  "Draw or describe your class diagram (use text notation)"
  Student writes class structure in text or Mermaid notation

Phase 5 — Key Design Decisions
  "Which design patterns did you apply and why?"
  Student justifies patterns — AI checks if patterns are actually appropriate

Phase 6 — Code Skeleton
  "Write the skeleton code (interfaces, abstract classes, key methods)"
  Student writes actual code structure (language-agnostic or chosen language)
```

**LLD Question Bank (Beginner → Expert):**
```
BEGINNER:
  - Design a Parking Lot System
  - Design a Library Management System
  - Design a Vending Machine
  - Design an ATM Machine
  - Design a Chess Game

INTERMEDIATE:
  - Design a Hotel Booking System
  - Design a Food Delivery App (just the ordering domain)
  - Design a Movie Ticket Booking System
  - Design a Ride Sharing App (matching engine excluded)
  - Design an Online Shopping Cart

ADVANCED:
  - Design a Distributed Job Scheduler
  - Design an Event-Driven Order Processing System
  - Design a Plugin Architecture Framework
  - Design a Rate Limiter Library
  - Design a Circuit Breaker Library
```

---

### Track B: HLD (High Level Design)

**Philosophy:** HLD is about making defensible tradeoff decisions under constraints.
Every HLD answer has no single "correct" answer — but there are defensible ones.
The AI evaluates *reasoning quality*, not answer correctness.

#### Module 1 — Foundation Building Blocks

| Lesson | Topic | Type |
|--------|-------|------|
| 1.1 | Scalability: Vertical vs Horizontal | Concept + Tradeoff quiz |
| 1.2 | Load Balancing strategies (Round Robin, Consistent Hashing) | Scenario application |
| 1.3 | Databases: SQL vs NoSQL — when, why, which | Decision matrix exercise |
| 1.4 | CAP Theorem — real-world application | Case study analysis |
| 1.5 | Caching: Where, What, Eviction policies | Design exercise |
| 1.6 | Message Queues & Event-Driven Architecture | Flow design |
| 1.7 | CDN, DNS, API Gateway | Architecture placement exercise |
| 1.8 | Microservices vs Monolith — when to split | Decomposition exercise |
| 1.9 | Back-of-envelope estimation | Calculation exercises |
| 1.10 | Consistency models (strong, eventual, causal) | Scenario matching |

#### Module 2 — HLD Design Questions (Situational)

Each question has **5 standard phases**:

```
Phase 1 — Requirements Clarification (Critical)
  "Ask ALL the clarifying questions you would ask an interviewer"
  Student submits list of questions — AI evaluates:
    - Did they ask about scale? (DAU, QPS)
    - Did they ask about consistency requirements?
    - Did they ask about latency expectations?
    - Did they ask about geographic distribution?
    - Did they separate must-haves from nice-to-haves?

Phase 2 — Capacity Estimation
  "Estimate storage, bandwidth, and compute requirements"
  Student does back-of-envelope math:
    - AI checks if numbers are in the right ballpark
    - AI checks if student understands WHAT to estimate, not just HOW

Phase 3 — High-Level Architecture Diagram
  "Design the top-level system (draw with Excalidraw or text notation)"
  Student describes or draws major components and data flows:
    - AI checks: are critical components present?
    - Does the architecture match stated requirements?

Phase 4 — Deep Dive (2-3 components)
  "Pick the 2-3 most critical/complex components and deep-dive"
  Student selects and explains internals of chosen components:
    - AI evaluates depth of understanding
    - Checks if design decisions are justified with tradeoffs

Phase 5 — Failure Modes & Bottlenecks
  "Identify potential failure points and how you'd mitigate them"
  Student identifies: SPOFs, data loss scenarios, thundering herd, etc.
```

**HLD Question Bank:**
```
BEGINNER:
  - Design a URL Shortener (tinyurl)
  - Design a Pastebin
  - Design a Key-Value Store
  - Design a Rate Limiter Service

INTERMEDIATE:
  - Design Twitter / X Feed
  - Design Instagram (photo storage + feed)
  - Design WhatsApp (messaging at scale)
  - Design YouTube (upload + streaming)
  - Design Google Drive / Dropbox

ADVANCED:
  - Design a Distributed Cache (like Redis)
  - Design a Search Engine (like Google Search)
  - Design a Ride-Sharing Service (Uber/Ola)
  - Design a Payment Processing System
  - Design a Notification System (at 10M users)
  - Design a Distributed Task Scheduler
  - Design a Live Streaming Platform (like Twitch)
```

---

## 4. AI Evaluation Engine Design

### Core Principles
1. **Rubric-first**: Every phase has a pre-defined scoring rubric embedded in the system prompt
2. **No hallucination zone**: AI operates within constrained evaluation, not open-ended generation
3. **Structured output only**: AI returns JSON — score, feedback points, missing elements, strengths
4. **Calibrated thresholds**: Score thresholds are set per-phase (not uniform)

### AI Stack
- **Model**: Ollama running locally (default: `llama3.1:8b` for fast eval, `llama3.1:70b` for deep eval)
- **Structured Output**: Ollama structured output with JSON schema enforcement
- **Fallback**: If local Ollama is unavailable → Groq API (llama3-70b, free tier)
- **Prompt Engineering**: System prompt + rubric + few-shot examples + student response

### Evaluation Prompt Architecture

```
SYSTEM PROMPT (immutable per phase):
  - Role: "You are an expert system design interviewer with 15+ years..."
  - Context: The design question + phase description
  - Rubric: Explicit scoring criteria (what earns points)
  - Anti-patterns: Common mistakes to flag
  - Output schema: Strict JSON

USER PROMPT:
  - Student's submitted response
  - Word/diagram content

RESPONSE SCHEMA:
{
  "score": number (0-100),
  "pass": boolean (score >= threshold),
  "strengths": string[],           // What they got right
  "missing_elements": string[],    // Critical things absent
  "misconceptions": string[],      // Wrong things (dangerous to let slide)
  "targeted_feedback": string,     // 2-3 sentence specific feedback
  "hint": string | null,           // Only populated on 3rd failed attempt
  "next_phase_teaser": string | null // Only on pass: what to think about next
}
```

### Phase-specific Rubrics (Example: HLD Phase 1 — Requirements)

```json
{
  "total_points": 100,
  "criteria": [
    { "label": "Scale questions asked (DAU/MAU, QPS)", "points": 20, "required": true },
    { "label": "Latency/availability requirements asked", "points": 15, "required": true },
    { "label": "Consistency requirements asked", "points": 15, "required": false },
    { "label": "Core features identified and prioritized", "points": 20, "required": true },
    { "label": "Out-of-scope items acknowledged", "points": 10, "required": false },
    { "label": "Data retention/compliance considered", "points": 10, "required": false },
    { "label": "Geographic distribution considered", "points": 10, "required": false }
  ],
  "pass_threshold": 60,
  "required_criteria_must_pass": true
}
```

### Evaluation Pipeline

```
Student submits → Sanitize input → Build prompt (system + rubric + response)
→ Call Ollama API → Parse JSON response → Validate schema
→ Score >= threshold AND required criteria met? → PASS
→ Store evaluation in DB → Return feedback to UI → Update progress
```

---

## 5. Tech Stack & Architecture Decisions

### Why These Choices (not just what)

| Layer | Choice | Reason |
|-------|--------|--------|
| **Framework** | Next.js 14 (App Router) | SSR for fast initial load, server actions for AI calls without separate API layer, great ecosystem |
| **Language** | TypeScript | Type safety critical for rubric/evaluation schema — caught 40% of my bugs in past projects |
| **Styling** | Tailwind CSS + shadcn/ui | Fastest path to production-quality UI, fully customizable, not opinionated |
| **Database** | PostgreSQL | Relational data fits perfectly (users, courses, modules, phases, submissions, evaluations) |
| **ORM** | Prisma | Type-safe queries, excellent migration tooling, schema-first |
| **Auth** | NextAuth.js v5 | Battle-tested, works perfectly with Next.js App Router, supports OAuth + credentials |
| **AI Runtime** | Ollama | Local, private, free, no API costs during development; structured JSON output support |
| **AI Fallback** | Groq API | When Ollama unavailable, Groq gives fastest inference on llama3 models |
| **Diagrams** | Mermaid.js + Excalidraw | Mermaid for reading diagrams in lessons, Excalidraw embed for student drawing |
| **Code Editor** | Monaco Editor (VS Code editor) | Industry standard, syntax highlighting, familiar to developers |
| **Rich Text** | Tiptap | Best-in-class rich text for student submissions |
| **State** | Zustand | Simple, predictable, no boilerplate |
| **Queue** | BullMQ + Redis | Async AI evaluation (don't block the UI while AI evaluates) |
| **Cache** | Redis | AI response caching (same response for same rubric+answer ≈ same question) |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Next.js)                 │
│  Pages: Dashboard | Curriculum | Question | Progress │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│              Next.js Server (App Router)             │
│  - Server Components (data fetching)                 │
│  - Server Actions (form submissions, AI triggers)    │
│  - API Routes (/api/evaluate, /api/progress)         │
└──────┬──────────────────────────────────┬────────────┘
       │                                  │
┌──────▼──────┐                  ┌────────▼────────────┐
│ PostgreSQL  │                  │  BullMQ + Redis      │
│ (Prisma ORM)│                  │  Evaluation Queue    │
└─────────────┘                  └────────┬────────────┘
                                          │
                                 ┌────────▼────────────┐
                                 │  AI Worker Process   │
                                 │  (Node.js worker)    │
                                 └────────┬────────────┘
                                          │
                          ┌───────────────┴────────────┐
                          │                            │
                 ┌────────▼──────┐           ┌─────────▼──────┐
                 │ Ollama Local  │           │   Groq API     │
                 │ llama3.1:8b   │           │  (fallback)    │
                 └───────────────┘           └────────────────┘
```

---

## 6. Database Schema

```prisma
// Core user and progress tracking

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  
  enrollments   Enrollment[]
  submissions   Submission[]
  progress      Progress[]
}

model Track {
  id          String   @id @default(cuid())
  slug        String   @unique  // "lld" | "hld"
  title       String
  description String
  order       Int
  
  modules     Module[]
}

model Module {
  id          String   @id @default(cuid())
  trackId     String
  slug        String
  title       String
  description String
  order       Int
  type        ModuleType  // LESSON | DESIGN_QUESTION
  difficulty  Difficulty  // BEGINNER | INTERMEDIATE | ADVANCED
  
  track       Track     @relation(fields: [trackId], references: [id])
  lessons     Lesson[]
  questions   DesignQuestion[]
}

model Lesson {
  id        String  @id @default(cuid())
  moduleId  String
  title     String
  content   Json    // MDX content blocks
  order     Int
  xpReward  Int     @default(10)
  
  module    Module  @relation(fields: [moduleId], references: [id])
}

model DesignQuestion {
  id           String  @id @default(cuid())
  moduleId     String
  title        String
  description  String
  track        TrackType  // LLD | HLD
  difficulty   Difficulty
  estimatedMin Int
  
  module       Module  @relation(fields: [moduleId], references: [id])
  phases       Phase[]
  submissions  Submission[]
}

model Phase {
  id              String  @id @default(cuid())
  questionId      String
  order           Int
  title           String
  instruction     String  // What the student is asked to do
  rubricJson      Json    // Scoring rubric (criteria, points, thresholds)
  systemPrompt    String  // AI system prompt for this phase
  passThreshold   Int     @default(60)
  maxAttempts     Int     @default(4)
  xpReward        Int     @default(25)
  
  question        DesignQuestion  @relation(fields: [questionId], references: [id])
  submissions     Submission[]
}

model Submission {
  id            String    @id @default(cuid())
  userId        String
  questionId    String
  phaseId       String
  content       String    // Student's raw submission text/diagram
  attemptNumber Int       @default(1)
  status        SubmissionStatus  // PENDING | EVALUATING | PASSED | FAILED
  createdAt     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id])
  question      DesignQuestion @relation(fields: [questionId], references: [id])
  phase         Phase     @relation(fields: [phaseId], references: [id])
  evaluation    Evaluation?
}

model Evaluation {
  id                String   @id @default(cuid())
  submissionId      String   @unique
  score             Int
  pass              Boolean
  strengths         String[]
  missingElements   String[]
  misconceptions    String[]
  targetedFeedback  String
  hint              String?
  nextPhaseTeaser   String?
  modelUsed         String   // "llama3.1:8b" | "llama3.1:70b" | "groq/llama3-70b"
  evaluationMs      Int      // How long evaluation took
  createdAt         DateTime @default(now())
  
  submission        Submission @relation(fields: [submissionId], references: [id])
}

model Progress {
  id              String   @id @default(cuid())
  userId          String
  questionId      String
  currentPhase    Int      @default(1)
  completedPhases Int[]    // Array of completed phase orders
  status          ProgressStatus  // NOT_STARTED | IN_PROGRESS | COMPLETED
  totalXp         Int      @default(0)
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, questionId])
}

model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  trackId   String
  startedAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, trackId])
}

enum ModuleType  { LESSON DESIGN_QUESTION }
enum TrackType   { LLD HLD }
enum Difficulty  { BEGINNER INTERMEDIATE ADVANCED }
enum SubmissionStatus { PENDING EVALUATING PASSED FAILED }
enum ProgressStatus   { NOT_STARTED IN_PROGRESS COMPLETED }
```

---

## 7. Application Architecture

### Page Structure

```
/                          → Landing page
/login                     → Auth
/dashboard                 → Student home (progress overview, streak, XP)
/tracks                    → LLD track, HLD track
/tracks/lld                → LLD curriculum overview
/tracks/hld                → HLD curriculum overview
/tracks/lld/modules/[slug] → Module detail (lessons list or question list)
/tracks/lld/questions/[id] → Design question workspace (THE CORE PAGE)
/tracks/lld/questions/[id]/phases/[phaseOrder] → Individual phase submission
/progress                  → Detailed progress, completed questions, XP history
/leaderboard               → Optional: weekly/monthly rankings
```

### Core Question Workspace (`/tracks/[track]/questions/[id]`)

This is the most important page. Layout:

```
┌────────────────────────────────────────────────────────────────┐
│  Question Header: Title + Difficulty + Track + Est. Time       │
├──────────────────────────┬─────────────────────────────────────┤
│  Phase Progress Bar      │  Phase List (locked/unlocked icons) │
│  Phase 1 ██ Phase 2 ░░   │  1. Requirements  ✅               │
│  Phase 3 ░░ Phase 4 ░░   │  2. Entities      🔓               │
├──────────────────────────┴─────────────────────────────────────┤
│                                                                │
│  CURRENT PHASE PANEL                                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Phase 2: Identify Entities                               │ │
│  │ Instruction: "Based on your requirements, list all       │ │
│  │ entities/classes and their key attributes..."            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  SUBMISSION AREA                                               │
│  [Rich Text Editor / Code Editor / Drawing Canvas]            │
│  (Type or draw your answer here)                               │
│                                                                │
│  [ Submit for AI Evaluation ]    Attempt 1 of 4               │
│                                                                │
├──────────────────────────────────────────────────────────────-┤
│  AI FEEDBACK PANEL (visible after submission)                  │
│  Score: 72/100  ✅ PASSED                                      │
│  ✅ Strengths: Identified User, Book, Library correctly        │
│  ⚠️  Missing: Reservation entity not identified               │
│  💡 Feedback: Consider the lifecycle of a borrowed item...    │
└────────────────────────────────────────────────────────────────┘
```

### Key Server Actions

```typescript
// app/actions/evaluation.ts
async function submitPhaseResponse(
  phaseId: string,
  questionId: string,
  content: string
): Promise<EvaluationResult>

// app/actions/progress.ts
async function getQuestionProgress(
  userId: string,
  questionId: string
): Promise<QuestionProgress>

async function unlockNextPhase(
  userId: string,
  questionId: string,
  currentPhase: number
): Promise<void>
```

---

## 8. UI/UX Design System

### Color System (Dark-first, developer-friendly)
```
Background:    #0F1117  (near-black, not pure black — reduces eye strain)
Surface:       #1A1D27  (cards, panels)
Border:        #2D3148  (subtle borders)
Primary:       #6366F1  (indigo — learning, knowledge)
Success:       #22C55E  (green — phase passed)
Warning:       #F59E0B  (amber — needs improvement)
Error:         #EF4444  (red — failed/misconception)
Text Primary:  #F1F5F9
Text Muted:    #94A3B8
```

### Typography
- **Font**: Inter (body) + JetBrains Mono (code)
- **Scale**: 12/14/16/20/24/32/48px (strict scale, no arbitrary sizes)

### Gamification Elements
- **XP System**: Every phase completion earns XP (scaled by difficulty + attempt number)
- **Streak tracker**: Days active
- **Achievement badges**: "First LLD Complete", "All Patterns Mastered", "HLD Champion"
- **Phase completion animation**: Subtle particle effect on phase pass
- **Progress visualization**: Curriculum map (visual dependency graph)

---

## 9. Development Roadmap & Milestones

### Phase 0 — Foundation (Week 1-2)
- [ ] Project scaffolding (Next.js + TypeScript + Tailwind + shadcn)
- [ ] PostgreSQL setup + Prisma schema
- [ ] NextAuth.js authentication
- [ ] Redis + BullMQ setup
- [ ] Ollama integration + structured output test
- [ ] Base layout components

### Phase 1 — Core Learning Engine (Week 3-5)
- [ ] Curriculum data model seeding (LLD Track — Module 1 fully seeded)
- [ ] Phase engine backend (create submission, queue evaluation, return result)
- [ ] AI evaluation worker (Ollama call + JSON parsing + fallback)
- [ ] Question workspace UI (the core page)
- [ ] Phase navigation + locking logic
- [ ] Progress persistence

### Phase 2 — Content & Polish (Week 6-8)
- [ ] Seed all LLD questions (all 3 difficulty tiers)
- [ ] Seed HLD Track (all modules + questions)
- [ ] Lesson content (Module 1 LLD + HLD foundations)
- [ ] Rich text editor integration (Tiptap)
- [ ] Monaco editor integration (for code phases)
- [ ] Mermaid diagram rendering (for lesson content)

### Phase 3 — Gamification & Dashboard (Week 9-10)
- [ ] XP system + calculation engine
- [ ] Student dashboard with progress map
- [ ] Achievement system
- [ ] Streak tracking
- [ ] Leaderboard (weekly)

### Phase 4 — Hardening (Week 11-12)
- [ ] Evaluation accuracy testing (sample responses + expected scores)
- [ ] Performance optimization (Redis caching of evaluations)
- [ ] Rate limiting (prevent evaluation spam)
- [ ] Error handling (Ollama down, JSON parse failures)
- [ ] Mobile responsiveness
- [ ] Accessibility pass

---

## 10. File & Folder Structure

```
SystemDesignLearner/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx            # Main app layout with sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── tracks/
│   │   │   ├── page.tsx
│   │   │   ├── [trackSlug]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── modules/[moduleSlug]/page.tsx
│   │   │   │   └── questions/
│   │   │   │       └── [questionId]/
│   │   │   │           ├── page.tsx          # Question workspace
│   │   │   │           └── phases/[phase]/page.tsx
│   │   ├── progress/page.tsx
│   │   └── leaderboard/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── evaluate/route.ts     # Webhook from BullMQ worker
│   │   └── progress/route.ts
│   ├── actions/
│   │   ├── evaluation.ts         # Server actions for AI evaluation
│   │   ├── progress.ts           # Server actions for progress tracking
│   │   └── auth.ts
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── curriculum/
│   │   ├── TrackCard.tsx
│   │   ├── ModuleList.tsx
│   │   └── CurriculumMap.tsx     # Visual progress map
│   ├── question/
│   │   ├── QuestionWorkspace.tsx # Main question page container
│   │   ├── PhasePanel.tsx        # Current phase instruction + editor
│   │   ├── PhaseProgressBar.tsx
│   │   ├── PhaseList.tsx         # Sidebar phase navigator
│   │   ├── SubmissionEditor.tsx  # Rich text / code / drawing editor
│   │   └── EvaluationFeedback.tsx # AI feedback display
│   ├── dashboard/
│   │   ├── ProgressOverview.tsx
│   │   ├── StreakCard.tsx
│   │   ├── XPCard.tsx
│   │   └── RecentActivity.tsx
│   └── shared/
│       ├── DifficultyBadge.tsx
│       ├── TrackBadge.tsx
│       └── LoadingEvaluation.tsx  # Animated "AI is evaluating..." state
│
├── lib/
│   ├── ai/
│   │   ├── ollama.ts             # Ollama client + structured output
│   │   ├── groq.ts               # Groq fallback client
│   │   ├── evaluator.ts          # Main evaluation orchestrator
│   │   ├── prompts/
│   │   │   ├── lld-phases.ts     # System prompts for LLD phases
│   │   │   └── hld-phases.ts     # System prompts for HLD phases
│   │   └── rubrics/
│   │       ├── lld-rubrics.ts    # Phase rubrics for LLD questions
│   │       └── hld-rubrics.ts    # Phase rubrics for HLD questions
│   ├── db/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── queries/
│   │       ├── progress.ts
│   │       ├── submissions.ts
│   │       └── curriculum.ts
│   ├── queue/
│   │   ├── evaluation-queue.ts   # BullMQ queue definition
│   │   └── worker.ts             # BullMQ worker (runs as separate process)
│   └── utils/
│       ├── xp.ts                 # XP calculation logic
│       └── progress.ts           # Progress calculation helpers
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│       ├── index.ts              # Seed orchestrator
│       ├── lld-track.ts          # LLD curriculum data
│       └── hld-track.ts          # HLD curriculum data
│
├── types/
│   ├── evaluation.ts             # EvaluationResult, Rubric types
│   ├── curriculum.ts             # Track, Module, Question types
│   └── progress.ts               # Progress, Submission types
│
├── worker/
│   └── index.ts                  # Standalone BullMQ worker entry point
│
├── .env.example
├── docker-compose.yml            # PostgreSQL + Redis for local dev
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Critical Design Decisions — Explained

### Why Phase-Locking is Non-Negotiable
Students who can skip phases will skip phases. Every shortcut reinforces the habit
of jumping to solutions without thinking through the problem. Phase locking forces
the uncomfortable "I don't know what I don't know" moment that is the actual learning.

### Why Local AI (Ollama)
- **Privacy**: Student responses contain reasoning — don't send to third parties
- **Cost**: Zero per-evaluation cost once set up
- **Latency**: Local inference is faster than API round-trips for 8b models
- **Control**: Can swap models without API contract changes

### Why Async Evaluation (BullMQ)
AI evaluation takes 2-8 seconds. Blocking the HTTP request is a bad UX.
Instead: submit → immediate acknowledgment → poll for result (or WebSocket push).
This also allows retrying failed evaluations without re-submitting the response.

### Why Not LangChain
LangChain adds abstraction for complex agent workflows. Our evaluation pipeline
is simple: one prompt → one structured response. LangChain would add overhead
and a dependency that changes APIs frequently. Direct Ollama SDK is sufficient.

### The "No Spoilers" Rule in Code
```typescript
// WRONG — this query reveals the answer indirectly
const phases = await prisma.phase.findMany({
  where: { questionId },
  include: { systemPrompt: true }  // NEVER send system prompt to client
})

// RIGHT — strip AI internals from client-side data
const phases = await prisma.phase.findMany({
  where: { questionId },
  select: {
    id: true, order: true, title: true, instruction: true,
    passThreshold: true, maxAttempts: true
    // systemPrompt is intentionally excluded
    // rubricJson is intentionally excluded
  }
})
```

---

*This document is the authoritative reference for all development decisions.
When in doubt about a feature, refer back to Section 2 (Pedagogical Framework)
and ask: "Does this help the student think, or does it help them skip thinking?"*
