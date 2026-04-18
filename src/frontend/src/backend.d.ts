import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ClassName = string;
export interface Attendance {
    id: AttendanceId;
    status: AttendanceStatus;
    studentId: StudentId;
    date: string;
    createdAt: bigint;
    markedBy: string;
}
export type AttendanceId = string;
export type AcademicRecordId = string;
export interface Teacher {
    id: TeacherId;
    name: string;
    createdAt: bigint;
    mobileNumber: string;
}
export type TeacherId = string;
export type StudentId = string;
export interface AcademicRecord {
    id: AcademicRecordId;
    studentId: StudentId;
    monthlyProgress: string;
    updatedAt: bigint;
    previousSabak: string;
    currentSabak: string;
    akhlaqRating: bigint;
}
export interface FeeRecord {
    id: FeeRecordId;
    status: FeesPaymentStatus;
    month: string;
    studentId: StudentId;
    createdAt: bigint;
    amount: bigint;
}
export type FeeRecordId = string;
export interface UserProfile {
    name: string;
    role: string;
    contactNumber: string;
}
export interface Student {
    id: StudentId;
    timing: string;
    name: string;
    createdAt: bigint;
    feesStatus: FeesStatus;
    mobileNumber: string;
    assignedTeacherId: TeacherId;
    fatherName: string;
    monthlyFees: bigint;
    className: ClassName;
}
export enum AttendanceStatus {
    on_leave = "on_leave",
    present = "present",
    late = "late",
    absent = "absent"
}
export enum FeesPaymentStatus {
    pending = "pending",
    paid = "paid",
    overdue = "overdue",
    partial_payment = "partial_payment"
}
export enum FeesStatus {
    active = "active",
    cancelled = "cancelled",
    pending = "pending"
}
export interface backendInterface {
    addFeeRecord(feeRecord: FeeRecord): Promise<void>;
    addStudent(student: Student): Promise<void>;
    addTeacher(teacher: Teacher): Promise<void>;
    deleteStudent(id: StudentId): Promise<void>;
    deleteTeacher(id: TeacherId): Promise<void>;
    getAcademicRecord(studentId: StudentId): Promise<AcademicRecord>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getMonthlyAttendance(studentId: StudentId, month: string): Promise<Array<Attendance>>;
    getStudent(id: StudentId): Promise<Student>;
    getStudentAttendance(studentId: StudentId): Promise<Array<Attendance>>;
    getStudentFees(studentId: StudentId): Promise<Array<FeeRecord>>;
    getStudentsByClass(className: ClassName): Promise<Array<Student>>;
    getStudentsByTeacher(teacherId: TeacherId): Promise<Array<Student>>;
    getTeacher(id: TeacherId): Promise<Teacher>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    markAttendance(attendanceRecord: Attendance): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAcademicRecord(record: AcademicRecord): Promise<void>;
    updateFeeStatus(id: FeeRecordId, status: FeesPaymentStatus): Promise<void>;
    updateStudent(id: StudentId, student: Student): Promise<void>;
    updateTeacher(id: TeacherId, teacher: Teacher): Promise<void>;
}
