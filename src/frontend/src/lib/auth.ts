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

/**
 * @deprecated Class-based system removed. Sessions are now used.
 * Kept as empty array so any existing import doesn't break.
 */
export const CLASS_LIST: readonly string[] = [] as const;

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
 * Teacher (Ustaad) login — name-only authentication.
 *
 * Looks up the teacher by name in the Admin-managed teacher list (localStorage).
 * If no teachers exist or name is not found → login fails.
 * No mobile number required.
 */
export function loginAsTeacher(teacherName: string): Session | null {
  const trimmedName = teacherName.trim();
  if (!trimmedName) return null;

  const teachers = getTeachers();

  // If no teachers added by Admin yet, reject login
  if (teachers.length === 0) return null;

  const teacher = teachers.find(
    (t) => t.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  );
  if (!teacher) return null;

  // Resolve all shifts for this teacher
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
 * Records last login and activity on success.
 */
export function loginAsParent(mobile: string): Session | null {
  const trimmedMobile = mobile.trim();
  if (!trimmedMobile) return null;

  const students = getStudents();
  const linked = students.find((s) => s.parentMobile === trimmedMobile);
  if (!linked) return null;

  const session: Session = {
    role: "parent",
    name: `Parent of ${linked.name}`,
    mobile: trimmedMobile,
  };
  saveSession(session);

  updateParentLastLogin(trimmedMobile, linked.id, linked.name);
  addParentActivity(trimmedMobile, "Login");

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
