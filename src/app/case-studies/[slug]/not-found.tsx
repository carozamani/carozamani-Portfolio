import Link from 'next/link';
import TypographyComponent from '@/components/ui/Typography';
import { getDictionary } from '@/lib/i18n/server';

export default async function CaseStudyNotFound() {
  const { projects } = await getDictionary();

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <TypographyComponent variant="h2" color="text-primary">
        {projects.notFoundTitle}
      </TypographyComponent>
      <TypographyComponent variant="body1" color="text-secondary">
        {projects.notFoundText}
      </TypographyComponent>
      <Link href="/#projects" style={{ color: 'var(--color-neon-primary)', fontWeight: 600 }}>
        {projects.backToProjects}
      </Link>
    </div>
  );
}
