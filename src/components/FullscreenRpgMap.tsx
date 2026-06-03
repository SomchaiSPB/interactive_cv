import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { checkpoints as defaultCheckpoints } from '../content/checkpoints';
import type { Checkpoint } from '../content/types';
import { profile } from '../content/profile';
import { CheckpointNode } from './CheckpointNode';
import { CheckpointPanel } from './CheckpointPanel';

type Props = {
  items?: Checkpoint[];
};

export function FullscreenRpgMap({ items = defaultCheckpoints }: Props) {
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

  const heroPosition = selected?.position ?? firstCheckpoint?.position ?? { x: 50, y: 50 };
  const activeMainId = selected?.branchOf ?? selected?.id ?? firstCheckpoint?.id ?? '';
  const activeMainIndex = Math.max(
    0,
    mainPath.findIndex((item) => item.id === activeMainId),
  );

  const navigateMainPath = (direction: 1 | -1) => {
    const nextIndex = Math.min(mainPath.length - 1, Math.max(0, activeMainIndex + direction));
    const next = mainPath[nextIndex];

    if (next) {
      setSelectedId(next.id);
    }
  };

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

  const travelTo = (id: string) => setSelectedId(id);

  return (
    <section className="game-home relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(105,167,255,0.22),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(124,247,212,0.15),transparent_24%),linear-gradient(180deg,rgba(4,8,16,0.72),rgba(7,11,20,0.94))]" />
      <div className="absolute inset-0 map-noise opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(124,247,212,0.03)_1px,transparent_1px),linear-gradient(rgba(124,247,212,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-neon/[0.08] blur-3xl" />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-amber-400/[0.06] blur-3xl" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 md:flex-row md:items-start md:justify-between">
          <div className="pointer-events-auto max-w-xl">
            <a href="/" className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-xl transition hover:border-neon/30 hover:bg-slate-950/80">
              <span className="pixel-border flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/95 text-sm font-bold text-neon">
                BG
              </span>
              <span>
                <span className="block text-[11px] uppercase tracking-[0.36em] text-neon">BACKEND ODYSSEY</span>
                <span className="block text-sm text-slate-200">{profile.name}</span>
              </span>
            </a>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
              Fullscreen career map. Click checkpoints to travel, inspect the HUD, and move along the path.
            </p>
          </div>

          <nav className="pointer-events-auto flex flex-wrap gap-2 md:justify-end">
            <a
              href="/cv"
              className="rounded-full border border-neon/35 bg-neon/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-neon transition hover:bg-neon/15"
            >
              Classic CV
            </a>
            <a
              href="/projects"
              className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-200 transition hover:border-white/20 hover:bg-slate-950/90"
            >
              Projects
            </a>
            <a
              href="/contact"
              className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-200 transition hover:border-white/20 hover:bg-slate-950/90"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 pb-4 pt-28 sm:px-6 lg:px-8">
        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_clamp(20rem,22vw,28rem)]">
          <div className="flex min-h-0 flex-col gap-4">
            <div className="panel-surface map-shell relative min-h-[64vh] flex-1 overflow-hidden rounded-[2rem] p-3 sm:p-5 lg:min-h-0">
              <div className="absolute inset-0 opacity-95">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(124,247,212,0.08),transparent_30%),radial-gradient(circle_at_70%_25%,rgba(105,167,255,0.12),transparent_18%),radial-gradient(circle_at_20%_70%,rgba(246,183,76,0.08),transparent_14%)]" />
                <div className="absolute inset-0 map-noise opacity-25" />
              </div>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,247,212,0.07),transparent_45%)]" />
              <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-neon/25 to-transparent" />
              <div className="absolute left-[12%] top-[16%] h-48 w-48 rounded-full bg-neon/[0.08] blur-3xl" />
              <div className="absolute right-[8%] top-[10%] h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
              <div className="absolute bottom-[10%] left-[22%] h-52 w-52 rounded-full bg-amber-400/[0.08] blur-3xl" />

              <svg className="absolute inset-0 z-[5] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="main-path-gradient-fullscreen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7cf7d4" />
                    <stop offset="100%" stopColor="#69a7ff" />
                  </linearGradient>
                  <linearGradient id="branch-path-gradient-fullscreen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7a93ff" />
                    <stop offset="100%" stopColor="#7cf7d4" />
                  </linearGradient>
                  <filter id="road-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="0.75" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {connections.map(({ from, to }) => {
                  const isMainConnection = !from.branchOf && !to.branchOf;
                  const stroke = isMainConnection
                    ? 'url(#main-path-gradient-fullscreen)'
                    : 'url(#branch-path-gradient-fullscreen)';
                  const strokeWidth = isMainConnection ? 2.2 : 1;
                  const baseWidth = isMainConnection ? 4.4 : 2.2;
                  const opacity = isMainConnection ? 0.9 : 0.5;
                  const dash = isMainConnection ? undefined : '1.8 2';

                  return (
                    <g key={`${from.id}-${to.id}`}>
                      <line
                        x1={from.position.x}
                        y1={from.position.y}
                        x2={to.position.x}
                        y2={to.position.y}
                        stroke="rgba(5, 8, 17, 0.92)"
                        strokeWidth={baseWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={dash}
                        opacity={0.92}
                      />
                      <line
                        x1={from.position.x}
                        y1={from.position.y}
                        x2={to.position.x}
                        y2={to.position.y}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={dash}
                        opacity={opacity}
                        filter="url(#road-glow)"
                      />
                    </g>
                  );
                })}
              </svg>

              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute z-[18] -translate-x-1/2 -translate-y-1/2"
                animate={{ left: `${heroPosition.x}%`, top: `${heroPosition.y}%` }}
                transition={{ type: 'spring', stiffness: 110, damping: 18, mass: 0.8 }}
              >
                <div className="relative flex flex-col items-center">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-neon/30 blur-2xl"
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-neon/70 bg-slate-950/95 shadow-[0_0_34px_rgba(124,247,212,0.36)]">
                    <span className="absolute top-2 h-3.5 w-7 rounded-full border border-slate-200/70 bg-slate-900/90" />
                    <span className="absolute top-5 h-5 w-10 rounded-b-full border border-slate-300/40 bg-gradient-to-b from-slate-800 to-slate-950" />
                    <span className="absolute left-1/2 top-[46%] h-1.5 w-1.5 -translate-x-[130%] rounded-full bg-neon shadow-[0_0_12px_rgba(124,247,212,0.9)]" />
                    <span className="absolute right-1/2 top-[46%] h-1.5 w-1.5 translate-x-[130%] rounded-full bg-neon shadow-[0_0_12px_rgba(124,247,212,0.9)]" />
                    <span className="absolute bottom-3 h-4 w-6 rounded-full border border-neon/50 bg-neon/10" />
                  </div>
                  <span className="mt-2 rounded-full border border-neon/20 bg-slate-950/85 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-neon">
                    Hero
                  </span>
                </div>
              </motion.div>

              <motion.div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 z-[7] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon/10 bg-[radial-gradient(circle,rgba(124,247,212,0.05),transparent_62%)]"
              />

              {items.map((item) => (
                <CheckpointNode
                  key={item.id}
                  checkpoint={item}
                  active={item.id === selected?.id}
                  onSelect={travelTo}
                  variant="fullscreen"
                />
              ))}

              <div className="absolute bottom-4 left-4 z-20 max-w-md rounded-3xl border border-white/10 bg-slate-950/75 px-4 py-3 backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Controls</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Click checkpoint to travel. Use Next / Previous to move along the main path. Classic CV is always available.
                </p>
              </div>
            </div>

            <div className="space-y-4 lg:hidden">
              <div className="panel-surface rounded-[2rem] p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-neon/70 bg-slate-950/95 shadow-[0_0_24px_rgba(124,247,212,0.3)]">
                    <span className="absolute top-2 h-3 w-6 rounded-full border border-slate-200/70 bg-slate-900/90" />
                    <span className="absolute top-5 h-4 w-8 rounded-b-full border border-slate-300/40 bg-gradient-to-b from-slate-800 to-slate-950" />
                    <span className="absolute left-1/2 top-[46%] h-1.5 w-1.5 -translate-x-[130%] rounded-full bg-neon" />
                    <span className="absolute right-1/2 top-[46%] h-1.5 w-1.5 translate-x-[130%] rounded-full bg-neon" />
                  </div>
                  <div>
                    <p className="mono text-xs uppercase tracking-[0.28em] text-neon">Hero marker</p>
                    <p className="mt-1 text-sm text-slate-200">{profile.name}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Tap a checkpoint below to travel through the journey on mobile.
                </p>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const isActive = item.id === selected?.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => travelTo(item.id)}
                      className={`w-full rounded-3xl border p-4 text-left transition ${
                        isActive
                          ? 'border-neon/40 bg-neon/10 text-white shadow-[0_0_24px_rgba(124,247,212,0.12)]'
                          : 'border-white/10 bg-slate-950/70 text-slate-200 hover:border-white/20 hover:bg-slate-950/85'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{item.subtitle}</p>
                          <h3 className="mt-1 text-base font-semibold">{item.title}</h3>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          {item.branchOf ? 'Branch' : 'Main'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{item.summary}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="panel-surface rounded-[2rem] p-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => navigateMainPath(-1)}
                    className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-200 transition hover:border-neon/30 hover:text-white disabled:opacity-40"
                    disabled={activeMainIndex <= 0}
                  >
                    Previous
                  </button>
                  <div className="text-center">
                    <p className="mono text-[10px] uppercase tracking-[0.28em] text-neon">Journey HUD</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Main path travel</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateMainPath(1)}
                    className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-200 transition hover:border-neon/30 hover:text-white disabled:opacity-40"
                    disabled={activeMainIndex >= mainPath.length - 1}
                  >
                    Next
                  </button>
                </div>
              </div>

              <CheckpointPanel checkpoint={selected ?? null} variant="hud" />

              <div className="panel-surface rounded-2xl px-4 py-3 text-xs leading-6 text-slate-400">
                <span className="block text-[10px] uppercase tracking-[0.28em] text-slate-500">Hint</span>
                <p className="mt-2">
                  Click a location to travel. The hero marker follows the selected checkpoint. Full WASD movement stays deferred.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
