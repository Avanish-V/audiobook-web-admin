import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  audioUrl: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type AudiobookInput = Omit<Audiobook, "id" | "createdAt" | "updatedAt">;

const audiobookInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  author: z.string().trim().min(1, "Author is required"),
  description: z.string().trim().optional().default(""),
  coverUrl: z.string().trim().optional().default(""),
  audioUrl: z.string().trim().min(1, "Audio URL is required"),
});

const listAudiobooksFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listAudiobooksServer } = await import("./books.server");
  return listAudiobooksServer();
});

const getAudiobookFn = createServerFn({ method: "GET" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    const { getAudiobookServer } = await import("./books.server");
    return getAudiobookServer(id);
  });

const createAudiobookFn = createServerFn({ method: "POST" })
  .validator((data: AudiobookInput) => audiobookInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { createAudiobookServer } = await import("./books.server");
    return createAudiobookServer(data);
  });

const updateAudiobookFn = createServerFn({ method: "POST" })
  .validator((payload: { id: string; data: Partial<AudiobookInput> }) =>
    z
      .object({
        id: z.string().min(1),
        data: audiobookInputSchema.partial(),
      })
      .parse(payload),
  )
  .handler(async ({ data: payload }) => {
    const { updateAudiobookServer } = await import("./books.server");
    return updateAudiobookServer(payload.id, payload.data);
  });

const deleteAudiobookFn = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    const { deleteAudiobookServer } = await import("./books.server");
    return deleteAudiobookServer(id);
  });

export async function listAudiobooks(): Promise<Audiobook[]> {
  return listAudiobooksFn();
}

export async function getAudiobook(id: string): Promise<Audiobook | null> {
  return getAudiobookFn({ data: id });
}

export async function createAudiobook(data: AudiobookInput): Promise<string> {
  return createAudiobookFn({ data });
}

export async function updateAudiobook(id: string, data: Partial<AudiobookInput>): Promise<void> {
  await updateAudiobookFn({ data: { id, data } });
}

export async function deleteAudiobook(id: string): Promise<void> {
  await deleteAudiobookFn({ data: id });
}
