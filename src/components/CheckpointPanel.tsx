import { AnimatePresence, motion } from 'framer-motion';
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
          className={`${isHud ? 'h-full max-h-[calc(100vh-10rem)] overflow-y-auto rounded-3xl border border-amber-100/10 bg-[#273522]/95 p-4 shadow-inner sm:p-5' : 'panel-surface h-full rounded-3xl p-6'}`}
        >
          <div className={isHud ? 'space-y-3' : 'space-y-4'}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className={`mono text-xs uppercase tracking-[0.28em] ${isHud ? 'text-amber-200' : 'text-neon'}`}>
                  Checkpoint {String(checkpoint.order).padStart(2, '0')}
                </p>
                <h3 className={`${isHud ? 'text-xl sm:text-2xl' : 'text-2xl'} font-semibold text-white`}>{checkpoint.title}</h3>
                <p className={`text-sm uppercase tracking-[0.2em] text-slate-400 ${isHud ? 'max-w-[18ch]' : ''}`}>
                  {checkpoint.subtitle}
                </p>
              </div>
            </div>

            <div className={`rounded-3xl ${isHud ? 'border border-amber-200/15 bg-amber-100/[0.06] p-3 sm:p-4' : 'border border-neon/15 bg-neon/5 p-4'}`}>
              <p className={`text-xs uppercase tracking-[0.24em] ${isHud ? 'text-amber-200' : 'text-neon'}`}>Quest summary</p>
              <p className={`mt-3 text-sm leading-7 text-slate-200 ${isHud ? 'sm:text-[0.92rem]' : ''}`}>{checkpoint.summary}</p>
            </div>

            {checkpoint.image ? (
              <img
                src={checkpoint.image.src}
                alt={checkpoint.image.alt}
                loading="lazy"
                className="h-auto w-full rounded-2xl border border-white/10"
              />
            ) : null}

            <div className={`grid gap-4 ${isHud ? 'md:grid-cols-1 xl:grid-cols-[1.15fr_0.85fr]' : 'md:grid-cols-[1.15fr_0.85fr]'}`}>
              <section className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Quest notes</p>
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
                {checkpoint.technologies.length ? (
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
                ) : null}

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

              </section>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
