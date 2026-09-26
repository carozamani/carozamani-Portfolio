import type { JSONContent } from '@tiptap/react';

export const WORDS_PER_MINUTE = 200;
export const EXCERPT_LENGTH = 160;

export const paragraphsToDoc = (paragraphs: string[]): JSONContent => ({
  type: 'doc',
  content: paragraphs.map((text) => ({ type: 'paragraph', content: [{ type: 'text', text }] })),
});

export const plainTextWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/** All text of a document, block by block, without needing an editor instance. */
export const docToText = (node: JSONContent): string => {
  if (node.text) return node.text;
  const children = (node.content ?? []).map(docToText).join(' ');
  return children;
};

export const countWords = (doc: JSONContent) => plainTextWords(docToText(doc));

export const readingMinutes = (doc: JSONContent) =>
  Math.max(1, Math.ceil(countWords(doc) / WORDS_PER_MINUTE));

/** First readable text of the article, trimmed to a card-sized summary. */
export const excerpt = (doc: JSONContent) => {
  const text = docToText(doc).replace(/\s+/g, ' ').trim();
  if (text.length <= EXCERPT_LENGTH) return text;
  return `${text.slice(0, EXCERPT_LENGTH).replace(/\s+\S*$/, '')}…`;
};

export const hasContent = (node: JSONContent): boolean =>
  node.type === 'image' ||
  node.type === 'horizontalRule' ||
  Boolean(node.text?.trim()) ||
  Boolean(node.content?.some(hasContent));
