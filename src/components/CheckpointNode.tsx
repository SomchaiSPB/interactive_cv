import { motion } from 'framer-motion';
import type { Checkpoint } from '../content/types';

type Props = {
  checkpoint: Checkpoint;
  active: boolean;
  onSelect: (id: string) => void;
};

export function CheckpointNode({ checkpoint, active, onSelect }: Props) {
  const offsetClass =
    checkpoint.side === 'left'
      ? '-translate-x-10 md:-translate-x-14'
      : checkpoint.side === 'right'
        ? 'translate-x-10 md:translate-x-14'
        : '';

  return (
    <button
      type="button"
      aria-label={`Select checkpoint ${checkpoint.order}: ${checkpoint.title}`}
      aria-pressed={active}
      onClick={() => onSelect(checkpoint.id)}
      className={`group absolute z-20 flex max-w-[13rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-2 text-left transition focus:outline-none ${offsetClass}`}
      style={{ left: `${checkpoint.position.x}%`, top: `${checkpoint.position.y}%` }}
    >
      <span
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold transition ${
          active
            ? 'border-neon bg-neon/20 text-neon shadow-[0_0_20px_rgba(124,247,212,0.35)]'
            : 'border-white/15 bg-slate-950/90 text-slate-300 group-hover:border-neon/50 group-hover:text-white'
        }`}
      >
        {String(checkpoint.order).padStart(2, '0')}
      </span>
      <motion.span
        layout
        className={`rounded-2xl border px-4 py-3 text-sm backdrop-blur-md ${
          active
            ? 'border-neon/40 bg-neon/10 text-white'
            : 'border-white/10 bg-slate-950/80 text-slate-200 group-hover:border-white/20'
        }`}
      >
        <span className="block text-[11px] uppercase tracking-[0.24em] text-slate-400">{checkpoint.subtitle}</span>
        <span className="mt-1 block font-semibold leading-snug">{checkpoint.title}</span>
      </motion.span>
    </button>
  );
}
