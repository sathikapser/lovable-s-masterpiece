export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="panel-hard hero-glow mb-6 flex flex-wrap items-end justify-between gap-4 border-b-4 px-5 py-4">
      <div>
        <p className="mono-caps text-signal">{eyebrow}</p>
        <h1 className="mt-1 text-2xl leading-none sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
