'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './HtmlEmbed.module.css';

const MAX_HEIGHT = 300000;
const FRAME_TOKEN = 'case-html-height';
const FRAME_WIDTH_TOKEN = 'case-html-width';
const PLATES_TOKEN = 'case-html-plates';
// The source documents use a 1440px export canvas; embedded pages should follow the iframe width.
const FIXED_EXPORT_VIEWPORT = '<meta name="viewport" content="width=1440">';
const EMBED_VIEWPORT = '<meta name="viewport" content="width=device-width, initial-scale=1">';

// Report the final case-study section's height so the iframe cannot leave a blank tail after its content.
const HEIGHT_REPORTER = `<script>(function(){var last=0;function height(){var sections=document.querySelectorAll('[data-plate]');if(!sections.length)return Math.ceil(document.body.getBoundingClientRect().height);var h=0;sections.forEach(function(s){var r=s.getBoundingClientRect();h=Math.max(h,r.bottom+window.scrollY)});return Math.ceil(h)}function r(){var h=height();if(h===last)return;last=h;parent.postMessage({type:'${FRAME_TOKEN}',height:h},'*')}function setWidth(e){var d=e.data;if(e.source!==parent||!d||d.type!=='${FRAME_WIDTH_TOKEN}'||typeof d.width!=='number'||d.width<=0)return;var m=document.querySelector('meta[name="viewport"]');if(!m)return;var value='width='+Math.round(d.width)+', initial-scale=1';if(m.content===value)return;m.setAttribute('content',value);requestAnimationFrame(function(){dispatchEvent(new Event('resize'));setTimeout(r,80)})}addEventListener('message',setWidth);addEventListener('load',r);addEventListener('resize',function(){setTimeout(r,60)});var o=new ResizeObserver(r);o.observe(document.documentElement);o.observe(document.body);setInterval(r,500);r()})()</script>`;

// Report each plate's heading and vertical extent so the host page can show where the reader is.
const PLATE_REPORTER = `<script>(function(){var last='';function p(){var out=[];document.querySelectorAll('[data-plate]').forEach(function(s,i){var r=s.getBoundingClientRect();var h=s.querySelector('h1,h2');out.push({id:s.getAttribute('data-plate')||String(i),label:h?h.textContent.replace(/\\s+/g,' ').trim():'',top:Math.round(r.top+window.scrollY),height:Math.round(r.height)})});var k=JSON.stringify(out);if(k===last)return;last=k;parent.postMessage({type:'${PLATES_TOKEN}',plates:out},'*')}addEventListener('load',p);addEventListener('resize',function(){setTimeout(p,60)});setInterval(p,500);p()})()</script>`;

// Deters casual copying only: the document still reaches the browser, so DevTools can read it.
const PROTECTION = `<style>*{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}img,video,svg{-webkit-user-drag:none;user-drag:none}@media print{body{display:none!important}}</style><script>(function(){['copy','cut','contextmenu','dragstart','selectstart'].forEach(function(t){document.addEventListener(t,function(e){e.preventDefault()})});document.addEventListener('keydown',function(e){if(!(e.ctrlKey||e.metaKey))return;var k=e.key.toLowerCase();if(k==='c'||k==='x'||k==='a'||k==='s'||k==='p'||k==='u')e.preventDefault()})})()</script>`;

export type EmbedPlate = { id: string; label: string; top: number; height: number };

type HtmlEmbedProps = {
  src: string;
  title: string;
  onPlates?: (plates: EmbedPlate[]) => void;
  onError?: () => void;
};

const isPlate = (value: unknown): value is EmbedPlate => {
  if (typeof value !== 'object' || value === null) return false;
  const plate = value as Record<string, unknown>;
  return (
    typeof plate.id === 'string' &&
    typeof plate.label === 'string' &&
    typeof plate.top === 'number' &&
    typeof plate.height === 'number'
  );
};

/** Without `allow-same-origin` the page gets an opaque origin, so it cannot reach cookies or the admin token. */
export function HtmlEmbed({ src, title, onPlates, onError }: HtmlEmbedProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  const [loaded, setLoaded] = useState<{ src: string; doc: string } | null>(null);
  const [height, setHeight] = useState(0);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(src, { signal: controller.signal })
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
      .then((html) =>
        setLoaded({
          src,
          doc:
            html.replace(FIXED_EXPORT_VIEWPORT, EMBED_VIEWPORT) +
            PROTECTION +
            HEIGHT_REPORTER +
            PLATE_REPORTER,
        }),
      )
      .catch(() => {
        if (!controller.signal.aborted) {
          setFailedSrc(src);
          onErrorRef.current?.();
        }
      });
    return () => controller.abort();
  }, [src]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const data: unknown = event.data;
      if (typeof data !== 'object' || data === null) return;
      const {
        type,
        height: next,
        plates,
      } = data as {
        type?: unknown;
        height?: unknown;
        plates?: unknown;
      };
      if (type === FRAME_TOKEN && typeof next === 'number' && next > 0) {
        setHeight(Math.min(Math.ceil(next), MAX_HEIGHT));
      }
      if (type === PLATES_TOKEN && Array.isArray(plates)) {
        onPlates?.(plates.filter(isPlate));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onPlates]);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;

    const syncWidth = () => {
      const width = Math.ceil(element.getBoundingClientRect().width);
      if (width > 0) {
        element.contentWindow?.postMessage({ type: FRAME_WIDTH_TOKEN, width }, '*');
      }
    };
    const observer = new ResizeObserver(syncWidth);
    observer.observe(element);
    element.addEventListener('load', syncWidth);
    syncWidth();
    const retry = window.setTimeout(syncWidth, 100);

    return () => {
      observer.disconnect();
      element.removeEventListener('load', syncWidth);
      window.clearTimeout(retry);
    };
  }, [loaded?.src]);

  if (failedSrc === src) return null;
  // Keep the previous height while a new language loads so the page does not collapse and jump.
  if (loaded?.src !== src) {
    return (
      <div
        className={styles.loading}
        style={height ? { minHeight: height } : undefined}
        aria-busy="true"
      />
    );
  }

  return (
    <iframe
      key={src}
      ref={frame}
      title={title}
      srcDoc={loaded.doc}
      sandbox="allow-scripts allow-popups"
      className={styles.frame}
      style={height ? { height } : undefined}
    />
  );
}
