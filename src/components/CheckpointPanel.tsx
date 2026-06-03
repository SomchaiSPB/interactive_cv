import { motion, AnimatePresence } from 'framer-motion';
import type { Checkpoint } from '../content/types';

type Props = {
  checkpoint: Checkpoint | null;
  variant?: 'default' | 'hud';
};

export function CheckpointPanel({ checkpoint, variant = 'default' }: Props) {
  const isHud = variant === 'hud';
  return (
    <AnimatePresence mode="wait">
      {checkpoint ? (
        <motion.aside
          key={checkpoint.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.2 }}
          className={`panel-surface h-full rounded-3xl ${isHud ? 'max-h-[calc(100vh-10rem)] overflow-y-auto p-4 sm:p-5' : 'p-6'}`}
        >
          <div className={isHud ? 'space-y-3' : 'space-y-4'}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="mono text-xs uppercase tracking-[0.28em] text-neon">
                  Checkpoint {String(checkpoint.order).padStart(2, '0')}
                </p>
                <h3 className={`${isHud ? 'text-xl sm:text-2xl' : 'text-2xl'} font-semibold text-white`}>{checkpoint.title}</h3>
                <p className={`text-sm uppercase tracking-[0.2em] text-slate-400 ${isHud ? 'max-w-[18ch]' : ''}`}>
                  {checkpoint.subtitle}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Path</p>
                <p className="mt-1 text-sm font-medium text-slate-200">
                  {checkpoint.branchOf ? 'Side branch' : 'Main path'}
                </p>
              </div>
            </div>

            <div className={`rounded-3xl border border-neon/15 bg-neon/5 ${isHud ? 'p-3 sm:p-4' : 'p-4'}`}>
              <p className="text-xs uppercase tracking-[0.24em] text-neon">Summary</p>
              <p className={`mt-3 text-sm leading-7 text-slate-200 ${isHud ? 'sm:text-[0.92rem]' : ''}`}>{checkpoint.summary}</p>
            </div>

            <div className={`grid gap-4 ${isHud ? 'md:grid-cols-1 xl:grid-cols-[1.15fr_0.85fr]' : 'md:grid-cols-[1.15fr_0.85fr]'}`}>
              <section className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Journey notes</p>
                <ul className="mt-3 space-y-3">
                  {checkpoint.details.map((detail) => (
                    <li key={detail} className="flex gap-3 text-sm leading-7 text-slate-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neon" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </section>

            <section className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Stack</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {checkpoint.technologies.map((tech) => (
                    <span key={tech} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {checkpoint.links?.length ? (
                <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Links</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {checkpoint.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noreferrer' : undefined}
                        className="rounded-full border border-neon/20 bg-neon/5 px-3 py-1 text-xs text-neon transition hover:border-neon/40 hover:bg-neon/10"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-slate-950/55 p-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Graph order</p>
                  <p className="mt-1 font-medium text-slate-200">{checkpoint.pathOrder ?? checkpoint.order}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Radius</p>
                    <p className="mt-1 font-medium text-slate-200">{checkpoint.interactionRadius ?? 0}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Connections</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(checkpoint.connectedTo ?? []).map((target) => (
                        <span key={target} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                          {target.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
