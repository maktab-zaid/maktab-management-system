// Authentication helpers for Madrasa Management System
import {
  type Session,
  type Student,
  type Teacher,
  clearSession,
  getSession,
  getStudents,
  getTeachers,
  saveSession,
} from "./storage";

/**
 * @deprecated Class-based system removed.
 */
export const CLASS_LIST: readonly string[] = [] as const;

/**
 * Admin login — username: "admin", password: "1234"
 * Works even when Supabase is not configured.
 */
export function loginAsAdmin(
  username: string,
  password: string,
): Session | null {
  if (username.trim() === "admin" && password === "1234") {
    const session: Session = { role: "admin", name: "Admin" };
    saveSession(session);
    return session;
  }
  return null;
}

/**
 * Teacher (Ustaad) login — name-only authentication.
 * Queries Supabase teachers table. Returns null if not found.
 * Returns null (with no crash) if Supabase is unavailable.
 */
export async function loginAsTeacher(
  teacherName: string,
): Promise<Session | null> {
  const trimmedName = teacherName.trim();
  if (!trimmedName) return null;

  let teachers: Teacher[] = [];
  try {
    teachers = await getTeachers();
  } catch (e) {
    console.error("[Auth] loginAsTeacher: failed to fetch teachers", e);
    return null;
  }

  if (teachers.length === 0) return null;

  const teacher = teachers.find(
    (t) => t.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  );
  if (!teacher) return null;

  let allShifts: string[] = [];
  if (teacher.shifts && teacher.shifts.length > 0) {
    allShifts = teacher.shifts;
  } else if (Array.isArray(teacher.timeSlot)) {
    allShifts = teacher.timeSlot;
  } else if (teacher.timeSlot) {
    allShifts = teacher.timeSlot.split(",").map((s) => s.trim());
  }

  const session: Session = {
    role: "teacher",
    name: teacher.name,
    teacherTimeSlot: allShifts[0] as Session["teacherTimeSlot"],
    teacherSessions: allShifts,
  };
  saveSession(session);
  return session;
}

/**
 * Parent login — checks if any student has the given parentMobile.
 * Queries Supabase students table.
 * Returns null (with no crash) if Supabase is unavailable.
 */
export async function loginAsParent(mobile: string): Promise<Session | null> {
  const trimmedMobile = mobile.trim();
  if (!trimmedMobile) return null;

  let students: Student[] = [];
  try {
    students = await getStudents();
  } catch (e) {
    console.error("[Auth] loginAsParent: failed to fetch students", e);
    return null;
  }

  const linked = students.find((s) => s.parentMobile === trimmedMobile);
  if (!linked) return null;

  const session: Session = {
    role: "parent",
    name: `Parent of ${linked.name}`,
    mobile: trimmedMobile,
  };
  saveSession(session);
  return session;
}

/**
 * Get the current session from localStorage.
 */
export { getSession as getCurrentSession };

/**
 * Clear the current session (logout).
 */
export function logout(): void {
  clearSession();
}
