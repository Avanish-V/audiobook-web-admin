import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { BookForm } from "@/components/BookForm";
import { createAudiobook } from "@/lib/books";
import { toast } from "sonner";

export const Route = createFileRoute("/books/new")({
  head: () => ({
    meta: [
      { title: "New audiobook · Admin" },
      { name: "description", content: "Add a new audiobook to your Firestore catalog." },
    ],
  }),
  component: NewBookPage,
});

function NewBookPage() {
  return (
    <AdminShell>
      <ClientOnly fallback={null}>
        <NewBookForm />
      </ClientOnly>
    </AdminShell>
  );
}

function NewBookForm() {
  const navigate = useNavigate();
  return (
    <BookForm
      submitLabel="Create audiobook"
      onSubmit={async (data) => {
        try {
          const id = await createAudiobook(data);
          toast.success("Audiobook created");
          navigate({ to: "/books/$id", params: { id } });
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : "Failed to create");
        }
      }}
    />
  );
}
