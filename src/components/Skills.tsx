import { SKILL_BARS, RINGS, CHIP_CLOUD } from '../data';
import { Reveal, SectionHead, ProgressBar, ProgressRing } from './ui';

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-[1440px] px-6 lg:px-10 py-24 md:py-32">
      <SectionHead
        index="02"
        kicker="Thermal profile"
        mm="ကျွမ်းကျင်မှုများ"
        title={<>CAPABILITY CURVE — <span className="heat-under">MEASURED, NOT CLAIMED</span></>}
        desc="Twelve years refining a stack that sustains burn: Kotlin-first Android, modern Jetpack, Firebase relays, and cross-platform Flutter when one codebase is the honest answer."
      />

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
        <Reveal>
          <div className="rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-7 sm:p-8 space-y-7">
            <div className="flex items-center justify-between">
              <h3 className="font-mono2 text-[11px] tracking-[0.18em] uppercase text-[var(--faint)]">Ionization channels · sustained output</h3>
              <span className="font-mono2 text-[10px] text-[var(--fainter)]">measured on release builds</span>
            </div>
            {SKILL_BARS.map((s, i) => <ProgressBar key={s.label} label={s.label} val={s.val} color={s.color} note={s.note} delay={i * 80} />)}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-7 sm:p-8">
            <h3 className="font-mono2 text-[11px] tracking-[0.18em] uppercase text-[var(--faint)] mb-8">Containment margins · four coils</h3>
            <div className="grid grid-cols-2 gap-8 place-items-center">
              {RINGS.map((r) => <ProgressRing key={r.label} label={r.label} val={r.val} color={r.color} />)}
            </div>
            <p className="mt-8 font-mono2 text-[11px] leading-[1.6] text-[var(--faint)]">3M+ users · 99.9% crash-free · 60fps target on low-end devices.</p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={160}>
        <div className="mt-12 flex flex-wrap gap-2">
          {CHIP_CLOUD.map((c) => (
            <span key={c} className="px-3.5 py-1.5 rounded-full border border-[var(--line)] bg-[var(--panel-soft)] font-mono2 text-[11px] tracking-[0.04em] text-[var(--dim)] hover:border-[var(--line-strong)] hover:text-[var(--txt)] transition-colors">
              {c}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
