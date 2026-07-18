import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAudiobook, listAudiobooks, type Audiobook } from "@/lib/books";
import { Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "Audiobooks · Admin" },
      { name: "description", content: "Browse, edit, and remove audiobooks in your catalog." },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  return (
    <AdminShell>
      <ClientOnly fallback={<Loading />}>
        <BooksList />
      </ClientOnly>
    </AdminShell>
  );
}

function Loading() {
  return (
    <div className="flex h-40 items-center justify-center text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
    </div>
  );
}

function BooksList() {
  const [books, setBooks] = useState<Audiobook[] | null>(null);
  const [q, setQ] = useState("");

  const refresh = () => {
    listAudiobooks()
      .then(setBooks)
      .catch((e) => toast.error(e.message ?? "Failed to load"));
  };
  useEffect(refresh, []);

  const filtered =
    books?.filter(
      (b) =>
        !q ||
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        b.author.toLowerCase().includes(q.toLowerCase()),
    ) ?? [];

  const onDelete = async (id: string) => {
    try {
      await deleteAudiobook(id);
      toast.success("Audiobook deleted");
      refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audiobooks</h1>
          <p className="text-sm text-muted-foreground">Manage your catalog stored in Firestore.</p>
        </div>
        <Button asChild>
          <Link to="/books/new">
            <PlusCircle className="mr-2 h-4 w-4" /> New audiobook
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by title or author…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm bg-background"
        />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Chapters</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books === null ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No audiobooks yet.{" "}
                  <Link to="/books/new" className="text-primary underline">
                    Add your first one
                  </Link>
                  .
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell className="text-muted-foreground">{b.author}</TableCell>
                  <TableCell>{b.chapters?.length ?? 0}</TableCell>
                  <TableCell>
                    {b.published ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/books/$id" params={{ id: b.id }}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{b.title}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes the audiobook and its chapters from Firestore.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(b.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
