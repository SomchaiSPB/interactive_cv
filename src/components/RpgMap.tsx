import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { checkpoints as defaultCheckpoints } from '../content/checkpoints';
import type { Checkpoint } from '../content/types';
import { CheckpointNode } from './CheckpointNode';
import { CheckpointPanel } from './CheckpointPanel';

type Props = {
  items?: Checkpoint[];
};

export default function RpgMap({ items = defaultCheckpoints }: Props) {
  const checkpointsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const mainPath = useMemo(
    () =>
      [...items]
        .filter((item) => !item.branchOf)
        .sort((a, b) => (a.pathOrder ?? a.order) - (b.pathOrder ?? b.order)),
    [items],
  );
  const firstCheckpoint = mainPath[0] ?? items.find((item) => item.unlockedByDefault) ?? items[0] ?? null;
  const [selectedId, setSelectedId] = useState(firstCheckpoint?.id ?? '');

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? firstCheckpoint,
    [firstCheckpoint, items, selectedId],
  );

  const connections = useMemo(() => {
    const seen = new Set<string>();
    const edges: Array<{ from: Checkpoint; to: Checkpoint }> = [];

    items.forEach((item) => {
      (item.connectedTo ?? []).forEach((targetId) => {
        const target = checkpointsById.get(targetId);
        if (!target) {
          return;
        }

        const key = [item.id, target.id].sort().join('::');
        if (seen.has(key)) {
          return;
        }

        seen.add(key);
        edges.push({ from: item, to: target });
      });
    });

    return edges;
  }, [checkpointsById, items]);

  const heroPosition = selected?.position ?? firstCheckpoint?.position ?? { x: 50, y: 50 };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <div className="panel-surface map-shell relative min-h-[760px] overflow-hidden rounded-[2rem] p-4 sm:p-6">
        <div className="absolute inset-0 opacity-90">
          <div className="absolute inset-0 grid-mask opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(105,167,255,0.22),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(124,247,212,0.12),transparent_22%),radial-gradient(circle_at_80%_30%,rgba(246,183,76,0.08),transparent_18%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,17,0.08),rgba(5,8,17,0.82))]" />
          <div className="absolute inset-0 map-noise opacity-25" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,247,212,0.08),transparent_42%)]" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-neon/25 to-transparent" />
        <div className="absolute left-[15%] top-[18%] h-36 w-36 rounded-full bg-neon/[0.08] blur-3xl" />
        <div className="absolute right-[10%] top-[12%] h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-[12%] left-[25%] h-40 w-40 rounded-full bg-amber-400/[0.08] blur-3xl" />

        <svg className="absolute inset-0 z-[5] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="main-path-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7cf7d4" />
              <stop offset="100%" stopColor="#69a7ff" />
            </linearGradient>
            <linearGradient id="branch-path-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7a93ff" />
              <stop offset="100%" stopColor="#7cf7d4" />
            </linearGradient>
          </defs>
          {connections.map(({ from, to }) => {
            const isMainConnection = !from.branchOf && !to.branchOf;
            const stroke = isMainConnection ? 'url(#main-path-gradient)' : 'url(#branch-path-gradient)';
            const strokeWidth = isMainConnection ? 0.8 : 0.5;
            const opacity = isMainConnection ? 0.85 : 0.42;
            const dash = isMainConnection ? undefined : '1.5 1.6';

            return (
              <line
                key={`${from.id}-${to.id}`}
                x1={from.position.x}
                y1={from.position.y}
                x2={to.position.x}
                y2={to.position.y}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={dash}
                opacity={opacity}
              />
            );
          })}
        </svg>

        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 z-[6] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute z-[18] -translate-x-1/2 -translate-y-1/2"
          animate={{ left: `${heroPosition.x}%`, top: `${heroPosition.y}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <div className="relative flex flex-col items-center">
            <motion.div
              className="absolute inset-0 rounded-full bg-neon/30 blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neon/70 bg-slate-950/95 shadow-[0_0_28px_rgba(124,247,212,0.35)]">
              <span className="h-3 w-3 rounded-full bg-neon shadow-[0_0_16px_rgba(124,247,212,0.85)]" />
            </div>
            <span className="mt-2 rounded-full border border-neon/20 bg-slate-950/85 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-neon">
              Guided hero
            </span>
          </div>
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 z-[7] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/10 bg-[radial-gradient(circle,rgba(124,247,212,0.04),transparent_62%)]"
        />

        {items.map((item) => (
          <CheckpointNode
            key={item.id}
            checkpoint={item}
            active={item.id === selected?.id}
            onSelect={setSelectedId}
          />
        ))}

        <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-slate-400">
          Click a checkpoint to inspect the story node. The hero marker follows the selected checkpoint.
        </div>
      </div>

      <CheckpointPanel checkpoint={selected ?? null} />
    </section>
  );
}
