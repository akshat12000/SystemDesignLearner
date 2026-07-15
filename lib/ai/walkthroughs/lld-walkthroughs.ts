// What students should have covered per LLD phase — shown when attempts are exhausted.
// Uses standard markdown so react-markdown renders it cleanly.

export const LLD_WALKTHROUGHS: Record<number, string> = {
  1: `Here's what a complete requirements answer should have covered:

**Functional Requirements (must-haves):**
- Core actions users can perform (park vehicle, exit, find available spot)
- Different vehicle types and their spot types (motorcycle, car, truck)
- Payment and fee calculation
- Entry/exit flow and ticket generation

**Non-Functional Requirements:**
- **Concurrency:** multiple vehicles entering/exiting simultaneously
- **Availability:** the system should not go down mid-operation
- **Scalability:** ability to add new floors/spots without redesign
- **Performance:** fast spot lookup (O(1) or O(log n))

**Actors:**
- Driver/Vehicle (primary user)
- Parking attendant or automated gate (system actor)

**Out of scope you should have explicitly stated:**
- Online reservation (unless asked)
- Payment gateway integration details`,

  2: `Here's what complete entity identification looks like:

**Core entities you needed:**
- **ParkingLot** — top-level container (id, address, totalFloors)
- **ParkingFloor** — one level (floorNumber, spots list)
- **ParkingSpot** — individual spot (spotId, type: SMALL/MEDIUM/LARGE, status: AVAILABLE/OCCUPIED/RESERVED)
- **Vehicle** — (licensePlate, vehicleType: MOTORCYCLE/CAR/TRUCK)
- **ParkingTicket** — issued on entry (ticketId, entryTime, spot ref, vehicle ref)
- **Payment** — (amount, paymentTime, method)

**Rules for each entity:**
- Must have a clear single responsibility
- Must include status/state attributes — not just IDs
- No "God classes" that handle everything`,

  3: `Here's what complete relationship mapping looks like:

**Key relationships:**
- ParkingLot **HAS-A composition [1:N]** ParkingFloor — floors cannot exist without the lot
- ParkingFloor **HAS-A composition [1:N]** ParkingSpot
- ParkingTicket **HAS-A aggregation [1:1]** ParkingSpot — ticket references spot; spot exists independently
- ParkingTicket **HAS-A aggregation [1:1]** Vehicle
- Payment **HAS-A [1:1]** ParkingTicket

**Cardinalities that matter:**
- One Vehicle → at most one active ticket (but many historical)
- One ParkingSpot → exactly one ParkingFloor

**Responsibility split:**
- ParkingLot is responsible for *finding* available spots (not ParkingSpot finding itself)
- ParkingTicket is responsible for knowing duration parked`,

  4: `Here's what the class diagram should have looked like:

\`\`\`
class ParkingLot {
  -floors: List<ParkingFloor>
  +findAvailableSpot(type: VehicleType): Optional<ParkingSpot>
  +issueTicket(vehicle: Vehicle): ParkingTicket
  +processExit(ticket: ParkingTicket): Payment
}

class ParkingSpot {
  -spotId: String
  -type: SpotType            // enum
  -status: SpotStatus        // enum
  +isAvailable(): boolean
  +reserve(): void
  +release(): void
}

interface PricingStrategy {
  +calculateFee(durationMinutes: Int): Double
}
\`\`\`

**Rules violated if missing:**
- ParkingSpot must NOT hold a direct Vehicle reference (SRP violation)
- Pricing behind an interface — not hardcoded in ParkingLot
- Enums for \`SpotType\` and \`SpotStatus\` — never raw strings`,

  5: `Here's what design pattern analysis should have covered:

**Patterns that apply here and WHY:**

**Strategy** — pricing tiers (HourlyPricing, DailyRatePricing all implement PricingStrategy).
Without this, you get a massive if-else chain in ParkingLot every time a new rate is added.

**Factory** — for creating ParkingSpots of different types (\`SpotFactory.create(SpotType)\`).
Without this, ParkingFloor needs to know the concrete types of every spot.

**Singleton** — ParkingLot (there's one lot per deployment). But you must *justify* it — 
don't just list it because it's common.

**Observer** — optional: notify a display board when a spot changes status.

**SOLID alignment to mention:**
- **OCP:** adding a new pricing tier shouldn't require modifying ParkingLot
- **DIP:** ParkingLot depends on \`PricingStrategy\` interface, not \`HourlyPricing\` directly
- **SRP:** ParkingSpot manages its own state; Payment handles fee logic`,

  6: `Here's what the code skeleton should have contained:

\`\`\`java
// Key interface
interface PricingStrategy {
    double calculateFee(long durationMinutes);
}

// Core entity — note thread safety
class ParkingSpot {
    private final String spotId;
    private final SpotType type;
    private volatile SpotStatus status;

    public synchronized boolean reserve() {
        if (status != SpotStatus.AVAILABLE) return false;
        status = SpotStatus.RESERVED;
        return true;
    }
    public synchronized void release() {
        status = SpotStatus.AVAILABLE;
    }
}

// Domain exceptions
class ParkingLotFullException extends RuntimeException {}
class InvalidTicketException extends RuntimeException {}

// Main service — pricing injected (DIP)
class ParkingLot {
    private final List<ParkingFloor> floors;
    private final PricingStrategy pricingStrategy;

    public Optional<ParkingSpot> findAvailableSpot(VehicleType type) { ... }
    public ParkingTicket issueTicket(Vehicle v) throws ParkingLotFullException { ... }
    public Payment processExit(ParkingTicket t) throws InvalidTicketException { ... }
}
\`\`\`

**Key points shown:** \`synchronized\` for thread safety, DI for pricing, \`Optional\` return type, domain exceptions.`,
};

export function getLLDWalkthrough(phaseOrder: number): string {
  return LLD_WALKTHROUGHS[phaseOrder] ?? "Review the phase instruction and rubric criteria carefully before moving on.";
}
