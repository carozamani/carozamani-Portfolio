import Link from 'next/link';
import TypographyComponent from '@/components/ui/Typography';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-size-caption)',
          letterSpacing: '0.08em',
          color: 'var(--color-neon-primary)',
        }}
      >
        404
      </span>
      <TypographyComponent variant="h2" color="text-primary">
        This page drifted off-screen
      </TypographyComponent>
      <TypographyComponent variant="body1" color="text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </TypographyComponent>
      <Link href="/" style={{ color: 'var(--color-neon-primary)', fontWeight: 600 }}>
        Back to Home
      </Link>
    </div>
  );
}
