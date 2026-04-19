import { AttendanceStatus } from "../types";

// Suppress unused warning — AttendanceStatus used elsewhere for type guards
void AttendanceStatus;

export function seedDataIfEmpty(): void {
  // No demo data seeded. System starts completely empty.
  // Admin adds real students and Ustaads manually.
}
