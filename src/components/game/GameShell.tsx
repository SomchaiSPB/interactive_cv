import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { checkpoints } from '../../content/checkpoints';
import { profile } from '../../content/profile';
import type { OdysseyNearestEventDetail } from '../../game/types';
import { PhaserGame } from './PhaserGame';
import { CheckpointPanel } from '../CheckpointPanel';

type NavLink = {
  label: string;
  href: string;
};

const navLinks: NavLink[] = [
  { label: 'Classic CV', href: '/cv' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
];

function useDesktopBreakpoint() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);

    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

export function GameShell() {
  const isDesktop = useDesktopBreakpoint();
  const [started, setStarted] = useState(false);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string | null>(null);
  const [nearestDetail, setNearestDetail] = useState<OdysseyNearestEventDetail>({
    location: null,
    prompt: null,
    interactable: false,
  });
  const [gameReady, setGameReady] = useState(false);

  const mainPath = useMemo(
    () =>
      [...checkpoints]
        .filter((checkpoint) => !checkpoint.branchOf)
        .sort((left, right) => (left.pathOrder ?? left.order) - (right.pathOrder ?? right.order)),
    [],
  );

  const selectedCheckpoint = useMemo(
    () => checkpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId) ?? null,
    [selectedCheckpointId],
  );

  useEffect(() => {
    if (!started) {
      setSelectedCheckpointId(null);
    }
  }, [started]);

  const openCheckpoint = useCallback((checkpointId: string) => {
    const checkpoint = checkpoints.find((item) => item.id === checkpointId) ?? null;
    setSelectedCheckpointId(checkpoint?.id ?? null);
  }, []);

  const handleGameReady = useCallback(() => {
    setGameReady(true);
  }, []);

  const handleNearestLocation = useCallback((detail: OdysseyNearestEventDetail) => {
    setNearestDetail(detail);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedCheckpointId(null);
  }, []);

  if (!isDesktop) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(105,167,255,0.12),transparent_30%),linear-gradient(180deg,#050811_0%,#070b14_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="absolute inset-0 map-noise opacity-20" />
        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col justify-between gap-6 rounded-[2rem] border border-white/10 bg-slate-950/72 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
          <div>
            <p className="mono text-xs uppercase tracking-[0.34em] text-neon">Backend Odyssey</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{profile.name}</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-400">{profile.role}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Game mode is desktop-first. Open the classic pages below for a readable CV, projects, and contact routes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-neon/15 bg-neon/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-neon">Quest path</p>
              <div className="mt-4 space-y-3">
                {mainPath.map((checkpoint) => (
                  <div key={checkpoint.id} className="rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3">
                    <p className="mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                      {String(checkpoint.order).padStart(2, '0')}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{checkpoint.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{checkpoint.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:border-neon/30 hover:bg-neon/10 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(105,167,255,0.14),transparent_26%),radial-gradient(circle_at_20%_20%,rgba(124,247,212,0.08),transparent_22%),linear-gradient(180deg,#050811_0%,#070b14_100%)] text-slate-100">
      <div className="absolute inset-0 map-noise opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(124,247,212,0.04)_1px,transparent_1px),linear-gradient(rgba(124,247,212,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-neon/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-amber-400/[0.08] blur-3xl" />

      {!started ? (
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="panel-surface relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,247,212,0.12),transparent_28%),radial-gradient(circle_at_70%_30%,rgba(105,167,255,0.11),transparent_18%)]" />
              <div className="relative max-w-2xl">
                <p className="mono text-xs uppercase tracking-[0.38em] text-neon">Backend Odyssey</p>
                <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  A portfolio you explore, not scroll.
                </h1>
                <p className="mt-4 text-sm uppercase tracking-[0.24em] text-slate-400">{profile.name}</p>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                  Top-down RPG quest portfolio for backend systems, data pipelines, complex integrations, financial reconciliation, and production debugging.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStarted(true)}
                    className="rounded-full border border-neon/40 bg-neon/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-neon transition hover:bg-neon/20"
                  >
                    Begin Quest
                  </button>
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel-surface flex flex-col justify-between rounded-[2rem] px-6 py-6 sm:px-7 sm:py-7">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Controls</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <li>Click to move</li>
                  <li>E to inspect</li>
                  <li>ESC to close panel</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-neon">Classic CV available</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Recruiters and clients can open the readable CV route at any time. The game is the first view, not the only path.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen">
          <PhaserGame
            checkpoints={checkpoints}
            onReady={handleGameReady}
            onNearestLocation={handleNearestLocation}
            onOpenCheckpoint={openCheckpoint}
            onClosePanel={handleClosePanel}
          />

          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
            <header className="pointer-events-none flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 lg:px-8">
              <div className="pointer-events-auto max-w-xl rounded-2xl border border-white/10 bg-slate-950/74 px-4 py-3 backdrop-blur-xl">
                <p className="mono text-[10px] uppercase tracking-[0.34em] text-neon">Backend Odyssey</p>
                <p className="mt-1 text-sm font-medium text-white">{profile.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{profile.role}</p>
              </div>
              <nav className="pointer-events-auto flex flex-wrap justify-end gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-white/10 bg-slate-950/74 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-200 backdrop-blur-xl transition hover:border-neon/30 hover:bg-neon/10"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </header>

            <div className="mt-auto grid gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
              <div className="pointer-events-auto space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/74 px-4 py-3 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Controls</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Click to move. {nearestDetail.prompt ?? 'Walk up to a building or NPC to inspect it.'}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/74 px-4 py-3 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Quest state</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${gameReady ? 'bg-neon shadow-[0_0_16px_rgba(124,247,212,0.8)]' : 'bg-amber-400'}`} />
                    <p className="text-sm text-slate-200">{gameReady ? 'Quest map ready' : 'Building the town...'}</p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-auto space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/74 px-4 py-3 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Nearest location</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {nearestDetail.location ? nearestDetail.location.displayName : 'Town Square'}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {nearestDetail.location ? nearestDetail.location.subtitle : 'Explore the town to find checkpoints'}
                  </p>
                </div>

                <div className="pointer-events-auto rounded-3xl border border-white/10 bg-slate-950/74 p-3 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Hint</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Press E or click a location to inspect its checkpoint panel.</p>
                </div>
              </div>
            </div>
          </div>

          {selectedCheckpoint ? (
            <motion.aside
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto absolute right-4 top-24 z-20 w-[min(92vw,28rem)] max-w-full lg:right-8 lg:top-24"
            >
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/92 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <div>
                    <p className="mono text-[10px] uppercase tracking-[0.28em] text-neon">Inspected checkpoint</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">ESC closes this panel</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCheckpointId(null)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-neon/30 hover:bg-neon/10"
                  >
                    Close
                  </button>
                </div>
                <CheckpointPanel checkpoint={selectedCheckpoint} variant="hud" />
              </div>
            </motion.aside>
          ) : null}
        </div>
      )}
    </section>
  );
}
