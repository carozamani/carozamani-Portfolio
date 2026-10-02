import { toast } from 'sonner';
import { format } from '@/lib/i18n/LocaleProvider';

/** Builds a promise rejection handler that shows the failure as a toast. */
export function reportFailure(template: string) {
  return (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    toast.error(format(template, { error: message }));
  };
}
