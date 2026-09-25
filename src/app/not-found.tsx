import Link from 'next/link';
import TypographyComponent from '@/components/ui/Typography';
import { LogoRing } from '@/components/ui/LogoRing';
import { getDictionary } from '@/lib/i18n/server';
import styles from './not-found.module.css';

export default async function NotFound() {
  const { notFound } = await getDictionary();

  return (
    <div className={styles.page}>
      <LogoRing size={72} />
      <span className={styles.code} dir="ltr">
        404
      </span>
      <TypographyComponent variant="h2" color="text-primary">
        {notFound.title}
      </TypographyComponent>
      <TypographyComponent variant="body1" color="text-secondary">
        {notFound.text}
      </TypographyComponent>
      <Link href="/" className={styles.link}>
        {notFound.home}
      </Link>
    </div>
  );
}
