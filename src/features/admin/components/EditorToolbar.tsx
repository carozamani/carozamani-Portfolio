'use client';

import type { ComponentType, ReactNode } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PilcrowLeft,
  PilcrowRight,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin-ui/select';
import { Separator } from '@/components/admin-ui/separator';
import { Toggle } from '@/components/admin-ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/admin-ui/tooltip';
import { DIRECTION_TYPES } from '@/lib/rich-text/extensions';
import { useDictionary } from '@/lib/i18n/LocaleProvider';

type Props = { editor: Editor; onLink: () => void; onImage: () => void };

type IconType = ComponentType<{ className?: string }>;

function ToolbarToggle({
  label,
  icon: Icon,
  pressed,
  disabled,
  onClick,
}: {
  label: string;
  icon: IconType;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          aria-label={label}
          pressed={pressed ?? false}
          disabled={disabled}
          onPressedChange={onClick}
          // keep the editor selection when clicking toolbar buttons
          onMouseDown={(event) => event.preventDefault()}
        >
          <Icon className="size-4" />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

const Divider = (): ReactNode => <Separator orientation="vertical" className="mx-1 h-6" />;

export function EditorToolbar({ editor, onLink, onImage }: Props) {
  const { editor: t } = useDictionary().admin;
  const tb = t.toolbar;

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive('heading', { level: 2 })
        ? 'h2'
        : e.isActive('heading', { level: 3 })
          ? 'h3'
          : e.isActive('heading', { level: 4 })
            ? 'h4'
            : 'p',
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      highlight: e.isActive('highlight'),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      code: e.isActive('code'),
      codeBlock: e.isActive('codeBlock'),
      link: e.isActive('link'),
      alignLeft: e.isActive({ textAlign: 'left' }),
      alignCenter: e.isActive({ textAlign: 'center' }),
      alignRight: e.isActive({ textAlign: 'right' }),
      ltr: DIRECTION_TYPES.some((type) => e.isActive(type, { dir: 'ltr' })),
      rtl: DIRECTION_TYPES.some((type) => e.isActive(type, { dir: 'rtl' })),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  const setBlock = (value: string) => {
    if (value === 'p') chain().setParagraph().run();
    else
      chain()
        .toggleHeading({ level: Number(value[1]) as 2 | 3 | 4 })
        .run();
  };

  const setAlign = (align: 'left' | 'center' | 'right') => chain().toggleTextAlign(align).run();

  const setDirection = (dir: 'ltr' | 'rtl') => {
    const active = dir === 'ltr' ? state.ltr : state.rtl;
    const value = active ? null : dir;
    DIRECTION_TYPES.reduce((c, type) => c.updateAttributes(type, { dir: value }), chain()).run();
  };

  return (
    <div
      role="toolbar"
      aria-label={tb.label}
      className="border-border bg-background/95 sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b p-1.5 backdrop-blur"
    >
      <ToolbarToggle
        label={tb.undo}
        icon={Undo2}
        disabled={!state.canUndo}
        onClick={() => chain().undo().run()}
      />
      <ToolbarToggle
        label={tb.redo}
        icon={Redo2}
        disabled={!state.canRedo}
        onClick={() => chain().redo().run()}
      />
      <Divider />
      <Select value={state.block} onValueChange={setBlock}>
        <SelectTrigger size="sm" className="w-36" aria-label={tb.blockType}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p">{tb.paragraph}</SelectItem>
          <SelectItem value="h2">{tb.heading2}</SelectItem>
          <SelectItem value="h3">{tb.heading3}</SelectItem>
          <SelectItem value="h4">{tb.heading4}</SelectItem>
        </SelectContent>
      </Select>
      <Divider />
      <ToolbarToggle
        label={tb.bold}
        icon={Bold}
        pressed={state.bold}
        onClick={() => chain().toggleBold().run()}
      />
      <ToolbarToggle
        label={tb.italic}
        icon={Italic}
        pressed={state.italic}
        onClick={() => chain().toggleItalic().run()}
      />
      <ToolbarToggle
        label={tb.underline}
        icon={Underline}
        pressed={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      />
      <ToolbarToggle
        label={tb.strike}
        icon={Strikethrough}
        pressed={state.strike}
        onClick={() => chain().toggleStrike().run()}
      />
      <ToolbarToggle
        label={tb.highlight}
        icon={Highlighter}
        pressed={state.highlight}
        onClick={() => chain().toggleHighlight().run()}
      />
      <ToolbarToggle
        label={tb.code}
        icon={Code}
        pressed={state.code}
        onClick={() => chain().toggleCode().run()}
      />
      <Divider />
      <ToolbarToggle
        label={tb.bulletList}
        icon={List}
        pressed={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      />
      <ToolbarToggle
        label={tb.orderedList}
        icon={ListOrdered}
        pressed={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      />
      <ToolbarToggle
        label={tb.quote}
        icon={Quote}
        pressed={state.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      />
      <ToolbarToggle
        label={tb.codeBlock}
        icon={Code2}
        pressed={state.codeBlock}
        onClick={() => chain().toggleCodeBlock().run()}
      />
      <ToolbarToggle
        label={tb.divider}
        icon={Minus}
        onClick={() => chain().setHorizontalRule().run()}
      />
      <Divider />
      <ToolbarToggle label={tb.link} icon={Link2} pressed={state.link} onClick={onLink} />
      <ToolbarToggle label={tb.image} icon={ImagePlus} onClick={onImage} />
      <Divider />
      <ToolbarToggle
        label={tb.alignLeft}
        icon={AlignLeft}
        pressed={state.alignLeft}
        onClick={() => setAlign('left')}
      />
      <ToolbarToggle
        label={tb.alignCenter}
        icon={AlignCenter}
        pressed={state.alignCenter}
        onClick={() => setAlign('center')}
      />
      <ToolbarToggle
        label={tb.alignRight}
        icon={AlignRight}
        pressed={state.alignRight}
        onClick={() => setAlign('right')}
      />
      <ToolbarToggle
        label={tb.dirLtr}
        icon={PilcrowRight}
        pressed={state.ltr}
        onClick={() => setDirection('ltr')}
      />
      <ToolbarToggle
        label={tb.dirRtl}
        icon={PilcrowLeft}
        pressed={state.rtl}
        onClick={() => setDirection('rtl')}
      />
    </div>
  );
}
