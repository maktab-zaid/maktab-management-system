/**
 * useGoogleSheets.ts — Google Sheets CSV hooks replaced with Supabase equivalents.
 * All hook names and return shapes are preserved for backward compatibility.
 * Consumers do not need to change their imports.
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getStudents, getTeachers } from "../lib/storage";
import type { Student } from "../lib/storage";

// ─── Re-export SheetStudent shape (backward compat) ─────────────────────────
export interface SheetStudent {
  name: string;
  fatherName: string;
  mobile: string;
  className: string;
  teacher: string;
  timing: string;
  feesStatus: string;
  monthlyFees: string;
  role: string;
  currentSabak: string;
  attendance: string;
  akhlaq: string;
}

export interface SheetReport {
  mobile: string;
  month: string;
  presentDays: string;
  sabak: string;
  akhlaq: string;
  feesStatus: string;
}

export interface SheetAdmin {
  mobile: string;
  name: string;
  role: string;
}

/** Map a Supabase Student to the legacy SheetStudent shape */
function studentToSheet(s: Student): SheetStudent {
  return {
    name: s.name,
    fatherName: s.fatherName,
    mobile: s.parentMobile,
    className: s.studentClass ?? s.className ?? "",
    teacher: s.teacherName,
    timing: s.timeSlot,
    feesStatus: s.feesStatus,
    monthlyFees: String(s.fees),
    role: "student",
    currentSabak: "",
    attendance: "",
    akhlaq: "",
  };
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Fetches all students from Supabase and returns them as SheetStudent[] */
export function useStudentsSheet() {
  return useQuery<SheetStudent[]>({
    queryKey: ["supabase-students-sheet"],
    queryFn: async () => {
      try {
        const students = await getStudents();
        return students.map(studentToSheet);
      } catch (e) {
        console.error("[useStudentsSheet] Failed to fetch students:", e);
        return [];
      }
    },
    staleTime: 60_000,
  });
}

/** Stub — monthly reports are no longer sourced from Google Sheets */
export function useMonthlyReportsSheet() {
  return useQuery<SheetReport[]>({
    queryKey: ["supabase-monthly-reports"],
    queryFn: async () => [],
    staleTime: 60_000,
  });
}

/**
 * Finds a student by their parent mobile number from Supabase.
 * Returns student data in legacy SheetStudent shape plus empty reports.
 */
export function useStudentByMobile(mobile: string) {
  const normalizedMobile = mobile.replace(/\D/g, "");

  const { data: students = [], isLoading } = useQuery<SheetStudent[]>({
    queryKey: ["supabase-students-sheet"],
    queryFn: async () => {
      try {
        const all = await getStudents();
        return all.map(studentToSheet);
      } catch (e) {
        console.error("[useStudentByMobile] Failed to fetch students:", e);
        return [];
      }
    },
    staleTime: 60_000,
  });

  const student = useMemo(
    () =>
      students.find((s) => s.mobile.replace(/\D/g, "") === normalizedMobile) ??
      null,
    [students, normalizedMobile],
  );

  return {
    student,
    reports: [] as SheetReport[],
    role: student ? ("student" as const) : null,
    isLoading,
  };
}

/**
 * Returns students for a given teacher name from Supabase.
 * Pass empty string to get all students.
 */
export function useTeacherStudents(teacherName: string) {
  const { data: students = [], isLoading } = useQuery<SheetStudent[]>({
    queryKey: ["supabase-students-sheet"],
    queryFn: async () => {
      try {
        const all = await getStudents();
        return all.map(studentToSheet);
      } catch (e) {
        console.error("[useTeacherStudents] Failed to fetch students:", e);
        return [];
      }
    },
    staleTime: 60_000,
  });

  const myStudents = useMemo(() => {
    if (!teacherName) return students;
    return students.filter(
      (s) =>
        s.teacher.toLowerCase().trim() === teacherName.toLowerCase().trim(),
    );
  }, [students, teacherName]);

  return { data: myStudents, isLoading };
}

/** Returns aggregate stats from Supabase student + teacher data */
export function useAdminSheetStats() {
  const { data: students = [], isLoading: studentsLoading } = useQuery<
    SheetStudent[]
  >({
    queryKey: ["supabase-students-sheet"],
    queryFn: async () => {
      try {
        const all = await getStudents();
        return all.map(studentToSheet);
      } catch (e) {
        console.error("[useAdminSheetStats] Failed to fetch students:", e);
        return [];
      }
    },
    staleTime: 60_000,
  });

  const { isLoading: teachersLoading } = useQuery({
    queryKey: ["supabase-teachers"],
    queryFn: async () => {
      try {
        return await getTeachers();
      } catch (e) {
        console.error("[useAdminSheetStats] Failed to fetch teachers:", e);
        return [];
      }
    },
    staleTime: 60_000,
  });

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const uniqueTeachers = [
      ...new Set(students.map((s) => s.teacher).filter(Boolean)),
    ];
    const totalTeachers = uniqueTeachers.length;
    const feesPaid = students.filter(
      (s) => s.feesStatus === "paid" || s.feesStatus === "active",
    ).length;
    const feesPending = students.filter(
      (s) => s.feesStatus === "pending" || s.feesStatus === "unpaid",
    ).length;
    const classCounts: Record<string, number> = {};
    for (const s of students) {
      if (s.className) {
        classCounts[s.className] = (classCounts[s.className] ?? 0) + 1;
      }
    }
    return {
      totalStudents,
      totalTeachers,
      feesPaid,
      feesPending,
      classCounts,
      teacherNames: uniqueTeachers,
    };
  }, [students]);

  return { ...stats, isLoading: studentsLoading || teachersLoading };
}
