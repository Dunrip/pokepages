export function KeyValueTable({
  rows,
}: {
  rows: Array<{ k: string; v: React.ReactNode }>;
}) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
      {rows.map((r) => (
        <div key={r.k}>
          <dt className="text-sm text-muted-foreground">{r.k}</dt>
          <dd className="text-sm font-medium">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
