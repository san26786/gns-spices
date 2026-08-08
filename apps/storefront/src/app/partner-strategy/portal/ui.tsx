'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  BRAND STYLES  (injected once at portal root)                       */
/* ------------------------------------------------------------------ */

export const portalCSS = `
.pt-root {
  --pt-bg:        #070A09;
  --pt-bg-2:      #0B0F0E;
  --pt-panel:     #101613;
  --pt-panel-2:   #141C18;
  --pt-line:      rgba(255,255,255,0.06);
  --pt-line-hi:   rgba(255,255,255,0.12);
  --pt-emerald:   #154734;
  --pt-emerald-2: #1B5D45;
  --pt-emerald-3: #3FB57B;
  --pt-gold:      #B08D3A;
  --pt-gold-hi:   #D6B25A;
  --pt-off:       #F5F1E8;
  --pt-text:      #E7EAE7;
  --pt-muted:     #8B9994;
  --pt-muted-2:   #6E7A73;
  --pt-danger:    #DC3545;
  --pt-warn:      #F0B140;
  color: var(--pt-text);
  background: var(--pt-bg);
  font-family: 'Outfit', system-ui, sans-serif;
  font-feature-settings: "cv02","cv03","cv04","cv11","tnum";
}
.pt-root, .pt-root * { box-sizing: border-box; }
.pt-root h1, .pt-root h2, .pt-root h3, .pt-root h4 { color: var(--pt-off); letter-spacing: -0.01em; }
.pt-root .mono { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; }
.pt-root .eyebrow {
  font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase;
  font-weight: 700; color: var(--pt-gold);
}
.pt-root .label {
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  font-weight: 600; color: var(--pt-muted);
}
.pt-root .panel {
  background: var(--pt-panel);
  border: 1px solid var(--pt-line);
  border-radius: 10px;
}
.pt-root .panel-hi {
  background: linear-gradient(180deg, rgba(21,71,52,0.16) 0%, rgba(21,71,52,0.04) 100%);
  border: 1px solid rgba(21,71,52,0.55);
  border-radius: 10px;
}
.pt-root .row-alt tr:nth-child(even) td { background: rgba(255,255,255,0.015); }
.pt-root table.data { width: 100%; border-collapse: collapse; font-size: 13px; }
.pt-root table.data th {
  text-align: left; text-transform: uppercase; letter-spacing: 0.14em;
  font-size: 10px; color: var(--pt-muted); font-weight: 700;
  padding: 10px 12px;
  border-bottom: 1px solid var(--pt-line);
  background: rgba(255,255,255,0.02);
  position: sticky; top: 0; z-index: 1;
}
.pt-root table.data td {
  padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.03);
  color: var(--pt-text); vertical-align: middle;
}
.pt-root table.data tr:hover td { background: rgba(255,255,255,0.025); }
.pt-root .input, .pt-root .select, .pt-root .textarea {
  width: 100%; padding: 7px 10px;
  background: rgba(0,0,0,0.30);
  border: 1px solid var(--pt-line);
  border-radius: 6px;
  color: var(--pt-text);
  font-size: 13px;
  outline: none;
  transition: border-color 120ms ease, box-shadow 120ms ease;
  font-variant-numeric: tabular-nums;
}
.pt-root .input:focus, .pt-root .select:focus, .pt-root .textarea:focus {
  border-color: rgba(176,141,58,0.55);
  box-shadow: 0 0 0 2px rgba(176,141,58,0.15);
}
.pt-root .cell-input {
  width: 100%; padding: 4px 6px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--pt-text);
  font-size: 13px;
  outline: none;
  font-variant-numeric: tabular-nums;
  transition: border-color 120ms ease, background 120ms ease;
}
.pt-root .cell-input:hover { border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); }
.pt-root .cell-input:focus {
  border-color: rgba(176,141,58,0.55);
  background: rgba(0,0,0,0.25);
}
.pt-root select.cell-input { background-image: none; }
.pt-root .btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  border: 1px solid var(--pt-line-hi);
  background: rgba(255,255,255,0.02);
  color: var(--pt-text);
  cursor: pointer;
  transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
}
.pt-root .btn:hover { border-color: var(--pt-gold); color: var(--pt-gold); }
.pt-root .btn-primary {
  background: var(--pt-emerald);
  border-color: rgba(176,141,58,0.30);
  color: var(--pt-off);
}
.pt-root .btn-primary:hover { background: var(--pt-emerald-2); color: var(--pt-off); border-color: rgba(176,141,58,0.5); }
.pt-root .btn-danger {
  background: rgba(220,53,69,0.12);
  border-color: rgba(220,53,69,0.35);
  color: #FCA5A5;
}
.pt-root .btn-danger:hover { border-color: #DC3545; color: #FEE2E2; }
.pt-root .kpi {
  padding: 14px 16px; border: 1px solid var(--pt-line);
  background: var(--pt-panel); border-radius: 10px;
  min-width: 0;
}
.pt-root .kpi .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--pt-muted); }
.pt-root .kpi .v { margin-top: 6px; font-size: 22px; font-weight: 700; color: var(--pt-off); font-variant-numeric: tabular-nums; }
.pt-root .kpi .s { margin-top: 2px; font-size: 11px; color: var(--pt-muted-2); }
.pt-root .badge {
  display: inline-flex; align-items: center; padding: 2px 8px;
  border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase;
}
.pt-root .badge-ap { background: rgba(176,141,58,0.15); color: var(--pt-gold-hi); border: 1px solid rgba(176,141,58,0.4); }
.pt-root .badge-a  { background: rgba(63,181,123,0.10); color: var(--pt-emerald-3); border: 1px solid rgba(63,181,123,0.35); }
.pt-root .badge-b  { background: rgba(255,255,255,0.04); color: var(--pt-text);     border: 1px solid var(--pt-line-hi); }
.pt-root .badge-c  { background: rgba(255,255,255,0.02); color: var(--pt-muted);    border: 1px solid var(--pt-line); }
.pt-root .badge-d  { background: rgba(0,0,0,0.20);      color: var(--pt-muted-2);  border: 1px solid var(--pt-line); }
.pt-root .badge-low     { background: rgba(63,181,123,0.10); color: var(--pt-emerald-3); border: 1px solid rgba(63,181,123,0.35); }
.pt-root .badge-medium  { background: rgba(240,177,64,0.10); color: var(--pt-warn);      border: 1px solid rgba(240,177,64,0.35); }
.pt-root .badge-high    { background: rgba(220,53,69,0.10);  color: #FCA5A5;            border: 1px solid rgba(220,53,69,0.35); }
.pt-root .tag {
  display: inline-flex; align-items: center; padding: 2px 6px;
  border-radius: 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--pt-muted);
  background: rgba(255,255,255,0.03); border: 1px solid var(--pt-line);
}
.pt-root .tag-gold { color: var(--pt-gold-hi); background: rgba(176,141,58,0.08); border-color: rgba(176,141,58,0.30); }
.pt-root .tag-danger { color: #FCA5A5; background: rgba(220,53,69,0.08); border-color: rgba(220,53,69,0.30); }
.pt-root .progress { height: 4px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
.pt-root .progress > i { display: block; height: 100%; background: linear-gradient(90deg, var(--pt-emerald-2) 0%, var(--pt-emerald-3) 100%); }
.pt-root .progress.gold > i { background: linear-gradient(90deg, var(--pt-gold) 0%, var(--pt-gold-hi) 100%); }
.pt-root .divider { height: 1px; background: var(--pt-line); margin: 20px 0; }
.pt-root .scroll-x { overflow-x: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent; }
.pt-root .scroll-x::-webkit-scrollbar { height: 6px; }
.pt-root .scroll-x::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
.pt-root .nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 6px;
  color: var(--pt-muted); font-size: 13px;
  cursor: pointer; user-select: none;
  border-left: 2px solid transparent;
  transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
}
.pt-root .nav-item:hover { color: var(--pt-text); background: rgba(255,255,255,0.02); }
.pt-root .nav-item.active {
  color: var(--pt-off); background: rgba(21,71,52,0.30);
  border-left-color: var(--pt-gold);
}
.pt-root .nav-num {
  font-family: ui-monospace, "SF Mono", monospace;
  font-size: 10px; color: var(--pt-muted-2); width: 20px; text-align: right; shrink: 0;
}
.pt-root .nav-item.active .nav-num { color: var(--pt-gold); }
`;

/* ------------------------------------------------------------------ */
/*  PRIMITIVES                                                         */
/* ------------------------------------------------------------------ */

export function Panel({
  title,
  right,
  children,
  className = '',
  padded = true,
  tone = 'default',
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  tone?: 'default' | 'hi';
}) {
  return (
    <div className={`${tone === 'hi' ? 'panel-hi' : 'panel'} ${className}`}>
      {title && (
        <div
          className="flex items-center justify-between px-4 md:px-5 py-3"
          style={{ borderBottom: '1px solid var(--pt-line)' }}
        >
          <div className="label">{title}</div>
          {right}
        </div>
      )}
      <div className={padded ? 'p-4 md:p-5' : ''}>{children}</div>
    </div>
  );
}

export function KPI({
  k,
  v,
  s,
  tone = 'default',
}: {
  k: string;
  v: React.ReactNode;
  s?: React.ReactNode;
  tone?: 'default' | 'gold' | 'warn' | 'danger';
}) {
  const color =
    tone === 'gold'
      ? 'var(--pt-gold-hi)'
      : tone === 'warn'
        ? 'var(--pt-warn)'
        : tone === 'danger'
          ? '#FCA5A5'
          : 'var(--pt-off)';
  return (
    <div className="kpi">
      <div className="k">{k}</div>
      <div className="v" style={{ color }}>
        {v}
      </div>
      {s !== undefined && <div className="s">{s}</div>}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  help?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {suffix && <span className="text-[10px] text-[var(--pt-muted-2)]">{suffix}</span>}
      </div>
      <input
        type="number"
        className="input mt-1.5"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(Number.isFinite(v) ? v : 0);
        }}
      />
      {help && <div className="mt-1 text-[10px] text-[var(--pt-muted-2)]">{help}</div>}
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select
        className="select mt-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea
        className="textarea mt-1.5"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function PriorityBadge({ p }: { p: 'A+' | 'A' | 'B' | 'C' | 'D' }) {
  const cls =
    p === 'A+' ? 'badge-ap' : p === 'A' ? 'badge-a' : p === 'B' ? 'badge-b' : p === 'C' ? 'badge-c' : 'badge-d';
  return <span className={`badge ${cls}`}>{p}</span>;
}

export function RiskBadge({ level }: { level: 'Low' | 'Medium' | 'High' }) {
  const cls =
    level === 'Low' ? 'badge-low' : level === 'Medium' ? 'badge-medium' : 'badge-high';
  return <span className={`badge ${cls}`}>{level}</span>;
}

export function IllustrativeTag({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="mt-3 text-[10px] leading-relaxed"
      style={{ color: 'var(--pt-muted-2)' }}
    >
      <span
        className="uppercase font-semibold mr-1"
        style={{ color: 'var(--pt-gold)', letterSpacing: '0.14em' }}
      >
        Illustrative ·
      </span>
      {children ?? 'Planning assumption. Subject to commercial agreement.'}
    </div>
  );
}

export function SectionHead({
  n,
  title,
  subtitle,
  right,
}: {
  n: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="eyebrow">Section {n}</div>
        <h2 className="mt-1.5 text-xl md:text-2xl font-semibold">{title}</h2>
        {subtitle && (
          <p
            className="mt-1.5 text-sm max-w-2xl leading-relaxed"
            style={{ color: 'var(--pt-muted)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}
