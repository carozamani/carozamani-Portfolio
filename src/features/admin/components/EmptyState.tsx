export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
      <strong className="text-foreground">{title}</strong>
      {hint && <span className="text-muted-foreground text-sm">{hint}</span>}
    </div>
  );
}
