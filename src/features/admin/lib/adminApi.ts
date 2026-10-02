import {
  ApiError,
  authHeaders,
  clearToken,
  getToken,
  mapCaseStudy,
  mapMedia,
  request,
  type CaseStudyDoc,
  type MediaDoc,
} from '@/lib/api';
import { paragraphsToDoc } from '@/lib/rich-text/doc';
import type { AdminCard, AdminCaseStudy, PublishStatus } from '@/types/admin';

type WithStatus = { status?: PublishStatus };

/** Matches the backend whitelist; SVG is refused there because it can carry scripts. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  try {
    return await request<T>(`/admin${path}`, {
      ...options,
      headers: { ...(token ? authHeaders(token) : {}), ...options.headers },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearToken();
      window.location.assign('/admin/login');
    }
    throw error;
  }
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

const toAdminCaseStudy = (doc: CaseStudyDoc & WithStatus): AdminCaseStudy => ({
  ...mapCaseStudy(doc),
  status: doc.status ?? 'published',
});

const toAdminCard = (doc: MediaDoc & WithStatus): AdminCard => {
  const card = mapMedia(doc);
  // articles written before the rich-text editor only have plain `body` paragraphs
  const content = card.content ?? (card.body ? paragraphsToDoc(card.body) : undefined);
  return { ...card, content, status: doc.status ?? 'published' };
};

export const caseStudiesApi = {
  async list() {
    const docs = await adminRequest<(CaseStudyDoc & WithStatus)[]>('/case-studies');
    return docs.map(toAdminCaseStudy);
  },
  async save(study: AdminCaseStudy, originalSlug?: string) {
    const doc = await adminRequest<CaseStudyDoc & WithStatus>(
      originalSlug ? `/case-studies/${encodeURIComponent(originalSlug)}` : '/case-studies',
      json(originalSlug ? 'PATCH' : 'POST', study),
    );
    return toAdminCaseStudy(doc);
  },
  remove: (slug: string) =>
    adminRequest<void>(`/case-studies/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
  reorder: (slugs: string[]) => adminRequest<void>('/case-studies/order', json('PUT', { slugs })),
};

export function mediaApi(type: AdminCard['type']) {
  return {
    async list() {
      const docs = await adminRequest<(MediaDoc & WithStatus)[]>(`/media?type=${type}`);
      return docs.map(toAdminCard);
    },
    async save(card: AdminCard, originalId?: string) {
      const { id, ...fields } = card;
      const doc = await adminRequest<MediaDoc & WithStatus>(
        originalId ? `/media/${encodeURIComponent(originalId)}` : '/media',
        json(originalId ? 'PATCH' : 'POST', { ...fields, slug: id, type }),
      );
      return toAdminCard(doc);
    },
    remove: (id: string) =>
      adminRequest<void>(`/media/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  };
}

/** Returns a same-origin `/uploads/...` path; Next rewrites it to the backend. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const { url } = await adminRequest<{ url: string }>('/uploads', { method: 'POST', body });
  return url;
}
