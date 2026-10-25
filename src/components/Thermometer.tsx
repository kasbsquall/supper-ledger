import { useEffect, useState } from "react";
import type { Lang } from "../ledger/types";
import { dict, formatMoney } from "../i18n";

// The signature move: the goal drawn as a fundraising thermometer whose mercury rises with each payment.
// Implements prd.md > The board (main figure). Vertical on wide screens, horizontal on phones.

interface Props {
  progress: number;
  goal: number;
  lang: Lang;
  /** Changes whenever money lands, to pulse the bulb. */
  pulseKey: number;
}

const V = { top: 48, bottom: 378 };
const H = { left: 40, right: 332 };
const MAJOR_STEPS = 6;

export function Thermometer({ progress, goal, lang, pulseKey }: Props) {
  const t = dict(lang);
  // Start empty and rise on first paint, so the level registers.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(progress)));
    return () => cancelAnimationFrame(id);
  }, [progress]);

  const f = Math.max(0.02, Math.min(1, shown));
  const pct = Math.round(progress * 100);
  const ticks = Array.from({ length: MAJOR_STEPS * 2 + 1 }, (_, i) => ({ value: (goal / (MAJOR_STEPS * 2)) * i, major: i % 2 === 0 }));
  const label = `${t.thermometer}: ${pct}%`;
  const bulbClass = `bulb${pulseKey > 0 ? " pulse" : ""}`;
  const isFull = progress >= 1;
  // How far bubbles and the glint travel: from the bulb up to the current level.
  const riseV = { ["--lvl" as string]: `${-(f * (V.bottom - V.top)) + 10}px` };
  const riseH = { ["--lvl" as string]: `${f * (H.right - H.left) - 10}px` };

  return (
    <>
      <svg className="thermo-v" viewBox="0 0 200 470" role="img" aria-label={label}>
        <g>
          {ticks.map(({ value, major }) => {
            const y = V.bottom - (goal > 0 ? value / goal : 0) * (V.bottom - V.top);
            return (
              <g key={value}>
                <line className={`tick${major ? "" : " min"}`} x1={major ? 58 : 64} x2={72} y1={y} y2={y} />
                {major && (
                  <text className="tlabel" x={52} y={y + 4} textAnchor="end">
                    {formatMoney(Math.round(value / 100) * 100, lang)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        <circle className="halo" cx="96" cy="414" r="40" aria-hidden="true" />
        <rect className="tube" x="74" y="18" width="44" height="372" rx="22" />
        <rect className="glass" x="80" y="24" width="32" height="360" rx="16" />
        <rect className="merc" x="84" y="48" width="24" height="330" rx="12" style={{ transform: `scaleY(${f})` }} />
        <g className="fx" style={riseV} aria-hidden="true">
          <rect className="glint" x="88" y="372" width="3" height="24" rx="1.5" />
          <circle className="bubble" cx="91" cy="384" r="2.6" />
          <circle className="bubble b2" cx="101" cy="384" r="2" />
          <circle className="bubble b3" cx="96" cy="384" r="3.2" />
        </g>
        <circle key={`v${pulseKey}`} className={bulbClass} cx="96" cy="414" r="40" />
        <rect x="84" y="360" width="24" height="30" fill="var(--tomate)" />
        <path className="shine" d="M74 400 a24 24 0 0 1 12 -16" />
        <g transform="translate(0,48)">
          <line x1="122" x2="138" y1="0" y2="0" className="tick" />
          <text className="goal-t" x="142" y="4">{t.goal}</text>
        </g>
        {isFull && <Sparks points={[[70, 26], [124, 14], [132, 50]]} />}
        <g className="now-g" style={{ transform: `translateY(${-(f * (V.bottom - V.top))}px)` }}>
          <line className="now-line" x1="112" x2="140" y1="378" y2="378" />
          <text className="now-t" x="144" y="372">{t.now}</text>
          <text className="now-v" x="144" y="390">{pct}%</text>
        </g>
      </svg>

      <svg className="thermo-h" viewBox="0 0 360 92" role="img" aria-label={label}>
        <g>
          {ticks.map(({ value, major }, i) => {
            const x = H.left + (goal > 0 ? value / goal : 0) * (H.right - H.left);
            const labeled = i % 4 === 0;
            return (
              <g key={value}>
                <line className={`tick${major ? "" : " min"}`} x1={x} x2={x} y1={54} y2={labeled ? 66 : major ? 62 : 59} />
                {labeled && (
                  <text className="tlabel" x={x} y={80} textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"} style={{ fontSize: 11 }}>
                    {formatMoney(Math.round(value / 100) * 100, lang)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
        <circle className="halo" cx="26" cy="35" r="23" aria-hidden="true" />
        <rect className="tube" x="34" y="20" width="318" height="30" rx="15" />
        <rect className="glass" x="39" y="25" width="308" height="20" rx="10" />
        <rect className="merc" x="40" y="28" width="292" height="14" rx="7" style={{ transform: `scaleX(${f})` }} />
        <g className="fx" style={riseH} aria-hidden="true">
          <rect className="glint" x="42" y="30" width="22" height="2.5" rx="1.25" />
          <circle className="bubble" cx="44" cy="33" r="1.8" />
          <circle className="bubble b2" cx="44" cy="38" r="1.3" />
        </g>
        <circle key={`h${pulseKey}`} className={bulbClass} cx="26" cy="35" r="23" />
        <rect x="30" y="28" width="22" height="14" fill="var(--tomate)" />
        <path className="shine" d="M14 40 a13 13 0 0 1 6 -14" />
        {isFull && <Sparks points={[[340, 10], [356, 30]]} />}
      </svg>
    </>
  );
}

/** Four-point sparks that twinkle around the top once the goal is reached. */
function Sparks({ points }: { points: Array<[number, number]> }) {
  return (
    <g aria-hidden="true">
      {points.map(([x, y], i) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path className="spark" style={{ animationDelay: `${i * 420}ms` }} d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z" />
        </g>
      ))}
    </g>
  );
}
