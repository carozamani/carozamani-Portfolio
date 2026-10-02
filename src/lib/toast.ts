// sonner is fetched on first use so it stays out of the initial bundle; LazyToaster mounts the outlet
const load = () => import('sonner').then((mod) => mod.toast);

export const toast = {
  success: (message: string) => void load().then((t) => t.success(message)),
  error: (message: string) => void load().then((t) => t.error(message)),
};
