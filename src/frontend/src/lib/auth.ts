// Authentication helpers for Madrasa Management System
import {
  type Session,
  addParentActivity,
  clearSession,
  getSession,
  getStudents,
  getTeachers,
  saveSession,
  updateParentLastLogin,
} from "./storage";

export const TEACHER_NAMES = [
  "Shaikh Tareef",
  "Shaikh Zaid",
  "Shaikh Irsad",
  "Hafiz Sajid",
  "Shaikh Adnan",
] as const;

export const CLASS_LIST = [
  "Ibtidayyah",
  "Nisf Qaidah",
  "Mukammal Qaidah",
  "Nisf Amma Para",
  "Mukammal Amma Para",
  "Nazra",
  "Hifz",
] as const;

// Default teacher-class mapping for fallback
const DEFAULT_TEACHER_CLASSES: Record<string, string> = {
  "Shaikh Tareef": "Ibtidayyah",
  "Shaikh Zaid": "Nisf Qaidah",
  "Shaikh Irsad": "Mukammal Qaidah",
  "Hafiz Sajid": "Nazra",
  "Shaikh Adnan": "Hifz",
};

/**
 * Admin login — username: "admin", password: "1234"
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
 * Teacher (Ustaad) login — find by name, returns session with assigned class.
 * Falls back to default class mapping if teacher not in localStorage yet.
 */
export function loginAsTeacher(teacherName: string): Session | null {
  const trimmedName = teacherName.trim();

  // Check that name is one of the valid teacher names
  const isValidTeacher = TEACHER_NAMES.some(
    (n) => n.toLowerCase() === trimmedName.toLowerCase(),
  );
  if (!isValidTeacher) return null;

  // Try to find in localStorage first
  const teachers = getTeachers();
  const teacher = teachers.find(
    (t) => t.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  );

  // Resolve canonical name from TEACHER_NAMES list
  const canonicalName =
    TEACHER_NAMES.find((n) => n.toLowerCase() === trimmedName.toLowerCase()) ??
    trimmedName;

  const assignedClass =
    teacher?.className ?? DEFAULT_TEACHER_CLASSES[canonicalName] ?? "";

  const session: Session = {
    role: "teacher",
    name: canonicalName,
    teacherClass: assignedClass,
  };
  saveSession(session);
  return session;
}

/**
 * Parent login — checks if any student has the given parentMobile.
 * Records last login time and activity on success.
 */
export function loginAsParent(mobile: string): Session | null {
  const students = getStudents();
  const linked = students.find((s) => s.parentMobile === mobile.trim());
  if (!linked) return null;

  const session: Session = {
    role: "parent",
    name: `Parent of ${linked.name}`,
    mobile: mobile.trim(),
  };
  saveSession(session);

  // Track parent activity
  updateParentLastLogin(mobile.trim(), linked.id, linked.name);
  addParentActivity(mobile.trim(), "Login");

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
