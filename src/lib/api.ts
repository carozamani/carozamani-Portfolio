import type { CaseStudy } from '@/types/caseStudy';
import type { CardProps } from '@/types/card';
import type { AdminMessage } from '@/data/admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
const TOKEN_KEY = 'admin_token';

type ServerFields = { _id: string; order?: number; createdAt?: string; updatedAt?: string };
export type CaseStudyDoc = CaseStudy & ServerFields;
export type MediaDoc = Omit<CardProps, 'id'> & ServerFields & { slug: string };
type MessageDoc = Omit<AdminMessage, 'id' | 'date'> & { _id: string; createdAt: string };

export function mapCaseStudy(doc: CaseStudyDoc): CaseStudy {
  const { _id, order, createdAt, updatedAt, ...rest } = doc;
  void [_id, order, createdAt, updatedAt];
  return rest;
}

export function mapMedia(doc: MediaDoc): CardProps {
  const { _id, order, createdAt, updatedAt, slug, ...rest } = doc;
  void [_id, order, createdAt, updatedAt];
  return { id: slug, ...rest };
}

function mapMessage(doc: MessageDoc): AdminMessage {
  const { _id, createdAt, ...rest } = doc;
  return { id: _id, date: createdAt.slice(0, 10), ...rest };
}

const PUBLIC_REVALIDATE_SECONDS = 300;
/** Tags every public content fetch so an admin save can refresh the site immediately. */
export const CONTENT_TAG = 'content';
const publicCache: RequestInit = {
  next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CONTENT_TAG] },
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // the browser sets the multipart boundary itself for FormData bodies
  const json: Record<string, string> =
    options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  const res = await fetch(`${API_URL}${path}`, {
    cache: options.next ? undefined : 'no-store',
    ...options,
    headers: { ...json, ...options.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? `Request failed with status ${res.status}`, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function login(email: string, password: string) {
  return request<{ token: string; email: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const docs = await request<CaseStudyDoc[]>('/case-studies', publicCache);
  return docs.map(mapCaseStudy);
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  try {
    const doc = await request<CaseStudyDoc>(`/case-studies/${slug}`, publicCache);
    return mapCaseStudy(doc);
  } catch {
    return null;
  }
}

export async function getMedia(type?: 'podcast' | 'article'): Promise<CardProps[]> {
  const query = type ? `?type=${type}` : '';
  const docs = await request<MediaDoc[]>(`/media${query}`, publicCache);
  return docs.map(mapMedia);
}

export async function getMediaBySlug(slug: string): Promise<CardProps | null> {
  try {
    const doc = await request<MediaDoc>(`/media/${slug}`, publicCache);
    return mapMedia(doc);
  } catch {
    return null;
  }
}

export async function submitContactMessage(values: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  await request('/messages', { method: 'POST', body: JSON.stringify(values) });
}

export async function getAdminMessages(token: string): Promise<AdminMessage[]> {
  const docs = await request<MessageDoc[]>('/messages', { headers: authHeaders(token) });
  return docs.map(mapMessage);
}

export async function updateAdminMessage(
  id: string,
  change: Partial<Pick<AdminMessage, 'read' | 'archived'>>,
  token: string,
): Promise<AdminMessage> {
  const doc = await request<MessageDoc>(`/messages/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(change),
  });
  return mapMessage(doc);
}

export async function deleteAdminMessage(id: string, token: string): Promise<void> {
  await request(`/messages/${id}`, { method: 'DELETE', headers: authHeaders(token) });
}
