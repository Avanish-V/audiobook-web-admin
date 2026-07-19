import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookAudio, CheckCircle2, ListMusic, Loader2 } from "lucide-react";
import { listAudiobooks, type Audiobook } from "@/lib/books";
import { isFirebaseConfigured } from "@/lib/firebase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Audiobook Admin" },
      { name: "description", content: "Manage your audiobook catalog." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AdminShell>
      <ClientOnly fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </ClientOnly>
    </AdminShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex h-40 items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading dashboard…
    </div>
  );
}

function DashboardContent() {
  const [books, setBooks] = useState<Audiobook[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setBooks([]);
      return;
    }
    listAudiobooks()
      .then(setBooks)
      .catch((e) => setError(e.message ?? "Failed to load"));
  }, []);

  const total = books?.length ?? 0;
  const withAudio = books?.filter((b) => !!b.audioUrl).length ?? 0;
  const withCover = books?.filter((b) => !!b.coverUrl).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of your audiobook catalog.</p>
      </div>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Audiobooks" value={total} icon={<BookAudio className="h-4 w-4" />} />
        <StatCard label="With audio" value={withAudio} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="With cover" value={withCover} icon={<ListMusic className="h-4 w-4" />} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
