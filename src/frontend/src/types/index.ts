// Local types for frontend-only Maktab Management System

// ─── Session constants (replaces class system) ─────────────────────────────

export const SESSION_LIST = ["Morning", "Afternoon", "Evening"] as const;
export type SessionName = (typeof SESSION_LIST)[number];

/**
 * Which Ustaads teach in each session.
 * @deprecated — All teacher data comes from Admin-managed localStorage.
 * This is kept as an empty record for backward-compat imports only.
 */
export const USTAAD_SESSIONS: Record<SessionName, string[]> = {
  Morning: [],
  Afternoon: [],
  Evening: [],
};

/**
 * Max student capacity per session.
 * @deprecated — Session capacity limits removed. Sessions are labels only.
 */
export const SESSION_CAPACITY: Record<SessionName, number> = {
  Morning: 0,
  Afternoon: 0,
  Evening: 0,
};

/**
 * All ustaad names — kept as empty for backward-compat imports.
 * @deprecated — Use getTeachers() from storage to get Admin-added Ustaads.
 */
export const ALL_USTAAD_NAMES = [] as const;

export type UstaadName = string;

// ─── Timing options (kept for backward compat) ─────────────────────────────

export const TIMING_OPTIONS = SESSION_LIST;
export const STUDENT_TIMING_OPTIONS = SESSION_LIST;

/** @deprecated Use SESSION_LIST instead */
export const CLASS_OPTIONS = SESSION_LIST;
/** @deprecated Use SESSION_LIST instead */
export const CLASS_LIST = SESSION_LIST;

/** Class options for students */
export const STUDENT_CLASS_OPTIONS = [
  "Ibtidayyah",
  "Nisf Qaida",
  "Mukammal Qaida",
  "Nisf Amma Para",
  "Mukammal Amma",
  "Nazra",
  "Hifz",
] as const;

export type StudentClass = (typeof STUDENT_CLASS_OPTIONS)[number] | string;

// ─── Student ──────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  /** Parent's mobile — used for parent login */
  parentMobile: string;
  /**
   * Session the student attends.
   * Stored as lowercase to match legacy data; display capitalised.
   * Also accepts "Morning" | "Afternoon" | "Evening" from new UI.
   */
  timeSlot: "morning" | "afternoon" | "evening" | string;
  /** Ustaad assigned to this student */
  teacherName: string;
  /** Monthly fees amount in ₹ */
  fees: number;
  feesStatus: "paid" | "pending";
  address?: string;
  rollNumber?: string;
  admissionDate?: string;
  /** Class/level of the student */
  studentClass?: string;
  /**
   * @deprecated Use timeSlot instead.
   * Kept so legacy records loaded from localStorage don't break;
   * will be migrated on read.
   */
  className?: string;
  /**
   * @deprecated Not used in new system.
   */
  assignedTeacherId?: string;
  /** Legacy field */
  timing?: string;
  /** Legacy field */
  mobileNumber?: string;
  /** Legacy bigint compat */
  createdAt?: bigint | string | number;
  /** Legacy bigint compat */
  monthlyFees?: bigint | number;
}

// ─── Teacher ──────────────────────────────────────────────────────────────

export interface Teacher {
  id: string;
  name: string;
  /** Sessions this Ustaad teaches — array of shift names */
  shifts?: string[];
  /** Sessions this Ustaad teaches (comma-separated or array) — kept for compat */
  timeSlot?: string | string[];
  mobile: string;
  /** Admin-approved mobile number for login restriction */
  mobileNumber?: string;
  salary?: number;
  /** @deprecated  */
  class?: string;
  /** @deprecated  */
  className?: string;
  createdAt?: bigint | string | number;
  subject?: string;
}

// ─── Salary ───────────────────────────────────────────────────────────────

export interface SalaryRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  month: string;
  year: string;
  amount: number;
  status: "paid" | "pending";
  paidDate?: string;
}

// ─── Parent Activity ──────────────────────────────────────────────────────

export interface ParentActivity {
  parentMobile: string;
  studentId: string;
  studentName: string;
  lastLogin: string;
  recentActivities: Array<{ action: string; timestamp: string }>;
}

// ─── Attendance ───────────────────────────────────────────────────────────

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  createdAt?: bigint | string;
}

// ─── Academic / Sabak ─────────────────────────────────────────────────────

export interface AcademicRecord {
  id: string;
  studentId: string;
  currentSabak: string;
  previousSabak: string;
  monthlyProgress: string;
  akhlaqRating?: bigint | number;
  updatedAt?: bigint | string;
  sabakType?: SabakType;
  sabakManual?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string;
  amount: bigint | number;
  status: FeesPaymentStatus;
  createdAt?: bigint | string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
}

// ─── Ustaad Profile ───────────────────────────────────────────────────────

export interface UstaadProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  bio: string;
  timeSlot: string;
  createdAt: string;
}

// ─── Activity Log ─────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: "admin" | "ustaad";
  action: "added_student" | "removed_student" | "updated_student";
  targetStudentName: string;
  details?: string;
}

// ─── Admin Profile ────────────────────────────────────────────────────────

export interface AdminProfile {
  name: string;
  designation: string;
  email: string;
  phone: string;
  address: string;
  profileImage?: string;
}

// ─── App Settings ─────────────────────────────────────────────────────────

export interface AppSettings {
  darkMode: boolean;
  desktopView: boolean;
  academicYear: string;
}

// ─── Notification ─────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

// ─── Ustaad Attendance ────────────────────────────────────────────────────

export interface UstaadAttendance {
  id: string;
  ustaadId: string;
  ustaadName: string;
  date: string;
  status: "present" | "absent";
  notes?: string;
}

// ─── Sabak type ───────────────────────────────────────────────────────────

export type SabakType = "urdu" | "dua" | "hadees" | "manual";

// ─── Status types ─────────────────────────────────────────────────────────

export type FeesStatus = "active" | "pending" | "cancelled";
export const FeesStatus = {
  active: "active" as FeesStatus,
  pending: "pending" as FeesStatus,
  cancelled: "cancelled" as FeesStatus,
};

export type AttendanceStatus = "present" | "absent";
export const AttendanceStatus = {
  present: "present" as AttendanceStatus,
  absent: "absent" as AttendanceStatus,
};

export type FeesPaymentStatus = "paid" | "pending";
export const FeesPaymentStatus = {
  paid: "paid" as FeesPaymentStatus,
  pending: "pending" as FeesPaymentStatus,
};

export type AppRole = "admin" | "staff" | "teacher" | "student";

export type AdminPage =
  | "dashboard"
  | "students"
  | "teachers"
  | "attendance"
  | "academic"
  | "reports";

export type TeacherPage =
  | "my-students"
  | "add-student"
  | "attendance"
  | "sabak";

export type StaffPage = "my-students" | "monthly-report" | "student-data";

export type StudentPage = "profile" | "attendance" | "fees" | "progress";

export interface AuthState {
  step: "login" | "app";
  mobileNumber: string;
  role: AppRole | null;
}

/** @deprecated - kept only so existing pages that import ClassName don't break */
export type ClassName = string;

/** @deprecated - kept only so existing pages that import TimingName don't break */
export type TimingName = SessionName;

/** @deprecated - kept only so existing pages that import StudentTimingName don't break */
export type StudentTimingName = SessionName;
