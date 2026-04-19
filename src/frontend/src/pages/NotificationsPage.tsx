import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type Notification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { useState } from "react";

interface NotificationsPageProps {
  setActivePage: (page: AppPage) => void;
}

export default function NotificationsPage({
  setActivePage,
}: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    getNotifications().sort((a, b) => b.date.localeCompare(a.date)),
  );

  function handleMarkRead(id: string) {
    markNotificationRead(id);
    setNotifications(
      getNotifications().sort((a, b) => b.date.localeCompare(a.date)),
    );
  }

  function handleMarkAllRead() {
    markAllNotificationsRead();
    setNotifications(
      getNotifications().sort((a, b) => b.date.localeCompare(a.date)),
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-5 page-enter" data-ocid="notifications.page">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid="notifications.back_button"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-1.5"
            data-ocid="notifications.mark_all_read_button"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3" data-ocid="notifications.list">
        {notifications.length === 0 ? (
          <Card
            className="card-elevated border-border/60"
            data-ocid="notifications.empty_state"
          >
            <CardContent className="p-10 text-center">
              <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-semibold text-muted-foreground">
                No notifications
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                You'll see notifications here when there are updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n, i) => (
            <Card
              key={n.id}
              className={`card-elevated border-border/60 cursor-pointer transition-all hover:shadow-md ${!n.isRead ? "border-l-4 border-l-primary bg-primary/2" : ""}`}
              onClick={() => handleMarkRead(n.id)}
              data-ocid={`notifications.item.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-primary" : "bg-muted-foreground/30"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(n.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
