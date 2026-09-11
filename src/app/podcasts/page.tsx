import MediaListPage from '../components/ui/Media/MediaListPage';
import { podcastCards } from '../data/media';

export default function PodcastsPage() {
  return (
    <MediaListPage
      title="Podcasts"
      description="Episodes about design, UX, product thinking, and challenges."
      cards={podcastCards}
    />
  );
}
