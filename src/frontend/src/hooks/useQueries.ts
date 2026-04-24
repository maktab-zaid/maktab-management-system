/**
 * useQueries.ts — localStorage-based hooks replaced with Supabase equivalents.
 * Hook names and signatures are preserved for backward compatibility.
 * Consumers do not need to change their imports.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAttendance,
  getFees,
  getSabakRecords,
  getStudents,
  getTeachers,
  saveAttendance,
  saveFees,
  saveSabakRecords,
  addStudent as supabaseAddStudent,
  addTeacher as supabaseAddTeacher,
  deleteStudent as supabaseDeleteStudent,
  deleteTeacher as supabaseDeleteTeacher,
  updateStudent as supabaseUpdateStudent,
} from "../lib/storage";
import type {
  AttendanceRecord,
  FeeRecord,
  SabakRecord,
  Student,
  Teacher,
} from "../lib/storage";
import { AttendanceStatus, FeesPaymentStatus } from "../types";

// Re-export status enums for backward compat
export { AttendanceStatus, FeesPaymentStatus };

// ─── Type aliases for legacy compatibility ───────────────────────────────────
// Pages that imported from useQueries used types from ../types which have
// bigint fields. We use storage.ts types which are all number-based.
// The shapes are compatible for UI rendering purposes.

// ─── Student hooks ────────────────────────────────────────────────────────────

export function useAllStudents() {
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        return await getStudents();
      } catch (e) {
        console.error("[useAllStudents]", e);
        return [];
      }
    },
    staleTime: 30_000,
  });
}

export function useStudentsByTeacher(teacherName: string) {
  return useQuery<Student[]>({
    queryKey: ["students-by-teacher", teacherName],
    queryFn: async () => {
      try {
        const all = await getStudents();
        return all.filter(
          (s) =>
            s.teacherName.toLowerCase().trim() ===
            teacherName.toLowerCase().trim(),
        );
      } catch (e) {
        console.error("[useStudentsByTeacher]", e);
        return [];
      }
    },
    enabled: !!teacherName,
    staleTime: 30_000,
  });
}

export function useStudentsByClass(className: string) {
  return useQuery<Student[]>({
    queryKey: ["students-by-class", className],
    queryFn: async () => {
      try {
        const all = await getStudents();
        return all.filter(
          (s) =>
            (s.studentClass ?? s.className ?? "").toLowerCase() ===
            className.toLowerCase(),
        );
      } catch (e) {
        console.error("[useStudentsByClass]", e);
        return [];
      }
    },
    enabled: !!className,
    staleTime: 30_000,
  });
}

export function useAddStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (student: Student) => {
      await supabaseAddStudent(student);
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
    mutationFn: async ({ student }: { id: string; student: Student }) => {
      await supabaseUpdateStudent(student);
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
      await supabaseDeleteStudent(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students-by-teacher"] });
    },
  });
}

// ─── Teacher hooks ────────────────────────────────────────────────────────────

export function useAllTeachers() {
  return useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      try {
        return await getTeachers();
      } catch (e) {
        console.error("[useAllTeachers]", e);
        return [];
      }
    },
    staleTime: 0,
  });
}

export function useAddTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (teacher: Teacher) => {
      const session = Array.isArray(teacher.timeSlot)
        ? (teacher.timeSlot[0] ?? "")
        : (teacher.timeSlot ?? "");
      return await supabaseAddTeacher(teacher.name, teacher.mobile, session);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (error: Error) => {
      console.error("[useAddTeacher] mutation failed:", error.message);
    },
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teacher }: { id: string; teacher: Teacher }) => {
      const session = Array.isArray(teacher.timeSlot)
        ? (teacher.timeSlot[0] ?? "")
        : (teacher.timeSlot ?? "");
      return await supabaseAddTeacher(teacher.name, teacher.mobile, session);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabaseDeleteTeacher(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

// ─── Attendance hooks ─────────────────────────────────────────────────────────

export function useStudentAttendance(studentId: string) {
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", studentId],
    queryFn: async () => {
      try {
        const all = await getAttendance();
        return all.filter((a) => a.studentId === studentId);
      } catch (e) {
        console.error("[useStudentAttendance]", e);
        return [];
      }
    },
    enabled: !!studentId,
    staleTime: 30_000,
  });
}

export function useMonthlyAttendance(studentId: string, month: string) {
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance-monthly", studentId, month],
    queryFn: async () => {
      try {
        const all = await getAttendance();
        return all.filter(
          (a) => a.studentId === studentId && a.date.startsWith(month),
        );
      } catch (e) {
        console.error("[useMonthlyAttendance]", e);
        return [];
      }
    },
    enabled: !!studentId && !!month,
    staleTime: 30_000,
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AttendanceRecord) => {
      await saveAttendance([record]);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["attendance", variables.studentId] });
      qc.invalidateQueries({ queryKey: ["attendance-monthly"] });
    },
  });
}

// ─── Fee hooks ────────────────────────────────────────────────────────────────

export function useStudentFees(studentId: string) {
  return useQuery<FeeRecord[]>({
    queryKey: ["fees", studentId],
    queryFn: async () => {
      try {
        const all = await getFees();
        return all.filter((f) => f.studentId === studentId);
      } catch (e) {
        console.error("[useStudentFees]", e);
        return [];
      }
    },
    enabled: !!studentId,
    staleTime: 30_000,
  });
}

export function useAddFeeRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: FeeRecord) => {
      await saveFees([record]);
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
      studentId,
    }: { id: string; status: "paid" | "pending"; studentId?: string }) => {
      const all = await getFees();
      const updated = all.map((f) => (f.id === id ? { ...f, status } : f));
      await saveFees(updated);
      return { studentId };
    },
    onSuccess: (_data) => {
      qc.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

// ─── Sabak / Academic hooks ───────────────────────────────────────────────────

export function useAcademicRecord(studentId: string) {
  return useQuery<SabakRecord | undefined>({
    queryKey: ["academic", studentId],
    queryFn: async () => {
      try {
        const all = await getSabakRecords();
        return all.find((r) => r.studentId === studentId);
      } catch (e) {
        console.error("[useAcademicRecord]", e);
        return undefined;
      }
    },
    enabled: !!studentId,
    staleTime: 30_000,
  });
}

export function useUpdateAcademicRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: SabakRecord) => {
      await saveSabakRecords([record]);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["academic", variables.studentId] });
    },
  });
}

// ─── Profile hook (session-only, not persisted to Supabase) ──────────────────

export function useCallerProfile() {
  return useQuery({
    queryKey: ["caller-profile"],
    queryFn: () => null,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_profile: unknown) => {
      // Profile is managed via storage.ts saveAdminProfile / saveUstaadProfile
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["caller-profile"] }),
  });
}
