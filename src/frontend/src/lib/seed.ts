import {
  type AcademicRecord,
  AttendanceStatus,
  type FeeRecord,
  FeesPaymentStatus,
  FeesStatus,
  type Student,
  type Teacher,
} from "../types";

const SEED_DONE_KEY = "maktab_seed_done";
const KEYS = {
  students: "maktab_students",
  teachers: "maktab_teachers",
  attendance: "maktab_attendance",
  academic: "maktab_academic",
  fees: "maktab_fees",
};

function setLS<T>(key: string, value: T): void {
  localStorage.setItem(
    key,
    JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? `${v}n` : v)),
  );
}

function getLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw, (_k, v) => {
      if (typeof v === "string" && /^\d+n$/.test(v))
        return BigInt(v.slice(0, -1));
      return v;
    }) as T;
  } catch {
    return fallback;
  }
}

export function seedDataIfEmpty(): void {
  if (localStorage.getItem(SEED_DONE_KEY)) return;

  const existingStudents = getLS<Student[]>(KEYS.students, []);
  const existingTeachers = getLS<Teacher[]>(KEYS.teachers, []);
  if (existingStudents.length > 0 || existingTeachers.length > 0) {
    localStorage.setItem(SEED_DONE_KEY, "true");
    return;
  }

  const now = BigInt(Date.now());

  const teachers: Teacher[] = [
    {
      id: "teacher-001",
      name: "Maulana Abdul Hameed",
      class: "Naazra",
      mobile: "03001234567",
      mobileNumber: "03001234567",
      createdAt: now,
    },
    {
      id: "teacher-002",
      name: "Hafiz Muhammad Yousuf",
      class: "Hifz",
      mobile: "03112345678",
      mobileNumber: "03112345678",
      createdAt: now,
    },
    {
      id: "teacher-003",
      name: "Qari Bilal Ahmed",
      class: "Mukammal Qaida",
      mobile: "03219876543",
      mobileNumber: "03219876543",
      createdAt: now,
    },
  ];

  const students: Student[] = [
    {
      id: "student-001",
      name: "Muhammad Usman",
      fatherName: "Muhammad Akbar",
      mobileNumber: "03001111111",
      className: "Naazra",
      assignedTeacherId: "teacher-001",
      timing: "Subah",
      feesStatus: FeesStatus.active,
      monthlyFees: BigInt(800),
      createdAt: now,
    },
    {
      id: "student-002",
      name: "Abdullah Farooq",
      fatherName: "Farooq Ahmed",
      mobileNumber: "03002222222",
      className: "Hifz",
      assignedTeacherId: "teacher-001",
      timing: "Dopahar",
      feesStatus: FeesStatus.active,
      monthlyFees: BigInt(1200),
      createdAt: now,
    },
    {
      id: "student-003",
      name: "Ibrahim Siddiqui",
      fatherName: "Tariq Siddiqui",
      mobileNumber: "03003333333",
      className: "Mukammal Qaida",
      assignedTeacherId: "teacher-002",
      timing: "Shaam",
      feesStatus: FeesStatus.pending,
      monthlyFees: BigInt(600),
      createdAt: now,
    },
    {
      id: "student-004",
      name: "Zaid Hussain",
      fatherName: "Imran Hussain",
      mobileNumber: "03004444444",
      className: "Nisf Qaida",
      assignedTeacherId: "teacher-002",
      timing: "Subah",
      feesStatus: FeesStatus.active,
      monthlyFees: BigInt(500),
      createdAt: now,
    },
    {
      id: "student-005",
      name: "Hamza Qureshi",
      fatherName: "Salman Qureshi",
      mobileNumber: "03005555555",
      className: "Naazra",
      assignedTeacherId: "teacher-003",
      timing: "Dopahar",
      feesStatus: FeesStatus.active,
      monthlyFees: BigInt(800),
      createdAt: now,
    },
    {
      id: "student-006",
      name: "Yusuf Rahman",
      fatherName: "Abdul Rahman",
      mobileNumber: "03006666666",
      className: "Hifz",
      assignedTeacherId: "teacher-003",
      timing: "Shaam",
      feesStatus: FeesStatus.active,
      monthlyFees: BigInt(1200),
      createdAt: now,
    },
  ];

  const today = new Date();
  const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const academic: AcademicRecord[] = students.map((s) => ({
    id: `academic-${s.id}`,
    studentId: s.id,
    currentSabak: getSabakForClass(s.className),
    previousSabak: getPrevSabakForClass(s.className),
    monthlyProgress: "Good",
    akhlaqRating: BigInt(4),
    updatedAt: now,
  }));

  const fees: FeeRecord[] = students.map((s) => ({
    id: `fee-${s.id}-${month}`,
    studentId: s.id,
    month,
    amount: s.monthlyFees,
    status:
      s.feesStatus === FeesStatus.active
        ? FeesPaymentStatus.paid
        : FeesPaymentStatus.pending,
    createdAt: now,
  }));

  setLS(KEYS.teachers, teachers);
  setLS(KEYS.students, students);
  setLS(KEYS.academic, academic);
  setLS(KEYS.fees, fees);
  setLS(KEYS.attendance, []);

  localStorage.setItem(SEED_DONE_KEY, "true");
}

function getSabakForClass(className: string): string {
  const map: Record<string, string> = {
    "Nisf Qaida": "Qa'ida Page 12",
    "Mukammal Qaida": "Qa'ida Page 28",
    Naazra: "Surah Al-Baqarah Ruku 3",
    Hifz: "Surah Al-Kahf",
    Others: "Basic Kalima",
  };
  return map[className] ?? "Starting";
}

function getPrevSabakForClass(className: string): string {
  const map: Record<string, string> = {
    "Nisf Qaida": "Qa'ida Page 11",
    "Mukammal Qaida": "Qa'ida Page 27",
    Naazra: "Surah Al-Baqarah Ruku 2",
    Hifz: "Surah Al-Isra",
    Others: "Introduction",
  };
  return map[className] ?? "Previous";
}
