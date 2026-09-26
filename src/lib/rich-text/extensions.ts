import { Extension } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';

const DIRECTION_TYPES = ['paragraph', 'heading'];

/** Lets a single paragraph or heading be switched between LTR and RTL. */
const Direction = Extension.create({
  name: 'direction',
  addGlobalAttributes() {
    return [
      {
        types: DIRECTION_TYPES,
        attributes: {
          dir: {
            default: null,
            parseHTML: (element) => element.getAttribute('dir'),
            renderHTML: (attributes) => (attributes.dir ? { dir: attributes.dir } : {}),
          },
        },
      },
    ];
  },
});

/** Shared by the admin editor and the public article renderer so both agree on the schema. */
export const richTextExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: { openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } },
  }),
  Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight,
  Direction,
];

export { DIRECTION_TYPES };
