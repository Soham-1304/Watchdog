import { useEffect, useRef } from 'react';
import { useReplayStore } from '../store/useReplayStore';

/**
 * High-precision clock engine driving the Cutaway replay loop.
 * Uses requestAnimationFrame with delta-time calculation to prevent drift across speeds (1x, 5x, 10x, 20x).
 */
export function useClockEngine(): void {
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const isLoaded = useReplayStore((s) => s.isLoaded);
  const tick = useReplayStore((s) => s.tick);

  const lastTimeRef = useRef<number | null>(null);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || !isLoaded) {
      lastTimeRef.current = null;
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      return;
    }

    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      } else {
        const deltaMs = timestamp - lastTimeRef.current;
        // Clamp maximum delta to avoid jumps on tab switch
        const clampedDeltaSec = Math.min(deltaMs / 1000, 0.1);
        tick(clampedDeltaSec);
        lastTimeRef.current = timestamp;
      }

      frameIdRef.current = requestAnimationFrame(loop);
    };

    frameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [isPlaying, isLoaded, tick]);
}
