import { useEffect, useRef } from 'react';
import { useReplayStore } from '../store/useReplayStore';
import { CricketState, F1State, TennisState } from '../types';
import { replayAdapter } from '../adapters/replayAdapter';

export function BroadcastCanvas() {
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const currentTime = useReplayStore((s) => s.currentTime);
  const matches = useReplayStore((s) => s.matches);
  const isPlaying = useReplayStore((s) => s.isPlaying);

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const latestEvent = replayAdapter.getLatestEventForMatch(activeMatchId, currentTime);

  if (!activeMatch) return null;
  const sport = activeMatch.sport;

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#07090e]">
      {/* 1. Dynamic Motion Screensaver Canvas */}
      <MotionSimulationCanvas sport={sport} isPlaying={isPlaying} />

      {/* Subtle Broadcast Lighting & Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* 2. Single Official TV Broadcast Scorebug (No double scoreboards) */}
      <div className="relative w-full h-full pointer-events-none">
        {sport === 'f1' && <F1Scorebug state={latestEvent?.state as F1State} />}
        {sport === 'tennis' && <TennisScorebug state={latestEvent?.state as TennisState} />}
        {sport === 'cricket' && <CricketScorebug state={latestEvent?.state as CricketState} />}
      </div>
    </div>
  );
}

/* =========================================================================
   DYNAMIC BROADCAST MOTION CANVAS (High-Fidelity Tennis, F1, Cricket)
   ========================================================================= */
function MotionSimulationCanvas({ sport, isPlaying }: { sport: string; isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (sport === 'tennis') {
        drawTennisCourt(ctx, width, height, t);
      } else if (sport === 'f1') {
        drawF1Circuit(ctx, width, height, t);
      } else {
        drawCricketPitch(ctx, width, height, t);
      }

      if (isPlaying) {
        t += 0.02;
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [sport, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      className="w-full h-full object-cover"
    />
  );
}

/* ---------------- TENNIS 3D PERSPECTIVE COURT & RALLY ---------------- */
function drawTennisCourt(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Deep hardcourt blue background
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w * 0.7);
  bgGrad.addColorStop(0, '#0f2744');
  bgGrad.addColorStop(1, '#050c18');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Court perspective trapezoid
  const topY = h * 0.28;
  const botY = h * 0.88;
  const topW = w * 0.46;
  const botW = w * 0.78;
  const cx = w / 2;

  const tl = { x: cx - topW / 2, y: topY };
  const tr = { x: cx + topW / 2, y: topY };
  const bl = { x: cx - botW / 2, y: botY };
  const br = { x: cx + botW / 2, y: botY };

  // Court inner green turf
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.fillStyle = '#0f4435';
  ctx.fill();

  // Outer lines
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.stroke();

  // Net in the middle
  const netY = (topY + botY) / 2 + 10;
  const netLeftX = cx - (topW + (botW - topW) * 0.5) / 2;
  const netRightX = cx + (topW + (botW - topW) * 0.5) / 2;

  ctx.beginPath();
  ctx.moveTo(netLeftX, netY);
  ctx.lineTo(netRightX, netY);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Service line & center service line
  const midTopY = (topY + netY) / 2;
  const midBotY = (netY + botY) / 2;

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.moveTo(cx - topW * 0.38, midTopY);
  ctx.lineTo(cx + topW * 0.38, midTopY);
  ctx.moveTo(cx - botW * 0.38, midBotY);
  ctx.lineTo(cx + botW * 0.38, midBotY);
  ctx.moveTo(cx, midTopY);
  ctx.lineTo(cx, midBotY);
  ctx.stroke();

  // Dynamic Rally Animation: Ball arc + shadow
  const rallyCycle = (Math.sin(t * 2) + 1) / 2; // 0 to 1
  const sideCycle = Math.cos(t * 1.5) * 0.35; // cross-court angle

  const ballCourtX = cx + sideCycle * (topW * (1 - rallyCycle) + botW * rallyCycle);
  const ballGroundY = topY + (botY - topY) * rallyCycle;
  const bounceHeight = Math.abs(Math.sin(t * 4)) * 55; // vertical bounce arc
  const ballY = ballGroundY - bounceHeight;

  // Ball shadow
  ctx.beginPath();
  ctx.ellipse(ballCourtX, ballGroundY, 8 + rallyCycle * 4, 3 + rallyCycle * 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();

  // Tennis Ball (Optic Yellow with glow)
  ctx.save();
  ctx.shadowColor = '#d9f99d';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(ballCourtX, ballY, 6 + rallyCycle * 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ccff00';
  ctx.fill();
  ctx.restore();

  // Subtle ambient stadium banner text
  ctx.font = '900 13px -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('ROD LAVER ARENA · AUSTRALIAN OPEN 2024', cx, topY - 24);
}

/* ---------------- FORMULA 1 NIGHT TELEMETRY CIRCUIT ---------------- */
function drawF1Circuit(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Deep dark carbon background
  ctx.fillStyle = '#06070a';
  ctx.fillRect(0, 0, w, h);

  // Background telemetry grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 48;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Yas Marina Stylized Circuit Path
  const cx = w / 2;
  const cy = h / 2 - 20;
  const rx = w * 0.32;
  const ry = h * 0.28;

  // Track outer glowing border
  ctx.save();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.roundRect(cx - rx, cy - ry, rx * 2, ry * 2, [120, 160, 140, 100]);
  ctx.stroke();

  // Track asphalt center line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Leading Car (Red Bull / Max Verstappen #1 - Amber)
  const carPos1 = (t * 0.25) % 1;
  const pt1 = getRoundedRectPoint(cx - rx, cy - ry, rx * 2, ry * 2, 120, carPos1);

  // Chasing Car (Mercedes / Lewis Hamilton #44 - Cyan)
  const carPos2 = ((t * 0.25) - 0.05 + 1) % 1;
  const pt2 = getRoundedRectPoint(cx - rx, cy - ry, rx * 2, ry * 2, 120, carPos2);

  // Car 2 trail & dot
  ctx.save();
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(pt2.x, pt2.y, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = '#22d3ee';
  ctx.fill();
  ctx.restore();

  // Car 1 leader trail & dot
  ctx.save();
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.arc(pt1.x, pt1.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
  ctx.restore();

  // Watermark circuit info
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('YAS MARINA CIRCUIT · SECTOR 3 GPS SIMULATION', cx, cy);
}

/* ---------------- CRICKET FLOODLIT PITCH & BALL TRAJECTORY ---------------- */
function drawCricketPitch(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // Stadium oval turf gradient
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w * 0.6);
  bgGrad.addColorStop(0, '#0c351f');
  bgGrad.addColorStop(1, '#05130b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // 30-yard circle
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.36, h * 0.38, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pitch strip (Rectangle)
  const pitchW = 85;
  const pitchH = 260;
  ctx.fillStyle = '#785b3b';
  ctx.fillRect(cx - pitchW / 2, cy - pitchH / 2, pitchW, pitchH);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - pitchW / 2, cy - pitchH / 2, pitchW, pitchH);

  // Bowling creases
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - pitchW / 2, cy - pitchH / 2 + 25);
  ctx.lineTo(cx + pitchW / 2, cy - pitchH / 2 + 25);
  ctx.moveTo(cx - pitchW / 2, cy + pitchH / 2 - 25);
  ctx.lineTo(cx + pitchW / 2, cy + pitchH / 2 - 25);
  ctx.stroke();

  // Wickets
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(cx - 10, cy - pitchH / 2 + 20, 20, 3);
  ctx.fillRect(cx - 10, cy + pitchH / 2 - 23, 20, 3);

  // Dynamic Bowling & Shot Trajectory
  const cycle = (t * 0.8) % 2; // 0..2
  if (cycle < 1) {
    // Delivery to batsman
    const ballY = (cy - pitchH / 2 + 25) + (pitchH - 50) * cycle;
    ctx.save();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, ballY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.restore();
  } else {
    // Shot traveling towards boundary rope
    const shotT = cycle - 1;
    const shotX = cx + shotT * (w * 0.38);
    const shotY = (cy + pitchH / 2 - 25) - Math.sin(shotT * Math.PI) * 120 + shotT * 100;

    // Shot tracer line
    ctx.strokeStyle = 'rgba(255, 82, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy + pitchH / 2 - 25);
    ctx.lineTo(shotX, shotY);
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = '#ff5200';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(shotX, shotY, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff5200';
    ctx.fill();
    ctx.restore();
  }

  // Stadium banner
  ctx.font = '800 12px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('KENSINGTON OVAL · ICC MEN\'S T20 WORLD CUP FINAL', cx, cy - pitchH / 2 - 35);
}

// Math helper for rounded rectangle track trajectory
function getRoundedRectPoint(x: number, y: number, w: number, h: number, r: number, progress: number) {
  const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
  const dist = (progress * perimeter) % perimeter;

  const topDist = w - 2 * r;
  if (dist <= topDist) {
    return { x: x + r + dist, y };
  }
  const trDist = topDist + (Math.PI * r) / 2;
  if (dist <= trDist) {
    const angle = ((dist - topDist) / ((Math.PI * r) / 2)) * (Math.PI / 2) - Math.PI / 2;
    return { x: x + w - r + Math.cos(angle) * r, y: y + r + Math.sin(angle) * r };
  }
  const rightDist = trDist + (h - 2 * r);
  if (dist <= rightDist) {
    return { x: x + w, y: y + r + (dist - trDist) };
  }
  const brDist = rightDist + (Math.PI * r) / 2;
  if (dist <= brDist) {
    const angle = ((dist - rightDist) / ((Math.PI * r) / 2)) * (Math.PI / 2);
    return { x: x + w - r + Math.cos(angle) * r, y: y + h - r + Math.sin(angle) * r };
  }
  const botDist = brDist + (w - 2 * r);
  if (dist <= botDist) {
    return { x: x + w - r - (dist - brDist), y: y + h };
  }
  return { x: x + r, y: y + r };
}

/* =========================================================================
   SINGLE CLEAN OFFICIAL TV SCOREBUGS (No double score overlays)
   ========================================================================= */
function F1Scorebug({ state }: { state?: F1State }) {
  const isSafetyCar = state?.status === 'SAFETY_CAR';

  return (
    <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
      {/* AWS Leaderboard Timing Tower (Top-Left) */}
      <div className="mt-14 w-44 sm:w-52 bg-black/85 backdrop-blur-md rounded-xl border border-white/15 overflow-hidden shadow-2xl text-[11px] font-mono-numbers">
        <div className="bg-[#e10600] px-3 py-1 flex items-center justify-between text-white font-black tracking-wider uppercase text-[10px]">
          <span>YAS MARINA</span>
          <span>L {state?.lap || 53}/{state?.totalLaps || 58}</span>
        </div>

        {isSafetyCar && (
          <div className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 text-center animate-pulse tracking-wide">
            ⚠ SAFETY CAR DEPLOYED
          </div>
        )}

        <div className="divide-y divide-white/10 bg-black/70">
          {(state?.standings || [
            { pos: 1, code: 'HAM', gap: 'LEADER', tyre: 'HARD' },
            { pos: 2, code: 'VER', gap: '+1.244s', tyre: 'SOFT' },
            { pos: 3, code: 'SAI', gap: '+14.82s', tyre: 'HARD' },
          ]).slice(0, 3).map((d) => (
            <div key={d.code} className="px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <span className="text-zinc-500 w-3 text-right">{d.pos}</span>
                <span className={d.pos === 1 ? 'text-amber-400 font-black' : 'text-white'}>{d.code}</span>
              </div>
              <span className="text-zinc-300 font-semibold">{d.gap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Speed & Gear Telemetry HUD (Bottom-Right) */}
      <div className="self-end mb-14 flex items-center gap-3 bg-black/85 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-xl shadow-2xl font-mono-numbers">
        <div className="text-right">
          <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">SPEED</div>
          <div className="text-lg font-black text-white">314 <span className="text-[10px] text-zinc-400 font-normal">KM/H</span></div>
        </div>
        <div className="h-6 w-px bg-white/20"></div>
        <div className="text-center">
          <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">GEAR</div>
          <div className="text-lg font-black text-red-500">7</div>
        </div>
      </div>
    </div>
  );
}

function TennisScorebug({ state }: { state?: TennisState }) {
  const isBreakPoint = state?.isBreakPoint;

  return (
    <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end pointer-events-none">
      <div className="mb-14 self-start bg-black/85 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden font-mono-numbers text-xs">
        <div className="bg-[#002B49] px-3 py-1 flex items-center justify-between text-white text-[10px] font-black tracking-wider uppercase border-b border-white/10">
          <span>AUSTRALIAN OPEN 2024</span>
          <span className="text-amber-400">ROD LAVER ARENA · SET 5</span>
        </div>

        <div className="p-2.5 space-y-1.5 min-w-[240px]">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${state?.server === 1 ? 'bg-amber-400' : 'bg-transparent'}`}></span>
              <span className="text-xs tracking-wide">SINNER</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">6</span>
              <span className="text-zinc-400">4</span>
              <span className="text-white font-black bg-white/15 px-1.5 py-0.5 rounded">
                {state?.gameScore?.split('-')[0] || '40'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${state?.server === 2 ? 'bg-amber-400' : 'bg-transparent'}`}></span>
              <span className="text-xs tracking-wide">MEDVEDEV</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">3</span>
              <span className="text-zinc-400">6</span>
              <span className="text-white font-black bg-white/15 px-1.5 py-0.5 rounded">
                {state?.gameScore?.split('-')[1] || '30'}
              </span>
            </div>
          </div>
        </div>

        {isBreakPoint && (
          <div className="bg-lime-500 text-black font-black text-[10px] py-1 px-3 text-center tracking-wider uppercase animate-pulse">
            ★ BREAK POINT OPPORTUNITY
          </div>
        )}
      </div>
    </div>
  );
}

function CricketScorebug({ state }: { state?: CricketState }) {
  const runsNeeded = state?.target ? state.target - (state.score || 0) : 0;
  const totalBalls = Math.floor(state?.overs || 18.2) * 6 + Math.round(((state?.overs || 18.2) % 1) * 10);
  const ballsRemaining = Math.max(0, 120 - totalBalls);

  return (
    <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end pointer-events-none">
      <div className="mb-14 self-start bg-black/85 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl p-3 font-mono-numbers text-xs min-w-[280px]">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-black tracking-wider border-b border-white/10 pb-1 mb-1.5">
          <span className="text-broadcast-orange">ICC T20 WC 2024 FINAL</span>
          <span>CRR: {state?.currentRunRate?.toFixed(1) || '8.8'}</span>
        </div>

        <div className="flex items-baseline justify-between text-white">
          <div>
            <span className="text-sm font-black mr-2">{state?.battingTeam || 'SA'}</span>
            <span className="text-lg font-black text-broadcast-orange">
              {state?.score || 151}/{state?.wickets || 4}
            </span>
            <span className="text-zinc-400 text-xs ml-1.5">({state?.overs || 15.1} ov)</span>
          </div>

          {runsNeeded > 0 && (
            <div className="text-right text-[11px] font-bold text-amber-300">
              Need {runsNeeded} off {ballsRemaining}b
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
