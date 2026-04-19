// Centralized localStorage data store for Madrasa Management System

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppUser {
  role: "admin" | "teacher" | "parent";
  name: string;
  mobile?: string;
}

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  parentMobile: string;
  /** Session the student attends: "morning" | "afternoon" | "evening" */
  timeSlot: string;
  teacherName: string;
  fees: number;
  feesStatus: "paid" | "pending";
  address?: string;
  rollNumber?: string;
  admissionDate?: string;
  /** Class/level of the student e.g. Hifz, Nazra */
  studentClass?: string;
  /** @deprecated Use timeSlot instead. Kept for backward-compat migration. */
  className?: string;
}

export interface Teacher {
  id: string;
  name: string;
  /** Sessions this Ustaad teaches. Can be array of shifts. */
  shifts?: string[];
  /** Sessions this Ustaad teaches. Stored as comma-separated string or array. */
  timeSlot?: string | string[];
  mobile: string;
  /** Admin-approved mobile number for login */
  mobileNumber?: string;
  salary?: number;
  /** @deprecated Removed from system. */
  className?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: "present" | "absent";
  markedBy: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  month: string;
  amount: number;
  status: "paid" | "pending";
}

/** Structured sabak record per section */
export interface SabakRecord {
  id: string;
  studentId: string;
  studentName: string;
  section?: "quran" | "urdu" | "dua" | "hadees";
  currentLesson?: string;
  previousLesson?: string;
  progressPercent?: number;
  remarks: string;
  updatedBy: string;
  updatedAt: string;
  // Quran-specific
  surahName?: string;
  ayatNumber?: number;
  // Count-based (Urdu / Dua / Hadees)
  countCompleted?: number;
  // 7 manual sections
  qaida?: string;
  ammaPara?: string;
  quran?: string;
  dua?: string;
  hadees?: string;
  urdu?: string;
  hifz?: string;
  // Legacy / backward-compat
  lessonName?: string;
  progress?: number;
  sabakType?: "urdu" | "dua" | "hadees" | "manual";
  sabakManual?: string;
}

/** Legacy sabak record (kept for backward-compat reads) */
export interface LegacySabakRecord {
  id: string;
  studentId: string;
  studentName: string;
  lessonName: string;
  progress: number;
  remarks: string;
  updatedBy: string;
  updatedAt: string;
  sabakType?: "urdu" | "dua" | "hadees" | "manual";
  sabakManual?: string;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
  createdBy: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
  type: "image" | "video";
  addedAt: string;
  uploadedBy?: string;
  classTag?: string;
}

export interface Session {
  role: "admin" | "teacher" | "parent";
  name: string;
  mobile?: string;
  /** @deprecated Not used in session system. */
  teacherClass?: string;
  /** Primary time slot for the logged-in teacher */
  teacherTimeSlot?: string;
  /** All sessions this teacher teaches */
  teacherSessions?: string[];
}

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

export interface ParentActivity {
  parentMobile: string;
  studentId: string;
  studentName: string;
  lastLogin: string;
  recentActivities: Array<{ action: string; timestamp: string }>;
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: "admin" | "ustaad";
  action: "added_student" | "removed_student" | "updated_student";
  targetStudentName: string;
  details?: string;
}

// ─── New Feature Types ────────────────────────────────────────────────────────

export interface AdminProfile {
  name: string;
  designation: string;
  email: string;
  phone: string;
  address: string;
  profileImage?: string;
  bio?: string;
  organization?: string;
}

export interface AppSettings {
  darkMode: boolean;
  desktopView: boolean;
  academicYear: string;
  theme?: "dark" | "light";
  viewMode?: "app" | "desktop";
  notifications?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type?: "info" | "warning" | "success";
  timestamp?: string;
  read?: boolean;
  forRole?: "admin" | "ustaad" | "parent" | "all";
}

export interface UstaadAttendance {
  id: string;
  ustaadId: string;
  ustaadName: string;
  date: string;
  status: "present" | "absent";
  notes?: string;
}

export interface UstaadProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  bio: string;
  timeSlot: string;
  createdAt: string;
  address?: string;
  profileImage?: string;
}

export interface ParentProfile {
  mobile: string;
  name: string;
  address: string;
  profileImage?: string;
  updatedAt: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  students: "madrasa_students",
  teachers: "madrasa_teachers",
  attendance: "madrasa_attendance",
  fees: "madrasa_fees",
  sabak: "maktab_sabak_records",
  notices: "madrasa_notices",
  gallery: "madrasa_gallery",
  session: "madrasa_session",
  salaries: "madrasa_salaries",
  parentActivity: "madrasa_parent_activity",
  adminProfile: "madrasa_admin_profile",
  appSettings: "madrasa_app_settings",
  notifications: "madrasa_notifications",
  ustaadAttendance: "madrasa_ustaad_attendance",
  ustaadProfiles: "madrasa_ustaad_profiles",
  parentProfiles: "madrasa_parent_profiles",
  activityLog: "maktab_activity_log",
} as const;

// ─── Generic helpers ──────────────────────────────────────────────────────────

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadSingle<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// ─── Migration: className → timeSlot ─────────────────────────────────────────

/**
 * Maps legacy class names to sessions for migration.
 * Called on every getStudents() call to handle old data gracefully.
 */
function migrateStudent(s: Student): Student {
  // If student has no timeSlot but has className, derive timeSlot from className
  if (!s.timeSlot && s.className) {
    // Legacy data — assign a default session based on class index
    const morning = ["Ibtidayyah", "Nisf Qaidah"];
    const afternoon = [
      "Mukammal Qaidah",
      "Nisf Amma Para",
      "Mukammal Amma Para",
    ];
    if (morning.some((c) => s.className?.includes(c))) {
      return { ...s, timeSlot: "morning" };
    }
    if (afternoon.some((c) => s.className?.includes(c))) {
      return { ...s, timeSlot: "afternoon" };
    }
    return { ...s, timeSlot: "evening" };
  }
  return s;
}

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export const getStudents = (): Student[] =>
  load<Student>(KEYS.students).map(migrateStudent);
export const saveStudents = (d: Student[]) => save(KEYS.students, d);

export const getTeachers = (): Teacher[] => load<Teacher>(KEYS.teachers);
export const saveTeachers = (d: Teacher[]) => save(KEYS.teachers, d);

/** Returns all shift names for a given teacher name */
export function getTeacherShifts(teacherName: string): string[] {
  const teachers = getTeachers();
  const teacher = teachers.find(
    (t) => t.name.toLowerCase() === teacherName.toLowerCase(),
  );
  if (!teacher) return [];
  if (teacher.shifts && teacher.shifts.length > 0) return teacher.shifts;
  if (Array.isArray(teacher.timeSlot)) return teacher.timeSlot;
  if (typeof teacher.timeSlot === "string" && teacher.timeSlot) {
    return teacher.timeSlot.split(",").map((s) => s.trim());
  }
  return [];
}

export const getAttendance = (): AttendanceRecord[] =>
  load<AttendanceRecord>(KEYS.attendance);
export const saveAttendance = (d: AttendanceRecord[]) =>
  save(KEYS.attendance, d);

export const getFees = (): FeeRecord[] => load<FeeRecord>(KEYS.fees);
export const saveFees = (d: FeeRecord[]) => save(KEYS.fees, d);

export const getSabakRecords = (): SabakRecord[] =>
  load<SabakRecord>(KEYS.sabak);
export const saveSabakRecords = (d: SabakRecord[]) => save(KEYS.sabak, d);

/** Add or update a single sabak record (matched by studentId+section) */
export function upsertSabakRecord(record: SabakRecord): void {
  const all = getSabakRecords();
  const idx = record.section
    ? all.findIndex(
        (r) => r.studentId === record.studentId && r.section === record.section,
      )
    : -1;
  if (idx >= 0) {
    all.unshift(record);
    all.splice(idx + 1, 1);
  } else {
    all.unshift(record);
  }
  saveSabakRecords(all);
}

/** Get latest record per section for a student */
export function getStudentSabakLatest(
  studentId: string,
): Partial<Record<string, SabakRecord>> {
  const all = getSabakRecords().filter(
    (r) => r.studentId === studentId && r.section,
  );
  const result: Partial<Record<string, SabakRecord>> = {};
  for (const r of all) {
    if (r.section && !result[r.section]) result[r.section] = r;
  }
  return result;
}

/** Get all records for a student+section (history) */
export function getSabakHistory(
  studentId: string,
  section: SabakRecord["section"],
): SabakRecord[] {
  return getSabakRecords().filter(
    (r) => r.studentId === studentId && r.section === section,
  );
}

// Backward-compat aliases
export const getSabak = getSabakRecords;
export const saveSabak = saveSabakRecords;

export const getNotices = (): Notice[] => load<Notice>(KEYS.notices);
export const saveNotices = (d: Notice[]) => save(KEYS.notices, d);

export const getGallery = (): GalleryItem[] => load<GalleryItem>(KEYS.gallery);
export const saveGallery = (d: GalleryItem[]) => save(KEYS.gallery, d);

export const getSession = (): Session | null =>
  loadSingle<Session>(KEYS.session);
export const saveSession = (s: Session): void =>
  localStorage.setItem(KEYS.session, JSON.stringify(s));
export const clearSession = (): void => localStorage.removeItem(KEYS.session);

// ─── Salary helpers ───────────────────────────────────────────────────────────

export const getSalaries = (): SalaryRecord[] =>
  load<SalaryRecord>(KEYS.salaries);
export const saveSalaries = (d: SalaryRecord[]) => save(KEYS.salaries, d);

// ─── Parent Activity helpers ──────────────────────────────────────────────────

export const getParentActivity = (): ParentActivity[] =>
  load<ParentActivity>(KEYS.parentActivity);
export const saveParentActivity = (d: ParentActivity[]) =>
  save(KEYS.parentActivity, d);

export function updateParentLastLogin(
  mobile: string,
  studentId: string,
  studentName: string,
): void {
  const activities = getParentActivity();
  const now = new Date().toISOString();
  const idx = activities.findIndex((a) => a.parentMobile === mobile);
  if (idx >= 0) {
    activities[idx].lastLogin = now;
    activities[idx].studentId = studentId;
    activities[idx].studentName = studentName;
  } else {
    activities.push({
      parentMobile: mobile,
      studentId,
      studentName,
      lastLogin: now,
      recentActivities: [],
    });
  }
  saveParentActivity(activities);
}

export function addParentActivity(mobile: string, action: string): void {
  const activities = getParentActivity();
  const now = new Date().toISOString();
  const idx = activities.findIndex((a) => a.parentMobile === mobile);
  const entry = { action, timestamp: now };
  if (idx >= 0) {
    activities[idx].recentActivities = [
      entry,
      ...activities[idx].recentActivities,
    ].slice(0, 20);
    saveParentActivity(activities);
  }
}

// ─── Admin Profile helpers ────────────────────────────────────────────────────

export function getAdminProfile(): AdminProfile | null {
  return loadSingle<AdminProfile>(KEYS.adminProfile);
}

export function saveAdminProfile(profile: AdminProfile): void {
  localStorage.setItem(KEYS.adminProfile, JSON.stringify(profile));
}

// ─── App Settings helpers ─────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  desktopView: false,
  academicYear: "2026-27",
};

export function getAppSettings(): AppSettings {
  const stored = loadSingle<AppSettings>(KEYS.appSettings);
  return stored ?? { ...DEFAULT_SETTINGS };
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.appSettings, JSON.stringify(settings));
}

export const loadAdminProfile = getAdminProfile;
export const loadAppSettings = getAppSettings;

// ─── Notification helpers ─────────────────────────────────────────────────────

export function getNotifications(): Notification[] {
  return load<Notification>(KEYS.notifications);
}

export function loadNotifications(): Notification[] {
  return getNotifications();
}

export function saveNotifications(items: Notification[]): void {
  save(KEYS.notifications, items);
}

export function saveNotification(n: Notification): void {
  const all = getNotifications();
  all.unshift(n);
  save(KEYS.notifications, all);
}

export function markNotificationRead(id: string): void {
  const all = getNotifications();
  const idx = all.findIndex((n) => n.id === id);
  if (idx >= 0) {
    all[idx].isRead = true;
    save(KEYS.notifications, all);
  }
}

export function markAllNotificationsRead(): void {
  const all = getNotifications().map((n) => ({ ...n, isRead: true }));
  save(KEYS.notifications, all);
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.isRead).length;
}

// ─── Ustaad Attendance helpers ────────────────────────────────────────────────

export function getUstaadAttendance(): UstaadAttendance[] {
  return load<UstaadAttendance>(KEYS.ustaadAttendance);
}

export function loadUstaadAttendance(): UstaadAttendance[] {
  return getUstaadAttendance();
}

export function saveUstaadAttendance(records: UstaadAttendance[]): void {
  save(KEYS.ustaadAttendance, records);
}

export function addUstaadAttendanceRecord(record: UstaadAttendance): void {
  const all = getUstaadAttendance();
  const idx = all.findIndex(
    (r) => r.ustaadName === record.ustaadName && r.date === record.date,
  );
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  save(KEYS.ustaadAttendance, all);
}

export function getUstaadAttendanceByDate(date: string): UstaadAttendance[] {
  return getUstaadAttendance().filter((r) => r.date === date);
}

// ─── Ustaad Profile helpers ───────────────────────────────────────────────────

export function getUstaadProfile(name: string): UstaadProfile | null {
  const all = load<UstaadProfile>(KEYS.ustaadProfiles);
  return all.find((p) => p.name === name) ?? null;
}

export function saveUstaadProfile(profile: UstaadProfile): void {
  const all = load<UstaadProfile>(KEYS.ustaadProfiles);
  const idx = all.findIndex((p) => p.name === profile.name);
  if (idx >= 0) {
    all[idx] = profile;
  } else {
    all.push(profile);
  }
  save(KEYS.ustaadProfiles, all);
}

export function getParentProfileByMobile(mobile: string): ParentProfile | null {
  const all = load<ParentProfile>(KEYS.parentProfiles);
  return all.find((p) => p.mobile === mobile) ?? null;
}

export function saveParentProfileRecord(profile: ParentProfile): void {
  const all = load<ParentProfile>(KEYS.parentProfiles);
  const idx = all.findIndex((p) => p.mobile === profile.mobile);
  if (idx >= 0) {
    all[idx] = profile;
  } else {
    all.push(profile);
  }
  save(KEYS.parentProfiles, all);
}

// ─── Activity Log helpers ─────────────────────────────────────────────────────

export function getActivityLog(): ActivityLog[] {
  return load<ActivityLog>(KEYS.activityLog);
}

export function addActivityLogEntry(
  entry: Omit<ActivityLog, "id" | "timestamp">,
): void {
  const all = getActivityLog();
  const newEntry: ActivityLog = {
    ...entry,
    id: createId(),
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...all].slice(0, 200);
  save(KEYS.activityLog, updated);
}

export function clearActivityLog(): void {
  localStorage.removeItem(KEYS.activityLog);
}

export const loadTeachers = getTeachers;
export const loadStudents = getStudents;
export const loadNotices = getNotices;

// ─── Init Default Settings ────────────────────────────────────────────────────

export function initDefaultSettings(): void {
  if (!localStorage.getItem(KEYS.appSettings)) {
    saveAppSettings({ ...DEFAULT_SETTINGS });
  }
  if (!localStorage.getItem(KEYS.adminProfile)) {
    saveAdminProfile({
      name: "Admin",
      designation: "Principal",
      email: "",
      phone: "",
      address: "Maktab Zaid Bin Sabit",
    });
  }
}

// ─── Seed (no-op — all data is added manually by Admin) ──────────────────────

export function seedDemoData(): void {
  // No demo data. System starts empty. Admin adds real data manually.
}

initDefaultSettings();
