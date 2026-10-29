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
  { label: 'Home', href: '/' },
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
            <p className="mono text-xs uppercase tracking-[0.34em] text-neon">The quest</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{profile.name}</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-400">{profile.role}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              The quest is desktop-only. Here is the short version — or open the pages below.
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
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(235,205,143,0.18),transparent_28%),linear-gradient(180deg,#243b25_0%,#172719_100%)] text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(132,181,91,0.14),transparent_24%),radial-gradient(circle_at_82%_76%,rgba(183,137,73,0.12),transparent_22%)]" />

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
              <div className="pointer-events-auto max-w-xl rounded-2xl border border-amber-100/15 bg-[#25331f]/88 px-4 py-3 shadow-lg backdrop-blur-xl">
                <p className="mono text-[10px] uppercase tracking-[0.34em] text-amber-200">The quest</p>
                <p className="mt-1 text-sm font-medium text-white">{profile.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-300">{profile.role}</p>
              </div>
              <nav className="pointer-events-auto flex flex-wrap justify-end gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-amber-100/15 bg-[#25331f]/88 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-stone-100 backdrop-blur-xl transition hover:border-amber-200/35 hover:bg-[#3d4d2d]"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </header>

            <div className="pointer-events-none mt-auto px-4 pb-4 sm:px-6 lg:px-8">
              <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-amber-100/15 bg-[#25331f]/88 px-4 py-2 text-sm text-stone-200 shadow-lg backdrop-blur-xl">
                <span className={`h-2 w-2 rounded-full ${gameReady ? 'bg-lime-400' : 'bg-amber-400'}`} />
                {gameReady ? 'Click to walk. Each building opens as you arrive.' : 'Building the town...'}
                {nearestDetail.location ? (
                  <span className="text-stone-300">Nearest: {nearestDetail.location.displayName}</span>
                ) : null}
              </p>
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
            <div className="rounded-[1.75rem] border border-amber-100/15 bg-[#1f2c1c]/95 p-3 shadow-[0_24px_80px_rgba(20,28,16,0.45)] backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="mono text-[10px] uppercase tracking-[0.28em] text-amber-200">Inspected checkpoint</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">ESC closes this panel</p>
                </div>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="rounded-full border border-amber-100/15 bg-amber-50/5 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-200 transition hover:border-amber-200/35 hover:bg-amber-100/10"
                >
                  Close
                </button>
              </div>
              <CheckpointPanel checkpoint={selectedCheckpoint} variant="hud" />
            </div>
          </motion.aside>
        ) : null}
      </div>
    </section>
  );
}
