import MediaListPage from '@/features/media/components/MediaListPage';
import { articleCards } from '@/data/media';

export default function ArticlesPage() {
  return (
    <MediaListPage
      title="Articles"
      description="Read insightful articles about UX, UI, and design systems."
      cards={articleCards}
    />
  );
}
