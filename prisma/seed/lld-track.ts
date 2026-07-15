import type { PrismaClient } from "../../app/generated/prisma/internal/class";

export async function seedLLDTrack(prisma: PrismaClient) {
  // Upsert track
  const track = await prisma.track.upsert({
    where: { slug: "lld" },
    create: {
      slug: "lld",
      type: "LLD",
      title: "Low Level Design",
      description:
        "Master object-oriented design, SOLID principles, and design patterns through structured practice. Phase-by-phase AI evaluation ensures you build the right mental models.",
      order: 1,
    },
    update: {},
  });

  // Module 1 — Foundations (Lessons)
  const mod1 = await prisma.module.upsert({
    where: { trackId_slug: { trackId: track.id, slug: "lld-foundations" } },
    create: {
      trackId: track.id,
      slug: "lld-foundations",
      title: "Foundations",
      description: "OOP principles and SOLID before you touch a design question",
      order: 1,
      type: "LESSON",
      difficulty: "BEGINNER",
    },
    update: {},
  });

  // Module 2 — Beginner Design Questions
  const mod2 = await prisma.module.upsert({
    where: { trackId_slug: { trackId: track.id, slug: "lld-beginner" } },
    create: {
      trackId: track.id,
      slug: "lld-beginner",
      title: "Beginner Design Questions",
      description: "Real-world design questions with full phase walkthrough",
      order: 2,
      type: "DESIGN_QUESTION",
      difficulty: "BEGINNER",
    },
    update: {},
  });

  // Module 3 — Intermediate
  const mod3 = await prisma.module.upsert({
    where: { trackId_slug: { trackId: track.id, slug: "lld-intermediate" } },
    create: {
      trackId: track.id,
      slug: "lld-intermediate",
      title: "Intermediate Design Questions",
      description: "More complex domains with real ambiguity",
      order: 3,
      type: "DESIGN_QUESTION",
      difficulty: "INTERMEDIATE",
    },
    update: {},
  });

  // Module 4 — Advanced
  const mod4 = await prisma.module.upsert({
    where: { trackId_slug: { trackId: track.id, slug: "lld-advanced" } },
    create: {
      trackId: track.id,
      slug: "lld-advanced",
      title: "Advanced Design Questions",
      description: "Framework-level and infrastructure design",
      order: 4,
      type: "DESIGN_QUESTION",
      difficulty: "ADVANCED",
      isLocked: false,
    },
    update: {},
  });

  // Seed design questions with full 6-phase structure
  await seedLLDQuestion(prisma, mod2.id, {
    title: "Design a Parking Lot System",
    description: `Design an object-oriented system for a multi-level parking lot.
    
The parking lot has multiple floors, each floor has multiple spots. 
Spots can be for different vehicle types: Motorcycle, Car, Truck.
The system must handle entry/exit, track availability, and compute parking fees.

Consider: concurrency (multiple entry/exit simultaneously), different pricing tiers, 
reservations, and compact vs large spots.`,
    difficulty: "BEGINNER",
    estimatedMin: 45,
    tags: ["OOP", "state-machine", "pricing"],
    xpTotal: 150,
  });

  await seedLLDQuestion(prisma, mod2.id, {
    title: "Design a Library Management System",
    description: `Design an object-oriented system for a public library.
    
Members can borrow books, return them, and pay fines for late returns.
Books can have multiple copies. Some books can be reserved by members.
Librarians can add/remove books and manage members.

Consider: reservations queue, fine calculation, member account states, 
and handling books with multiple authors.`,
    difficulty: "BEGINNER",
    estimatedMin: 50,
    tags: ["OOP", "reservations", "fines"],
    xpTotal: 150,
  });

  await seedLLDQuestion(prisma, mod2.id, {
    title: "Design a Vending Machine",
    description: `Design a vending machine that dispenses products when users insert money.

The machine has slots for different products with different prices.
Users can insert coins, select a product, get change back, or cancel.
The machine administrator can restock products and collect money.

Consider: state machine design (idle, has money, dispensing, etc.), 
different coin denominations, out-of-stock handling, and exact change issues.`,
    difficulty: "BEGINNER",
    estimatedMin: 40,
    tags: ["state-machine", "OOP", "coins"],
    xpTotal: 150,
  });

  await seedLLDQuestion(prisma, mod3.id, {
    title: "Design a Hotel Booking System",
    description: `Design an object-oriented system for hotel room booking.

Hotels have different room types (single, double, suite) with different pricing.
Guests can search availability by date range, book rooms, check in/out, and cancel.
Hotel staff can manage rooms (mark as maintenance, change pricing).

Consider: date range overlaps, cancellation policies with different refund rules,
overbooking handling, loyalty points, and seasonal pricing.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 60,
    tags: ["OOP", "bookings", "pricing", "state-machine"],
    xpTotal: 175,
  });

  await seedLLDQuestion(prisma, mod3.id, {
    title: "Design a Movie Ticket Booking System",
    description: `Design an object-oriented system like BookMyShow for booking movie tickets.

Theaters have multiple screens. Each screen shows movies at different showtimes.
Users can search movies, select seats on an interactive seat map, and book tickets.
Seats can be different types: regular, premium, recliner.

Consider: concurrent seat reservation (seat locking), partial bookings, 
seat selection conflicts, pricing by seat type and timing, and cancellations.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 60,
    tags: ["OOP", "concurrency", "seat-locking", "pricing"],
    xpTotal: 175,
  });

  await seedLLDQuestion(prisma, mod4.id, {
    title: "Design a Rate Limiter Library",
    description: `Design a reusable rate limiter library that can be embedded in any service.

The library must support multiple algorithms: Token Bucket, Sliding Window Counter, 
Fixed Window Counter. It should be configurable per endpoint/user/IP.
The library must be thread-safe and support distributed rate limiting via Redis.

Consider: which algorithm for which use case, the interface design for 
configurability, thread safety, Redis storage schema, and clock skew handling 
in distributed environments.`,
    difficulty: "ADVANCED",
    estimatedMin: 75,
    tags: ["distributed", "algorithms", "thread-safety", "Redis"],
    xpTotal: 200,
  });

  // ── Additional beginner questions ──────────────────────────────────────────

  await seedLLDQuestion(prisma, mod2.id, {
    title: "Design an ATM Machine",
    description: `Design the software for an ATM machine.

Users can insert their debit card, enter a PIN, check balance, withdraw cash, 
deposit cash, and transfer funds between accounts.
The machine dispenses cash in available denominations (100, 200, 500, 2000).
Multiple ATMs share the same bank backend.

Consider: PIN validation and security, denomination selection algorithm (greedy),
cash inventory management, card states (inserted, verified, ejected),
session timeout, and concurrent transactions from the same account.`,
    difficulty: "BEGINNER",
    estimatedMin: 45,
    tags: ["state-machine", "security", "OOP"],
    xpTotal: 150,
  });

  await seedLLDQuestion(prisma, mod2.id, {
    title: "Design a Chess Game",
    description: `Design an object-oriented model for a two-player Chess game.

The game has a board (8×8), pieces (King, Queen, Rook, Bishop, Knight, Pawn),
and two players (White, Black). Each piece type has different movement rules.
The game enforces legal moves, detects check, checkmate, and stalemate.

Consider: how to represent pieces and their movement rules without a massive 
switch statement (Strategy or polymorphism), board representation, 
move validation, check detection, and the game state machine.`,
    difficulty: "BEGINNER",
    estimatedMin: 50,
    tags: ["OOP", "polymorphism", "strategy", "state-machine"],
    xpTotal: 150,
  });

  // ── Additional intermediate questions ──────────────────────────────────────

  await seedLLDQuestion(prisma, mod3.id, {
    title: "Design an Online Shopping Cart",
    description: `Design the cart and order management domain for an e-commerce platform.

Users can browse products, add items to cart, apply discount codes/coupons,
select a delivery address, choose a payment method, and place an order.
Inventory is deducted on order placement.
Orders go through states: PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED.

Consider: cart as a transient session vs persistent entity, inventory reservation 
during checkout to prevent overselling, coupon validation (percentage vs flat),
the order state machine, and rollback on payment failure.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 60,
    tags: ["OOP", "state-machine", "inventory", "coupons"],
    xpTotal: 175,
  });

  await seedLLDQuestion(prisma, mod3.id, {
    title: "Design a Ride Sharing Matching Engine",
    description: `Design the core matching and booking domain for a ride-sharing app (like Uber).

Riders request a ride from their location to a destination.
The system matches a rider to a nearby available driver.
Drivers can accept or decline. If declined, the next nearest driver is tried.
Once accepted: ride is BOOKED → IN_PROGRESS → COMPLETED / CANCELLED.

Consider: driver availability state machine, the matching algorithm (nearest driver 
within max radius, with priority for ratings), handling driver going offline 
mid-matching, fare estimation before booking, and ride cancellation policies.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 65,
    tags: ["OOP", "matching", "state-machine", "algorithms"],
    xpTotal: 175,
  });

  await seedLLDQuestion(prisma, mod3.id, {
    title: "Design a Food Delivery Order System",
    description: `Design the order lifecycle domain for a food delivery platform (like Swiggy/Zomato).

Customers browse restaurants, build an order, and track delivery in real-time.
Multiple delivery partners are available in each area.
Order states: PLACED → ACCEPTED → PREPARING → PICKED_UP → DELIVERED / CANCELLED.
Restaurants can mark items as unavailable mid-order.

Consider: the order state machine and transitions, restaurant-side and 
delivery-partner-side views of the same order, partial cancellation handling, 
delivery fee calculation (distance-based), and real-time order tracking.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 60,
    tags: ["OOP", "state-machine", "delivery", "real-time"],
    xpTotal: 175,
  });

  // ── Additional advanced questions ─────────────────────────────────────────

  await seedLLDQuestion(prisma, mod4.id, {
    title: "Design a Distributed Job Scheduler",
    description: `Design a job scheduling library/service that executes tasks on a schedule.

Jobs can be one-time or recurring (cron expressions). Jobs can be distributed 
across multiple worker nodes. Each job has a timeout, retry policy, and priority.
Jobs must not be executed by more than one worker (exactly-once semantics).

Consider: the Quartz Scheduler pattern, distributed locking (using DB or Redis) 
to prevent duplicate execution, the job lifecycle (SCHEDULED → RUNNING → 
COMPLETED/FAILED/RETRYING), worker heartbeat and dead worker detection, 
and cron expression parsing.`,
    difficulty: "ADVANCED",
    estimatedMin: 80,
    tags: ["distributed", "scheduling", "locking", "cron"],
    xpTotal: 200,
  });

  await seedLLDQuestion(prisma, mod4.id, {
    title: "Design a Circuit Breaker Library",
    description: `Design a reusable circuit breaker library for fault-tolerant service calls.

The circuit breaker wraps an external call and tracks failure rates.
States: CLOSED (normal) → OPEN (failing, reject calls) → HALF-OPEN (testing).
Thresholds: failure rate % and call volume window before tripping to OPEN.
Half-open: allow limited test calls; if they succeed, go back to CLOSED.

Consider: the state machine with precise transitions, sliding window 
(count-based vs time-based) for tracking failures, thread-safe state transitions, 
metrics collection (success rate, failure rate, slow call rate), and the 
decorator/wrapper pattern for transparent use by callers.`,
    difficulty: "ADVANCED",
    estimatedMin: 70,
    tags: ["patterns", "fault-tolerance", "state-machine", "thread-safety"],
    xpTotal: 200,
  });
}

// ─── Phase templates for LLD (6 phases) ──────────────────────────────────────

async function seedLLDQuestion(
  prisma: PrismaClient,
  moduleId: string,
  q: {
    title: string;
    description: string;
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    estimatedMin: number;
    tags: string[];
    xpTotal: number;
  }
) {
  const question = await prisma.designQuestion.upsert({
    where: {
      // Upsert by title + moduleId (create composite unique in real scenario)
      id: `lld-${q.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}`,
    },
    create: {
      id: `lld-${q.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}`,
      moduleId,
      title: q.title,
      description: q.description,
      track: "LLD",
      difficulty: q.difficulty,
      estimatedMin: q.estimatedMin,
      tags: q.tags,
      xpTotal: q.xpTotal,
    },
    update: { description: q.description },
  });

  const phases = [
    {
      order: 1,
      title: "Requirements Gathering",
      instruction: `Identify the functional and non-functional requirements for this system.
      
Be specific. List:
1. Functional requirements — what the system must DO (user stories or feature list)
2. Non-functional requirements — reliability, performance, concurrency, scale
3. The primary actors and their roles
4. What is explicitly OUT OF SCOPE for this design

Do NOT jump to class design yet. This phase is about understanding the problem.`,
      passThreshold: 60,
      xpReward: Math.round(q.xpTotal * 0.12),
      editorType: "richtext",
    },
    {
      order: 2,
      title: "Entity Identification",
      instruction: `Based on your requirements, identify all entities (classes/objects) in the system.

For each entity, provide:
- Entity name (noun, PascalCase)
- Its key attributes (data it holds)
- Its single responsibility (what is this entity responsible for?)

Format example:
Book: id, title, isbn, status (AVAILABLE/BORROWED/RESERVED) — Represents a physical book copy and its borrowing state

Do NOT define methods or relationships yet — that's the next phase.`,
      passThreshold: 60,
      xpReward: Math.round(q.xpTotal * 0.17),
      editorType: "richtext",
    },
    {
      order: 3,
      title: "Relationships & Responsibilities",
      instruction: `Define the relationships between entities you identified.

For each relationship specify:
- Type: IS-A (inheritance), HAS-A composition (strong ownership), HAS-A aggregation (weak ownership), USES (dependency)
- Cardinality: 1:1, 1:N, N:M
- Direction: which entity owns the relationship

Example:
- Library HAS-A (composition) [1:N] ParkingSpot — spots cannot exist without the lot
- User USES [N:M] Book — through the Borrowing entity

Also identify: which entity is responsible for which operations?`,
      passThreshold: 60,
      xpReward: Math.round(q.xpTotal * 0.17),
      editorType: "richtext",
    },
    {
      order: 4,
      title: "Class Diagram",
      instruction: `Write your class diagram using either:
a) Text notation (class name, attributes with types, methods with signatures)
b) Mermaid classDiagram syntax

Must include:
- All key classes/interfaces with access modifiers (+public, -private, #protected)
- Attributes with types
- Methods with parameter types and return types
- Relationships shown with correct arrows

Example (text notation):
class Book {
  -id: String
  -status: BookStatus  
  +getStatus(): BookStatus
  +checkout(userId: String): void
}`,
      passThreshold: 55,
      xpReward: Math.round(q.xpTotal * 0.20),
      editorType: "code",
    },
    {
      order: 5,
      title: "Design Patterns & Key Decisions",
      instruction: `Identify which design patterns you applied in your design and WHY.

For each pattern:
1. Name the pattern
2. WHERE you applied it (which classes/interactions)
3. WHY — what specific problem does it solve in this design?
4. What is the alternative and why did you NOT choose it?

Also address:
- Which SOLID principles are explicitly followed in your design?
- What are the key trade-offs of your design decisions?`,
      passThreshold: 55,
      xpReward: Math.round(q.xpTotal * 0.17),
      editorType: "richtext",
    },
    {
      order: 6,
      title: "Code Skeleton",
      instruction: `Write the code skeleton for the most critical parts of your design.

Focus on:
1. Key interfaces and abstract classes (not implementations)
2. Core method signatures with javadoc/docstring comments
3. Custom exceptions for domain-specific errors
4. Thread safety considerations where relevant (synchronized, locks)

You do NOT need to implement methods — skeleton + comments describing what the method does is sufficient.
Language: Java, Python, or TypeScript (your choice).`,
      passThreshold: 50,
      xpReward: Math.round(q.xpTotal * 0.17),
      editorType: "code",
    },
  ];

  for (const phase of phases) {
    await prisma.phase.upsert({
      where: { questionId_order: { questionId: question.id, order: phase.order } },
      create: {
        questionId: question.id,
        order: phase.order,
        title: phase.title,
        instruction: phase.instruction,
        // System prompt is generated at runtime from lib/ai/prompts/lld-phases.ts
        // We store a reference key here, not the full prompt
        systemPrompt: `LLD_PHASE_${phase.order}`,
        rubricJson: { phaseOrder: phase.order, track: "LLD" },
        passThreshold: phase.passThreshold,
        maxAttempts: 4,
        xpReward: phase.xpReward,
        editorType: phase.editorType,
      },
      update: { instruction: phase.instruction },
    });
  }
}
