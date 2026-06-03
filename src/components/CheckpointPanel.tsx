import { motion, AnimatePresence } from 'framer-motion';
import type { Checkpoint } from '../content/types';

type Props = {
  checkpoint: Checkpoint | null;
};

export function CheckpointPanel({ checkpoint }: Props) {
  return (
    <AnimatePresence mode="wait">
      {checkpoint ? (
        <motion.aside
          key={checkpoint.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.2 }}
          className="panel-surface h-full rounded-3xl p-6"
        >
          <p className="mono text-xs uppercase tracking-[0.28em] text-neon">
            Checkpoint {String(checkpoint.order).padStart(2, '0')}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{checkpoint.title}</h3>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-400">{checkpoint.subtitle}</p>
          <p className="mt-5 text-sm leading-7 text-slate-300">{checkpoint.summary}</p>
          <div className="mt-5 space-y-3">
            {checkpoint.details.map((detail) => (
              <div className="flex gap-3 text-sm text-slate-300">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neon" />
                <span>{detail}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {checkpoint.technologies.map((tech) => (
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-200">
                {tech}
              </span>
            ))}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

