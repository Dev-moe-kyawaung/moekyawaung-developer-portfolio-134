import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { ArrowRight, Download, ChevronDown, Gauge, Flame, Radio, ThermometerSun } from 'lucide-react';
import { PROFILE, ROLES, STATS, SOCIALS, I18N, IMAGES, MARQUEE_ITEMS } from '../data';
import { useTyping, useLang } from '../hooks';
import { SocialIcon, StatCounter, Reveal, Marquee } from './ui';
import { ContainmentCore } from './PlasmaField';

function downloadResume() {
  const txt = [
    'MOE KYAW AUNG — Senior Android / Flutter Engineer (Core Director)',
    `${PROFILE.location} | ${PROFILE.phones[0]} | ${PROFILE.primaryEmail}`,
    `GitHub: ${PROFILE.githubMain}`,
    '', 'Systems: Kotlin, Jetpack Compose, Clean Architecture, Firebase, Flutter, CI/CD',
    'Log: 12 years · 3,000+ deployments · 600+ repositories · 99.9% containment',
  ].join('\n');
  const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'Moe-Kyaw-Aung-Operating-Log.txt'; a.click();
  URL.revokeObjectURL(url);
}

/* live plant readouts — the room is never still */
function usePlant() {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setT((v) => v + 1), 1400);
    return () => clearInterval(id);
  }, []);
  return [
    { k: 'toroidal field', v: `${(5.2 + Math.sin(t * 0.6) * 0.14).toFixed(2)} T` },
    { k: 'plasma temp', v: `${(148 + Math.sin(t * 0.9 + 1) * 6).toFixed(0)} MK` },
    { k: 'neutron flux', v: `${(1.06 + Math.cos(t * 0.7) * 0.03).toFixed(2)}e14` },
    { k: 'containment', v: `${(99.9 - Math.abs(Math.sin(t * 0.5)) * 0.04).toFixed(2)} %` },
  ];
}

export default function Hero() {
  const lang = useLang();
  const t = I18N[lang];
  const typed = useTyping(ROLES, 46, 22, 2100);
  const plant = usePlant();
  const [par, setPar] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const id = setTimeout(() => setMounted(true), 60); return () => clearTimeout(id); }, []);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPar({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  const enter = (d: number) => ({
    transitionDelay: `${d}ms`,
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'none' : 'translateY(18px)',
    transition: 'opacity 0.85s cubic-bezier(0.2,0.8,0.2,1), transform 0.85s cubic-bezier(0.2,0.8,0.2,1)',
  } as React.CSSProperties);

  return (
    <section id="home" className="relative flex min-h-screen flex-col overflow-hidden" onMouseMove={onMove}>
      {/* ============ control-room desk rail (top) ============ */}
      <div className="relative z-10 mt-[76px] border-y border-[var(--line-faint)] bg-[rgba(6,8,12,0.72)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 overflow-x-auto px-6 py-2 lg:px-10">
          <span className="flex shrink-0 items-center gap-2 font-mono2 text-[9px] uppercase tracking-[0.24em] text-[var(--ember)]">
            <Radio size={11} className="animate-pulse" /> plant status
          </span>
          {plant.map((p) => (
            <span key={p.k} className="flex shrink-0 items-baseline gap-2 font-mono2 text-[10px] uppercase tracking-[0.14em]">
              <span className="text-[var(--faint)]">{p.k}</span>
              <span className="text-[var(--txt)] tabular-nums">{p.v}</span>
              <span className="text-[var(--fainter)]">/</span>
            </span>
          ))}
          <span className={`ml-auto hidden shrink-0 items-center gap-2 font-mono2 text-[10px] uppercase tracking-[0.16em] text-[var(--stable)] sm:flex ${lang === 'mm' ? 'font-mm' : ''}`}>
            <span className="led" /> {t.available}
          </span>
        </div>
      </div>

      {/* ============ main deck ============ */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 items-center px-6 py-12 lg:px-10 lg:py-16">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">

          {/* ---------- director console ---------- */}
          <div>
            <p style={enter(60)} className={`mb-5 flex flex-wrap items-center gap-3 font-mono2 text-[10.5px] uppercase tracking-[0.26em] text-[var(--ion)] ${lang === 'mm' ? 'font-mm' : ''}`}>
              <span className="h-px w-8 bg-[var(--ember)]" />
              core director · <span className="font-mm text-[var(--amber)]">{PROFILE.mmName}</span>
            </p>

            <h1 style={enter(140)} className="font-display uppercase leading-[0.92] tracking-[-0.01em] text-[clamp(2.5rem,6.6vw,5.4rem)] text-[var(--txt)]">
              Moe Kyaw<br />
              <span className="relative inline-block text-[var(--amber)]">
                Aung
                <span className="absolute -bottom-3 left-0 h-[3px] w-full bg-[var(--ember)] shadow-[var(--glow-ember)]" />
              </span>
            </h1>

            <p style={enter(220)} className="mt-7 max-w-[54ch] text-[19px] leading-[1.5] font-head tracking-tight text-[var(--txt-soft)] sm:text-[22px]">
              I run mobile systems the way a reactor runs: <span className="text-[var(--ion)]">contained, instrumented, and stable under load.</span>
            </p>

            <div style={enter(300)} className="mt-5 flex items-start gap-3">
              <Flame size={15} className="mt-1 shrink-0 text-[var(--ember)]" />
              <p className={`max-w-[56ch] text-[14.5px] leading-[1.8] text-[var(--dim)] ${lang === 'mm' ? 'font-mm' : ''}`}>
                Twelve years of hands-on plasma work in Kotlin, Jetpack Compose and Flutter — clean
                architecture, real security, and release builds that hold at 99.9% containment on
                hardware people actually own.
              </p>
            </div>

            {/* rotating discipline readout */}
            <div style={enter(380)} className="mt-7 inline-flex items-center gap-3 border-l-2 border-[var(--ion)] bg-[var(--panel-soft)] py-2.5 pl-3 pr-4">
              <Gauge size={15} className="text-[var(--ion)]" />
              <p className="font-mono2 text-[11.5px] tracking-tight text-[var(--txt-soft)] sm:text-[12.5px]">
                {typed}<span className="type-caret" />
              </p>
            </div>

            {/* CTAs */}
            <div style={enter(460)} className="mt-9 flex flex-wrap gap-3">
              <a href="#projects" className="btn btn-primary">Open reactor modules <ArrowRight size={15} /></a>
              <button onClick={downloadResume} className="btn btn-ghost"><Download size={15} /> Operating log</button>
              <a href="#contact" className="btn btn-ghost hidden sm:inline-flex"><Radio size={15} /> Hail the room</a>
            </div>

            {/* bond channels */}
            <div style={enter(540)} className="mt-9 flex flex-wrap items-center gap-2">
              <span className="mr-2 font-mono2 text-[9px] uppercase tracking-[0.24em] text-[var(--fainter)]">Outbound relays</span>
              {SOCIALS.slice(0, 10).map((s) => (
                <a key={s.key} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  aria-label={s.label} title={`${s.label} · ${s.handle}`}
                  className="flex h-9 w-9 items-center justify-center border border-[var(--line)] bg-[var(--panel-soft)] text-[var(--dim)] transition-all hover:-translate-y-0.5 hover:border-[var(--ion)] hover:text-[var(--ion)] hover:shadow-[var(--glow-ion)]"
                  style={{ clipPath: 'var(--cut-sm)' }}>
                  <SocialIcon name={s.key} size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* ---------- containment chamber ---------- */}
          <div style={enter(320)} className="relative mx-auto flex w-fit items-center justify-center">
            <div style={{ transform: `translate(${par.x * -16}px, ${par.y * -16}px)`, transition: 'transform 0.4s ease-out' }}>
              <ContainmentCore size={typeof window !== 'undefined' && window.innerWidth < 640 ? 340 : 500} intensity={1}>
                <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[var(--line-strong)] bg-[var(--bg-2)] shadow-[0_0_60px_rgba(56,214,255,0.3)]">
                  <img src={IMAGES.avatar} alt="Moe Kyaw Aung — core director" className="h-full w-full object-cover" loading="eager" />
                  <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 62% 22%, transparent 48%, rgba(8,9,13,0.72))' }} />
                  <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 46px rgba(255,106,43,0.22)' }} />
                  <span className="absolute inset-x-0 bottom-3 text-center font-mono2 text-[8.5px] uppercase tracking-[0.28em] text-[var(--amber)]/80">
                    unit · mka-2026
                  </span>
                </div>
              </ContainmentCore>
            </div>

            {/* chamber side plates */}
            <div className="absolute -left-2 top-6 hidden sm:block" style={{ transform: `translate(${par.x * 24}px, ${par.y * 18}px)` }}>
              <div className="reactor-module flex items-center gap-2.5 px-4 py-2.5">
                <ThermometerSun size={15} className="text-[var(--ember)]" />
                <div>
                  <div className="font-orbit text-[15px] leading-none text-[var(--txt)]">12 YRS</div>
                  <div className="mt-1 font-mono2 text-[8px] uppercase tracking-[0.2em] text-[var(--faint)]">sustained burn</div>
                </div>
                <span className="micro-cluster ml-1"><span /><span /><span /></span>
              </div>
            </div>
            <div className="absolute -right-2 bottom-16 hidden sm:block" style={{ transform: `translate(${par.x * -22}px, ${par.y * -18}px)` }}>
              <div className="reactor-module flex items-center gap-2.5 px-4 py-2.5">
                <Gauge size={15} className="text-[var(--ion)]" />
                <div>
                  <div className="font-orbit text-[15px] leading-none text-[var(--txt)]">99.9%</div>
                  <div className="mt-1 font-mono2 text-[8px] uppercase tracking-[0.2em] text-[var(--faint)]">containment</div>
                </div>
                <span className="micro-cluster ml-1"><span /><span /><span /></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ output meters ============ */}
      <Reveal className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-10 lg:px-10">
        <div className="reactor-module hud-scan overflow-hidden">
          <div className="hud-strip">
            <span>output meters · rolling 12 seasons</span>
            <span className="flex items-center gap-2 text-[var(--stable)]"><span className="led" /> all cells nominal</span>
          </div>
          <div className="grid grid-cols-2 divide-[var(--line-faint)] md:grid-cols-4 md:divide-x">
            {STATS.map((s) => <StatCounter key={s.label} stat={s} />)}
          </div>
        </div>
      </Reveal>

      <Marquee items={MARQUEE_ITEMS} />

      {/* scroll */}
      <div className="relative z-10 flex justify-center pb-4">
        <a href="#about" aria-label="Descend to the vessel" className="flex flex-col items-center gap-1 text-[var(--faint)] transition-colors hover:text-[var(--ion)]">
          <span className="font-mono2 text-[8px] uppercase tracking-[0.3em]">descend to deck 02</span>
          <ChevronDown size={14} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}
