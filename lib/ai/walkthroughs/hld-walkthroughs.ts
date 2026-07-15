export const HLD_WALKTHROUGHS: Record<number, string> = {
  1: `Here's what complete requirements clarification looks like:

**Scale questions (mandatory):**
- "What is the expected DAU / MAU?"
- "What is the peak QPS for reads? For writes?"
- "What is the read/write ratio?"

**Availability & consistency (mandatory):**
- "What is the availability SLA — 99.9% or 99.99%?"
- "Is strong consistency required, or is eventual consistency acceptable?"
- "What is the acceptable data loss window (RPO)?"

**Feature scoping (mandatory):**
- Explicitly list must-haves vs nice-to-haves
- Confirm what is out of scope for v1

**Data characteristics:**
- "What is the average size of a record/payload?"
- "What is the data retention requirement?"

> **Never skip scale questions.** Not asking about DAU/QPS is the most common reason engineers fail system design interviews.`,

  2: `Here's what complete capacity estimation looks like (URL Shortener example):

**Always show your math with units:**

**Storage:**
- 100M new URLs/day × 500 bytes/URL = 50 GB/day
- 5-year storage = 50 GB × 365 × 5 ≈ **90 TB**
- With 3× replication = **~270 TB total**

**Bandwidth:**
- Write: 100M/day ÷ 86,400s ≈ 1,160 writes/sec × 500B = ~580 KB/s ingress
- Read: 10:1 read ratio → 11,600 reads/sec × 500B = ~5.8 MB/s egress

**Compute:**
- Peak write QPS ≈ 2,000/sec (2× average)
- Peak read QPS ≈ 20,000/sec

**What the numbers tell you:**
- Read-heavy (10:1) → **caching is critical**
- Large storage → **need sharding strategy**
- Write QPS is modest → **single-region primary DB is viable**`,

  3: `Here's what a complete high-level architecture covers:

**All layers must be present and justified:**
- **Client** (web/mobile/SDK) → DNS → CDN (static assets) → Load Balancer → API Gateway → App Servers → Cache + DB

**Database choice — always name and justify:**
- Don't say "a database." Say **"PostgreSQL because we need ACID transactions"** or **"Cassandra because we need 10M+ writes/sec with eventual consistency"**

**Cache — where and strategy:**
- Location: server-side (Redis), CDN edge, or client-side
- Strategy: cache-aside for reads, write-through for write-heavy
- What to cache: hot reads — **not writes**

**Message queue — when to add:**
- Add when async tasks exist, write bursts need smoothing, or fan-out is needed
- Kafka for high-throughput ordered streams; RabbitMQ for simple task queues

**Microservices — only split when:**
- Different scaling requirements, different teams, or different deployment cadences`,

  4: `Here's what a strong component deep dive covers:

**Pick the hardest component** — don't deep dive the load balancer. Focus on what's novel: the feed algorithm, the ID generator, the transcoding pipeline.

**Template for every deep dive:**
1. What specific challenge does this component solve?
2. What data structure or algorithm does it use internally?
3. What trade-off did you make vs alternatives?
4. How does it handle your Phase 2 scale numbers?

**Example — URL Shortener ID Generation:**
- **Challenge:** generate unique 7-char IDs at 2,000 writes/sec without collisions
- **Options considered:** MD5 hash (collision risk), auto-increment (predictable, enumerable), Base62(timestamp + machineId + counter)
- **Winner:** Base62 with 7 chars = 62⁷ = 3.5 trillion unique IDs — sufficient for 5 years
- **Trade-off:** slightly longer IDs vs guaranteed uniqueness without a DB round-trip`,

  5: `Here's what complete failure mode analysis covers:

**Single Points of Failure — identify all of them:**
- Primary DB → Fix: primary-replica replication + automatic failover (e.g. RDS Multi-AZ)
- Cache layer → Fix: Redis Cluster; fall back to DB with **circuit breaker** to prevent stampede
- Load balancer → Fix: active-active LB pair with DNS health checks

**Data loss scenarios:**
- Write in-flight when DB crashes → Fix: write-ahead log (WAL) + synchronous replication for critical writes
- Cache eviction of hot data → Fix: LRU eviction policy + warm-up strategy on restart

**Thundering herd:**
- Cache restarts cold → DB receives 10,000× normal load → Fix: **request coalescing**, staggered warm-up, circuit breaker

**Cascading failure:**
- Slow downstream service exhausts thread pool → Fix: **timeouts on all downstream calls**, bulkhead isolation, circuit breaker pattern (closed → open → half-open)

**Monitoring minimum viable set:**
- Alert on: error rate > 1%, p99 latency > SLA threshold, disk > 80%, message queue depth growing`,
};

export function getHLDWalkthrough(phaseOrder: number): string {
  return HLD_WALKTHROUGHS[phaseOrder] ?? "Review the phase instruction and criteria carefully before moving on.";
}
