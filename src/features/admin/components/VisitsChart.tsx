'use client';

import { useId, useMemo, useState, type PointerEvent } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/admin-ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin-ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/admin-ui/toggle-group';
import { adminVisitsDaily, adminVisitsEnd } from '@/data/admin';
import { cn } from '@/lib/utils';
import { format, useLocale } from '@/lib/i18n/LocaleProvider';

const RANGES = [7, 14, 30] as const;
type Range = (typeof RANGES)[number];

const W = 800;
const H = 280;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const DAY_MS = 86_400_000;

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const niceMax = (value: number) => {
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step / 2) * step * 2;
};

/** Smooth path through the points using Catmull-Rom converted to cubic Béziers. */
const smoothPath = (points: [number, number][]) =>
  points.reduce((path, [x, y], i, all) => {
    if (i === 0) return `M${x},${y}`;
    const [x0, y0] = all[i - 2] ?? all[i - 1];
    const [x1, y1] = all[i - 1];
    const [x3, y3] = all[i + 1] ?? [x, y];
    const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6];
    const c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6];
    return `${path} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${x},${y}`;
  }, '');

export function VisitsChart() {
  const { locale, dict } = useLocale();
  const t = dict.admin.dashboard;
  const gradientId = useId();
  const [range, setRange] = useState<Range>(30);
  const [hover, setHover] = useState<number | null>(null);

  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const shortDate = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),
    [locale],
  );

  const total = adminVisitsDaily.length;
  const current = adminVisitsDaily.slice(total - range);
  const previous = adminVisitsDaily.slice(total - range * 2, total - range);
  const totalNow = sum(current);
  const change = ((totalNow - sum(previous)) / sum(previous)) * 100;

  const yMax = niceMax(Math.max(...current));
  const ticks = [0, 1, 2, 3, 4].map((i) => (yMax / 4) * i);
  const x = (i: number) => PAD.left + (i / (current.length - 1)) * PLOT_W;
  const y = (v: number) => PAD.top + PLOT_H - (v / yMax) * PLOT_H;

  const points = current.map((v, i) => [x(i), y(v)] as [number, number]);
  const line = smoothPath(points);
  const area = `${line} L${x(current.length - 1)},${PAD.top + PLOT_H} L${x(0)},${PAD.top + PLOT_H} Z`;

  const dateAt = (i: number) =>
    shortDate.format(new Date(Date.parse(adminVisitsEnd) - (current.length - 1 - i) * DAY_MS));

  const labelEvery = range === 7 ? 1 : range === 14 ? 2 : 5;
  const active = hover ?? current.length - 1;
  const up = change >= 0;

  const onMove = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setHover(Math.min(current.length - 1, Math.max(0, Math.round(ratio * (current.length - 1)))));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {t.visitsTitle}
          </CardTitle>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-foreground text-3xl font-bold">{number.format(totalNow)}</span>
            <Badge
              variant="outline"
              className={cn(
                up
                  ? 'border-emerald-500/40 text-emerald-400'
                  : 'border-destructive/40 text-destructive',
              )}
            >
              {up ? <ArrowUpRight /> : <ArrowDownRight />}
              {number.format(Math.abs(Math.round(change * 10) / 10))}%
            </Badge>
            <span className="text-muted-foreground text-xs">{t.vsPrevious}</span>
          </div>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={String(range)}
          aria-label={t.rangeLabel}
          onValueChange={(value) => {
            if (!value) return;
            setRange(Number(value) as Range);
            setHover(null);
          }}
        >
          {RANGES.map((r) => (
            <ToggleGroupItem key={r} value={String(r)}>
              {t[`range${r}`]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        <div className="relative" dir="ltr">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={t.visitsAria}
            className="block h-auto w-full overflow-visible"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(tick)}
                  y2={y(tick)}
                  className="stroke-border"
                  strokeDasharray="3 5"
                />
                <text
                  x={PAD.left - 8}
                  y={y(tick) + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  {number.format(tick)}
                </text>
              </g>
            ))}

            {current.map(
              (_, i) =>
                i % labelEvery === 0 && (
                  <text
                    key={i}
                    x={x(i)}
                    y={H - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[11px]"
                  >
                    {dateAt(i)}
                  </text>
                ),
            )}

            <path d={area} fill={`url(#${gradientId})`} />
            <path
              d={line}
              fill="none"
              className="stroke-primary"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <line
              x1={x(active)}
              x2={x(active)}
              y1={PAD.top}
              y2={PAD.top + PLOT_H}
              className="stroke-input"
              strokeDasharray="4 4"
            />
            <circle
              cx={x(active)}
              cy={y(current[active])}
              r="5"
              className="fill-background stroke-primary"
              strokeWidth="3"
            />

            <rect
              x={PAD.left}
              y={PAD.top}
              width={PLOT_W}
              height={PLOT_H}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>

          <div
            className="border-border bg-popover text-popover-foreground pointer-events-none absolute flex -translate-x-1/2 -translate-y-[calc(100%+14px)] flex-col gap-0.5 rounded-sm border px-2.5 py-1.5 text-xs whitespace-nowrap"
            style={{
              left: `${(x(active) / W) * 100}%`,
              top: `${(y(current[active]) / H) * 100}%`,
            }}
            role="status"
          >
            <strong>{format(t.tooltipVisits, { count: number.format(current[active]) })}</strong>
            <span className="text-muted-foreground">{dateAt(active)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
