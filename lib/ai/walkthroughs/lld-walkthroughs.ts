// What students should have covered per LLD phase — shown when attempts are exhausted.
// IMPORTANT: These are methodology-based walkthroughs that apply to ANY LLD question.
// Examples used are clearly labelled as illustrative only.

export const LLD_WALKTHROUGHS: Record<number, string> = {
  1: `Here's the methodology for a complete requirements phase:

**Functional Requirements — what to capture:**
- List the core user actions (what the primary actor *does* with the system)
- Identify all distinct roles/actors and their goals
- Separate must-haves from nice-to-haves explicitly

**Non-Functional Requirements — never skip these:**
- **Concurrency:** can multiple users/operations happen simultaneously?
- **Availability:** consequences of downtime?
- **Scalability:** will the system need to grow over time?
- **Performance:** any latency or throughput constraints?

**Always state out-of-scope items explicitly.**
Saying "X is out of scope" shows interviewer maturity.

> **Example** (for a Parking Lot): Functional = park vehicle, exit, check availability. NFR = concurrent entry/exit, fast spot lookup. Out of scope = online reservation.
> **For your question**, apply the same structure to the domain you were given.`,

  2: `Here's the methodology for complete entity identification:

**How to identify entities:**
1. Read your requirements — every noun that has its own lifecycle is likely an entity
2. Ask: "Does this thing have attributes and state?" → if yes, it's an entity
3. Avoid "God classes" — one class should not do everything
4. Each entity must have a **single clear responsibility**

**What each entity definition must include:**
- Name (PascalCase noun)
- Key attributes (data it holds)
- Status/state field where relevant (e.g. AVAILABLE, BOOKED, ACTIVE, EXPIRED)
- Its single responsibility in one sentence

**Red flags that cost you marks:**
- Entity with no attributes (just an ID)
- Missing state/status on entities that clearly have lifecycle
- Combining two responsibilities in one class

> **Example** (for a Parking Lot): \`ParkingSpot\` holds (spotId, type, **status**) and its responsibility is tracking whether it is available. \`ParkingTicket\` holds entry time and links a vehicle to a spot.
> **For your question**, apply this same thinking to the domain you were given — identify its core nouns with lifecycles.`,

  3: `Here's the methodology for complete relationship mapping:

**The three relationship types you must know:**
- **IS-A (inheritance):** "a Dog IS-A Animal" — use sparingly, prefer composition
- **HAS-A composition:** parent *owns* the child, child cannot exist without parent
- **HAS-A aggregation:** parent *references* the child, child can exist independently

**For each relationship, you must specify:**
- Type (is-a / composition / aggregation / uses)
- Cardinality: 1:1, 1:N, or N:M
- Direction (which side owns it)

**Responsibility assignment — what decides what:**
The entity that *manages* the state of another is usually the one responsible for operations on it.

> **Example** (for a Parking Lot): A \`ParkingFloor\` **has-a composition [1:N]** \`ParkingSpot\` — spots can't exist without a floor. A \`ParkingTicket\` **has-a aggregation [1:1]** \`ParkingSpot\` — the ticket references a spot but the spot exists independently.
> **For your question**, map the same relationship types between *your* question's entities.`,

  4: `Here's the methodology for a complete class diagram:

**Every class must show:**
- Access modifiers: \`+\` public, \`-\` private, \`#\` protected
- Attributes with types: \`-status: BookStatus\`
- Methods with signatures: \`+checkout(userId: String): void\`
- Return types on all methods

**Interfaces and abstract classes:**
- Any behaviour that could vary across types → put behind an interface
- Common state shared across subclasses → abstract class

**Common deductions:**
- All attributes public → encapsulation violation
- No interfaces defined → missed abstraction
- Methods named as nouns instead of verbs
- Classes with only data and no behaviour (anemic domain model)

> **Example** (for a Parking Lot): \`PricingStrategy\` is an interface because pricing rules vary. \`ParkingSpot\` has \`-status: SpotStatus\` (private) and \`+reserve(): boolean\` (public).
> **For your question**, apply the same structure to your domain's classes.`,

  5: `Here's the methodology for design pattern selection:

**How to justify a pattern (the only acceptable format):**
> "I used **[Pattern]** because **[specific problem it solves in THIS design]**, without it I would have **[the bad alternative]**."

**Patterns most common in LLD interviews and when to use them:**
- **Strategy** — when an algorithm or behaviour can vary (pricing, sorting, allocation)
- **Factory / Abstract Factory** — when object creation logic is complex or type-dependent
- **Observer** — when one change must notify multiple others without tight coupling
- **Singleton** — when exactly one instance must exist system-wide (justify carefully!)
- **Decorator** — when you need to add behaviour without subclassing
- **Command** — when you need undo/redo or queued operations

**SOLID principles to call out:**
- OCP: adding new behaviour without modifying existing code
- DIP: depend on abstractions, not concrete classes
- SRP: each class has one reason to change

> **For your question**, ask: "What behaviour varies? What needs to be extensible? What needs to be notified of changes?" — those are your pattern opportunities.`,

  6: `Here's the methodology for a complete code skeleton:

**What a skeleton must contain (not full implementation):**
1. **Key interfaces** — define the contracts, not the implementations
2. **Abstract classes** — when multiple classes share state
3. **Method signatures** — parameters with types, return types, throws declarations
4. **Custom domain exceptions** — one per major failure mode
5. **Thread safety markers** — \`synchronized\`, \`volatile\`, or comment noting where locks are needed

**What NOT to do:**
- Don't write full method bodies — the point is structure, not logic
- Don't skip exceptions — they signal you understand failure modes
- Don't make everything \`public static\` — that's procedural, not OOP

\`\`\`java
// Template structure (adapt to your domain)
interface ICoreAbstraction {
    ReturnType primaryOperation(ParamType param) throws DomainException;
}

class CoreEntity {
    private final String id;
    private volatile StatusEnum status; // volatile = shared across threads

    public synchronized boolean performStateChange() {
        if (status != StatusEnum.VALID_STATE) return false;
        status = StatusEnum.NEW_STATE;
        return true;
    }
}

class DomainSpecificException extends RuntimeException {
    public DomainSpecificException(String message) { super(message); }
}
\`\`\`

> Adapt this template to your question's domain — rename the interface, entity, and exception to match your design.`,
};

export function getLLDWalkthrough(phaseOrder: number): string {
  return LLD_WALKTHROUGHS[phaseOrder] ?? "Review the phase instruction and rubric criteria carefully before moving on.";
}
