import { motion } from 'framer-motion';
import type { Checkpoint } from '../content/types';

type Props = {
  checkpoint: Checkpoint;
  active: boolean;
  onSelect: (id: string) => void;
  variant?: 'default' | 'fullscreen';
};

export function CheckpointNode({ checkpoint, active, onSelect, variant = 'default' }: Props) {
  const isBranch = Boolean(checkpoint.branchOf);
  const isFullscreen = variant === 'fullscreen';
  const offsetClass =
    checkpoint.side === 'left'
      ? '-translate-x-10 md:-translate-x-14'
      : checkpoint.side === 'right'
        ? 'translate-x-10 md:translate-x-14'
        : '';
  const rootClass = isFullscreen ? (isBranch ? 'max-w-[12rem]' : 'max-w-[16rem]') : isBranch ? 'max-w-[11rem]' : 'max-w-[14rem]';
  const orbClass = isFullscreen ? (isBranch ? 'h-10 w-10 text-[10px]' : 'h-14 w-14 text-sm') : isBranch ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-xs';
  const cardClass = isFullscreen ? (isBranch ? 'px-4 py-3 text-sm' : 'px-5 py-4 text-base') : isBranch ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm';

  return (
    <motion.button
      type="button"
      aria-label={`Select checkpoint ${checkpoint.order}: ${checkpoint.title}`}
      aria-pressed={active}
      onClick={() => onSelect(checkpoint.id)}
      whileHover={{ y: -2, scale: active ? 1.01 : 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neon/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${offsetClass} ${rootClass}`}
      style={{ left: `${checkpoint.position.x}%`, top: `${checkpoint.position.y}%` }}
    >
      <span
        className={`mx-auto flex items-center justify-center rounded-full border font-semibold transition ${
          orbClass
        } ${
          active
            ? 'border-neon bg-neon/20 text-neon shadow-[0_0_20px_rgba(124,247,212,0.35)]'
            : isBranch
              ? 'border-white/10 bg-slate-950/85 text-slate-300/90 group-hover:border-neon/35 group-hover:text-white'
              : 'border-white/15 bg-slate-950/90 text-slate-300 group-hover:border-neon/50 group-hover:text-white'
        }`}
      >
        {String(checkpoint.order).padStart(2, '0')}
      </span>
      <motion.span
        layout
        className={`rounded-2xl border backdrop-blur-md transition ${
          cardClass
        } ${
          active
            ? 'border-neon/50 bg-neon/10 text-white shadow-[0_0_24px_rgba(124,247,212,0.14)]'
            : isBranch
              ? 'border-white/10 bg-slate-950/72 text-slate-200/90 group-hover:border-white/20 group-hover:bg-slate-950/82'
              : 'border-white/10 bg-slate-950/80 text-slate-200 group-hover:border-white/20'
        }`}
      >
        <span className={`block uppercase tracking-[0.24em] text-slate-400 ${isFullscreen ? 'text-[11px]' : 'text-[10px]'}`}>{checkpoint.subtitle}</span>
        <span className={`mt-1 block font-semibold leading-snug ${isBranch ? 'text-[13px]' : isFullscreen ? 'text-[15px]' : 'text-sm'}`}>
          {checkpoint.title}
        </span>
        {checkpoint.branchOf ? (
          <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Branch of {checkpoint.branchOf.replace(/-/g, ' ')}
          </span>
        ) : null}
      </motion.span>
    </motion.button>
  );
}
