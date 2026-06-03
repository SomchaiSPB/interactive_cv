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
  const firstCheckpoint = items[0] ?? null;
  const [selectedId, setSelectedId] = useState(firstCheckpoint?.id ?? '');

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? firstCheckpoint,
    [firstCheckpoint, items, selectedId],
  );

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <div className="panel-surface relative min-h-[760px] overflow-hidden rounded-[2rem] p-4 sm:p-6">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 grid-mask opacity-35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,247,212,0.12),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,17,0.12),rgba(5,8,17,0.75))]" />
        </div>

        <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-neon/25 to-transparent" />
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-3xl"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
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
          Click a checkpoint to inspect the story node.
        </div>
      </div>

      <CheckpointPanel checkpoint={selected ?? null} />
    </section>
  );
}

