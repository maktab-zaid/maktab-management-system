import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Bell, BellOff, CheckCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  type Notification,
  createId,
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  saveNotification,
} from "../../../lib/storage";

interface Props {
  onBack: () => void;
  onUnreadChange?: (count: number) => void;
}

const TYPE_COLORS: Record<string, string> = {
  info: "bg-primary/10 border-primary/20 text-primary",
  warning: "bg-warning/10 border-warning/20 text-warning-foreground",
  success: "bg-success/10 border-success/20 text-success-foreground",
};

function seedSampleNotifications(): Promise<void> {
  return getNotifications().then((existing) => {
    const filtered = existing.filter(
      (n) => n.forRole === "ustaad" || n.forRole === "all",
    );
    if (filtered.length > 0) return;

    const samples: Notification[] = [
      {
        id: createId(),
        title: "Fee Collection Reminder",
        message:
          "Fee collection is due this week. Please remind students and update fee status in the system.",
        type: "warning",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        date: new Date(Date.now() - 2 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        read: false,
        isRead: false,
        forRole: "ustaad",
      },
      {
        id: createId(),
        title: "Attendance Reminder",
        message:
          "Attendance sync reminder: Please ensure daily attendance is marked before Evening session.",
        type: "info",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        date: new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        read: false,
        isRead: false,
        forRole: "ustaad",
      },
      {
        id: createId(),
        title: "Parent-Teacher Meeting",
        message:
          "Parent-Teacher Meeting is scheduled for Saturday. Please prepare student progress reports.",
        type: "info",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        read: true,
        isRead: true,
        forRole: "all",
      },
    ];

    return Promise.all(samples.map((n) => saveNotification(n))).then(() => {});
  });
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function UstaadNotificationsPage({
  onBack,
  onUnreadChange,
}: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(() => {
    seedSampleNotifications()
      .then(() => {
        return getNotifications();
      })
      .then((all) => {
        const filtered = all.filter(
          (n) => n.forRole === "ustaad" || n.forRole === "all",
        );
        setNotifications(filtered);
        return getUnreadCount();
      })
      .then((count) => {
        onUnreadChange?.(count);
      })
      .catch(() => {});
  }, [onUnreadChange]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = (id: string) => {
    markNotificationRead(id)
      .then(() => loadNotifications())
      .catch(() => {});
  };

  const handleMarkAllRead = () => {
    Promise.all(
      notifications
        .filter((n) => !n.read)
        .map((n) => markNotificationRead(n.id)),
    )
      .then(() => loadNotifications())
      .catch(() => {});
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div data-ocid="teacher.notifications.page" className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="teacher.notifications.back_button"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {unread > 0
              ? `${unread} unread notification${unread !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            data-ocid="teacher.notifications.mark_all_read"
            className="gap-1.5 shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid="teacher.notifications.empty_state"
        >
          <BellOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">No notifications</p>
          <p className="text-sm text-muted-foreground">
            You're all caught up. Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <Card
              key={n.id}
              data-ocid={`teacher.notifications.item.${i + 1}`}
              className={`shadow-card transition-all cursor-pointer ${n.read ? "opacity-70" : "border-primary/30"}`}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${TYPE_COLORS[n.type ?? "info"]}`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-relaxed ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}
                    >
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(n.timestamp ?? n.date)}
                      </span>
                      {!n.read && (
                        <Badge className="text-[10px] h-4 px-1.5 bg-primary text-primary-foreground">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
