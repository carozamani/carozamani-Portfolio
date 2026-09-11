import Link from 'next/link';
import TypographyComponent from '../../components/ui/typography/Typography.component';

export default function CaseStudyNotFound() {
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
        این کیس‌استادی پیدا نشد
      </TypographyComponent>
      <TypographyComponent variant="body1" color="text-secondary">
        پروژه‌ای که دنبالش بودی وجود نداره یا جابه‌جا شده.
      </TypographyComponent>
      <Link href="/#projects" style={{ color: 'var(--image-border-color)', fontWeight: 600 }}>
        بازگشت به پروژه‌ها
      </Link>
    </div>
  );
}
