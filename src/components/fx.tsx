import { useEffect, useState } from 'react';
import { ArrowUp, Flame } from 'lucide-react';
import { useScrollY } from '../hooks';
import { PlasmaField, ReactorDefs } from './PlasmaField';

/* ============ PRELOADER — reactor start-up ramp ============ */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const dur = 1550;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => { setGone(true); setTimeout(onDone, 600); }, 200);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const stages = [
    'CHARGING TOROIDAL COILS',
    'IONIZING DEUTERIUM LOOP',
    'MAGNETIC CAGE LOCKED',
    'PLASMA SUSTAINED — GO',
  ];
  const stage = stages[Math.min(stages.length - 1, Math.floor(pct / 26))];
  const temp = (0.4 + (pct / 100) * 148).toFixed(1);

  return (
    <div className={`preloader ${gone ? 'done' : ''}`} aria-hidden={gone}>
      <div className="chamber">
        <div className="coil-lattice" />
        <div className="heat-floor" />
      </div>

      <div className="relative flex flex-col items-center gap-7 px-6">
        <div className="relative h-28 w-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-[var(--ion)] opacity-50 reactor-spin-cw" />
          <div className="absolute inset-[10px] rounded-full border border-[var(--ember)] opacity-70 reactor-spin-ccw" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--amber)] bg-[var(--bg-2)] shadow-[var(--glow-ember)]">
            <Flame size={22} className="text-[var(--ember)] plasma-throb" />
          </div>
        </div>

        <div className="font-mono2 text-[10px] uppercase tracking-[0.34em] text-[var(--ion)]">
          MKA REACTOR · UNIT 2026
        </div>

        <div className="w-[300px]">
          <div className="mb-2 flex items-center justify-between font-mono2 text-[10px]">
            <span className="uppercase tracking-[0.2em] text-[var(--faint)]">{temp} MK</span>
            <span className="text-[var(--amber)]">{pct}%</span>
          </div>
          <div className="gauge-track">
            <div className="gauge-fill" style={{ width: `${pct}%`, transition: 'width 120ms linear' }} />
          </div>
          <div className="mt-2 font-mono2 text-[9px] uppercase tracking-[0.24em] text-[var(--dim)]">{stage}</div>
        </div>
      </div>
    </div>
  );
}

/* ============ CURSOR — native pointer (control room) ============ */
export function Cursor() { return null; }

/* ============ BACKGROUND — the vessel itself ============ */
export function Background() {
  return (
    <div className="chamber" aria-hidden="true">
      <ReactorDefs />
      <div className="contain-rings" />
      <div className="coil-lattice" />
      <div className="plasma-haze" style={{ left: '-6%' }} />
      <div className="plasma-haze" style={{ right: '-8%', background: 'linear-gradient(to bottom, rgba(255,106,43,0.09), transparent 58%)' }} />
      <PlasmaField density={0.000052} flow={0.42} className="opacity-[0.85]" />
      <div className="heat-floor" />
      <div className="deco-ticks" />
    </div>
  );
}

/* ============ TILT — kept for API compatibility ============ */
export function Tilt({ children, className = '' }: { children: React.ReactNode; className?: string; max?: number }) {
  return <div className={className}>{children}</div>;
}

/* ============ BACK TO TOP — emergency scram ============ */
export function BackToTop() {
  const y = useScrollY();
  const show = y > 460;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Return to control deck"
      className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center border border-[var(--line-strong)] bg-[var(--panel)] text-[var(--ion)] backdrop-blur-md transition-all duration-500 hover:border-[var(--ion)] hover:shadow-[var(--glow-ion)] ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      style={{ clipPath: 'var(--cut-sm)' }}
    >
      <ArrowUp size={17} />
    </button>
  );
}

/* ============ STICKY CTA — comm channel ============ */
export function StickyCta() {
  const y = useScrollY();
  const show = y > 760;
  return (
    <a
      href="#contact"
      className={`fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-2.5 pl-3 pr-4 py-2.5 border border-[var(--line)] bg-[var(--panel)] font-mono2 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md transition-all duration-500 hover:border-[var(--ember)] hover:shadow-[var(--glow-ember)] ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      style={{ clipPath: 'var(--cut-sm)' }}
    >
      <span className="pulse-dot" />
      <span className="text-[var(--dim)]">Open comms · schedule review</span>
    </a>
  );
}
