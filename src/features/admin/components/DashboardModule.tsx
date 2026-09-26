'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin-ui/card';
import { adminMessages, adminStats } from '@/data/admin';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { VisitsChart } from './VisitsChart';

export function DashboardModule() {
  const { locale, dict } = useLocale();
  const t = dict.admin;
  const number = new Intl.NumberFormat(locale);

  return (
    <>
      <h1 className="text-foreground text-3xl font-bold">{t.nav.dashboard}</h1>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {adminStats.map(({ key, value }) => (
          <Card
            key={key}
            className="aspect-square justify-center gap-1 py-2 lg:aspect-auto lg:gap-6 lg:py-6"
          >
            <CardHeader className="justify-items-center px-1 text-center sm:px-2 lg:justify-items-start lg:px-6 lg:text-start">
              <CardTitle className="text-muted-foreground text-[10px] leading-tight font-medium sm:text-xs lg:text-sm">
                {t.dashboard.stats[key]}
              </CardTitle>
              <div className="text-foreground text-xl font-bold sm:text-3xl">
                {number.format(value)}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <VisitsChart />

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-border border-b py-4">
          <CardTitle className="text-base">{t.dashboard.recent}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {adminMessages.map((m) => (
            <div
              key={m.id}
              className="border-border flex items-start justify-between gap-4 border-b px-6 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="text-foreground flex items-center gap-2 font-medium">
                  {!m.read && <span className="bg-primary size-2 rounded-full" />}
                  {m.name}
                </div>
                <p className="text-muted-foreground truncate text-sm">{m.message}</p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">{m.date}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
