// Centralized data store for Madrasa Management System
// All data operations go through Supabase. Session stays in localStorage.

import { supabase } from "./supabase";

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
  /** @deprecated Use timeSlot instead. */
  className?: string;
}

export interface Teacher {
  id: string;
  name: string;
  /** Sessions this Ustaad teaches. */
  shifts?: string[];
  /** Sessions this Ustaad teaches (comma-separated or array). */
  timeSlot?: string | string[];
  mobile: string;
  mobileNumber?: string;
  salary?: number;
  /** @deprecated */
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
  surahName?: string;
  ayatNumber?: number;
  countCompleted?: number;
  qaida?: string;
  ammaPara?: string;
  quran?: string;
  dua?: string;
  hadees?: string;
  urdu?: string;
  hifz?: string;
  lessonName?: string;
  progress?: number;
  sabakType?: "urdu" | "dua" | "hadees" | "manual";
  sabakManual?: string;
}

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
  /** @deprecated */
  teacherClass?: string;
  teacherTimeSlot?: string;
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

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: "admin" | "ustaad";
  action: "added_student" | "removed_student" | "updated_student";
  targetStudentName: string;
  details?: string;
}

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

// ─── Session (localStorage only — auth state) ─────────────────────────────────

const SESSION_KEY = "madrasa_session";

export const getSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
};

export const saveSession = (s: Session): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

// ─── Admin Profile (localStorage — device-level settings) ────────────────────

const ADMIN_PROFILE_KEY = "madrasa_admin_profile";
const APP_SETTINGS_KEY = "madrasa_app_settings";

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  desktopView: false,
  academicYear: "2026-27",
};

export function getAdminProfile(): AdminProfile | null {
  try {
    const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as AdminProfile) : null;
  } catch {
    return null;
  }
}

export function saveAdminProfile(profile: AdminProfile): void {
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as AppSettings) : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveAppSettings(settings: AppSettings): void {
  localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
}

export const loadAdminProfile = getAdminProfile;
export const loadAppSettings = getAppSettings;

// ─── Column name helpers ──────────────────────────────────────────────────────

/** Map snake_case DB rows → camelCase Student objects */
// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToStudent(row: Record<string, any>): Student {
  return {
    id: row.id,
    name: row.name,
    fatherName: row.father_name ?? "",
    parentMobile: row.parent_mobile ?? "",
    timeSlot: row.time_slot ?? "",
    teacherName: row.teacher_name ?? "",
    fees: Number(row.fees ?? 0),
    feesStatus: row.fees_status ?? "pending",
    address: row.address ?? "",
    rollNumber: row.roll_number ?? "",
    admissionDate: row.admission_date ?? "",
    studentClass: row.student_class ?? "",
    className: row.class_name ?? "",
  };
}

function studentToRow(s: Student): Record<string, unknown> {
  return {
    id: s.id,
    name: s.name,
    father_name: s.fatherName,
    parent_mobile: s.parentMobile,
    time_slot: s.timeSlot,
    teacher_name: s.teacherName,
    fees: s.fees,
    fees_status: s.feesStatus,
    address: s.address ?? "",
    roll_number: s.rollNumber ?? "",
    admission_date: s.admissionDate ?? "",
    student_class: s.studentClass ?? "",
    class_name: s.className ?? "",
  };
}

function teacherToRow(t: Teacher): Record<string, unknown> {
  const shifts = t.shifts ?? [];
  return {
    id: t.id,
    name: t.name,
    mobile: t.mobile,
    mobile_number: t.mobileNumber ?? "",
    salary: t.salary ?? 0,
    shifts: JSON.stringify(shifts),
    time_slot: Array.isArray(t.timeSlot)
      ? t.timeSlot.join(",")
      : (t.timeSlot ?? ""),
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToAttendance(row: Record<string, any>): AttendanceRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name ?? "",
    date: row.date,
    status: row.status,
    markedBy: row.marked_by ?? "",
  };
}

function attendanceToRow(r: AttendanceRecord): Record<string, unknown> {
  return {
    id: r.id,
    student_id: r.studentId,
    student_name: r.studentName,
    date: r.date,
    status: r.status,
    marked_by: r.markedBy,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToFee(row: Record<string, any>): FeeRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name ?? "",
    month: row.month,
    amount: Number(row.amount ?? 0),
    status: row.status,
  };
}

function feeToRow(f: FeeRecord): Record<string, unknown> {
  return {
    id: f.id,
    student_id: f.studentId,
    student_name: f.studentName,
    month: f.month,
    amount: f.amount,
    status: f.status,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToSabak(row: Record<string, any>): SabakRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name ?? "",
    section: row.section || undefined,
    currentLesson: row.current_lesson ?? "",
    previousLesson: row.previous_lesson ?? "",
    progressPercent: Number(row.progress_percent ?? 0),
    remarks: row.remarks ?? "",
    updatedBy: row.updated_by ?? "",
    updatedAt: row.updated_at ?? "",
    surahName: row.surah_name ?? "",
    ayatNumber: Number(row.ayat_number ?? 0),
    countCompleted: Number(row.count_completed ?? 0),
    qaida: row.qaida ?? "",
    ammaPara: row.amma_para ?? "",
    quran: row.quran ?? "",
    dua: row.dua ?? "",
    hadees: row.hadees ?? "",
    urdu: row.urdu ?? "",
    hifz: row.hifz ?? "",
    lessonName: row.lesson_name ?? "",
    progress: Number(row.progress ?? 0),
    sabakType: row.sabak_type || undefined,
    sabakManual: row.sabak_manual ?? "",
  };
}

function sabakToRow(r: SabakRecord): Record<string, unknown> {
  return {
    id: r.id,
    student_id: r.studentId,
    student_name: r.studentName,
    section: r.section ?? "",
    current_lesson: r.currentLesson ?? "",
    previous_lesson: r.previousLesson ?? "",
    progress_percent: r.progressPercent ?? 0,
    remarks: r.remarks,
    updated_by: r.updatedBy,
    updated_at: r.updatedAt,
    surah_name: r.surahName ?? "",
    ayat_number: r.ayatNumber ?? 0,
    count_completed: r.countCompleted ?? 0,
    qaida: r.qaida ?? "",
    amma_para: r.ammaPara ?? "",
    quran: r.quran ?? "",
    dua: r.dua ?? "",
    hadees: r.hadees ?? "",
    urdu: r.urdu ?? "",
    hifz: r.hifz ?? "",
    lesson_name: r.lessonName ?? "",
    progress: r.progress ?? 0,
    sabak_type: r.sabakType ?? "",
    sabak_manual: r.sabakManual ?? "",
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToNotice(row: Record<string, any>): Notice {
  return {
    id: row.id,
    title: row.title,
    message: row.message ?? "",
    date: row.date ?? "",
    createdBy: row.created_by ?? "",
  };
}

function noticeToRow(n: Notice): Record<string, unknown> {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    date: n.date,
    created_by: n.createdBy,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToGallery(row: Record<string, any>): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url ?? "",
    type: row.type ?? "image",
    addedAt: row.added_at ?? "",
    uploadedBy: row.uploaded_by ?? "",
    classTag: row.class_tag ?? "",
  };
}

function galleryToRow(g: GalleryItem): Record<string, unknown> {
  return {
    id: g.id,
    title: g.title,
    url: g.url,
    type: g.type,
    added_at: g.addedAt,
    uploaded_by: g.uploadedBy ?? "",
    class_tag: g.classTag ?? "",
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToSalary(row: Record<string, any>): SalaryRecord {
  return {
    id: row.id,
    teacherId: row.teacher_id ?? "",
    teacherName: row.teacher_name ?? "",
    month: row.month ?? "",
    year: row.year ?? "",
    amount: Number(row.amount ?? 0),
    status: row.status ?? "pending",
    paidDate: row.paid_date ?? "",
  };
}

function salaryToRow(r: SalaryRecord): Record<string, unknown> {
  return {
    id: r.id,
    teacher_id: r.teacherId,
    teacher_name: r.teacherName,
    month: r.month,
    year: r.year,
    amount: r.amount,
    status: r.status,
    paid_date: r.paidDate ?? "",
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToActivityLog(row: Record<string, any>): ActivityLog {
  return {
    id: row.id,
    timestamp: row.timestamp ?? "",
    actorName: row.actor_name ?? "",
    actorRole: row.actor_role ?? "admin",
    action: row.action ?? "added_student",
    targetStudentName: row.target_student_name ?? "",
    details: row.details ?? "",
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToNotification(row: Record<string, any>): Notification {
  return {
    id: row.id,
    title: row.title ?? "",
    message: row.message ?? "",
    date: row.date ?? "",
    isRead: row.is_read ?? false,
    type: row.type ?? "info",
    timestamp: row.timestamp ?? "",
    forRole: row.for_role ?? "all",
  };
}

function notificationToRow(n: Notification): Record<string, unknown> {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    date: n.date,
    is_read: n.isRead,
    type: n.type ?? "info",
    timestamp: n.timestamp ?? "",
    for_role: n.forRole ?? "all",
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToUstaadAttendance(row: Record<string, any>): UstaadAttendance {
  return {
    id: row.id,
    ustaadId: row.ustaad_id ?? "",
    ustaadName: row.ustaad_name ?? "",
    date: row.date ?? "",
    status: row.status ?? "present",
    notes: row.notes ?? "",
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToUstaadProfile(row: Record<string, any>): UstaadProfile {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    bio: row.bio ?? "",
    timeSlot: row.time_slot ?? "",
    address: row.address ?? "",
    profileImage: row.profile_image ?? "",
    createdAt: row.created_at ?? "",
  };
}

// biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
function rowToParentProfile(row: Record<string, any>): ParentProfile {
  return {
    mobile: row.mobile,
    name: row.name ?? "",
    address: row.address ?? "",
    profileImage: row.profile_image ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

// ─── Students ─────────────────────────────────────────────────────────────────

export async function getStudents(): Promise<Student[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase] getStudents:", error.message);
      return [];
    }
    return (data ?? []).map(rowToStudent);
  } catch (e) {
    console.error("[Supabase] getStudents exception:", e);
    return [];
  }
}

export async function saveStudents(students: Student[]): Promise<void> {
  if (!supabase || students.length === 0) return;
  try {
    const { error } = await supabase
      .from("students")
      .upsert(students.map(studentToRow));
    if (error) console.error("[Supabase] saveStudents:", error.message);
  } catch (e) {
    console.error("[Supabase] saveStudents exception:", e);
  }
}

export async function addStudent(student: Student): Promise<Student> {
  if (!supabase) return student;
  try {
    const { error } = await supabase
      .from("students")
      .insert(studentToRow(student));
    if (error) console.error("[Supabase] addStudent:", error.message);
  } catch (e) {
    console.error("[Supabase] addStudent exception:", e);
  }
  return student;
}

export async function updateStudent(student: Student): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("students")
      .upsert(studentToRow(student));
    if (error) console.error("[Supabase] updateStudent:", error.message);
  } catch (e) {
    console.error("[Supabase] updateStudent exception:", e);
  }
}

export async function deleteStudent(id: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) console.error("[Supabase] deleteStudent:", error.message);
  } catch (e) {
    console.error("[Supabase] deleteStudent exception:", e);
  }
}

// ─── Teachers ─────────────────────────────────────────────────────────────────

export async function getTeachers(): Promise<Teacher[]> {
  console.log("Fetching teachers...");
  if (!supabase) {
    console.warn(
      "[Supabase] getTeachers: Supabase not configured — returning []",
    );
    return [];
  }
  try {
    const { data, error } = await supabase.from("teachers").select("*");
    if (error) {
      console.error("Fetch error:", error);
      return [];
    }
    console.log("Teachers:", data);
    // biome-ignore lint/suspicious/noExplicitAny: db row shape unknown at compile time
    return (data || []).map((row: Record<string, any>) => ({
      id: row.id,
      name: row.name,
      mobile: row.mobile ?? "",
      // support both 'session' (new inserts) and 'time_slot' (legacy)
      timeSlot: row.session ?? row.time_slot ?? "",
      shifts: [],
    }));
  } catch (e) {
    console.error("[Supabase] getTeachers exception:", e);
    return [];
  }
}

export async function saveTeachers(teachers: Teacher[]): Promise<void> {
  if (!supabase || teachers.length === 0) return;
  try {
    const { error } = await supabase
      .from("teachers")
      .upsert(teachers.map(teacherToRow));
    if (error) console.error("[Supabase] saveTeachers:", error.message);
  } catch (e) {
    console.error("[Supabase] saveTeachers exception:", e);
  }
}

export async function addTeacher(
  name: string,
  mobile: string,
  session: string,
): Promise<unknown> {
  console.log("Adding teacher:", name, mobile, session);
  if (!supabase) {
    console.warn(
      "[Supabase] addTeacher: Supabase not configured — skipping insert",
    );
    return null;
  }
  try {
    const { data, error } = await supabase
      .from("teachers")
      .insert([{ name, mobile, session }]);
    if (error) {
      console.error("Insert error:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("[Supabase] addTeacher exception:", e);
    return null;
  }
}

export async function deleteTeacher(id: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) console.error("[Supabase] deleteTeacher:", error.message);
  } catch (e) {
    console.error("[Supabase] deleteTeacher exception:", e);
  }
}

/** Returns all shift names for a given teacher name */
export async function getTeacherShifts(teacherName: string): Promise<string[]> {
  const teachers = await getTeachers();
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

// ─── Attendance ───────────────────────────────────────────────────────────────

export async function getAttendance(): Promise<AttendanceRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      console.error("[Supabase] getAttendance:", error.message);
      return [];
    }
    return (data ?? []).map(rowToAttendance);
  } catch (e) {
    console.error("[Supabase] getAttendance exception:", e);
    return [];
  }
}

export async function saveAttendance(
  records: AttendanceRecord[],
): Promise<void> {
  if (!supabase || records.length === 0) return;
  try {
    const { error } = await supabase
      .from("attendance")
      .upsert(records.map(attendanceToRow));
    if (error) console.error("[Supabase] saveAttendance:", error.message);
  } catch (e) {
    console.error("[Supabase] saveAttendance exception:", e);
  }
}

// ─── Fees ─────────────────────────────────────────────────────────────────────

export async function getFees(): Promise<FeeRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("fees")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase] getFees:", error.message);
      return [];
    }
    return (data ?? []).map(rowToFee);
  } catch (e) {
    console.error("[Supabase] getFees exception:", e);
    return [];
  }
}

export async function saveFees(fees: FeeRecord[]): Promise<void> {
  if (!supabase || fees.length === 0) return;
  try {
    const { error } = await supabase.from("fees").upsert(fees.map(feeToRow));
    if (error) console.error("[Supabase] saveFees:", error.message);
  } catch (e) {
    console.error("[Supabase] saveFees exception:", e);
  }
}

// ─── Sabak Records ────────────────────────────────────────────────────────────

export async function getSabakRecords(): Promise<SabakRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("sabak_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase] getSabakRecords:", error.message);
      return [];
    }
    return (data ?? []).map(rowToSabak);
  } catch (e) {
    console.error("[Supabase] getSabakRecords exception:", e);
    return [];
  }
}

export async function saveSabakRecords(records: SabakRecord[]): Promise<void> {
  if (!supabase || records.length === 0) return;
  try {
    const { error } = await supabase
      .from("sabak_records")
      .upsert(records.map(sabakToRow));
    if (error) console.error("[Supabase] saveSabakRecords:", error.message);
  } catch (e) {
    console.error("[Supabase] saveSabakRecords exception:", e);
  }
}

export async function upsertSabakRecord(record: SabakRecord): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("sabak_records")
      .upsert(sabakToRow(record));
    if (error) console.error("[Supabase] upsertSabakRecord:", error.message);
  } catch (e) {
    console.error("[Supabase] upsertSabakRecord exception:", e);
  }
}

export async function getStudentSabakLatest(
  studentId: string,
): Promise<Partial<Record<string, SabakRecord>>> {
  const all = await getSabakRecords();
  const studentRecords = all.filter(
    (r) => r.studentId === studentId && r.section,
  );
  const result: Partial<Record<string, SabakRecord>> = {};
  for (const r of studentRecords) {
    if (r.section && !result[r.section]) result[r.section] = r;
  }
  return result;
}

export async function getSabakHistory(
  studentId: string,
  section: SabakRecord["section"],
): Promise<SabakRecord[]> {
  const all = await getSabakRecords();
  return all.filter((r) => r.studentId === studentId && r.section === section);
}

// Backward-compat aliases
export const getSabak = getSabakRecords;
export const saveSabak = saveSabakRecords;

// ─── Notices ──────────────────────────────────────────────────────────────────

export async function getNotices(): Promise<Notice[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase] getNotices:", error.message);
      return [];
    }
    return (data ?? []).map(rowToNotice);
  } catch (e) {
    console.error("[Supabase] getNotices exception:", e);
    return [];
  }
}

export async function saveNotices(notices: Notice[]): Promise<void> {
  if (!supabase || notices.length === 0) return;
  try {
    const { error } = await supabase
      .from("notices")
      .upsert(notices.map(noticeToRow));
    if (error) console.error("[Supabase] saveNotices:", error.message);
  } catch (e) {
    console.error("[Supabase] saveNotices exception:", e);
  }
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export async function getGallery(): Promise<GalleryItem[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase] getGallery:", error.message);
      return [];
    }
    return (data ?? []).map(rowToGallery);
  } catch (e) {
    console.error("[Supabase] getGallery exception:", e);
    return [];
  }
}

export async function saveGallery(items: GalleryItem[]): Promise<void> {
  if (!supabase || items.length === 0) return;
  try {
    const { error } = await supabase
      .from("gallery")
      .upsert(items.map(galleryToRow));
    if (error) console.error("[Supabase] saveGallery:", error.message);
  } catch (e) {
    console.error("[Supabase] saveGallery exception:", e);
  }
}

// ─── Salaries ─────────────────────────────────────────────────────────────────

export async function getSalaries(): Promise<SalaryRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("salaries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase] getSalaries:", error.message);
      return [];
    }
    return (data ?? []).map(rowToSalary);
  } catch (e) {
    console.error("[Supabase] getSalaries exception:", e);
    return [];
  }
}

export async function saveSalaries(records: SalaryRecord[]): Promise<void> {
  if (!supabase || records.length === 0) return;
  try {
    const { error } = await supabase
      .from("salaries")
      .upsert(records.map(salaryToRow));
    if (error) console.error("[Supabase] saveSalaries:", error.message);
  } catch (e) {
    console.error("[Supabase] saveSalaries exception:", e);
  }
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

export async function getActivityLog(): Promise<ActivityLog[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[Supabase] getActivityLog:", error.message);
      return [];
    }
    return (data ?? []).map(rowToActivityLog);
  } catch (e) {
    console.error("[Supabase] getActivityLog exception:", e);
    return [];
  }
}

export async function addActivityLogEntry(
  entry: Omit<ActivityLog, "id" | "timestamp">,
): Promise<void> {
  if (!supabase) return;
  const newEntry: ActivityLog = {
    ...entry,
    id: createId(),
    timestamp: new Date().toISOString(),
  };
  try {
    const { error } = await supabase.from("activity_log").insert({
      id: newEntry.id,
      timestamp: newEntry.timestamp,
      actor_name: newEntry.actorName,
      actor_role: newEntry.actorRole,
      action: newEntry.action,
      target_student_name: newEntry.targetStudentName,
      details: newEntry.details ?? "",
    });
    if (error) console.error("[Supabase] addActivityLogEntry:", error.message);
  } catch (e) {
    console.error("[Supabase] addActivityLogEntry exception:", e);
  }
}

export async function clearActivityLog(): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("activity_log")
      .delete()
      .neq("id", "");
    if (error) console.error("[Supabase] clearActivityLog:", error.message);
  } catch (e) {
    console.error("[Supabase] clearActivityLog exception:", e);
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<Notification[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase] getNotifications:", error.message);
      return [];
    }
    return (data ?? []).map(rowToNotification);
  } catch (e) {
    console.error("[Supabase] getNotifications exception:", e);
    return [];
  }
}

export const loadNotifications = getNotifications;

export async function saveNotifications(items: Notification[]): Promise<void> {
  if (!supabase || items.length === 0) return;
  try {
    const { error } = await supabase
      .from("notifications")
      .upsert(items.map(notificationToRow));
    if (error) console.error("[Supabase] saveNotifications:", error.message);
  } catch (e) {
    console.error("[Supabase] saveNotifications exception:", e);
  }
}

export async function saveNotification(n: Notification): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("notifications")
      .insert(notificationToRow(n));
    if (error) console.error("[Supabase] saveNotification:", error.message);
  } catch (e) {
    console.error("[Supabase] saveNotification exception:", e);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) console.error("[Supabase] markNotificationRead:", error.message);
  } catch (e) {
    console.error("[Supabase] markNotificationRead exception:", e);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);
    if (error)
      console.error("[Supabase] markAllNotificationsRead:", error.message);
  } catch (e) {
    console.error("[Supabase] markAllNotificationsRead exception:", e);
  }
}

export async function getUnreadCount(): Promise<number> {
  if (!supabase) return 0;
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    if (error) {
      console.error("[Supabase] getUnreadCount:", error.message);
      return 0;
    }
    return count ?? 0;
  } catch (e) {
    console.error("[Supabase] getUnreadCount exception:", e);
    return 0;
  }
}

// ─── Ustaad Attendance ────────────────────────────────────────────────────────

export async function getUstaadAttendance(): Promise<UstaadAttendance[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("ustaad_attendance")
      .select("*")
      .order("date", { ascending: false });
    if (error) {
      console.error("[Supabase] getUstaadAttendance:", error.message);
      return [];
    }
    return (data ?? []).map(rowToUstaadAttendance);
  } catch (e) {
    console.error("[Supabase] getUstaadAttendance exception:", e);
    return [];
  }
}

export const loadUstaadAttendance = getUstaadAttendance;

export async function saveUstaadAttendance(
  records: UstaadAttendance[],
): Promise<void> {
  if (!supabase || records.length === 0) return;
  try {
    const { error } = await supabase.from("ustaad_attendance").upsert(
      records.map((r) => ({
        id: r.id,
        ustaad_id: r.ustaadId,
        ustaad_name: r.ustaadName,
        date: r.date,
        status: r.status,
        notes: r.notes ?? "",
      })),
    );
    if (error) console.error("[Supabase] saveUstaadAttendance:", error.message);
  } catch (e) {
    console.error("[Supabase] saveUstaadAttendance exception:", e);
  }
}

export async function addUstaadAttendanceRecord(
  record: UstaadAttendance,
): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("ustaad_attendance").upsert({
      id: record.id,
      ustaad_id: record.ustaadId,
      ustaad_name: record.ustaadName,
      date: record.date,
      status: record.status,
      notes: record.notes ?? "",
    });
    if (error)
      console.error("[Supabase] addUstaadAttendanceRecord:", error.message);
  } catch (e) {
    console.error("[Supabase] addUstaadAttendanceRecord exception:", e);
  }
}

export async function getUstaadAttendanceByDate(
  date: string,
): Promise<UstaadAttendance[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("ustaad_attendance")
      .select("*")
      .eq("date", date);
    if (error) {
      console.error("[Supabase] getUstaadAttendanceByDate:", error.message);
      return [];
    }
    return (data ?? []).map(rowToUstaadAttendance);
  } catch (e) {
    console.error("[Supabase] getUstaadAttendanceByDate exception:", e);
    return [];
  }
}

// ─── Ustaad Profile ───────────────────────────────────────────────────────────

export async function getUstaadProfile(
  name: string,
): Promise<UstaadProfile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("ustaad_profiles")
      .select("*")
      .eq("name", name)
      .maybeSingle();
    if (error) {
      console.error("[Supabase] getUstaadProfile:", error.message);
      return null;
    }
    return data ? rowToUstaadProfile(data) : null;
  } catch (e) {
    console.error("[Supabase] getUstaadProfile exception:", e);
    return null;
  }
}

export async function saveUstaadProfile(profile: UstaadProfile): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("ustaad_profiles").upsert({
      id: profile.id,
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      bio: profile.bio,
      time_slot: profile.timeSlot,
      address: profile.address ?? "",
      profile_image: profile.profileImage ?? "",
      created_at: profile.createdAt,
    });
    if (error) console.error("[Supabase] saveUstaadProfile:", error.message);
  } catch (e) {
    console.error("[Supabase] saveUstaadProfile exception:", e);
  }
}

// ─── Parent Profile ───────────────────────────────────────────────────────────

export async function getParentProfileByMobile(
  mobile: string,
): Promise<ParentProfile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("parent_profiles")
      .select("*")
      .eq("mobile", mobile)
      .maybeSingle();
    if (error) {
      console.error("[Supabase] getParentProfileByMobile:", error.message);
      return null;
    }
    return data ? rowToParentProfile(data) : null;
  } catch (e) {
    console.error("[Supabase] getParentProfileByMobile exception:", e);
    return null;
  }
}

export async function saveParentProfileRecord(
  profile: ParentProfile,
): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("parent_profiles").upsert({
      mobile: profile.mobile,
      name: profile.name,
      address: profile.address,
      profile_image: profile.profileImage ?? "",
      updated_at: profile.updatedAt,
    });
    if (error)
      console.error("[Supabase] saveParentProfileRecord:", error.message);
  } catch (e) {
    console.error("[Supabase] saveParentProfileRecord exception:", e);
  }
}

// ─── Parent Activity (no longer persisted — session-local only) ───────────────

export function getParentActivity(): ParentActivity[] {
  return [];
}

export function updateParentLastLogin(
  _mobile: string,
  _studentId: string,
  _studentName: string,
): void {
  // No-op: Parent activity tracking removed from persistent store.
}

export function addParentActivity(_mobile: string, _action: string): void {
  // No-op: Parent activity tracking is session-local only.
}

export function saveParentActivity(_d: ParentActivity[]): void {
  // No-op
}

// ─── Backward-compat aliases ──────────────────────────────────────────────────

export const loadTeachers = getTeachers;
export const loadStudents = getStudents;
export const loadNotices = getNotices;

// ─── Init (no-op — settings stored locally) ───────────────────────────────────

export function initDefaultSettings(): void {
  if (!localStorage.getItem("madrasa_app_settings")) {
    saveAppSettings({ ...DEFAULT_SETTINGS });
  }
  if (!localStorage.getItem("madrasa_admin_profile")) {
    saveAdminProfile({
      name: "Admin",
      designation: "Principal",
      email: "",
      phone: "",
      address: "Maktab Zaid Bin Sabit",
    });
  }
}

export function seedDemoData(): void {
  // No demo data. System starts empty. Admin adds real data manually.
}

initDefaultSettings();
