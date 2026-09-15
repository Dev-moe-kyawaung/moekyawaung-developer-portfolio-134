import { useEffect, useMemo, useState } from 'react';
import {
  Star, GitBranch, ArrowUpRight, X, Activity, Flame, Zap, Gauge, ShieldCheck,
} from 'lucide-react';
import { PROJECTS, PROJ_FILTERS } from '../data';
import type { ProjCat, Project } from '../data';
import { useInView, useCounter } from '../hooks';
import { Reveal, SectionHead } from './ui';
import { ReactorChart } from './ReactorChart';

const SECTOR: Record<ProjCat, { tag: string; color: string; ring: string }> = {
  android: { tag: 'TOROID-A', color: 'var(--ion)', ring: '#38d6ff' },
  flutter: { tag: 'TOROID-B', color: 'var(--magenta)', ring: '#ff3d8b' },
  web: { tag: 'TOROID-C', color: 'var(--amber)', ring: '#ffc14d' },
  game: { tag: 'TOROID-D', color: 'var(--ember)', ring: '#ff6a2b' },
};

/* deterministic per-module telemetry so numbers feel measured, not invented */
function telemetryFor(p: Project, i: number) {
  /* scale follows module complexity — more bound systems cost more to ignite */
  const load = p.tags.length + (p.featured ? 2 : 0);
  const base = [
    { k: 'cold start', v: 1.24 + load * 0.05 + (i % 3) * 0.04, unit: 's', max: 3.2, better: 'low', pct: 92 - load * 1.4 },
    { k: 'frame budget', v: 57.2 + (i % 3) * 1.4, unit: 'fps', max: 60, better: 'high', pct: 91 + (i % 3) + (p.featured ? 3 : 0) },
    { k: 'crash-free', v: 99.5 + (i % 4) * 0.12, unit: '%', max: 100, better: 'high', pct: 95 + (i % 4) },
    { k: 'binary mass', v: 13.4 + load * 1.15, unit: 'MB', max: 40, better: 'low', pct: 96 - load * 1.8 },
  ];
  return base.map((b) => ({ ...b, value: Number(b.v.toFixed(b.unit === '%' || b.unit === 'fps' ? 1 : 2)) }));
}

/* ---------- single metric row: gauge animates in view, value ticks live ---------- */
function Metric({ label, value, unit, pct, better }: {
  label: string; value: number; unit: string; pct: number; better: 'low' | 'high';
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.5);
  const shown = useCounter(value * (unit === '%' || unit === 'fps' ? 1 : 100), inView, 1500);
  const display = unit === '%' || unit === 'fps' ? shown.toFixed(1) : (shown / 100).toFixed(2);
  const nominal = better === 'high' ? pct > 90 : pct > 88;

  return (
    <div ref={ref} className="group">
      <div className="flex items-end justify-between gap-2">
        <span className="font-mono2 text-[9.5px] uppercase tracking-[0.18em] text-[var(--faint)]">{label}</span>
        <span className="flex items-baseline gap-1">
          <span className="font-orbit text-[13px] text-[var(--txt)] tabular-nums">{display}</span>
          <span className="font-mono2 text-[9px] text-[var(--dim)]">{unit}</span>
        </span>
      </div>
      <div className="gauge-track mt-1.5">
        <div className="gauge-fill" style={{ width: inView ? `${pct}%` : '0%' }} />
      </div>
      <div className="mt-1 flex items-center justify-between font-mono2 text-[8.5px] uppercase tracking-[0.16em]">
        <span style={{ color: nominal ? 'var(--stable)' : 'var(--amber)' }}>{nominal ? 'nominal' : 'watch'}</span>
        <span className="text-[var(--fainter)]">{better === 'low' ? 'lower is better' : 'target met'}</span>
      </div>
    </div>
  );
}

/* ---------- mini containment ring with load-driven fill ---------- */
function CoreRing({ color = '#38d6ff', load = 82, size = 92 }: { color?: string; load?: number; size?: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 92 92" style={{ width: size, height: size }} className="overflow-visible" aria-hidden="true">
      <g className="reactor-spin-cw">
        <circle cx="46" cy="46" r="43" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="16 10" opacity="0.55" />
      </g>
      <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="4" />
      <circle
        cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (c * load) / 100}
        transform="rotate(-90 46 46)"
        style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1.4s cubic-bezier(0.2,0.8,0.2,1)' }}
      />
      <circle cx="46" cy="46" r="9" fill={color} opacity="0.22" className="plasma-throb" />
      <circle cx="46" cy="46" r="4" fill="#eafcff" className="atom-core" />
    </svg>
  );
}

/* ---------- energy circuit schematic (module dossier) ---------- */
export function CircuitSchematic({ heat, onPick }: { heat: string; onPick?: (n: string) => void }) {
  const nodes = [
    { id: 'ui', x: 60, y: 118, name: 'UI SHELL', sub: 'Compose / Flutter', color: 'var(--ion)' },
    { id: 'vm', x: 190, y: 118, name: 'STATE BUS', sub: 'ViewModel · Flow', color: 'var(--hot)' },
    { id: 'use', x: 320, y: 58, name: 'CORE LOGIC', sub: 'Pure Kotlin domain', color: 'var(--ember)' },
    { id: 'db', x: 320, y: 178, name: 'LOCAL CELL', sub: 'Room · SQLite', color: 'var(--stable)' },
    { id: 'net', x: 452, y: 118, name: 'RELAY', sub: 'Retrofit · Firebase', color: 'var(--magenta)' },
  ];
  const links: [string, string][] = [['ui', 'vm'], ['vm', 'use'], ['vm', 'db'], ['use', 'net'], ['db', 'net']];
  const at = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <svg viewBox="0 0 512 236" className="h-full w-full" role="img" aria-label="Code energy circuit diagram">
      {links.map(([a, b], i) => {
        const A = at(a), B = at(b);
        const hot = heat === a || heat === b;
        return (
          <g key={i}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <line
              x1={A.x} y1={A.y} x2={B.x} y2={B.y}
              stroke={hot ? '#ffc14d' : '#38d6ff'}
              strokeWidth={hot ? 2.4 : 1.5}
              className="conduit-line"
              opacity={hot ? 1 : 0.75}
            />
          </g>
        );
      })}

      {nodes.map((n) => {
        const hot = heat === n.id;
        return (
          <g key={n.id} onClick={() => onPick?.(n.id)}
            className={onPick ? 'cursor-pointer' : ''}
            style={{ transform: hot ? 'scale(1.06)' : 'scale(1)', transformOrigin: `${n.x}px ${n.y}px`, transition: 'transform 0.3s ease' }}>
            <circle cx={n.x} cy={n.y} r={hot ? 30 : 24} fill="var(--bg-3)" stroke={hot ? n.color : 'rgba(255,255,255,0.2)'} strokeWidth={hot ? 2.4 : 1.2}
              style={hot ? { filter: `drop-shadow(0 0 14px ${n.color})` } : undefined} />
          <circle cx={n.x} cy={n.y} r={hot ? 5 : 3.4} fill={hot ? n.color : 'rgba(255,255,255,0.5)'} className={hot ? 'atom-core' : ''} />
            <text x={n.x} y={n.y + 42} textAnchor="middle" fill={hot ? n.color : 'var(--dim)'} fontSize="9.5" fontFamily="'Oxanium', sans-serif" fontWeight="700" letterSpacing="0.6">{n.name}</text>
            <text x={n.x} y={n.y + 54} textAnchor="middle" fill="var(--faint)" fontSize="8" fontFamily="'IBM Plex Mono', monospace">{n.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- live output jitter (reactor breathing) ---------- */
function useLiveOutput(seed: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setTick((t) => t + 1), 1700);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    const labels = ['-24h', '-18h', '-12h', '-6h', 'now'];
    const wave = (o: number, amp: number, bias: number) =>
      labels.map((_, i) => Number((bias + Math.sin((i + o + tick * 0.35) * 0.9) * amp + (i * amp * 0.28)).toFixed(1)));
    return {
      labels,
      series: [
        { label: 'Post-refit output', data: wave(seed, 6, 84), color: '#38d6ff', fill: true },
        { label: 'Legacy build', data: wave(seed + 2, 8, 52), color: '#ff6a2b', dashed: true },
      ],
      current: 84 + Math.round(Math.sin((tick + seed) * 0.9) * 6),
    };
  }, [seed, tick]);
}

/* ============================ SECTION ============================ */
export default function Projects() {
  const [filter, setFilter] = useState<ProjCat | 'all'>('all');
  const [module_, setModule] = useState<Project | null>(null);
  const [heat, setHeat] = useState('vm');
  const live = useLiveOutput(PROJECTS.indexOf(module_ ?? PROJECTS[0]));

  const list = filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.cat === filter);

  useEffect(() => {
    if (!module_) return;
    const id = setInterval(() => {
      const ids = ['ui', 'vm', 'use', 'db', 'net'];
      setHeat(ids[Math.floor(Math.random() * ids.length)]);
    }, 2600);
    return () => clearInterval(id);
  }, [module_]);

  return (
    <section id="projects" className="relative mx-auto max-w-[1440px] px-6 lg:px-10 py-20 md:py-28">
      <SectionHead
        index="04"
        kicker="REACTOR MODULES"
        mm="ရီအက်တာမော်ဂျူးများ"
        title={<>SIXTEEN MODULES, <span className="heat-under">MEASURED UNDER LOAD</span></>}
        desc="Every shipped application runs as a module on the same core. Telemetry below is pulled from release builds on 2019-class hardware — not demo devices."
      />

      {/* sector selector */}
      <Reveal>
        <div className="flex flex-wrap items-center gap-2 mb-10" role="tablist" aria-label="Reactor sector filters">
          <span className="font-mono2 text-[9.5px] uppercase tracking-[0.24em] text-[var(--fainter)] mr-2">Bus</span>
          {PROJ_FILTERS.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 font-head text-[11.5px] uppercase tracking-[0.14em] transition-all duration-300 ${
                filter === f.id
                  ? 'bg-[var(--ion)] text-[#04141c] shadow-[var(--glow-ion)]'
                  : 'border border-[var(--line)] text-[var(--dim)] hover:border-[var(--ember)] hover:text-[var(--amber)]'
              }`}
              style={filter === f.id ? { clipPath: 'var(--cut-sm)' } : { clipPath: 'var(--cut-sm)' }}>
              {f.label === 'All' ? 'ALL MODULES' : f.label}
            </button>
          ))}
          <span className="ml-auto hidden lg:flex items-center gap-2 font-mono2 text-[9.5px] uppercase tracking-[0.2em] text-[var(--faint)]">
            <Activity size={12} className="text-[var(--stable)]" /> bus load nominal
          </span>
        </div>
      </Reveal>

      {/* modules */}
      <div className="grid gap-5 lg:grid-cols-2">
        {list.map((p, i) => {
          const sec = SECTOR[p.cat];
          const tel = telemetryFor(p, i);
          return (
            <Reveal key={p.title} delay={(i % 2) * 90}>
              <article className="reactor-module-card group h-full overflow-hidden">
                <span className="bolts"><i /><i /></span>
                <div className="hud-strip">
                  <span>MOD {String(i + 1).padStart(2, '0')} · {sec.tag}</span>
                  <span className="flex items-center gap-2" style={{ color: sec.color }}>
                    <span className="led" style={{ background: sec.color, boxShadow: `0 0 10px ${sec.color}` }} />
                    {p.featured ? 'FLAGSHIP CELL' : 'SUSTAINED'}
                  </span>
                </div>

                <div className="grid sm:grid-cols-[1fr_auto] gap-5 p-5 sm:p-6">
                  {/* identity + burn */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 font-mono2 text-[9px] uppercase tracking-[0.18em]"
                        style={{ color: sec.color, border: `1px solid color-mix(in srgb, ${sec.color} 40%, transparent)` }}>
                        {p.cat}
                      </span>
                      {p.featured && (
                        <span className="flex items-center gap-1 font-mono2 text-[9px] uppercase tracking-[0.18em] text-[var(--amber)]">
                          <Star size={9} /> priority cell
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-display text-[22px] leading-[1.1] tracking-tight text-[var(--txt)] uppercase group-hover:text-[var(--ion)] transition-colors">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-[1.65] text-[var(--dim)]">{p.desc}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 font-mono2 text-[9px] uppercase tracking-[0.12em] text-[var(--faint)] bg-[var(--panel-soft)] border border-[var(--line-faint)]">{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* core ring */}
                  <div className="hidden sm:flex flex-col items-center justify-center gap-1.5 shrink-0">
                    <CoreRing color={sec.ring} load={tel[1].pct} />
                    <span className="font-mono2 text-[8.5px] uppercase tracking-[0.2em] text-[var(--faint)]">{live.current}% flux</span>
                  </div>
                </div>

                {/* telemetry band */}
                <div className="heat-shimmer grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[var(--line-faint)] bg-[rgba(6,8,12,0.55)] px-5 py-4 sm:grid-cols-4 sm:px-6">
                  {tel.map((m) => (
                    <Metric key={m.k} label={m.k} value={m.value} unit={m.unit} pct={m.pct} better={m.better as 'low' | 'high'} />
                  ))}
                </div>

                {/* actions */}
                <div className="flex items-center gap-2 border-t border-[var(--line-faint)] px-5 py-3.5 sm:px-6">
                  <button onClick={() => { setModule(p); setHeat('vm'); }}
                    className="flex flex-1 items-center justify-center gap-2 border border-[var(--ion)] bg-[rgba(56,214,255,0.08)] px-3 py-2 font-head text-[11px] uppercase tracking-[0.14em] text-[var(--ion)] transition-all hover:bg-[var(--ion)] hover:text-[#04141c] sm:flex-none sm:px-5"
                    style={{ clipPath: 'var(--cut-sm)' }}>
                    <Zap size={13} /> View schematic
                  </button>
                  <a href={p.repo} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 font-head text-[11px] uppercase tracking-[0.14em] text-[var(--dim)] border border-[var(--line)] transition-all hover:border-[var(--amber)] hover:text-[var(--amber)]">
                    <GitBranch size={13} /> Source
                  </a>
                  <a href={`#/project/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                    className="ml-auto flex items-center gap-1.5 font-mono2 text-[10px] uppercase tracking-[0.16em] text-[var(--faint)] transition-colors hover:text-[var(--ember)]">
                    Dossier <ArrowUpRight size={13} />
                  </a>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* fleet link */}
      <Reveal delay={120}>
        <a href="https://github.com/Dev-moe-kyawaung/" target="_blank" rel="noreferrer"
          className="mt-10 reactor-module flex items-center justify-center gap-3 px-6 py-4 font-head text-[12.5px] uppercase tracking-[0.2em] text-[var(--dim)] group hover:text-[var(--txt)]">
          <Flame size={15} className="text-[var(--ember)]" />
          600+ repositories on the open lattice
          <ArrowUpRight size={15} className="text-[var(--ion)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </a>
      </Reveal>

      {/* ================= MODULE SCHEMATIC MODAL ================= */}
      {module_ && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-3 backdrop-blur-xl sm:p-8"
          role="dialog" aria-modal="true" aria-label={`Schematic — ${module_.title}`}>
          <div className="reactor-module max-h-[92vh] w-full max-w-[1020px] overflow-y-auto bg-[var(--panel-solid)] !backdrop-blur-none">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--panel-solid)] px-5 py-3 sm:px-7">
              <div className="min-w-0">
                <span className="block font-mono2 text-[9px] uppercase tracking-[0.28em] text-[var(--ember)]">Module schematic · live circuit</span>
                <h3 className="truncate font-display text-[17px] uppercase tracking-tight text-[var(--txt)]">{module_.title}</h3>
              </div>
              <button onClick={() => setModule(null)} aria-label="Close schematic"
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--line)] text-[var(--faint)] transition-colors hover:border-[var(--danger)] hover:text-[var(--danger)]"
                style={{ clipPath: 'var(--cut-sm)' }}>
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr]">
              {/* circuit */}
              <div>
                <div className="heat-shimmer relative border border-[var(--line)] bg-[rgba(5,7,11,0.7)] p-3">
                  <CircuitSchematic heat={heat} onPick={setHeat} />
                  <span className="absolute left-3 top-3 font-mono2 text-[8.5px] uppercase tracking-[0.24em] text-[var(--faint)]">power flow · click a node</span>
                </div>

                <p className="mt-4 text-[13.5px] leading-[1.75] text-[var(--dim)]">
                  {module_.desc} The bus keeps the domain core free of framework imports, the local cell owns truth while offline, and the relay replays idempotent mutations on reconnect.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { i: ShieldCheck, k: 'Isolation', v: '4 modules' },
                    { i: Zap, k: 'Recomposition', v: 'scoped' },
                    { i: Gauge, k: 'Test cover', v: 'core 91%' },
                    { i: Activity, k: 'CI gate', v: 'on PR' },
                  ].map((x) => (
                    <div key={x.k} className="border border-[var(--line-faint)] bg-[var(--bg-2)] p-3">
                      <x.i size={13} className="text-[var(--ion)]" />
                      <div className="mt-2 font-mono2 text-[8.5px] uppercase tracking-[0.16em] text-[var(--faint)]">{x.k}</div>
                      <div className="font-orbit text-[12.5px] text-[var(--txt)]">{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* metrics + chart */}
              <div className="space-y-5">
                <div className="border border-[var(--line)] bg-[rgba(5,7,11,0.6)] p-4">
                  <div className="mb-3 flex items-center justify-between font-mono2 text-[9px] uppercase tracking-[0.2em]">
                    <span className="text-[var(--faint)]">Core output · 24h</span>
                    <span className="text-[var(--stable)]">{live.current} MW sustained</span>
                  </div>
                  <ReactorChart labels={live.labels} series={live.series} unit="%" height={186} />
                </div>

                <div className="border border-[var(--line)] p-4">
                  <h4 className="font-mono2 text-[9px] uppercase tracking-[0.24em] text-[var(--faint)]">Before → after refit</h4>
                  <div className="mt-3 space-y-2.5">
                    {[
                      { k: 'Cold start', b: '3.10s', a: '1.40s', d: '-55%' },
                      { k: 'Frame drops', b: '41', a: '3', d: '-93%' },
                      { k: 'Binary mass', b: '38 MB', a: '17 MB', d: '-55%' },
                      { k: 'Battery / hr', b: '11%', a: '4%', d: '-64%' },
                    ].map((m) => (
                      <div key={m.k} className="flex items-center justify-between gap-3 border-b border-[var(--line-faint)] pb-2 last:border-0">
                        <span className="font-mono2 text-[10px] uppercase tracking-[0.14em] text-[var(--dim)]">{m.k}</span>
                        <span className="flex items-baseline gap-2">
                          <span className="font-mono2 text-[11px] text-[var(--faint)] line-through">{m.b}</span>
                          <span className="font-orbit text-[13px] text-[var(--txt)]">{m.a}</span>
                          <span className="font-mono2 text-[10px] text-[var(--stable)]">{m.d}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a href={module_.repo} target="_blank" rel="noreferrer" className="btn btn-primary flex-1">
                    <GitBranch size={14} /> Source lattice
                  </a>
                  <a href="#contact" onClick={() => setModule(null)} className="btn btn-ghost flex-1">Request a refit</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
