import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js navigation — avoids "invariant expected app router" errors in tests
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

// Mock Next.js headers (used by server actions internally)
vi.mock("next/headers", () => ({
  cookies: () => ({ get: vi.fn(), set: vi.fn() }),
  headers: () => new Map(),
}));

// Suppress console.error in tests (React act() warnings, etc.)
// Remove the line below if you want to see them
// vi.spyOn(console, "error").mockImplementation(() => {});
