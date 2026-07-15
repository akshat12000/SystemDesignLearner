import type { PrismaClient } from "../../app/generated/prisma/internal/class";

export async function seedHLDTrack(prisma: PrismaClient) {
  const track = await prisma.track.upsert({
    where: { slug: "hld" },
    create: {
      slug: "hld",
      type: "HLD",
      title: "High Level Design",
      description:
        "Design distributed systems under real constraints. Phase-by-phase structure from requirements clarification to failure mode analysis. The AI evaluates your reasoning quality, not keywords.",
      order: 2,
    },
    update: {},
  });

  const mod1 = await prisma.module.upsert({
    where: { trackId_slug: { trackId: track.id, slug: "hld-foundations" } },
    create: {
      trackId: track.id,
      slug: "hld-foundations",
      title: "Building Blocks",
      description: "Scalability, databases, caching, and message queues before designing systems",
      order: 1,
      type: "LESSON",
      difficulty: "BEGINNER",
    },
    update: {},
  });

  const mod2 = await prisma.module.upsert({
    where: { trackId_slug: { trackId: track.id, slug: "hld-beginner" } },
    create: {
      trackId: track.id,
      slug: "hld-beginner",
      title: "Beginner System Design",
      description: "Classic HLD questions to build your framework",
      order: 2,
      type: "DESIGN_QUESTION",
      difficulty: "BEGINNER",
    },
    update: {},
  });

  const mod3 = await prisma.module.upsert({
    where: { trackId_slug: { trackId: track.id, slug: "hld-intermediate" } },
    create: {
      trackId: track.id,
      slug: "hld-intermediate",
      title: "Intermediate System Design",
      description: "Consumer-scale products with real trade-offs",
      order: 3,
      type: "DESIGN_QUESTION",
      difficulty: "INTERMEDIATE",
    },
    update: {},
  });

  const mod4 = await prisma.module.upsert({
    where: { trackId_slug: { trackId: track.id, slug: "hld-advanced" } },
    create: {
      trackId: track.id,
      slug: "hld-advanced",
      title: "Advanced System Design",
      description: "Infrastructure-level and hyper-scale systems",
      order: 4,
      type: "DESIGN_QUESTION",
      difficulty: "ADVANCED",
    },
    update: {},
  });

  // Beginner questions
  await seedHLDQuestion(prisma, mod2.id, {
    title: "Design a URL Shortener (TinyURL)",
    description: `Design a URL shortening service like TinyURL or bit.ly.

Users submit a long URL and receive a short code (e.g., tinyurl.com/abc123).
Visiting the short URL redirects to the original URL.
Analytics: track click counts per short URL.

This appears simple but has important decisions around:
ID generation strategy, hash collisions, redirect mechanisms (301 vs 302),
storage choices, caching strategy for hot URLs, and expiration.`,
    difficulty: "BEGINNER",
    estimatedMin: 60,
    tags: ["hashing", "caching", "redirect", "storage"],
    xpTotal: 150,
  });

  await seedHLDQuestion(prisma, mod2.id, {
    title: "Design a Key-Value Store",
    description: `Design a distributed key-value store (like Redis or DynamoDB's core).

Support: GET, PUT, DELETE operations with string keys and values up to 1MB.
Target: 10,000 QPS reads, 1,000 QPS writes. P99 read latency < 10ms.
Data must survive server restarts (persistence).

Key challenges: partitioning/sharding strategy, replication for fault tolerance,
consistency model (strong vs eventual), handling hot keys, 
and the write-ahead log for durability.`,
    difficulty: "BEGINNER",
    estimatedMin: 75,
    tags: ["distributed", "consistency", "partitioning", "replication"],
    xpTotal: 175,
  });

  // Intermediate questions
  await seedHLDQuestion(prisma, mod3.id, {
    title: "Design Twitter / X Feed",
    description: `Design the core Twitter platform — posting tweets and viewing a home feed.

Users can post tweets (280 chars + media), follow other users, 
and see a home feed of tweets from followed users.
Scale: 300M daily active users, 500M tweets/day, peak 150K tweets/second.
Celebrities may have 100M+ followers.

The hard problem: fan-out on write vs fan-out on read for the feed.
This is a classic read-heavy system with the celebrity problem.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 90,
    tags: ["fan-out", "feed", "timeline", "celebrity-problem", "caching"],
    xpTotal: 200,
  });

  await seedHLDQuestion(prisma, mod3.id, {
    title: "Design WhatsApp Messaging",
    description: `Design the core WhatsApp messaging system.

Features: 1:1 messaging, group messaging (max 256 members), 
message delivery receipts (sent/delivered/read), media sharing.
Scale: 100B messages/day, 2B+ users, end-to-end encryption.
Offline delivery: messages must be queued when recipient is offline.

Key challenges: message queue per user, WebSocket connections at scale,
end-to-end encryption architecture, delivery receipts design,
and handling the thundering herd when a popular user comes online.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 90,
    tags: ["websockets", "message-queue", "encryption", "delivery-receipts"],
    xpTotal: 200,
  });

  await seedHLDQuestion(prisma, mod3.id, {
    title: "Design YouTube Video Service",
    description: `Design YouTube's video upload and streaming service.

Users can upload videos, which are processed (transcoded to multiple resolutions) 
and then streamed to viewers worldwide.
Scale: 500 hours of video uploaded per minute, 1B+ hours watched per day.
Videos must be available in multiple resolutions (360p to 4K).

Key challenges: async video transcoding pipeline, CDN strategy for global delivery,
adaptive bitrate streaming (HLS/DASH), storage costs, 
and resumable uploads for large files.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 90,
    tags: ["video-processing", "CDN", "streaming", "transcoding", "storage"],
    xpTotal: 200,
  });

  // Advanced questions
  await seedHLDQuestion(prisma, mod4.id, {
    title: "Design a Distributed Cache (like Redis)",
    description: `Design a distributed in-memory cache system.

Requirements: GET/SET/DEL with TTL support. Support for pub/sub.
Cluster mode: data distributed across N nodes.
Eviction policies: LRU, LFU, TTL-based.
Persistence: optional RDB snapshots and AOF logging.
Target: sub-millisecond latency, 99.99% availability.

This is a deep infrastructure design. Think about: consistent hashing for sharding,
replication topology (master-replica), split-brain handling,
eviction algorithm implementation at scale, and the persistence vs performance trade-off.`,
    difficulty: "ADVANCED",
    estimatedMin: 120,
    tags: ["distributed", "consistent-hashing", "eviction", "replication", "pub-sub"],
    xpTotal: 250,
  });

  await seedHLDQuestion(prisma, mod4.id, {
    title: "Design a Ride-Sharing Service (Uber/Ola)",
    description: `Design the core ride-sharing platform.

Riders request rides from their location. Nearby drivers receive requests.
The system matches rider to driver, tracks real-time location, calculates pricing, 
and processes payment.
Scale: 15M trips/day, 4M drivers, real-time location updates every 4 seconds.

Key challenges: geospatial indexing for driver lookup (S2/QuadTree/Geohash),
real-time location updates at scale, matching algorithm, surge pricing,
and handling the driver going offline mid-trip.`,
    difficulty: "ADVANCED",
    estimatedMin: 120,
    tags: ["geospatial", "real-time", "matching", "location-tracking", "surge-pricing"],
    xpTotal: 250,
  });

  // ── Additional beginner questions ──────────────────────────────────────────

  await seedHLDQuestion(prisma, mod2.id, {
    title: "Design a Pastebin",
    description: `Design a pastebin service (like pastebin.com or GitHub Gist).

Users can paste text content and get a short URL. Pastes can be public or private.
Pastes expire after a configurable duration (1 hour, 1 day, never).
Anonymously created pastes are supported (no login required).
Scale: 10M DAU, 1M new pastes/day, 100M reads/day.

Key decisions: storage for text blobs (object storage vs DB), short URL generation,
expiry cleanup mechanism, CDN for read-heavy hot pastes, and the analytics 
(view counts) without blocking writes.`,
    difficulty: "BEGINNER",
    estimatedMin: 60,
    tags: ["storage", "hashing", "CDN", "expiry"],
    xpTotal: 150,
  });

  await seedHLDQuestion(prisma, mod2.id, {
    title: "Design a Rate Limiter Service",
    description: `Design a centralized rate limiting service used by multiple microservices.

Services query the rate limiter before processing each request.
Rules: X requests per user per second/minute. Rules are configurable per API endpoint.
The limiter must be accurate, distributed (multiple instances), and low latency (<5ms).
Scale: 100K+ RPS throughput on the limiter itself.

Key decisions: Token Bucket vs Sliding Window algorithm, Redis storage schema 
for distributed state, handling Redis failure gracefully (fail open vs fail closed),
and where to deploy the limiter (sidecar, gateway, library).`,
    difficulty: "BEGINNER",
    estimatedMin: 60,
    tags: ["rate-limiting", "Redis", "distributed", "algorithms"],
    xpTotal: 150,
  });

  // ── Additional intermediate questions ──────────────────────────────────────

  await seedHLDQuestion(prisma, mod3.id, {
    title: "Design Google Drive / Dropbox",
    description: `Design a cloud file storage and sync service.

Users can upload files (up to 5GB), organize in folders, and access from any device.
Files sync across devices automatically when changed.
Sharing: share files/folders with other users (view or edit permissions).
Scale: 500M users, 1B+ files, 10PB+ storage.

Key challenges: chunked upload for large files, delta sync (only upload changed chunks),
conflict resolution when the same file is edited on two devices simultaneously,
deduplication (same content = same storage block), and the sync protocol.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 90,
    tags: ["file-storage", "sync", "chunking", "deduplication", "conflict-resolution"],
    xpTotal: 200,
  });

  await seedHLDQuestion(prisma, mod3.id, {
    title: "Design a Search Autocomplete System",
    description: `Design the typeahead/autocomplete feature for a search box (like Google search suggestions).

As the user types, return the top 10 completions within 100ms.
Suggestions are ranked by query frequency (popular searches appear first).
The system learns: if 10M people searched "apple pie recipe" this week, 
typing "apple" should suggest it.
Scale: 10B queries/day, 5M unique queries/day to the autocomplete service.

Key challenges: the Trie data structure for prefix lookup, how to update the 
Trie with new search frequency data (periodic batch vs real-time), 
sharding the Trie across machines, and the caching strategy for top-k results.`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 75,
    tags: ["Trie", "ranking", "real-time", "caching", "prefix-search"],
    xpTotal: 200,
  });

  await seedHLDQuestion(prisma, mod3.id, {
    title: "Design a Notification System",
    description: `Design a multi-channel notification service for a large platform.

The system sends push notifications (iOS/Android), emails, and SMS.
Notifications are triggered by events (new follower, payment received, etc.).
10M DAU, each receiving an average of 5 notifications/day = 50M notifications/day.
Delivery must be reliable — a notification must not be lost even if a server crashes.

Key challenges: fan-out at scale (a celebrity post triggers 10M push notifications),
rate limiting per user/device (don't spam), retry with exponential backoff for 
failed deliveries, tracking delivery status (sent/delivered/read),
and priority queues (transactional notifications > marketing).`,
    difficulty: "INTERMEDIATE",
    estimatedMin: 75,
    tags: ["push-notifications", "fan-out", "message-queue", "retry", "multi-channel"],
    xpTotal: 200,
  });

  // ── Additional advanced questions ─────────────────────────────────────────

  await seedHLDQuestion(prisma, mod4.id, {
    title: "Design a Web Crawler",
    description: `Design a distributed web crawler like Googlebot.

The crawler starts from seed URLs, downloads pages, extracts links, and queues them.
Scale: crawl 1 billion pages in 30 days = ~385 pages/second sustained.
Store: URL frontier (queue), crawled content, crawl metadata.

Key challenges: politeness policies (don't hammer a single server — robots.txt, 
crawl-delay), URL normalization and deduplication (avoid crawling the same page twice),
distributed scheduling across 100+ crawler workers, handling infinite URL spaces 
(URL traps), and prioritizing which URLs to crawl first (PageRank-based priority).`,
    difficulty: "ADVANCED",
    estimatedMin: 90,
    tags: ["distributed", "crawling", "deduplication", "queuing", "politeness"],
    xpTotal: 225,
  });

  await seedHLDQuestion(prisma, mod4.id, {
    title: "Design a Payment Processing System",
    description: `Design a payment processing platform (like Stripe or Razorpay).

Merchants integrate via API to charge customers. Customers can pay with 
credit/debit cards (via card network — Visa/Mastercard).
The system handles: charge, refund, dispute, and payout to merchants.
Scale: 10K TPS at peak, $10B+ processed daily, 99.999% availability required.

Key challenges: idempotency (network failure should never double-charge a customer),
distributed transaction across your DB and the card network,
PCI-DSS compliance (never store raw card data), exactly-once processing,
and the reconciliation system (your records must match the bank's records daily).`,
    difficulty: "ADVANCED",
    estimatedMin: 120,
    tags: ["payments", "idempotency", "distributed-transactions", "compliance", "reconciliation"],
    xpTotal: 250,
  });
}

async function seedHLDQuestion(
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
      id: `hld-${q.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}`,
    },
    create: {
      id: `hld-${q.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}`,
      moduleId,
      title: q.title,
      description: q.description,
      track: "HLD",
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
      title: "Requirements Clarification",
      instruction: `You are starting your HLD interview. The most critical step is asking the right questions BEFORE you design anything.

List ALL the clarifying questions you would ask the interviewer. Group them:

**Scale & Traffic:**
- What is the expected Daily Active Users (DAU)?
- What are the peak QPS (queries per second) for reads and writes?
- What is the read/write ratio?

**Availability & Consistency:**  
- What are the availability requirements (99.9%? 99.99%?)
- Is strong consistency required, or is eventual consistency acceptable?
- What is the maximum acceptable data loss (RPO)?

**Features & Scope:**
- What are the must-have features for v1?
- What is explicitly out of scope?

**Data:**
- What is the expected data size per record?
- What is the total storage over 5 years?

Ask every question that would affect your architectural decisions.`,
      passThreshold: 60,
      xpReward: Math.round(q.xpTotal * 0.15),
      editorType: "richtext",
    },
    {
      order: 2,
      title: "Capacity Estimation",
      instruction: `Assume these numbers from the clarification phase (use realistic numbers for this system):
- DAU and peak QPS appropriate for this system's scale
- Average record/payload size
- Read/write ratio

Now do back-of-envelope estimation. SHOW YOUR MATH:

1. **Storage estimation:**
   - Daily new data = ?
   - 5-year total = ?
   - With replication factor 3 = ?

2. **Bandwidth:**
   - Ingress (write bandwidth) = QPS_write × avg_payload_size
   - Egress (read bandwidth) = QPS_read × avg_response_size

3. **Compute:**
   - Peak read QPS = ?
   - Peak write QPS = ?

4. **What do these numbers tell you about architecture?**
   - Is this read-heavy or write-heavy? → impacts DB and cache design
   - Is storage the bottleneck? → impacts sharding strategy

Use: 1M req/day ≈ 12 req/sec. Show units in every calculation.`,
      passThreshold: 55,
      xpReward: Math.round(q.xpTotal * 0.15),
      editorType: "richtext",
    },
    {
      order: 3,
      title: "High-Level Architecture",
      instruction: `Design the top-level architecture of the system. Describe (or draw) ALL major components.

Your architecture must include and justify:

1. **Client layer** — web, mobile, SDK?
2. **API Gateway / Load Balancer** — what type, why?
3. **Application servers** — monolith or microservices? If microservices, which services?
4. **Database(s)** — which specific DB (not just "SQL or NoSQL"). Justify: why PostgreSQL vs Cassandra vs DynamoDB?
5. **Cache** — where (client, CDN, server-side)? What caching strategy (write-through, write-behind, cache-aside)?
6. **Message queue** — is async processing needed? Which queue (Kafka vs RabbitMQ vs SQS)?
7. **CDN** — what content? Which origin?

For each major decision, state: "I chose X because Y, with the trade-off that Z."

You can describe this as numbered components or draw in ASCII/text notation.`,
      passThreshold: 60,
      xpReward: Math.round(q.xpTotal * 0.25),
      editorType: "richtext",
    },
    {
      order: 4,
      title: "Deep Dive — Critical Components",
      instruction: `Select the 2-3 MOST COMPLEX or CRITICAL components from your architecture and explain their internals.

Choose components that:
- Handle the hardest scale requirements
- Have the most interesting design decisions
- Are most likely to fail or become bottlenecks

For each chosen component, explain:
1. **Internal design** — how does it work inside?
2. **Key algorithm or data structure** (if applicable)
3. **Why this approach** — trade-offs vs alternatives
4. **How it handles the scale numbers from Phase 2**

Do NOT choose the "easy" components. If the hard part is the feed generation algorithm, dive into that — not "the load balancer distributes traffic."`,
      passThreshold: 60,
      xpReward: Math.round(q.xpTotal * 0.25),
      editorType: "richtext",
    },
    {
      order: 5,
      title: "Failure Modes & Bottlenecks",
      instruction: `Identify what can go wrong in your architecture and how you'd mitigate each failure.

Cover:

1. **Single Points of Failure (SPOFs):**
   - For each SPOF, what is your redundancy strategy?

2. **Data loss scenarios:**
   - What happens if the primary DB crashes during a write?
   - How do you ensure durability?

3. **Cascading failures:**
   - What happens if the cache goes down? Does the DB get overwhelmed?
   - Do you have circuit breakers?

4. **Hot spots / thundering herd:**
   - What happens when a celebrity posts (fan-out problem)?
   - What happens when the cache is cold (cold start)?

5. **Bottlenecks at 10x scale:**
   - Which component breaks first if traffic grows 10x?
   - What is your scaling strategy for that component?

6. **Monitoring:**
   - What metrics would you alert on?
   - What is your SLA for this system?`,
      passThreshold: 55,
      xpReward: Math.round(q.xpTotal * 0.20),
      editorType: "richtext",
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
        systemPrompt: `HLD_PHASE_${phase.order}`,
        rubricJson: { phaseOrder: phase.order, track: "HLD" },
        passThreshold: phase.passThreshold,
        maxAttempts: 4,
        xpReward: phase.xpReward,
        editorType: phase.editorType,
      },
      update: { instruction: phase.instruction },
    });
  }
}
