import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AcademicRecord,
  Attendance,
  FeeRecord,
  Student,
  Teacher,
  UserProfile,
} from "../types";
import { AttendanceStatus, FeesPaymentStatus } from "../types";

// ── localStorage helpers ──────────────────────────────────────────────────────

function getLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    // revive bigint values stored as strings with suffix "n"
    return JSON.parse(raw, (_k, v) => {
      if (typeof v === "string" && /^\d+n$/.test(v))
        return BigInt(v.slice(0, -1));
      return v;
    }) as T;
  } catch {
    return fallback;
  }
}

function setLS<T>(key: string, value: T): void {
  localStorage.setItem(
    key,
    JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? `${v}n` : v)),
  );
}

const KEYS = {
  students: "maktab_students",
  teachers: "maktab_teachers",
  attendance: "maktab_attendance",
  academic: "maktab_academic",
  fees: "maktab_fees",
  profile: "maktab_profile",
};

// ── Student hooks ─────────────────────────────────────────────────────────────

export function useAllStudents() {
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: () => getLS<Student[]>(KEYS.students, []),
    staleTime: 0,
  });
}

export function useStudentsByTeacher(teacherId: string) {
  return useQuery<Student[]>({
    queryKey: ["students-by-teacher", teacherId],
    queryFn: () =>
      getLS<Student[]>(KEYS.students, []).filter(
        (s) => s.assignedTeacherId === teacherId,
      ),
    enabled: !!teacherId,
  });
}

export function useStudentsByClass(className: string) {
  return useQuery<Student[]>({
    queryKey: ["students-by-class", className],
    queryFn: () =>
      getLS<Student[]>(KEYS.students, []).filter(
        (s) => s.className === className,
      ),
    enabled: !!className,
  });
}

export function useAddStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (student: Student) => {
      const list = getLS<Student[]>(KEYS.students, []);
      setLS(KEYS.students, [...list, student]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-by-teacher"] });
    },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, student }: { id: string; student: Student }) => {
      const list = getLS<Student[]>(KEYS.students, []);
      setLS(
        KEYS.students,
        list.map((s) => (s.id === id ? student : s)),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-by-teacher"] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const list = getLS<Student[]>(KEYS.students, []);
      setLS(
        KEYS.students,
        list.filter((s) => s.id !== id),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-by-teacher"] });
    },
  });
}

// ── Teacher hooks ─────────────────────────────────────────────────────────────

export function useAllTeachers() {
  return useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: () => getLS<Teacher[]>(KEYS.teachers, []),
    staleTime: 0,
  });
}

export function useAddTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (teacher: Teacher) => {
      const list = getLS<Teacher[]>(KEYS.teachers, []);
      setLS(KEYS.teachers, [...list, teacher]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, teacher }: { id: string; teacher: Teacher }) => {
      const list = getLS<Teacher[]>(KEYS.teachers, []);
      setLS(
        KEYS.teachers,
        list.map((t) => (t.id === id ? teacher : t)),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const list = getLS<Teacher[]>(KEYS.teachers, []);
      setLS(
        KEYS.teachers,
        list.filter((t) => t.id !== id),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

// ── Attendance hooks ──────────────────────────────────────────────────────────

export function useStudentAttendance(studentId: string) {
  return useQuery<Attendance[]>({
    queryKey: ["attendance", studentId],
    queryFn: () =>
      getLS<Attendance[]>(KEYS.attendance, []).filter(
        (a) => a.studentId === studentId,
      ),
    enabled: !!studentId,
  });
}

export function useMonthlyAttendance(studentId: string, month: string) {
  return useQuery<Attendance[]>({
    queryKey: ["attendance-monthly", studentId, month],
    queryFn: () =>
      getLS<Attendance[]>(KEYS.attendance, []).filter(
        (a) => a.studentId === studentId && a.date.startsWith(month),
      ),
    enabled: !!studentId && !!month,
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: Attendance) => {
      const list = getLS<Attendance[]>(KEYS.attendance, []);
      const existing = list.findIndex((a) => a.id === record.id);
      if (existing >= 0) {
        list[existing] = record;
        setLS(KEYS.attendance, list);
      } else {
        setLS(KEYS.attendance, [...list, record]);
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["attendance", variables.studentId] });
      qc.invalidateQueries({ queryKey: ["attendance-monthly"] });
    },
  });
}

// ── Academic hooks ────────────────────────────────────────────────────────────

export function useAcademicRecord(studentId: string) {
  return useQuery<AcademicRecord | undefined>({
    queryKey: ["academic", studentId],
    queryFn: () =>
      getLS<AcademicRecord[]>(KEYS.academic, []).find(
        (r) => r.studentId === studentId,
      ),
    enabled: !!studentId,
  });
}

export function useUpdateAcademicRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AcademicRecord) => {
      const list = getLS<AcademicRecord[]>(KEYS.academic, []);
      const existing = list.findIndex((r) => r.studentId === record.studentId);
      if (existing >= 0) {
        list[existing] = record;
        setLS(KEYS.academic, list);
      } else {
        setLS(KEYS.academic, [...list, record]);
      }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["academic", variables.studentId] });
    },
  });
}

// ── Fee hooks ─────────────────────────────────────────────────────────────────

export function useStudentFees(studentId: string) {
  return useQuery<FeeRecord[]>({
    queryKey: ["fees", studentId],
    queryFn: () =>
      getLS<FeeRecord[]>(KEYS.fees, []).filter(
        (f) => f.studentId === studentId,
      ),
    enabled: !!studentId,
  });
}

export function useAddFeeRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: FeeRecord) => {
      const list = getLS<FeeRecord[]>(KEYS.fees, []);
      setLS(KEYS.fees, [...list, record]);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["fees", variables.studentId] });
    },
  });
}

export function useUpdateFeeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: string; status: FeesPaymentStatus }) => {
      const list = getLS<FeeRecord[]>(KEYS.fees, []);
      setLS(
        KEYS.fees,
        list.map((f) => (f.id === id ? { ...f, status } : f)),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fees"] }),
  });
}

// ── Profile hooks ─────────────────────────────────────────────────────────────

export function useCallerProfile() {
  return useQuery<UserProfile | null>({
    queryKey: ["caller-profile"],
    queryFn: () => getLS<UserProfile | null>(KEYS.profile, null),
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      setLS(KEYS.profile, profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["caller-profile"] }),
  });
}

export { AttendanceStatus, FeesPaymentStatus };
