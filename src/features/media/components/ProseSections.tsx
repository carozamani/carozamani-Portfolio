import styles from './ProseSections.module.css';

const HEADING_PREFIX = '## ';

type ProseSectionsProps = {
  paragraphs: string[];
  className?: string;
};

/** Renders plain body paragraphs; lines starting with `## ` become section headings for the ruler. */
export function ProseSections({ paragraphs, className }: ProseSectionsProps) {
  return (
    <div className={`${styles.body} ${className ?? ''}`.trim()}>
      {paragraphs.map((paragraph, index) => {
        if (paragraph.startsWith(HEADING_PREFIX)) {
          const label = paragraph.slice(HEADING_PREFIX.length).trim();
          return (
            <h2 key={`h-${index}-${label}`} className={styles.heading}>
              {label}
            </h2>
          );
        }
        return <p key={`p-${index}`}>{paragraph}</p>;
      })}
    </div>
  );
}
