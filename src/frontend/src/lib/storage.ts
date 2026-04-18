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
  className: string;
  teacherName: string;
  fees: number;
  feesStatus: "paid" | "pending";
}

export interface Teacher {
  id: string;
  name: string;
  className: string;
  mobile: string;
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
  lessonName: string;
  progress: number;
  remarks: string;
  updatedBy: string;
  updatedAt: string;
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
  teacherClass?: string;
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

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  students: "madrasa_students",
  teachers: "madrasa_teachers",
  attendance: "madrasa_attendance",
  fees: "madrasa_fees",
  sabak: "madrasa_sabak",
  notices: "madrasa_notices",
  gallery: "madrasa_gallery",
  session: "madrasa_session",
  salaries: "madrasa_salaries",
  parentActivity: "madrasa_parent_activity",
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

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export const getStudents = (): Student[] => load<Student>(KEYS.students);
export const saveStudents = (d: Student[]) => save(KEYS.students, d);

export const getTeachers = (): Teacher[] => load<Teacher>(KEYS.teachers);
export const saveTeachers = (d: Teacher[]) => save(KEYS.teachers, d);

export const getAttendance = (): AttendanceRecord[] =>
  load<AttendanceRecord>(KEYS.attendance);
export const saveAttendance = (d: AttendanceRecord[]) =>
  save(KEYS.attendance, d);

export const getFees = (): FeeRecord[] => load<FeeRecord>(KEYS.fees);
export const saveFees = (d: FeeRecord[]) => save(KEYS.fees, d);

export const getSabak = (): SabakRecord[] => load<SabakRecord>(KEYS.sabak);
export const saveSabak = (d: SabakRecord[]) => save(KEYS.sabak, d);

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

// ─── Seed Data ────────────────────────────────────────────────────────────────

export function seedDemoData(): void {
  // Only seed if no students exist yet
  if (localStorage.getItem(KEYS.students)) return;

  // Teachers — exact 5 teachers with proper class assignments
  const teachers: Teacher[] = [
    {
      id: "t1",
      name: "Shaikh Tareef",
      className: "Ibtidayyah",
      mobile: "9800000001",
    },
    {
      id: "t2",
      name: "Shaikh Zaid",
      className: "Nisf Qaidah",
      mobile: "9800000002",
    },
    {
      id: "t3",
      name: "Shaikh Irsad",
      className: "Mukammal Qaidah",
      mobile: "9800000003",
    },
    {
      id: "t4",
      name: "Hafiz Sajid",
      className: "Nazra",
      mobile: "9800000004",
    },
    {
      id: "t5",
      name: "Shaikh Adnan",
      className: "Hifz",
      mobile: "9800000005",
    },
  ];
  saveTeachers(teachers);

  // Students — 12 students distributed across classes, each with parentMobile
  const students: Student[] = [
    {
      id: "ms1",
      name: "Ahmed Ibrahim",
      fatherName: "Ibrahim Ali",
      parentMobile: "9000000001",
      className: "Ibtidayyah",
      teacherName: "Shaikh Tareef",
      fees: 1500,
      feesStatus: "paid",
    },
    {
      id: "ms2",
      name: "Zaid Hussain",
      fatherName: "Hussain Raza",
      parentMobile: "9000000002",
      className: "Ibtidayyah",
      teacherName: "Shaikh Tareef",
      fees: 1500,
      feesStatus: "pending",
    },
    {
      id: "ms3",
      name: "Omar Farooq",
      fatherName: "Farooq Umar",
      parentMobile: "9000000003",
      className: "Nisf Qaidah",
      teacherName: "Shaikh Zaid",
      fees: 1200,
      feesStatus: "paid",
    },
    {
      id: "ms4",
      name: "Ali Siddiqui",
      fatherName: "Siddiqui Anwar",
      parentMobile: "9000000004",
      className: "Nisf Qaidah",
      teacherName: "Shaikh Zaid",
      fees: 1200,
      feesStatus: "pending",
    },
    {
      id: "ms5",
      name: "Hassan Raza",
      fatherName: "Raza Karim",
      parentMobile: "9000000005",
      className: "Mukammal Qaidah",
      teacherName: "Shaikh Irsad",
      fees: 1000,
      feesStatus: "paid",
    },
    {
      id: "ms6",
      name: "Ibrahim Malik",
      fatherName: "Malik Yusuf",
      parentMobile: "9000000006",
      className: "Mukammal Qaidah",
      teacherName: "Shaikh Irsad",
      fees: 1000,
      feesStatus: "paid",
    },
    {
      id: "ms7",
      name: "Yusuf Ansari",
      fatherName: "Ansari Jameel",
      parentMobile: "9000000007",
      className: "Nazra",
      teacherName: "Hafiz Sajid",
      fees: 1000,
      feesStatus: "pending",
    },
    {
      id: "ms8",
      name: "Salman Sheikh",
      fatherName: "Sheikh Salim",
      parentMobile: "9000000008",
      className: "Nazra",
      teacherName: "Hafiz Sajid",
      fees: 1000,
      feesStatus: "paid",
    },
    {
      id: "ms9",
      name: "Bilal Qureshi",
      fatherName: "Qureshi Nasir",
      parentMobile: "9000000009",
      className: "Hifz",
      teacherName: "Shaikh Adnan",
      fees: 800,
      feesStatus: "pending",
    },
    {
      id: "ms10",
      name: "Tariq Mehmood",
      fatherName: "Mehmood Sadiq",
      parentMobile: "9000000010",
      className: "Hifz",
      teacherName: "Shaikh Adnan",
      fees: 800,
      feesStatus: "paid",
    },
    {
      id: "ms11",
      name: "Khalid Jamil",
      fatherName: "Jamil Bashir",
      parentMobile: "9000000011",
      className: "Nisf Amma Para",
      teacherName: "Shaikh Adnan",
      fees: 800,
      feesStatus: "paid",
    },
    {
      id: "ms12",
      name: "Usman Patel",
      fatherName: "Patel Rashid",
      parentMobile: "9000000012",
      className: "Mukammal Amma Para",
      teacherName: "Hafiz Sajid",
      fees: 800,
      feesStatus: "pending",
    },
  ];
  saveStudents(students);

  // Notices — 5 notices
  const notices: Notice[] = [
    {
      id: "nn1",
      title: "Monthly Fee Reminder — April 2026",
      message:
        "All students must clear April 2026 fees by the 20th. A late payment penalty of ₹50 will be applied after the due date.",
      date: "2026-04-10",
      createdBy: "Admin",
    },
    {
      id: "nn2",
      title: "Eid-ul-Fitr Holiday — Apr 21–23",
      message:
        "Maktab will remain closed for three days during Eid-ul-Fitr from April 21 to April 23. Classes resume on Wednesday, April 24. Eid Mubarak to all families!",
      date: "2026-04-08",
      createdBy: "Admin",
    },
    {
      id: "nn3",
      title: "Annual Quran Recitation Competition",
      message:
        "Registration is open for Naazra and Hifz students. The competition is on April 30. Prizes for top 3 participants. Register with your class teacher by April 25.",
      date: "2026-04-06",
      createdBy: "Admin",
    },
    {
      id: "nn4",
      title: "Parent-Teacher Meeting — April 19",
      message:
        "All parents are requested to attend on Saturday, April 19 at 10 AM in the main hall to discuss their child's progress, attendance, and fees status.",
      date: "2026-04-03",
      createdBy: "Admin",
    },
    {
      id: "nn5",
      title: "Tajweed Workshop — Every Thursday",
      message:
        "A special Tajweed workshop will be held every Thursday from 4:00 PM to 5:30 PM starting April 18. Attendance is mandatory for Hifz students.",
      date: "2026-04-01",
      createdBy: "Admin",
    },
  ];
  saveNotices(notices);

  // Attendance — 10 records (mix of present/absent)
  const today = new Date().toISOString().slice(0, 10);
  const attendance: AttendanceRecord[] = [
    {
      id: "na1",
      studentId: "ms1",
      studentName: "Ahmed Ibrahim",
      date: today,
      status: "present",
      markedBy: "Shaikh Tareef",
    },
    {
      id: "na2",
      studentId: "ms2",
      studentName: "Zaid Hussain",
      date: today,
      status: "absent",
      markedBy: "Shaikh Tareef",
    },
    {
      id: "na3",
      studentId: "ms3",
      studentName: "Omar Farooq",
      date: today,
      status: "present",
      markedBy: "Shaikh Zaid",
    },
    {
      id: "na4",
      studentId: "ms4",
      studentName: "Ali Siddiqui",
      date: today,
      status: "present",
      markedBy: "Shaikh Zaid",
    },
    {
      id: "na5",
      studentId: "ms5",
      studentName: "Hassan Raza",
      date: today,
      status: "absent",
      markedBy: "Shaikh Irsad",
    },
    {
      id: "na6",
      studentId: "ms6",
      studentName: "Ibrahim Malik",
      date: today,
      status: "present",
      markedBy: "Shaikh Irsad",
    },
    {
      id: "na7",
      studentId: "ms7",
      studentName: "Yusuf Ansari",
      date: today,
      status: "present",
      markedBy: "Hafiz Sajid",
    },
    {
      id: "na8",
      studentId: "ms8",
      studentName: "Salman Sheikh",
      date: today,
      status: "absent",
      markedBy: "Hafiz Sajid",
    },
    {
      id: "na9",
      studentId: "ms9",
      studentName: "Bilal Qureshi",
      date: today,
      status: "present",
      markedBy: "Shaikh Adnan",
    },
    {
      id: "na10",
      studentId: "ms10",
      studentName: "Tariq Mehmood",
      date: today,
      status: "present",
      markedBy: "Shaikh Adnan",
    },
  ];
  saveAttendance(attendance);

  // Fee records — 10 records (mix of paid/pending, different months)
  const feeRecords: FeeRecord[] = [
    {
      id: "nf1",
      studentId: "ms1",
      studentName: "Ahmed Ibrahim",
      month: "April 2026",
      amount: 1500,
      status: "paid",
    },
    {
      id: "nf2",
      studentId: "ms2",
      studentName: "Zaid Hussain",
      month: "April 2026",
      amount: 1500,
      status: "pending",
    },
    {
      id: "nf3",
      studentId: "ms3",
      studentName: "Omar Farooq",
      month: "April 2026",
      amount: 1200,
      status: "paid",
    },
    {
      id: "nf4",
      studentId: "ms4",
      studentName: "Ali Siddiqui",
      month: "April 2026",
      amount: 1200,
      status: "pending",
    },
    {
      id: "nf5",
      studentId: "ms5",
      studentName: "Hassan Raza",
      month: "April 2026",
      amount: 1000,
      status: "paid",
    },
    {
      id: "nf6",
      studentId: "ms6",
      studentName: "Ibrahim Malik",
      month: "March 2026",
      amount: 1000,
      status: "paid",
    },
    {
      id: "nf7",
      studentId: "ms7",
      studentName: "Yusuf Ansari",
      month: "April 2026",
      amount: 1000,
      status: "pending",
    },
    {
      id: "nf8",
      studentId: "ms8",
      studentName: "Salman Sheikh",
      month: "March 2026",
      amount: 1000,
      status: "paid",
    },
    {
      id: "nf9",
      studentId: "ms9",
      studentName: "Bilal Qureshi",
      month: "April 2026",
      amount: 800,
      status: "pending",
    },
    {
      id: "nf10",
      studentId: "ms10",
      studentName: "Tariq Mehmood",
      month: "February 2026",
      amount: 800,
      status: "paid",
    },
  ];
  saveFees(feeRecords);

  // Sabak records — 8 records with lesson names, progress%, remarks
  const sabakRecords: SabakRecord[] = [
    {
      id: "ns1",
      studentId: "ms1",
      studentName: "Ahmed Ibrahim",
      lessonName: "Para 28 — Al-Mujadila",
      progress: 82,
      remarks: "Tajweed is very strong. Keep up the momentum.",
      updatedBy: "Shaikh Tareef",
      updatedAt: "2026-04-16",
    },
    {
      id: "ns2",
      studentId: "ms2",
      studentName: "Zaid Hussain",
      lessonName: "Surah Al-Baqarah (p.2)",
      progress: 55,
      remarks: "Recitation is clear; work on pronunciation of ض and ظ.",
      updatedBy: "Shaikh Tareef",
      updatedAt: "2026-04-16",
    },
    {
      id: "ns3",
      studentId: "ms3",
      studentName: "Omar Farooq",
      lessonName: "Para 22 — Al-Ahzab",
      progress: 75,
      remarks: "Good retention; needs to revise Para 20–21 for consistency.",
      updatedBy: "Shaikh Zaid",
      updatedAt: "2026-04-15",
    },
    {
      id: "ns4",
      studentId: "ms4",
      studentName: "Ali Siddiqui",
      lessonName: "Lesson 8 — Basic Reading",
      progress: 40,
      remarks: "Struggling with long vowels. Extra practice needed daily.",
      updatedBy: "Shaikh Zaid",
      updatedAt: "2026-04-16",
    },
    {
      id: "ns5",
      studentId: "ms5",
      studentName: "Hassan Raza",
      lessonName: "Surah Aal-Imran",
      progress: 75,
      remarks: "Excellent fluency and speed. Ready for Hifz evaluation.",
      updatedBy: "Shaikh Irsad",
      updatedAt: "2026-04-14",
    },
    {
      id: "ns6",
      studentId: "ms6",
      studentName: "Ibrahim Malik",
      lessonName: "Lesson 4 — Nurani Qaida",
      progress: 40,
      remarks: "Basics need reinforcement. Parents should practice at home.",
      updatedBy: "Shaikh Irsad",
      updatedAt: "2026-04-16",
    },
    {
      id: "ns7",
      studentId: "ms7",
      studentName: "Yusuf Ansari",
      lessonName: "Para 30 — Al-Naba",
      progress: 88,
      remarks: "Near completion of Quran. Exceptional student.",
      updatedBy: "Hafiz Sajid",
      updatedAt: "2026-04-16",
    },
    {
      id: "ns8",
      studentId: "ms9",
      studentName: "Bilal Qureshi",
      lessonName: "Lesson 6 — Nurani Qaida",
      progress: 60,
      remarks: "Good improvement this month. Maintain the daily routine.",
      updatedBy: "Shaikh Adnan",
      updatedAt: "2026-04-17",
    },
  ];
  saveSabak(sabakRecords);

  // Salary records — sample salary data for teachers
  const salaryRecords: SalaryRecord[] = [
    {
      id: "sal1",
      teacherId: "t1",
      teacherName: "Shaikh Tareef",
      month: "April",
      year: "2026",
      amount: 8000,
      status: "paid",
      paidDate: "2026-04-05",
    },
    {
      id: "sal2",
      teacherId: "t2",
      teacherName: "Shaikh Zaid",
      month: "April",
      year: "2026",
      amount: 7500,
      status: "pending",
    },
    {
      id: "sal3",
      teacherId: "t3",
      teacherName: "Shaikh Irsad",
      month: "April",
      year: "2026",
      amount: 7500,
      status: "pending",
    },
    {
      id: "sal4",
      teacherId: "t4",
      teacherName: "Hafiz Sajid",
      month: "April",
      year: "2026",
      amount: 9000,
      status: "paid",
      paidDate: "2026-04-06",
    },
    {
      id: "sal5",
      teacherId: "t5",
      teacherName: "Shaikh Adnan",
      month: "April",
      year: "2026",
      amount: 10000,
      status: "pending",
    },
  ];
  saveSalaries(salaryRecords);

  // Gallery — 3 placeholder items
  const gallery: GalleryItem[] = [
    {
      id: "ng1",
      title: "Annual Prize Distribution 2026",
      url: "/assets/images/placeholder.svg",
      type: "image",
      addedAt: "2026-04-01",
      uploadedBy: "Admin",
    },
    {
      id: "ng2",
      title: "Quran Recitation Competition",
      url: "/assets/images/placeholder.svg",
      type: "image",
      addedAt: "2026-03-15",
      uploadedBy: "Admin",
      classTag: "Hifz",
    },
    {
      id: "ng3",
      title: "Parent-Teacher Meeting Highlights",
      url: "/assets/images/placeholder.svg",
      type: "image",
      addedAt: "2026-03-01",
      uploadedBy: "Admin",
    },
  ];
  saveGallery(gallery);
}

// Auto-seed on first load
seedDemoData();
