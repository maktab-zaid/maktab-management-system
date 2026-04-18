import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { AppRole } from "../types";
import {
  normalizeMobile,
  parseMonthlyReports,
  parseStudentsSheet,
} from "../utils/googleSheets";
import type {
  SheetAdmin,
  SheetReport,
  SheetStudent,
} from "../utils/googleSheets";

export type { SheetStudent, SheetReport, SheetAdmin };

const SHEET_STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Google Sheets CSV URLs (publicly published sheets)
const STUDENTS_SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/1RNqBfZGfjpLXbHB9pJpqUNR5gfWxKTSWyomYfp41f7s/export?format=csv";
const REPORTS_SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/1N1tlOyn3I8_p9xvxn34481u961ij4gPzo92kgYerNuQ/export?format=csv";

export function useStudentsSheet() {
  return useQuery<SheetStudent[]>({
    queryKey: ["sheet-students"],
    queryFn: async () => {
      try {
        const res = await fetch(STUDENTS_SHEET_CSV);
        if (!res.ok) return [];
        const csv = await res.text();
        return parseStudentsSheet(csv);
      } catch (e) {
        console.error("Failed to fetch students sheet:", e);
        return [];
      }
    },
    staleTime: SHEET_STALE_TIME,
  });
}

export function useMonthlyReportsSheet() {
  return useQuery<SheetReport[]>({
    queryKey: ["sheet-reports"],
    queryFn: async () => {
      try {
        const res = await fetch(REPORTS_SHEET_CSV);
        if (!res.ok) return [];
        const csv = await res.text();
        return parseMonthlyReports(csv);
      } catch (e) {
        console.error("Failed to fetch monthly reports sheet:", e);
        return [];
      }
    },
    staleTime: SHEET_STALE_TIME,
  });
}

export function useStudentByMobile(mobile: string) {
  const { data: students = [], isLoading: studentsLoading } =
    useStudentsSheet();
  const { data: reports = [], isLoading: reportsLoading } =
    useMonthlyReportsSheet();

  const normalizedMobile = normalizeMobile(mobile);

  const student = useMemo(
    () =>
      students.find((s) => normalizeMobile(s.mobile) === normalizedMobile) ??
      null,
    [students, normalizedMobile],
  );

  const studentReports = useMemo(
    () => reports.filter((r) => normalizeMobile(r.mobile) === normalizedMobile),
    [reports, normalizedMobile],
  );

  const role = useMemo((): AppRole | null => {
    if (!student) return null;
    const r = student.role.toLowerCase();
    if (r === "admin") return "admin";
    if (r === "teacher" || r === "ustad") return "teacher";
    return "student";
  }, [student]);

  return {
    student,
    reports: studentReports,
    role,
    isLoading: studentsLoading || reportsLoading,
  };
}

export function useTeacherStudents(teacherName: string) {
  const { data: students = [], isLoading } = useStudentsSheet();

  const myStudents = useMemo(() => {
    if (!teacherName) return students;
    return students.filter(
      (s) =>
        s.teacher.toLowerCase().trim() === teacherName.toLowerCase().trim(),
    );
  }, [students, teacherName]);

  return { data: myStudents, isLoading };
}

export function useAdminSheetStats() {
  const { data: students = [], isLoading: studentsLoading } =
    useStudentsSheet();

  const stats = useMemo(() => {
    const totalStudents =
      students.filter(
        (s) => !s.role || s.role === "student" || s.role === "talib",
      ).length || students.length;

    const uniqueTeachers = [
      ...new Set(students.map((s) => s.teacher).filter(Boolean)),
    ];
    const totalTeachers = uniqueTeachers.length;

    const feesPaid = students.filter(
      (s) =>
        s.feesStatus.toLowerCase() === "paid" ||
        s.feesStatus.toLowerCase() === "active",
    ).length;

    const feesPending = students.filter(
      (s) =>
        s.feesStatus.toLowerCase() === "pending" ||
        s.feesStatus.toLowerCase() === "unpaid",
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

  return { ...stats, isLoading: studentsLoading };
}
