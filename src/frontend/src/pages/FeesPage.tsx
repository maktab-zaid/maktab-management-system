import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type FeeRecord,
  type Session,
  type Student,
  addParentActivity,
  createId,
  getFees,
  getStudents,
  saveFees,
} from "@/lib/storage";
import {
  Bell,
  CheckCircle2,
  IndianRupee,
  MessageCircle,
  Plus,
  Smartphone,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface FeesPageProps {
  session: Session;
}

const STATUS_FILTERS = ["All", "paid", "pending"] as const;
type FilterOption = (typeof STATUS_FILTERS)[number];

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function FeeBadge({ status }: { status: "paid" | "pending" }) {
  if (status === "paid")
    return (
      <Badge
        className="badge-paid hover:badge-paid font-semibold text-[11px] px-2.5"
        data-ocid="fees.badge.paid"
      >
        ✓ Paid
      </Badge>
    );
  return (
    <Badge
      className="badge-pending hover:badge-pending font-semibold text-[11px] px-2.5"
      data-ocid="fees.badge.pending"
    >
      ● Pending
    </Badge>
  );
}

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  isHighlight?: boolean;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  colorClass,
  bgClass,
  borderClass,
  isHighlight,
}: SummaryCardProps) {
  return (
    <Card
      className={`relative overflow-hidden border ${borderClass} shadow-sm hover:shadow-md transition-shadow duration-300 ${isHighlight ? "bg-primary" : "bg-card"}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isHighlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}
            >
              {label}
            </p>
            <p
              className={`text-2xl font-black tracking-tight leading-none ${isHighlight ? "text-primary-foreground" : colorClass}`}
            >
              {value}
            </p>
            {sub && (
              <p
                className={`text-xs mt-1.5 ${isHighlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}
              >
                {sub}
              </p>
            )}
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${isHighlight ? "bg-white/15" : bgClass}`}
          >
            <Icon
              className={`w-5 h-5 ${isHighlight ? "text-primary-foreground" : colorClass}`}
            />
          </div>
        </div>
        <div
          className={`absolute bottom-0 left-0 h-0.5 w-full ${isHighlight ? "bg-white/20" : bgClass}`}
        />
      </CardContent>
    </Card>
  );
}

// ─── WhatsApp Reminder Modal ──────────────────────────────────────────────────

interface ReminderModalProps {
  fee: FeeRecord;
  parentMobile: string;
  onClose: () => void;
}

function ReminderModal({ fee, parentMobile, onClose }: ReminderModalProps) {
  const msg = `Assalamualaikum, ${fee.studentName} ki is mahine ki fees pending hai. Kripya jald ada karein. — Maktab Zaid Bin Sabit`;
  const encoded = encodeURIComponent(msg);
  const waLink = `https://wa.me/91${parentMobile}?text=${encoded}`;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm w-full h-full max-w-full max-h-full m-0 border-0"
      data-ocid="fees.reminder_dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <Card className="w-full max-w-md card-elevated page-enter shadow-2xl">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary rounded-t-xl">
            <div>
              <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp Reminder
              </h2>
              <p className="text-xs text-primary-foreground/70 mt-0.5">
                {fee.studentName} — {fee.month}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/15 transition-colors"
              data-ocid="fees.reminder_close_button"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-primary-foreground/80" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="rounded-lg bg-muted/50 border border-border/60 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Message Preview
              </p>
              <p className="text-sm text-foreground leading-relaxed">{msg}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Sending to: +91 {parentMobile}</span>
            </div>
          </div>

          <div className="px-6 pb-5 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="fees.reminder_cancel_button"
            >
              Cancel
            </Button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
              data-ocid="fees.reminder_whatsapp_button"
            >
              <Button
                type="button"
                className="w-full btn-green gap-2"
                onClick={onClose}
              >
                <MessageCircle className="w-4 h-4" />
                Send WhatsApp
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </dialog>
  );
}

// ─── Paid Confirmation WhatsApp Modal (Teacher) ───────────────────────────────

interface PaidConfirmModalProps {
  fee: FeeRecord;
  parentMobile: string;
  onClose: () => void;
}

function PaidConfirmModal({
  fee,
  parentMobile,
  onClose,
}: PaidConfirmModalProps) {
  const msg = `Assalamualaikum, ${fee.studentName} ki fees is mahine paid ho gayi hai. JazakAllah Khair — Maktab Zaid Bin Sabit`;
  const encoded = encodeURIComponent(msg);
  const waLink = `https://wa.me/91${parentMobile}?text=${encoded}`;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm w-full h-full max-w-full max-h-full m-0 border-0"
      data-ocid="fees.paid_confirm_dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <Card className="w-full max-w-md card-elevated page-enter shadow-2xl">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary rounded-t-xl">
            <div>
              <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Fees Paid — WhatsApp
              </h2>
              <p className="text-xs text-primary-foreground/70 mt-0.5">
                {fee.studentName} — {fee.month}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/15 transition-colors"
              data-ocid="fees.paid_confirm_close_button"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-primary-foreground/80" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="rounded-lg bg-muted/50 border border-border/60 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Message Preview
              </p>
              <p className="text-sm text-foreground leading-relaxed">{msg}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Sending to: +91 {parentMobile}</span>
            </div>
          </div>

          <div className="px-6 pb-5 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="fees.paid_confirm_cancel_button"
            >
              Skip
            </Button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
              data-ocid="fees.paid_confirm_whatsapp_button"
            >
              <Button
                type="button"
                className="w-full btn-green gap-2"
                onClick={onClose}
              >
                <MessageCircle className="w-4 h-4" />
                Send WhatsApp
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </dialog>
  );
}

// ─── UPI Pay Modal ────────────────────────────────────────────────────────────

interface UpiModalProps {
  fee: FeeRecord;
  teacherMobile: string;
  studentName: string;
  onClose: () => void;
}

function UpiModal({ fee, teacherMobile, studentName, onClose }: UpiModalProps) {
  const upiDeepLink = `upi://pay?pa=want5083@okaxis&pn=Maktab%20Zaid%20Bin%20Sabit&tn=Student%20Fees&am=${fee.amount}&cu=INR`;
  const waText = encodeURIComponent(
    `Fees payment screenshot for ${studentName} — ${fee.month}`,
  );
  const waLink = `https://wa.me/91${teacherMobile}?text=${waText}`;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm w-full h-full max-w-full max-h-full m-0 border-0"
      data-ocid="fees.upi_dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <Card className="w-full max-w-sm card-elevated page-enter shadow-2xl">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary rounded-t-xl">
            <div>
              <h2 className="text-base font-bold text-primary-foreground flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Pay Fees via UPI
              </h2>
              <p className="text-xs text-primary-foreground/70 mt-0.5">
                {fee.studentName} — {fee.month}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/15 transition-colors"
              data-ocid="fees.upi_close_button"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-primary-foreground/80" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Amount */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Amount Due
              </p>
              <p className="text-4xl font-black text-primary">
                {fmt(fee.amount)}
              </p>
            </div>

            {/* UPI ID */}
            <div className="rounded-lg bg-muted/50 border border-border/60 p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                UPI ID
              </p>
              <p className="text-lg font-black text-foreground tracking-wide">
                want5083@okaxis
              </p>
              <p className="text-xs text-muted-foreground">
                Maktab Zaid Bin Sabit
              </p>
            </div>

            {/* Direct Pay button */}
            <a
              href={upiDeepLink}
              className="block w-full"
              data-ocid="fees.upi_pay_button"
            >
              <button
                type="button"
                className="w-full px-4 py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Open UPI App & Pay {fmt(fee.amount)}
              </button>
            </a>

            {/* Screenshot reminder */}
            <div className="rounded-lg border border-gold/40 bg-gold/5 p-3 space-y-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="text-gold-dark">★</span>
                After payment
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Please send a screenshot of your payment via WhatsApp to
                confirm.
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all duration-150"
                data-ocid="fees.upi_screenshot_whatsapp_button"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Send Screenshot via WhatsApp
              </a>
            </div>
          </div>

          <div className="px-6 pb-5">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onClose}
              data-ocid="fees.upi_close_button_bottom"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </dialog>
  );
}

// ─── Add Fee Record Modal (Admin) ─────────────────────────────────────────────

interface AddFeeModalProps {
  students: Student[];
  onClose: () => void;
  onSave: (rec: FeeRecord) => void;
}

const MONTHS = [
  "January 2026",
  "February 2026",
  "March 2026",
  "April 2026",
  "May 2026",
  "June 2026",
];

function AddFeeModal({ students, onClose, onSave }: AddFeeModalProps) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [month, setMonth] = useState("April 2026");
  const [amount, setAmount] = useState("");

  const selectedStudent = students.find((s) => s.id === studentId);

  function handleSave() {
    if (!studentId || !month || !amount || Number(amount) <= 0) return;
    const rec: FeeRecord = {
      id: createId(),
      studentId,
      studentName: selectedStudent?.name ?? "",
      month,
      amount: Number(amount),
      status: "pending",
    };
    onSave(rec);
    onClose();
  }

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm w-full h-full max-w-full max-h-full m-0 border-0"
      data-ocid="fees.add_dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <Card className="w-full max-w-md card-elevated page-enter shadow-2xl">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary rounded-t-xl">
            <div>
              <h2 className="text-base font-bold text-primary-foreground">
                Add Fee Record
              </h2>
              <p className="text-xs text-primary-foreground/70 mt-0.5">
                Create a new monthly fee entry
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/15 transition-colors"
              data-ocid="fees.add_close_button"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-primary-foreground/80" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-student" className="text-sm font-medium">
                Student
              </Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger
                  id="add-student"
                  data-ocid="fees.add_student.select"
                >
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-month" className="text-sm font-medium">
                Month
              </Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger id="add-month" data-ocid="fees.add_month.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-amount" className="text-sm font-medium">
                Amount (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                  ₹
                </span>
                <Input
                  id="add-amount"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 font-semibold"
                  placeholder={
                    selectedStudent
                      ? String(selectedStudent.fees)
                      : "Enter amount"
                  }
                  data-ocid="fees.add_amount.input"
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-5 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-ocid="fees.add_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 btn-green"
              onClick={handleSave}
              disabled={!studentId || !month || !amount || Number(amount) <= 0}
              data-ocid="fees.add_confirm_button"
            >
              Add Record
            </Button>
          </div>
        </CardContent>
      </Card>
    </dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FeesPage({ session }: FeesPageProps) {
  const allStudents = getStudents();
  const [records, setRecords] = useState<FeeRecord[]>(() => getFees());
  const [filter, setFilter] = useState<FilterOption>("All");
  const [search, setSearch] = useState("");
  const [reminderFee, setReminderFee] = useState<FeeRecord | null>(null);
  const [paidConfirmFee, setPaidConfirmFee] = useState<FeeRecord | null>(null);
  const [upiFee, setUpiFee] = useState<FeeRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Track parent activity
  useEffect(() => {
    if (session.role === "parent" && session.mobile) {
      addParentActivity(session.mobile, "Viewed fees");
    }
  }, [session.role, session.mobile]);

  // ── Role-based filtering ──────────────────────────────────────────────────

  const visibleRecords = useMemo(() => {
    if (session.role === "admin") return records;

    if (session.role === "teacher") {
      // Filter by teacher's assigned class (teacherClass takes priority, falls back to name)
      const myStudentIds = allStudents
        .filter((s) =>
          session.teacherClass
            ? s.className === session.teacherClass
            : s.teacherName === session.name,
        )
        .map((s) => s.id);
      return records.filter((r) => myStudentIds.includes(r.studentId));
    }

    // parent: find their child by parentMobile
    if (session.role === "parent" && session.mobile) {
      const child = allStudents.find((s) => s.parentMobile === session.mobile);
      if (!child) return [];
      return records.filter((r) => r.studentId === child.id);
    }

    return [];
  }, [records, session, allStudents]);

  const filtered = useMemo(
    () =>
      visibleRecords.filter((f) => {
        const matchStatus = filter === "All" || f.status === filter;
        const matchSearch = f.studentName
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchStatus && matchSearch;
      }),
    [visibleRecords, filter, search],
  );

  // ── Summary totals ────────────────────────────────────────────────────────

  const totalBilled = visibleRecords.reduce((s, r) => s + r.amount, 0);
  const totalCollected = visibleRecords
    .filter((r) => r.status === "paid")
    .reduce((s, r) => s + r.amount, 0);
  const totalPending = totalBilled - totalCollected;
  const pendingCount = visibleRecords.filter(
    (r) => r.status === "pending",
  ).length;

  // ── Mutations ─────────────────────────────────────────────────────────────

  function toggleStatus(id: string) {
    const target = records.find((r) => r.id === id);
    const wasToggling = target?.status === "pending"; // pending → paid transition
    setRecords((prev) => {
      const updated = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status:
                r.status === "paid"
                  ? "pending"
                  : ("paid" as "paid" | "pending"),
            }
          : r,
      );
      saveFees(updated);
      return updated;
    });
    showSuccess("Fee status updated.");
    // For teacher: when marking as PAID, show WhatsApp confirmation modal
    if (session.role === "teacher" && wasToggling && target) {
      setPaidConfirmFee(target);
    }
  }

  function handleAddFee(rec: FeeRecord) {
    setRecords((prev) => {
      const updated = [...prev, rec];
      saveFees(updated);
      return updated;
    });
    showSuccess(`Fee record added for ${rec.studentName}.`);
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function getParentMobile(fee: FeeRecord): string {
    return allStudents.find((s) => s.id === fee.studentId)?.parentMobile ?? "";
  }

  function getTeacherMobile(fee: FeeRecord): string {
    const student = allStudents.find((s) => s.id === fee.studentId);
    if (!student) return "";
    // Try to find teacher mobile from getTeachers, but we don't import it here
    // Use a simple fallback: teacher mobile from stored teachers via localStorage
    try {
      const raw = localStorage.getItem("madrasa_teachers");
      if (raw) {
        const teachers = JSON.parse(raw) as Array<{
          name: string;
          mobile: string;
        }>;
        const t = teachers.find((t) => t.name === student.teacherName);
        return t?.mobile ?? "";
      }
    } catch {
      // ignore
    }
    return "";
  }

  function rowBg(status: "paid" | "pending") {
    return status === "paid"
      ? "row-hover-paid transition-colors duration-150"
      : "row-hover-pending transition-colors duration-150";
  }

  const isReadOnly = session.role === "parent";
  const canAdd = session.role === "admin";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 page-enter" data-ocid="fees.page">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Fees Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {session.role === "parent"
              ? "Your child's fee records"
              : session.role === "teacher"
                ? `${session.name}'s class — ${visibleRecords.length} records`
                : `All students — ${visibleRecords.length} records`}
          </p>
        </div>
        {canAdd && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="btn-green gap-2 shadow-sm"
            data-ocid="fees.add_payment_button"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Fee Record</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        data-ocid="fees.summary"
      >
        <SummaryCard
          icon={IndianRupee}
          label="Total Fees Billed"
          value={fmt(totalBilled)}
          sub="This period"
          colorClass="text-primary"
          bgClass="bg-primary/10"
          borderClass="border-primary/20"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Fees Collected"
          value={fmt(totalCollected)}
          sub={
            totalBilled > 0
              ? `${Math.round((totalCollected / totalBilled) * 100)}% of total billed`
              : "No records"
          }
          colorClass="summary-card-collected"
          bgClass="summary-icon-collected"
          borderClass="border-border/40"
          isHighlight
        />
        <SummaryCard
          icon={TrendingDown}
          label="Pending Balance"
          value={fmt(totalPending)}
          sub={`${pendingCount} student${pendingCount !== 1 ? "s" : ""} with dues`}
          colorClass="summary-card-pending"
          bgClass="summary-icon-pending"
          borderClass="border-border/40"
        />
      </div>

      {/* Success banner */}
      {successMsg && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg banner-success text-sm font-medium"
          data-ocid="fees.success_state"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <Card className="card-elevated border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-ocid="fees.search_input"
              />
            </div>
            <div
              className="flex gap-2 flex-wrap"
              data-ocid="fees.status_filters"
            >
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  data-ocid={`fees.filter.${s}`}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                    filter === s
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {s === "All" ? "All" : s === "paid" ? "Paid" : "Pending"}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card
        className="card-elevated border-border/60 overflow-hidden"
        data-ocid="fees.table"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-border bg-muted/60">
                <th className="px-4 py-3 text-left font-semibold text-foreground/60 text-xs uppercase tracking-wider w-8">
                  #
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground/60 text-xs uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground/60 text-xs uppercase tracking-wider hidden md:table-cell">
                  Month
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground/60 text-xs uppercase tracking-wider">
                  Amount (₹)
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground/60 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground/60 text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                    data-ocid="fees.empty_state"
                  >
                    No fee records found.
                  </td>
                </tr>
              )}
              {filtered.map((rec, i) => (
                <tr
                  key={rec.id}
                  className={`border-b border-border/40 ${rowBg(rec.status)}`}
                  data-ocid={`fees.item.${i + 1}`}
                >
                  <td className="px-4 py-3.5 text-muted-foreground text-xs font-medium">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/15">
                        <span className="text-xs font-bold text-primary">
                          {rec.studentName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate text-sm">
                          {rec.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {rec.month}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell text-xs font-medium">
                    {rec.month}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-foreground">
                    {fmt(rec.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {/* Admin/teacher: clickable badge to toggle status */}
                    {!isReadOnly ? (
                      <button
                        type="button"
                        onClick={() => toggleStatus(rec.id)}
                        title="Click to toggle status"
                        data-ocid={`fees.toggle_status.${i + 1}`}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <FeeBadge status={rec.status} />
                      </button>
                    ) : (
                      <FeeBadge status={rec.status} />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Reminder button — admin/teacher, pending only */}
                      {!isReadOnly && rec.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => setReminderFee(rec)}
                          title="Send WhatsApp Reminder"
                          data-ocid={`fees.reminder_button.${i + 1}`}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-700 hover:bg-amber-500 hover:text-white active:scale-95 transition-all duration-200 border border-amber-500/20 flex items-center gap-1"
                        >
                          <Bell className="w-3 h-3" />
                          <span className="hidden sm:inline">Remind</span>
                        </button>
                      )}
                      {/* UPI Pay button — parent, pending only */}
                      {isReadOnly && rec.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => setUpiFee(rec)}
                          data-ocid={`fees.upi_button.${i + 1}`}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all duration-200 border border-primary/20 flex items-center gap-1"
                        >
                          <Smartphone className="w-3 h-3" />
                          Pay UPI
                        </button>
                      )}
                      {/* Cleared state */}
                      {rec.status === "paid" && (
                        <span className="text-xs text-muted-foreground/40 font-medium">
                          Cleared
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/60">
                  <td
                    colSpan={3}
                    className="px-4 py-3 font-bold text-foreground text-sm"
                  >
                    Total — {filtered.length} record
                    {filtered.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-foreground">
                    {fmt(filtered.reduce((s, r) => s + r.amount, 0))}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

      {/* WhatsApp Reminder Modal */}
      {reminderFee && (
        <ReminderModal
          fee={reminderFee}
          parentMobile={getParentMobile(reminderFee)}
          onClose={() => setReminderFee(null)}
        />
      )}

      {/* Paid Confirmation WhatsApp Modal (teacher) */}
      {paidConfirmFee && (
        <PaidConfirmModal
          fee={paidConfirmFee}
          parentMobile={getParentMobile(paidConfirmFee)}
          onClose={() => setPaidConfirmFee(null)}
        />
      )}

      {/* UPI Pay Modal (parent) */}
      {upiFee && (
        <UpiModal
          fee={upiFee}
          teacherMobile={getTeacherMobile(upiFee)}
          studentName={upiFee.studentName}
          onClose={() => setUpiFee(null)}
        />
      )}

      {/* Add Fee Record Modal (admin) */}
      {showAddModal && (
        <AddFeeModal
          students={allStudents}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddFee}
        />
      )}
    </div>
  );
}
