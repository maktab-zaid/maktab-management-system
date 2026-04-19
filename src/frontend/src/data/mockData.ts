import type {
  AttendanceRecord,
  FeeRecord,
  Notice,
  SabakRecord,
  Student,
} from "../types/dashboard";

// All data arrays are empty — no demo/fake data.
// Real data is added by Admin manually and stored in localStorage via storage.ts.

export const STUDENTS: Student[] = [];

export const ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export const FEE_RECORDS: FeeRecord[] = [];

export const SABAK_RECORDS: SabakRecord[] = [];

export const NOTICES: Notice[] = [];
