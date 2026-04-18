import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudents } from "@/lib/api";
import {
  ArrowLeft,
  Banknote,
  Clock,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  feesCollected: number;
  pendingFees: number;
  loaded: boolean;
  error: boolean;
}

interface StatusPageProps {
  onBack: () => void;
}

export default function StatusPage({ onBack }: StatusPageProps) {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    feesCollected: 0,
    pendingFees: 0,
    loaded: false,
    error: false,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const timer = setTimeout(() => {
      setStats((prev) => ({ ...prev, loaded: true, error: true }));
      setLoading(false);
    }, 2000);

    try {
      const rows = await getStudents();
      clearTimeout(timer);

      const totalStudents = rows.length;

      const uniqueTeachers = new Set(rows.map((r) => r.Teacher).filter(Boolean))
        .size;

      let feesCollected = 0;
      let pendingFees = 0;

      for (const row of rows) {
        const feeVal = Number.parseFloat(row.Fees);
        if (!Number.isNaN(feeVal)) {
          feesCollected += feeVal;
        } else if (row.Fees && row.Fees.toLowerCase() === "pending") {
          pendingFees += 1;
        }
      }

      setStats({
        totalStudents,
        totalTeachers: uniqueTeachers,
        feesCollected,
        pendingFees,
        loaded: true,
        error: false,
      });
    } catch {
      clearTimeout(timer);
      setStats((prev) => ({ ...prev, loaded: true, error: true }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
    {
      id: "status.students.card",
      label: "Total Students",
      value: stats.totalStudents,
      icon: <Users className="w-7 h-7" />,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: "status.teachers.card",
      label: "Total Teachers",
      value: stats.totalTeachers,
      icon: <UserCheck className="w-7 h-7" />,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: "status.fees-collected.card",
      label: "Fees Collected",
      value: `₹${stats.feesCollected.toLocaleString()}`,
      icon: <Banknote className="w-7 h-7" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      id: "status.pending-fees.card",
      label: "Pending Fees",
      value: `₹${stats.pendingFees.toLocaleString()}`,
      icon: <Clock className="w-7 h-7" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="islamic-bg min-h-screen">
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md">
        <Button
          data-ocid="status.back.button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-primary-foreground hover:bg-white/20 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-bold text-lg leading-tight">Status</h1>
          <p className="text-primary-foreground/75 text-xs">
            Overview &amp; Summary
          </p>
        </div>
        <div className="ml-auto">
          <Button
            data-ocid="status.refresh.button"
            variant="ghost"
            size="icon"
            onClick={loadStats}
            disabled={loading}
            className="text-primary-foreground hover:bg-white/20 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {stats.error && (
          <div
            data-ocid="status.error_state"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            ⚠️ Could not load data from Google Sheets. Make sure the Apps Script
            URL is configured and the sheet is shared as &quot;Anyone with the
            link can view&quot;.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {statCards.map((card) =>
            loading ? (
              <Card key={card.id} className="shadow-card">
                <CardContent className="p-5">
                  <Skeleton className="h-8 w-8 rounded-full mb-3" />
                  <Skeleton className="h-7 w-20 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
            ) : (
              <Card
                key={card.id}
                data-ocid={card.id}
                className="shadow-card stat-card-hover border-0 overflow-hidden"
              >
                <div className="gold-shimmer" />
                <CardContent className="p-5">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${card.bg} ${card.color} mb-3`}
                  >
                    {card.icon}
                  </div>
                  <p className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {card.label}
                  </p>
                </CardContent>
              </Card>
            ),
          )}
        </div>

        {!loading && (
          <div className="mt-8 text-center">
            <Card className="shadow-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-primary">
                  Data Source
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground pb-5">
                Data is fetched live from Google Sheets via Apps Script.
                <br />
                Ensure sheets are shared as &quot;Anyone with the link can
                view&quot;.
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
