import type { Audiobook, AudiobookInput } from "./books";
import { getFirebaseRestConfig } from "./firebase.server";

const COLLECTION = "audiobooks";
const DATABASE = "(default)";

type FirestoreValue = {
  stringValue?: string;
  timestampValue?: string;
  nullValue?: null;
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

type FirestoreListResponse = {
  documents?: FirestoreDocument[];
};

export async function listAudiobooksServer(): Promise<Audiobook[]> {
  const params = new URLSearchParams({
    key: getFirebaseRestConfig().apiKey,
    orderBy: "createdAt desc",
  });
  const response = await requestJson<FirestoreListResponse>(`${collectionUrl()}?${params}`);
  return (response.documents ?? []).map(documentToAudiobook);
}

export async function getAudiobookServer(id: string): Promise<Audiobook | null> {
  const params = new URLSearchParams({ key: getFirebaseRestConfig().apiKey });
  const response = await fetch(`${documentUrl(id)}?${params}`);

  if (response.status === 404) return null;
  if (!response.ok) throw await firestoreError(response);

  return documentToAudiobook((await response.json()) as FirestoreDocument);
}

export async function createAudiobookServer(data: AudiobookInput): Promise<string> {
  const id = createDocumentId();
  const now = new Date().toISOString();
  const params = new URLSearchParams({ key: getFirebaseRestConfig().apiKey });

  await requestJson<FirestoreDocument>(`${documentUrl(id)}?${params}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fields: {
        id: stringValue(id),
        title: stringValue(data.title),
        author: stringValue(data.author),
        description: stringValue(data.description),
        coverUrl: stringValue(data.coverUrl),
        audioUrl: stringValue(data.audioUrl),
        createdAt: timestampValue(now),
        updatedAt: timestampValue(now),
      },
    }),
  });

  return id;
}

export async function updateAudiobookServer(
  id: string,
  data: Partial<AudiobookInput>,
): Promise<void> {
  const fields: Record<string, FirestoreValue> = {
    updatedAt: timestampValue(new Date().toISOString()),
  };

  for (const key of ["title", "author", "description", "coverUrl", "audioUrl"] as const) {
    if (data[key] !== undefined) fields[key] = stringValue(data[key]);
  }

  const params = new URLSearchParams({
    key: getFirebaseRestConfig().apiKey,
    "currentDocument.exists": "true",
  });

  for (const key of Object.keys(fields)) {
    params.append("updateMask.fieldPaths", key);
  }

  await requestJson<FirestoreDocument>(`${documentUrl(id)}?${params}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fields }),
  });
}

export async function deleteAudiobookServer(id: string): Promise<void> {
  const params = new URLSearchParams({ key: getFirebaseRestConfig().apiKey });
  const response = await fetch(`${documentUrl(id)}?${params}`, { method: "DELETE" });

  if (!response.ok && response.status !== 404) throw await firestoreError(response);
}

function collectionUrl() {
  const { projectId } = getFirebaseRestConfig();
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE}/documents/${COLLECTION}`;
}

function documentUrl(id: string) {
  return `${collectionUrl()}/${encodeURIComponent(id)}`;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) throw await firestoreError(response);

  return (await response.json()) as T;
}

async function firestoreError(response: Response) {
  const text = await response.text();

  try {
    const payload = JSON.parse(text) as { error?: { message?: string } };
    return new Error(payload.error?.message ?? `Firebase request failed (${response.status})`);
  } catch {
    return new Error(`Firebase request failed (${response.status})`);
  }
}

function documentToAudiobook(document: FirestoreDocument): Audiobook {
  const fields = document.fields ?? {};
  const fallbackId = document.name.split("/").pop() ?? "";

  return {
    id: readString(fields, "id") || fallbackId,
    title: readString(fields, "title"),
    author: readString(fields, "author"),
    description: readString(fields, "description"),
    coverUrl: readString(fields, "coverUrl"),
    audioUrl: readString(fields, "audioUrl"),
    createdAt: readTimestamp(fields, "createdAt") ?? document.createTime ?? null,
    updatedAt: readTimestamp(fields, "updatedAt") ?? document.updateTime ?? null,
  };
}

function readString(fields: Record<string, FirestoreValue>, key: string) {
  return fields[key]?.stringValue ?? "";
}

function readTimestamp(fields: Record<string, FirestoreValue>, key: string) {
  return fields[key]?.timestampValue ?? null;
}

function stringValue(value: string | undefined): FirestoreValue {
  return { stringValue: value?.trim() ?? "" };
}

function timestampValue(value: string): FirestoreValue {
  return { timestampValue: value };
}

function createDocumentId() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 20);
}