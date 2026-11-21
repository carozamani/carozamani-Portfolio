'use client';

import { useRef, useState } from 'react';
import { FileCode2, X } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import { MAX_HTML_BYTES, uploadHtml } from '../lib/adminApi';

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export function HtmlUpload({ value, onChange }: Props) {
  const { common } = useDictionary().admin;
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const pick = async (file: File) => {
    if (!/\.html?$/i.test(file.name)) return setError(common.errHtmlType);
    if (file.size > MAX_HTML_BYTES) return setError(common.errHtmlSize);
    setError('');
    setBusy(true);
    try {
      onChange(await uploadHtml(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-3">
      <div className="border-input flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed p-4">
        <FileCode2 className="text-muted-foreground size-6" />
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
          {value ? common.htmlUploaded : common.chooseHtml}
        </span>
        {value && (
          <>
            <Button asChild variant="ghost" size="sm">
              <a href={value} target="_blank" rel="noopener noreferrer">
                {common.openHtml}
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={common.remove}
              onClick={() => onChange('')}
            >
              <X />
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {value ? common.replaceHtml : common.chooseHtml}
        </Button>
        <input
          ref={input}
          type="file"
          accept=".html,.htm,text/html"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void pick(file);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
