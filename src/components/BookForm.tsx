import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Audiobook, AudiobookInput, Chapter } from "@/lib/books";

export interface BookFormProps {
  initial?: Audiobook;
  submitLabel: string;
  onSubmit: (data: AudiobookInput) => Promise<void>;
}

export function BookForm({ initial, submitLabel, onSubmit }: BookFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [narrator, setNarrator] = useState(initial?.narrator ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "en");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [chapters, setChapters] = useState<Chapter[]>(initial?.chapters ?? []);
  const [saving, setSaving] = useState(false);

  const updateChapter = (i: number, patch: Partial<Chapter>) =>
    setChapters((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const addChapter = () =>
    setChapters((cs) => [...cs, { title: `Chapter ${cs.length + 1}`, audioUrl: "" }]);
  const removeChapter = (i: number) => setChapters((cs) => cs.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        narrator: narrator.trim() || undefined,
        description: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        language: language.trim() || undefined,
        published,
        chapters: chapters.map((c) => ({
          title: c.title.trim(),
          audioUrl: c.audioUrl.trim(),
          duration: c.duration?.trim() || undefined,
        })),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/books">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label="Author" required>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} required />
          </Field>
          <Field label="Narrator">
            <Input value={narrator} onChange={(e) => setNarrator(e.target.value)} />
          </Field>
          <Field label="Language">
            <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en" />
          </Field>
          <Field label="Cover image URL" className="sm:col-span-2">
            <Input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </Field>
          <div className="flex items-center justify-between rounded-md border p-3 sm:col-span-2">
            <div>
              <Label className="text-sm font-medium">Published</Label>
              <p className="text-xs text-muted-foreground">
                Draft books stay hidden from the audiobook platform.
              </p>
            </div>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Chapters</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addChapter}>
            <Plus className="mr-1 h-4 w-4" /> Add chapter
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {chapters.length === 0 && (
            <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
              No chapters yet. Add one to get started.
            </p>
          )}
          {chapters.map((c, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-md border bg-muted/30 p-3 sm:grid-cols-[1fr_2fr_100px_auto] sm:items-end"
            >
              <Field label={`#${i + 1} Title`}>
                <Input
                  value={c.title}
                  onChange={(e) => updateChapter(i, { title: e.target.value })}
                  required
                />
              </Field>
              <Field label="Audio URL">
                <Input
                  value={c.audioUrl}
                  onChange={(e) => updateChapter(i, { audioUrl: e.target.value })}
                  placeholder="https://…mp3"
                  required
                />
              </Field>
              <Field label="Duration">
                <Input
                  value={c.duration ?? ""}
                  onChange={(e) => updateChapter(i, { duration: e.target.value })}
                  placeholder="12:34"
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeChapter(i)}
                aria-label="Remove chapter"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="outline" type="button">
          <Link to="/books">Cancel</Link>
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
  required,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
