import type { CardProps } from '@/types/card';
import { renderRichText } from '@/lib/rich-text/render';
import styles from './ArticleDetail.module.css';
import '@/styles/rich-content.css';

export default function ArticleDetail({ article }: { article: CardProps }) {
  const meta = [article.date, article.readTime].filter(Boolean).join(' · ');

  return (
    <article className={styles.page}>
      <div className={styles.content}>
        <p className={styles.meta}>{meta}</p>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.summary}>{article.summary}</p>

        {article.content ? (
          <div
            className={`rich-content ${styles.richBody}`}
            // Generated from the editor schema, so only allowed nodes and marks can appear.
            dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }}
          />
        ) : (
          <div className={styles.body}>
            {article.body?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
