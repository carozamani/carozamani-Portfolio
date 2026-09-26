import type { JSONContent } from '@tiptap/react';
import { generateHTML } from '@tiptap/html';
import { richTextExtensions } from './extensions';

/**
 * Output is generated from the editor schema, so only nodes and marks the schema allows can reach
 * the page (unknown tags are dropped and link hrefs are protocol-checked by the Link extension).
 */
export const renderRichText = (doc: JSONContent) => generateHTML(doc, richTextExtensions);
