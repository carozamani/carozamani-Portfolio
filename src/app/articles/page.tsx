import MediaListPage from '../components/ui/Media/MediaListPage';
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
