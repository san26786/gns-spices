import Link from 'next/link';

export function FormPageShell({
  eyebrow, title, accent, intro, aside, back, children,
}: {
  eyebrow: string; title: string; accent?: string; intro: React.ReactNode;
  aside?: React.ReactNode; back?: { href: string; label: string }; children: React.ReactNode;
}) {
  return (
    <div className="text-white">
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-12 items-start">
        <div>
          {back && <Link href={back.href} className="text-sm text-zinc-400 hover:text-amber-400">← {back.label}</Link>}
          <div className="mt-6"><span className="gold-rule">{eyebrow}</span></div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-5 leading-tight">
            {title} {accent && <span className="text-amber-400">{accent}</span>}
          </h1>
          <div className="mt-6 text-zinc-300 leading-relaxed grid gap-4">{intro}</div>
          {aside && <div className="mt-8">{aside}</div>}
        </div>
        <div className="min-w-0">{children}</div>
      </section>
    </div>
  );
}

export function Steps({ items }: { items: Array<[string, string]> }) {
  return (
    <ol className="grid gap-4">
      {items.map(([t, d], i) => (
        <li key={t} className="flex gap-4">
          <span className="shrink-0 w-7 h-7 rounded-full bg-amber-500/15 text-amber-300 text-sm font-bold grid place-items-center">{i + 1}</span>
          <span><b className="block">{t}</b><span className="text-sm text-zinc-400">{d}</span></span>
        </li>
      ))}
    </ol>
  );
}
