import type { CardProps } from '@/types/card';
import styles from './ArticleDetail.module.css';

export default function ArticleDetail({ article }: { article: CardProps }) {
  const meta = [article.date, article.readTime].filter(Boolean).join(' · ');

  return (
    <article className={styles.page}>
      <div className={styles.content}>
        <p className={styles.meta}>{meta}</p>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.summary}>{article.summary}</p>

        <div className={styles.body}>
          {article.body?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
