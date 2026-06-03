import { useEffect, useRef } from 'react';
import type { Checkpoint } from '../../content/types';
import { mapCheckpointsToGameLocations } from '../../game/locationMapper';
import type { OdysseyNearestEventDetail } from '../../game/types';
import { ODYSSEY_EVENT_CLOSE, ODYSSEY_EVENT_NEAREST, ODYSSEY_EVENT_OPEN, ODYSSEY_EVENT_READY } from '../../game/types';

type Props = {
  checkpoints: Checkpoint[];
  onReady?: () => void;
  onNearestLocation: (detail: OdysseyNearestEventDetail) => void;
  onOpenCheckpoint: (checkpointId: string) => void;
  onClosePanel: () => void;
};

export function PhaserGame({ checkpoints, onReady, onNearestLocation, onOpenCheckpoint, onClosePanel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import('phaser').Game | null>(null);
  const callbacksRef = useRef({
    onReady,
    onNearestLocation,
    onOpenCheckpoint,
    onClosePanel,
  });

  useEffect(() => {
    callbacksRef.current = {
      onReady,
      onNearestLocation,
      onOpenCheckpoint,
      onClosePanel,
    };
  }, [onClosePanel, onNearestLocation, onOpenCheckpoint, onReady]);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    // Keep the Phaser lifecycle tied to the mount lifecycle only.
    // HUD updates re-render this React shell frequently, so callback identity
    // changes must not recreate the game instance.
    const handleReady = () => callbacksRef.current.onReady?.();
    const handleNearest = (event: Event) => {
      const detail = (event as CustomEvent<OdysseyNearestEventDetail>).detail;
      callbacksRef.current.onNearestLocation(
        detail ?? {
          location: null,
          prompt: null,
          interactable: false,
        },
      );
    };
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ checkpointId: string }>).detail;
      if (detail?.checkpointId) {
        callbacksRef.current.onOpenCheckpoint(detail.checkpointId);
      }
    };
    const handleClose = () => callbacksRef.current.onClosePanel();

    window.addEventListener(ODYSSEY_EVENT_READY, handleReady as EventListener);
    window.addEventListener(ODYSSEY_EVENT_NEAREST, handleNearest as EventListener);
    window.addEventListener(ODYSSEY_EVENT_OPEN, handleOpen as EventListener);
    window.addEventListener(ODYSSEY_EVENT_CLOSE, handleClose as EventListener);

    const boot = async () => {
      const [phaserModule, sceneModule] = await Promise.all([import('phaser'), import('../../game/BackendOdysseyScene')]);

      if (cancelled || !containerRef.current) {
        return;
      }

      const Phaser = phaserModule.default;
      const { BackendOdysseyScene } = sceneModule;
      const locations = mapCheckpointsToGameLocations(checkpoints);

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        backgroundColor: '#050811',
        pixelArt: true,
        roundPixels: true,
        scale: {
          mode: Phaser.Scale.RESIZE,
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false,
          },
        },
        scene: [new BackendOdysseyScene({ locations })],
      });

      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry || !gameRef.current) {
          return;
        }

        const width = Math.max(1, Math.floor(entry.contentRect.width));
        const height = Math.max(1, Math.floor(entry.contentRect.height));
        gameRef.current.scale.resize(width, height);
      });

      resizeObserver.observe(containerRef.current);
    };

    void boot();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      window.removeEventListener(ODYSSEY_EVENT_READY, handleReady as EventListener);
      window.removeEventListener(ODYSSEY_EVENT_NEAREST, handleNearest as EventListener);
      window.removeEventListener(ODYSSEY_EVENT_OPEN, handleOpen as EventListener);
      window.removeEventListener(ODYSSEY_EVENT_CLOSE, handleClose as EventListener);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [checkpoints]);

  return <div ref={containerRef} className="absolute inset-0" aria-label="Backend Odyssey game canvas" />;
}
