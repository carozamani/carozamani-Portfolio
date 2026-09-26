'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  ChevronsUpDown,
  LogOut,
  Mail,
  Mic,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/admin-ui/dropdown-menu';
import { Separator } from '@/components/admin-ui/separator';
import { Wordmark } from '@/components/ui/Wordmark';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/admin-ui/sidebar';
import { adminNav } from '@/data/admin';
import { localeDirection } from '@/lib/i18n/config';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { CommandPalette } from './CommandPalette';
import '@/styles/admin-theme.css';

type NavKey = (typeof adminNav)[number]['key'];

const icons: Record<NavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  messages: Mail,
  caseStudies: FolderKanban,
  articles: FileText,
  podcasts: Mic,
  settings: Settings,
};

export function AdminShell({ children }: { children: ReactNode }) {
  const { locale, dict } = useLocale();
  const t = dict.admin;
  const dir = localeDirection[locale];
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const current = adminNav.find((n) => isActive(n.href));

  return (
    <SidebarProvider className="admin-canvas" dir={dir}>
      <Sidebar
        side={dir === 'rtl' ? 'right' : 'left'}
        collapsible="icon"
        className="border-sidebar-border"
      >
        <SidebarHeader>
          <div className="flex h-14 items-center justify-center gap-3 px-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-(--color-hero-ring)">
              <Image src="/image/LogoPrimary.svg" alt="Caro Zamani" width={26} height={26} />
            </span>
            <Wordmark className="text-3xl group-data-[collapsible=icon]:hidden!" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu aria-label={t.brand}>
              {adminNav
                .filter(({ key }) => key !== 'settings')
                .map(({ href, key }) => {
                  const Icon = icons[key];
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton asChild isActive={isActive(href)} tooltip={t.nav[key]}>
                        <Link href={href} aria-current={pathname === href ? 'page' : undefined}>
                          <Icon />
                          <span>{t.nav[key]}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="h-16 gap-3 border border-(--color-border-default) px-3 text-lg group-data-[collapsible=icon]:h-11! group-data-[collapsible=icon]:px-0! hover:border-(--color-hero-ring)"
                    aria-label={t.accountMenu}
                  >
                    <Image
                      src="/image/me.png"
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 shrink-0 rounded-full object-cover group-data-[collapsible=icon]:size-8"
                    />
                    <span className="text-sidebar-accent-foreground font-semibold">Admin</span>
                    <ChevronsUpDown className="ms-auto size-4! group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="min-w-56">
                  <DropdownMenuItem asChild className="gap-3 py-2.5 text-base">
                    <Link href="/admin/settings">
                      <Settings className="size-5" />
                      {t.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    variant="destructive"
                    className="gap-3 py-2.5 text-base"
                  >
                    <Link href="/admin/login">
                      <LogOut className="size-5" />
                      {t.logout}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0 bg-transparent">
        <header className="border-border flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger aria-label={t.menu} />
          <Separator orientation="vertical" className="h-5" />
          <nav aria-label={t.common.breadcrumb} className="text-muted-foreground text-sm">
            {t.brand}
            {current && current.href !== '/admin' ? ` / ${t.nav[current.key]}` : ''}
          </nav>
          <div className="ms-auto flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </header>
        <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-6">{children}</div>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  );
}
