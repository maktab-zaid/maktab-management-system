import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  BookOpen,
  Check,
  Copy,
  MessageCircle,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type Notice,
  type Session,
  createId,
  getNotices,
  saveNotices,
} from "../lib/storage";

export interface NoticesPageProps {
  session: Session;
}

interface CreateForm {
  title: string;
  message: string;
  date: string;
}

const today = (): string => new Date().toISOString().split("T")[0];

const EMPTY_FORM: CreateForm = { title: "", message: "", date: today() };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildWhatsAppText(notice: Notice): string {
  return `*${notice.title}* — ${formatDate(notice.date)}\n\n${notice.message}\n\n— Maktab Zaid Bin Sabit`;
}

export default function NoticesPage({ session }: NoticesPageProps) {
  const isAdmin = session.role === "admin";

  const [notices, setNotices] = useState<Notice[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load notices from Supabase on mount
  useEffect(() => {
    getNotices()
      .then((n) =>
        setNotices(
          [...n].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        ),
      )
      .catch(() => setNotices([]));
  }, []);

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    const next: Notice = {
      id: createId(),
      title: form.title.trim(),
      message: form.message.trim(),
      date: form.date || today(),
      createdBy: "Admin",
    };
    const updated = [next, ...notices];
    setNotices(updated);
    await saveNotices(updated);
    setForm(EMPTY_FORM);
    setShowCreate(false);
    toast.success("Notice published successfully.");
  };

  const handleDelete = async (notice: Notice) => {
    const updated = notices.filter((n) => n.id !== notice.id);
    setNotices(updated);
    await saveNotices(updated);
    setDeleteTarget(null);
    toast.success(`"${notice.title}" deleted.`);
  };

  // ── Share helpers ────────────────────────────────────────────────────────────

  const handleWhatsApp = (notice: Notice) => {
    const text = buildWhatsAppText(notice);
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleCopy = async (notice: Notice) => {
    const text = buildWhatsAppText(notice);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(notice.id);
      toast.success("Message copied to clipboard.");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  // The latest notice is the first in the sorted list
  const latestNoticeId = notices[0]?.id ?? null;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 page-enter" data-ocid="notices.page">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Notices</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {notices.length} notice{notices.length !== 1 ? "s" : ""} published
          </p>
        </div>
        {isAdmin && (
          <Button
            type="button"
            className="btn-green gap-2 shadow-sm"
            onClick={() => setShowCreate(true)}
            data-ocid="notices.create_button"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Notice</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>

      {/* Cards grid */}
      {notices.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="notices.list"
        >
          {notices.map((notice, i) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              index={i}
              isAdmin={isAdmin}
              isLatest={notice.id === latestNoticeId}
              copiedId={copiedId}
              onDelete={() => setDeleteTarget(notice)}
              onWhatsApp={() => handleWhatsApp(notice)}
              onCopy={() => handleCopy(notice)}
            />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-20 gap-4 text-center card-base rounded-xl"
          data-ocid="notices.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No notices yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              {isAdmin
                ? "Create your first notice to share information with parents and staff."
                : "No notices have been published yet. Check back later."}
            </p>
          </div>
          {isAdmin && (
            <Button
              type="button"
              className="btn-green gap-2"
              onClick={() => setShowCreate(true)}
              data-ocid="notices.empty_create_button"
            >
              <Plus className="w-4 h-4" />
              Create First Notice
            </Button>
          )}
        </div>
      )}

      {/* ── Create Notice Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={showCreate}
        onOpenChange={(o) => {
          setShowCreate(o);
          if (!o) setForm(EMPTY_FORM);
        }}
      >
        <DialogContent
          className="sm:max-w-lg"
          data-ocid="notices.create_modal.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </span>
              Create Notice
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="notice-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="notice-title"
                placeholder="Enter a clear, descriptive title…"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                data-ocid="notices.title.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notice-date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="notice-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                data-ocid="notices.date.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notice-message" className="text-sm font-medium">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="notice-message"
                placeholder="Write the full notice message here…"
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className="resize-none"
                data-ocid="notices.content.textarea"
              />
            </div>

            {/* WhatsApp preview */}
            {(form.title.trim() || form.message.trim()) && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  WhatsApp Preview
                </p>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-mono">
                  {buildWhatsAppText({
                    id: "",
                    title: form.title || "Notice Title",
                    message: form.message || "Notice message…",
                    date: form.date || today(),
                    createdBy: "Admin",
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowCreate(false);
                setForm(EMPTY_FORM);
              }}
              data-ocid="notices.create_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 btn-green"
              onClick={handleCreate}
              disabled={!form.title.trim() || !form.message.trim()}
              data-ocid="notices.create_modal.confirm_button"
            >
              Publish Notice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ────────────────────────────────────────────── */}
      {deleteTarget && (
        <Dialog
          open={!!deleteTarget}
          onOpenChange={(o) => {
            if (!o) setDeleteTarget(null);
          }}
        >
          <DialogContent
            className="sm:max-w-sm"
            data-ocid="notices.delete_confirm.dialog"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </span>
                <span className="text-destructive">Delete Notice</span>
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteTarget.title}&rdquo;
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteTarget(null)}
                data-ocid="notices.delete_confirm.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(deleteTarget)}
                data-ocid="notices.delete_confirm.confirm_button"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ── Notice Card ──────────────────────────────────────────────────────────────

interface NoticeCardProps {
  notice: Notice;
  index: number;
  isAdmin: boolean;
  isLatest: boolean;
  copiedId: string | null;
  onDelete: () => void;
  onWhatsApp: () => void;
  onCopy: () => void;
}

function NoticeCard({
  notice,
  index,
  isAdmin,
  isLatest,
  copiedId,
  onDelete,
  onWhatsApp,
  onCopy,
}: NoticeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const preview =
    notice.message.length > 120
      ? `${notice.message.slice(0, 120)}…`
      : notice.message;
  const isCopied = copiedId === notice.id;

  return (
    <Card
      style={
        isLatest
          ? { borderLeftColor: "oklch(0.72 0.18 75)", borderLeftWidth: "4px" }
          : { borderLeftColor: "oklch(0.45 0.15 145)", borderLeftWidth: "4px" }
      }
      className={[
        "relative rounded-xl overflow-hidden",
        "transition-all duration-300 ease-out group",
        "hover:-translate-y-1 hover:shadow-xl",
        expanded ? "ring-2 ring-primary/20 shadow-lg" : "shadow-sm",
        isLatest ? "border-2 border-gold/50 ring-1 ring-gold/20" : "border",
      ].join(" ")}
      data-ocid={`notices.item.${index + 1}`}
    >
      {/* Gold shimmer on hover */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.75 0.18 75), oklch(0.88 0.12 80), oklch(0.75 0.18 75), transparent)",
        }}
        aria-hidden
      />

      <CardContent className="p-4 space-y-3">
        {/* Top row: date badge + latest badge + admin delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border notice-badge-event">
              <Bell className="w-3 h-3 flex-shrink-0" />
              {formatDate(notice.date)}
            </span>
            {isLatest && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                style={{
                  background: "oklch(0.72 0.18 75 / 0.15)",
                  color: "oklch(0.55 0.15 70)",
                  borderColor: "oklch(0.72 0.18 75 / 0.40)",
                }}
                data-ocid={`notices.latest_badge.${index + 1}`}
              >
                <Star className="w-3 h-3 flex-shrink-0" />
                Latest
              </span>
            )}
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={onDelete}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 flex-shrink-0"
              aria-label={`Delete "${notice.title}"`}
              data-ocid={`notices.delete_button.${index + 1}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground leading-snug line-clamp-2 text-sm">
          {notice.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bell className="w-3 h-3 flex-shrink-0" />
          <span className="font-medium">{notice.createdBy}</span>
        </div>

        {/* Message (expand / collapse) */}
        <div
          className={[
            "overflow-hidden transition-all duration-300 ease-out",
            expanded ? "max-h-96" : "max-h-14",
          ].join(" ")}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            {expanded ? notice.message : preview}
          </p>
        </div>

        {/* Footer: read more + share actions */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/70 transition-colors duration-150"
            data-ocid={`notices.read_more.${index + 1}`}
          >
            {expanded ? "Show less" : "Read more"}
          </button>

          {/* WhatsApp + Copy */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
              aria-label="Copy notice message"
              data-ocid={`notices.copy_button.${index + 1}`}
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onWhatsApp}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all duration-150"
              aria-label="Share on WhatsApp"
              data-ocid={`notices.whatsapp_button.${index + 1}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
