'use client';

import { useState } from 'react';
import { EditorContent, useEditor, type Editor, type JSONContent } from '@tiptap/react';
import { Placeholder } from '@tiptap/extensions';
import { richTextExtensions } from '@/lib/rich-text/extensions';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { IMAGE_TYPES, uploadImage } from '../lib/adminApi';
import { ImageDialog, LinkDialog, type LinkValues } from './EditorDialogs';
import { EditorToolbar } from './EditorToolbar';
import '@/styles/rich-content.css';

type Props = {
  initialContent: JSONContent;
  onChange: (doc: JSONContent, editor: Editor) => void;
};

type Dialog = 'link' | 'image' | null;

export function RichTextEditor({ initialContent, onChange }: Props) {
  const { editor: t } = useDictionary().admin;
  const [dialog, setDialog] = useState<Dialog>(null);

  const editor = useEditor({
    extensions: [...richTextExtensions, Placeholder.configure({ placeholder: t.bodyPlaceholder })],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange(e.getJSON(), e),
    editorProps: {
      attributes: { class: 'rich-content ProseMirror', 'aria-label': t.contentLabel },
      // pasted or dropped image files are uploaded, then inserted as image nodes
      handlePaste: (view, event) =>
        insertImages(event.clipboardData?.files, () => view.state.selection.from),
      handleDrop: (view, event) =>
        insertImages(
          event.dataTransfer?.files,
          () => view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos,
        ),
    },
  });

  function insertImages(files: FileList | null | undefined, position: () => number | undefined) {
    const images = [...(files ?? [])].filter((file) => IMAGE_TYPES.includes(file.type));
    if (images.length === 0 || !editor) return false;
    const at = position();
    images.forEach(async (file) => {
      const src = await uploadImage(file).catch(() => null);
      if (!src) return;
      const chain = editor.chain().focus();
      (at === undefined ? chain : chain.setTextSelection(at)).setImage({ src }).run();
    });
    return true;
  }

  if (!editor) return null;

  const currentLink: LinkValues | null = editor.isActive('link')
    ? {
        href: String(editor.getAttributes('link').href ?? ''),
        newTab: editor.getAttributes('link').target === '_blank',
      }
    : null;

  const closeDialog = () => {
    setDialog(null);
    editor.commands.focus();
  };

  return (
    <div className="border-border rounded-xl border">
      <EditorToolbar
        editor={editor}
        onLink={() => setDialog('link')}
        onImage={() => setDialog('image')}
      />
      <div className="p-5">
        <EditorContent editor={editor} />
      </div>
      {dialog === 'link' && (
        <LinkDialog
          initial={currentLink}
          onClose={closeDialog}
          onRemove={() => {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            closeDialog();
          }}
          onApply={({ href, newTab }) => {
            editor
              .chain()
              .focus()
              .extendMarkRange('link')
              .setLink({ href, target: newTab ? '_blank' : null })
              .run();
            closeDialog();
          }}
        />
      )}
      {dialog === 'image' && (
        <ImageDialog
          onClose={closeDialog}
          onInsert={({ src, alt }) => {
            editor.chain().focus().setImage({ src, alt }).run();
            closeDialog();
          }}
        />
      )}
    </div>
  );
}
