import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";



actor {
  // User Profile Type
  public type UserProfile = {
    name : Text;
    role : Text;
    contactNumber : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Types
  type StudentId = Text;
  type TeacherId = Text;
  type AttendanceId = Text;
  type AcademicRecordId = Text;
  type FeeRecordId = Text;
  type ClassName = Text;

  type FeesStatus = {
    #active;
    #pending;
    #cancelled;
  };

  module FeesStatus {
    public func compare(a : FeesStatus, b : FeesStatus) : Order.Order {
      switch (a, b) {
        case (#active, #active) { #equal };
        case (#active, _) { #less };
        case (#pending, #active) { #greater };
        case (#pending, #pending) { #equal };
        case (#pending, #cancelled) { #less };
        case (#cancelled, #cancelled) { #equal };
        case (#cancelled, _) { #greater };
      };
    };

    public func toText(fs : FeesStatus) : Text {
      switch (fs) {
        case (#active) { "Active" };
        case (#pending) { "Pending" };
        case (#cancelled) { "Cancelled" };
      };
    };
  };

  type AttendanceStatus = {
    #present;
    #absent;
    #on_leave;
    #late;
  };

  module AttendanceStatus {
    public func compare(a : AttendanceStatus, b : AttendanceStatus) : Order.Order {
      switch (a, b) {
        case (#present, #present) { #equal };
        case (#present, _) { #less };
        case (#absent, #present) { #greater };
        case (#absent, #absent) { #equal };
        case (#absent, #on_leave) { #less };
        case (#absent, #late) { #less };
        case (#on_leave, #on_leave) { #equal };
        case (#on_leave, #late) { #less };
        case (#late, #late) { #equal };
        case (_, _) { Text.compare(toText(a), toText(b)) };
      };
    };

    public func toText(status : AttendanceStatus) : Text {
      switch (status) {
        case (#present) { "Present" };
        case (#absent) { "Absent" };
        case (#on_leave) { "On Leave" };
        case (#late) { "Late" };
      };
    };
  };

  type FeesPaymentStatus = {
    #paid;
    #pending;
    #overdue;
    #partial_payment;
  };

  module FeesPaymentStatus {
    public func compare(a : FeesPaymentStatus, b : FeesPaymentStatus) : Order.Order {
      switch (a, b) {
        case (#paid, #paid) { #equal };
        case (#paid, _) { #less };
        case (#pending, #paid) { #greater };
        case (#pending, #pending) { #equal };
        case (#pending, #overdue) { #less };
        case (#pending, #partial_payment) { #less };
        case (#overdue, #overdue) { #equal };
        case (#overdue, #partial_payment) { #less };
        case (#partial_payment, #partial_payment) { #equal };
        case (_, _) { Text.compare(toText(a), toText(b)) };
      };
    };

    public func toText(status : FeesPaymentStatus) : Text {
      switch (status) {
        case (#paid) { "Paid" };
        case (#pending) { "Pending" };
        case (#overdue) { "Overdue" };
        case (#partial_payment) { "Partial Payment" };
      };
    };
  };

  type Student = {
    id : StudentId;
    name : Text;
    fatherName : Text;
    mobileNumber : Text;
    className : ClassName;
    assignedTeacherId : TeacherId;
    timing : Text;
    feesStatus : FeesStatus;
    monthlyFees : Nat;
    createdAt : Int;
  };

  module Student {
    public func compare(student1 : Student, student2 : Student) : Order.Order {
      Text.compare(student1.id, student2.id);
    };
  };

  type Teacher = {
    id : TeacherId;
    name : Text;
    mobileNumber : Text;
    createdAt : Int;
  };

  module Teacher {
    public func compare(teacher1 : Teacher, teacher2 : Teacher) : Order.Order {
      Text.compare(teacher1.id, teacher2.id);
    };
  };

  type Attendance = {
    id : AttendanceId;
    studentId : StudentId;
    status : AttendanceStatus;
    date : Text;
    markedBy : Text;
    createdAt : Int;
  };

  module Attendance {
    public func compare(attendance1 : Attendance, attendance2 : Attendance) : Order.Order {
      if (attendance1.createdAt < attendance2.createdAt) { #less } else if (
        attendance1.createdAt > attendance2.createdAt
      ) { #greater } else { Text.compare(attendance1.id, attendance2.id) };
    };
  };

  type AcademicRecord = {
    id : AcademicRecordId;
    studentId : StudentId;
    currentSabak : Text;
    previousSabak : Text;
    monthlyProgress : Text;
    akhlaqRating : Nat;
    updatedAt : Int;
  };

  module AcademicRecord {
    public func compare(record1 : AcademicRecord, record2 : AcademicRecord) : Order.Order {
      if (record1.updatedAt < record2.updatedAt) { #less } else if (
        record1.updatedAt > record2.updatedAt
      ) { #greater } else { Text.compare(record1.id, record2.id) };
    };
  };

  type FeeRecord = {
    id : FeeRecordId;
    studentId : StudentId;
    month : Text;
    amount : Nat;
    status : FeesPaymentStatus;
    createdAt : Int;
  };

  module FeeRecord {
    public func compare(record1 : FeeRecord, record2 : FeeRecord) : Order.Order {
      if (record1.createdAt < record2.createdAt) { #less } else if (
        record1.createdAt > record2.createdAt
      ) { #greater } else { Text.compare(record1.id, record2.id) };
    };
  };

  // Store
  let students = Map.empty<StudentId, Student>();
  let teachers = Map.empty<TeacherId, Teacher>();
  let attendance = Map.empty<AttendanceId, Attendance>();
  let academicRecords = Map.empty<AcademicRecordId, AcademicRecord>();
  let feeRecords = Map.empty<FeeRecordId, FeeRecord>();

  func getMonthFromDate(date : Text) : Text {
    let parts = date.split(#char '-').toArray();
    if (parts.size() < 2) {
      Runtime.trap("Invalid date format. Expected: YYYY-MM-DD");
    };
    parts[1];
  };

  // Student Entities
  public shared func addStudent(student : Student) : async () {
    if (students.containsKey(student.id)) { Runtime.trap("Student with id " # student.id # " already exists") };
    students.add(student.id, student);
  };

  public shared func updateStudent(id : StudentId, student : Student) : async () {
    if (not students.containsKey(id)) { Runtime.trap("Student not found") };
    students.add(id, student);
  };

  public shared func deleteStudent(id : StudentId) : async () {
    if (not students.containsKey(id)) { Runtime.trap("Student not found") };
    students.remove(id);
  };

  public query func getStudent(id : StudentId) : async Student {
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) { student };
    };
  };

  public query func getAllStudents() : async [Student] {
    students.values().toArray().sort();
  };

  public query func getStudentsByClass(className : ClassName) : async [Student] {
    students.values().toArray().sort().filter(
      func(s) {
        s.className == className;
      }
    );
  };

  public query func getStudentsByTeacher(teacherId : TeacherId) : async [Student] {
    students.values().toArray().sort().filter(
      func(s) {
        s.assignedTeacherId == teacherId;
      }
    );
  };

  // Teacher Entities
  public shared func addTeacher(teacher : Teacher) : async () {
    if (teachers.containsKey(teacher.id)) { Runtime.trap("Teacher with id " # teacher.id # " already exists") };
    teachers.add(teacher.id, teacher);
  };

  public shared func updateTeacher(id : TeacherId, teacher : Teacher) : async () {
    if (not teachers.containsKey(id)) { Runtime.trap("Teacher not found") };
    teachers.add(id, teacher);
  };

  public shared func deleteTeacher(id : TeacherId) : async () {
    if (not teachers.containsKey(id)) { Runtime.trap("Teacher not found") };
    teachers.remove(id);
  };

  public query func getTeacher(id : TeacherId) : async Teacher {
    switch (teachers.get(id)) {
      case (null) { Runtime.trap("Teacher not found") };
      case (?teacher) { teacher };
    };
  };

  public query func getAllTeachers() : async [Teacher] {
    teachers.values().toArray().sort();
  };

  // Attendance Entities
  public shared func markAttendance(attendanceRecord : Attendance) : async () {
    validateDate(attendanceRecord.date);
    if (attendance.containsKey(attendanceRecord.id)) {
      Runtime.trap("Attendance record for this id already exists");
    };
    attendance.add(attendanceRecord.id, attendanceRecord);
  };

  public query func getStudentAttendance(studentId : StudentId) : async [Attendance] {
    attendance.values().toArray().sort().filter(
      func(record) {
        record.studentId == studentId;
      }
    );
  };

  public query func getMonthlyAttendance(studentId : StudentId, month : Text) : async [Attendance] {
    attendance.values().toArray().sort().filter(
      func(record) {
        let recordMonth = getMonthFromDate(record.date);
        record.studentId == studentId and recordMonth == month;
      }
    );
  };

  // Academic Records
  public shared func updateAcademicRecord(record : AcademicRecord) : async () {
    if (not students.containsKey(record.studentId)) { Runtime.trap("Cannot add academic record for non-existing student") };
    academicRecords.add(record.id, record);
  };

  public query func getAcademicRecord(studentId : StudentId) : async AcademicRecord {
    academicRecords.values().toArray().sort().find(
      func(record) {
        record.studentId == studentId;
      }
    ).unwrap();
  };

  // Fee Records
  public shared func addFeeRecord(feeRecord : FeeRecord) : async () {
    if (feeRecords.containsKey(feeRecord.id)) { Runtime.trap("Fee record for this id already exists") };
    feeRecords.add(feeRecord.id, feeRecord);
  };

  public shared func updateFeeStatus(id : FeeRecordId, status : FeesPaymentStatus) : async () {
    switch (feeRecords.get(id)) {
      case (null) { Runtime.trap("Fee record not found") };
      case (?record) {
        feeRecords.remove(id);
        let updatedRecord = { record with status };
        feeRecords.add(id, updatedRecord);
      };
    };
  };

  public query func getStudentFees(studentId : StudentId) : async [FeeRecord] {
    feeRecords.values().toArray().sort().filter(
      func(record) {
        record.studentId == studentId;
      }
    );
  };

  // Helper Functions
  func validateDate(date : Text) {
    if (date.size() != 10) { Runtime.trap("Invalid date format. Expected: YYYY-MM-DD") };
  };
};
