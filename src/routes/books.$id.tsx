import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { BookForm } from "@/components/BookForm";
import { getAudiobook, updateAudiobook, type Audiobook } from "@/lib/books";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/books/$id")({
  head: () => ({
    meta: [
      { title: "Edit audiobook · Admin" },
      { name: "description", content: "Edit an audiobook and its chapters." },
    ],
  }),
  component: EditBookPage,
});

function EditBookPage() {
  return (
    <AdminShell>
      <ClientOnly fallback={<Loading />}>
        <EditBookForm />
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

function EditBookForm() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Audiobook | null | undefined>(undefined);

  useEffect(() => {
    getAudiobook(id)
      .then(setBook)
      .catch((e) => {
        toast.error(e?.message ?? "Failed to load");
        setBook(null);
      });
  }, [id]);

  if (book === undefined) return <Loading />;
  if (book === null)
    return (
      <div className="mx-auto max-w-2xl rounded-md border bg-background p-8 text-center text-muted-foreground">
        Audiobook not found.
      </div>
    );

  return (
    <BookForm
      initial={book}
      submitLabel="Save changes"
      onSubmit={async (data) => {
        try {
          await updateAudiobook(id, data);
          toast.success("Changes saved");
          navigate({ to: "/books" });
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : "Failed to save");
        }
      }}
    />
  );
}
