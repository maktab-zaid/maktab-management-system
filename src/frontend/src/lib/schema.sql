-- Maktab Management System — Supabase Schema
-- Run this in your Supabase SQL editor to create all required tables.

-- Enable UUID extension (usually already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Students ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  father_name TEXT DEFAULT '',
  parent_mobile TEXT DEFAULT '',
  time_slot TEXT DEFAULT '',
  teacher_name TEXT DEFAULT '',
  fees NUMERIC DEFAULT 0,
  fees_status TEXT DEFAULT 'pending',
  address TEXT DEFAULT '',
  roll_number TEXT DEFAULT '',
  admission_date TEXT DEFAULT '',
  student_class TEXT DEFAULT '',
  class_name TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Teachers ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT DEFAULT '',
  mobile_number TEXT DEFAULT '',
  salary NUMERIC DEFAULT 0,
  shifts TEXT DEFAULT '[]',
  time_slot TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Attendance ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT DEFAULT '',
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  marked_by TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Fees ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fees (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT DEFAULT '',
  month TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Sabak Records ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sabak_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT DEFAULT '',
  section TEXT DEFAULT '',
  current_lesson TEXT DEFAULT '',
  previous_lesson TEXT DEFAULT '',
  progress_percent NUMERIC DEFAULT 0,
  remarks TEXT DEFAULT '',
  updated_by TEXT DEFAULT '',
  updated_at TEXT DEFAULT '',
  surah_name TEXT DEFAULT '',
  ayat_number INTEGER DEFAULT 0,
  count_completed INTEGER DEFAULT 0,
  qaida TEXT DEFAULT '',
  amma_para TEXT DEFAULT '',
  quran TEXT DEFAULT '',
  dua TEXT DEFAULT '',
  hadees TEXT DEFAULT '',
  urdu TEXT DEFAULT '',
  hifz TEXT DEFAULT '',
  lesson_name TEXT DEFAULT '',
  progress NUMERIC DEFAULT 0,
  sabak_type TEXT DEFAULT '',
  sabak_manual TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Notices ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  date TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Gallery ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT DEFAULT '',
  type TEXT DEFAULT 'image',
  added_at TEXT DEFAULT '',
  uploaded_by TEXT DEFAULT '',
  class_tag TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Salaries ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salaries (
  id TEXT PRIMARY KEY,
  teacher_id TEXT DEFAULT '',
  teacher_name TEXT DEFAULT '',
  month TEXT DEFAULT '',
  year TEXT DEFAULT '',
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  paid_date TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Activity Log ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  actor_name TEXT DEFAULT '',
  actor_role TEXT DEFAULT '',
  action TEXT DEFAULT '',
  target_student_name TEXT DEFAULT '',
  details TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  message TEXT DEFAULT '',
  date TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'info',
  timestamp TEXT DEFAULT '',
  for_role TEXT DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Ustaad Attendance ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ustaad_attendance (
  id TEXT PRIMARY KEY,
  ustaad_id TEXT DEFAULT '',
  ustaad_name TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (ustaad_name, date)
);

-- ─── Ustaad Profiles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ustaad_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  time_slot TEXT DEFAULT '',
  address TEXT DEFAULT '',
  profile_image TEXT DEFAULT '',
  created_at TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Parent Profiles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parent_profiles (
  mobile TEXT PRIMARY KEY,
  name TEXT DEFAULT '',
  address TEXT DEFAULT '',
  profile_image TEXT DEFAULT '',
  updated_at TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
-- Enable RLS on all tables (allow all operations for anon key for now)
-- Tighten policies once you add proper auth.

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sabak_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ustaad_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ustaad_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (public) key — restrict per-role later
CREATE POLICY "allow_all_students" ON students FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_teachers" ON teachers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_attendance" ON attendance FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_fees" ON fees FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_sabak_records" ON sabak_records FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_notices" ON notices FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_gallery" ON gallery FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_salaries" ON salaries FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_activity_log" ON activity_log FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_notifications" ON notifications FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ustaad_attendance" ON ustaad_attendance FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ustaad_profiles" ON ustaad_profiles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_parent_profiles" ON parent_profiles FOR ALL TO anon USING (true) WITH CHECK (true);
