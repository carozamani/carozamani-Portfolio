import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/admin-ui/button';

type Props = { label: string; href: string; onClick?: () => void };

/** Plain link back to a list; pass onClick when leaving needs a confirmation first. */
export function BackButton({ label, href, onClick }: Props) {
  const content = (
    <>
      <ArrowLeft className="rtl:rotate-180" /> {label}
    </>
  );

  return onClick ? (
    <Button type="button" variant="ghost" size="sm" onClick={onClick}>
      {content}
    </Button>
  ) : (
    <Button asChild variant="ghost" size="sm">
      <Link href={href}>{content}</Link>
    </Button>
  );
}
