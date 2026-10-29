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

const hudButtonClass =
  'rounded-full border border-amber-100/15 bg-[#25331f]/88 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-100 backdrop-blur-xl transition hover:border-amber-200/35 hover:bg-[#3d4d2d] sm:px-4 sm:text-[11px] sm:tracking-[0.22em]';

export function GameShell() {
  // The list is the no-game fallback; it stays one tap away from the HUD.
  const [listView, setListView] = useState(false);
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

  if (listView) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(105,167,255,0.12),transparent_30%),linear-gradient(180deg,#050811_0%,#070b14_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
        <div className="absolute inset-0 map-noise opacity-20" />
        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col justify-between gap-6 rounded-[2rem] border border-white/10 bg-slate-950/72 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
          <div>
            <p className="mono text-xs uppercase tracking-[0.34em] text-neon">The quest</p>
            <h1 className="pixel mt-3 text-2xl uppercase text-neon">{profile.brand}</h1>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-400">{profile.role}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              The same town as a list — tap a place to look inside.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-neon/15 bg-neon/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-neon">Quest path</p>
              <div className="mt-4 space-y-3">
                {mainPath.map((checkpoint) => (
                  <details key={checkpoint.id} className="group rounded-2xl border border-white/10 bg-slate-950/65 open:border-neon/30">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                      <span>
                        <span className="mono block text-[10px] uppercase tracking-[0.28em] text-slate-500">
                          {String(checkpoint.order).padStart(2, '0')}
                        </span>
                        <span className="mt-1 block text-sm font-semibold text-white">{checkpoint.title}</span>
                        <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-slate-400">{checkpoint.subtitle}</span>
                      </span>
                      <span className="pixel text-xs text-accent transition-transform group-open:rotate-90" aria-hidden="true">▶</span>
                    </summary>
                    <div className="space-y-3 px-4 pb-4 text-sm leading-6 text-slate-300">
                      <p className="text-slate-200">{checkpoint.summary}</p>
                      <ul className="space-y-2">
                        {checkpoint.details.map((detail) => (
                          <li key={detail} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neon" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      {checkpoint.image ? (
                        <img src={checkpoint.image.src} alt={checkpoint.image.alt} loading="lazy" className="h-auto w-full rounded-xl border border-white/10" />
                      ) : null}
                      {checkpoint.links?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {checkpoint.links.map((link) => (
                            <a
                              key={link.label}
                              href={link.href}
                              target={link.external ? '_blank' : undefined}
                              rel={link.external ? 'noreferrer' : undefined}
                              className="rounded-full border border-neon/30 bg-neon/10 px-3 py-1.5 text-xs text-neon"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => setListView(false)}
                className="rounded-full border border-neon/30 bg-neon/10 px-4 py-3 text-center text-sm font-medium text-neon"
              >
                Back to town
              </button>
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
    <section className="relative h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(235,205,143,0.18),transparent_28%),linear-gradient(180deg,#243b25_0%,#172719_100%)] text-stone-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(132,181,91,0.14),transparent_24%),radial-gradient(circle_at_82%_76%,rgba(183,137,73,0.12),transparent_22%)]" />

      <div className="relative h-full">
        <PhaserGame
          checkpoints={checkpoints}
          onReady={handleGameReady}
          onNearestLocation={handleNearestLocation}
          onOpenCheckpoint={openCheckpoint}
          onClosePanel={handleClosePanel}
        />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
            <header className="pointer-events-none flex items-start justify-between gap-2 px-3 pt-3 sm:gap-4 sm:px-6 sm:pt-4 lg:px-8">
              <a href="/" className="pointer-events-auto max-w-xl rounded-2xl border border-amber-100/15 bg-[#25331f]/88 px-3 py-2 shadow-lg backdrop-blur-xl sm:px-4 sm:py-3">
                <p className="mono hidden text-[10px] uppercase tracking-[0.34em] text-amber-200 sm:block">The quest</p>
                <p className="pixel text-[10px] uppercase text-white sm:mt-1 sm:text-sm">{profile.brand}</p>
                <p className="mt-1 hidden text-xs uppercase tracking-[0.18em] text-stone-300 sm:block">{profile.role}</p>
              </a>
              <nav className="pointer-events-auto flex flex-wrap justify-end gap-2">
                {navLinks.map((link) => (
                  <a key={link.href} href={link.href} className={`${hudButtonClass} ${link.href === '/contact' ? '' : 'hidden sm:inline-block'}`}>
                    {link.label}
                  </a>
                ))}
                <button type="button" onClick={() => setListView(true)} className={hudButtonClass}>
                  List
                </button>
              </nav>
            </header>

            <div className="pointer-events-none mt-auto px-3 pb-3 sm:px-6 sm:pb-4 lg:px-8">
              <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-amber-100/15 bg-[#25331f]/88 px-4 py-2 text-xs text-stone-200 shadow-lg backdrop-blur-xl sm:text-sm">
                <span className={`h-2 w-2 rounded-full ${gameReady ? 'bg-lime-400' : 'bg-amber-400'}`} />
                {gameReady ? 'Click or tap to walk. Each building opens as you arrive.' : 'Building the town...'}
                {nearestDetail.location ? (
                  <span className="text-stone-300">Nearest: {nearestDetail.location.displayName}</span>
                ) : null}
              </p>
            </div>
        </div>

        {selectedCheckpoint ? (
          // Bottom sheet on phones, side panel from md up.
          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto absolute inset-x-2 bottom-2 z-20 md:inset-x-auto md:bottom-auto md:right-4 md:top-24 md:w-[28rem] lg:right-8"
          >
            <div className="rounded-[1.75rem] border border-amber-100/15 bg-[#1f2c1c]/95 p-3 shadow-[0_24px_80px_rgba(20,28,16,0.45)] backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="mono text-[10px] uppercase tracking-[0.28em] text-amber-200">Inspected checkpoint</p>
                  <p className="mt-1 hidden text-xs uppercase tracking-[0.18em] text-stone-500 md:block">ESC closes this panel</p>
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
