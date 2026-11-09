"use client";

import { useReducedMotion } from "framer-motion";
import type { Region, Sex } from "@/lib/engine/muscles";
import { cn } from "@/lib/utils";

// Front and back body diagrams drawn in code. Each muscle is a shape tagged with its region;
// the left half is drawn once and mirrored. Man and woman differ by build (shoulders, waist, hips, hair).

type P = [number, number];
type Shape = { r: Region; d: string };

const f2 = (n: number) => n.toFixed(2);

function taper(a: P, b: P, ra: number, rb: number) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  return `M${f2(a[0] + nx * ra)} ${f2(a[1] + ny * ra)}L${f2(b[0] + nx * rb)} ${f2(b[1] + ny * rb)}A${rb} ${rb} 0 0 0 ${f2(b[0] - nx * rb)} ${f2(b[1] - ny * rb)}L${f2(a[0] - nx * ra)} ${f2(a[1] - ny * ra)}A${ra} ${ra} 0 0 0 ${f2(a[0] + nx * ra)} ${f2(a[1] + ny * ra)}Z`;
}

function ellipse(cx: number, cy: number, rx: number, ry: number, rot = 0) {
  // as a path so it can share the same <path> rendering
  const c = Math.cos((rot * Math.PI) / 180);
  const s = Math.sin((rot * Math.PI) / 180);
  const x1 = cx - rx * c;
  const y1 = cy - rx * s;
  const x2 = cx + rx * c;
  const y2 = cy + rx * s;
  return `M${f2(x1)} ${f2(y1)}A${rx} ${ry} ${rot} 1 0 ${f2(x2)} ${f2(y2)}A${rx} ${ry} ${rot} 1 0 ${f2(x1)} ${f2(y1)}Z`;
}

type Build = { S: number; W: number; H: number; leg: number; arm: number; thigh: number };
const BUILD: Record<Sex, Build> = {
  male: { S: 19, W: 12.6, H: 15, leg: 8.4, arm: 1, thigh: 1 },
  female: { S: 15.4, W: 10, H: 17.6, leg: 9.4, arm: 0.84, thigh: 1.1 },
};

/** Arm joints (left side) for a build. */
function armPts(b: Build) {
  const sh: P = [50 - b.S - 1, 38];
  const el: P = [50 - b.S - 4.5, 66];
  const wr: P = [50 - b.S - 7, 92];
  return { sh, el, wr };
}
function legPts(b: Build) {
  const hp: P = [50 - b.leg, 102];
  const kn: P = [50 - b.leg + 0.6, 146];
  const an: P = [50 - b.leg + 1.4, 190];
  return { hp, kn, an };
}

function silhouette(b: Build, sex: Sex): string[] {
  const { sh, el, wr } = armPts(b);
  const { hp, kn, an } = legPts(b);
  const a = b.arm;
  const t = b.thigh;
  // torso (full, both sides)
  const L = (x: number) => 50 - x;
  const R = (x: number) => 50 + x;
  const torso = [
    `M${L(4.4)} 27`,
    `Q${L(b.S - 4)} 30 ${L(b.S)} 33`,
    `Q${L(b.S + 4.5)} 36 ${L(b.S + 3)} 44`,
    `L${L(b.S - 2.5)} 50`,
    `Q${L(b.W + 1.5)} 64 ${L(b.W)} 80`,
    `Q${L(b.W + 0.5)} 88 ${L(b.H)} 98`,
    `L${L(b.H - 1)} 108`,
    `L50 112`,
    `L${R(b.H - 1)} 108`,
    `L${R(b.H)} 98`,
    `Q${R(b.W + 0.5)} 88 ${R(b.W)} 80`,
    `Q${R(b.W + 1.5)} 64 ${R(b.S - 2.5)} 50`,
    `L${R(b.S + 3)} 44`,
    `Q${R(b.S + 4.5)} 36 ${R(b.S)} 33`,
    `Q${R(b.S - 4)} 30 ${R(4.4)} 27`,
    "Z",
  ].join("");
  const left = [
    taper(sh, el, 5 * a, 3.6 * a),
    taper(el, wr, 3.8 * a, 2.4 * a),
    ellipse(wr[0] - 0.6, wr[1] + 5.5, 2.6 * a, 4.4),
    taper(hp, kn, 8.4 * t, 4.6),
    taper(kn, an, 4.6, 2.6),
    ellipse(an[0] - 0.4, an[1] + 4.5, 2.8, 4.2),
  ];
  const head = sex === "female" ? ellipse(50, 14.5, 7, 9.2) : ellipse(50, 14.5, 7.4, 9.6);
  const neck = `M${L(3.8)} 20L${L(4.4)} 31L${R(4.4)} 31L${R(3.8)} 20Z`;
  return [torso, neck, head, ...left];
}

function frontShapes(b: Build, sex: Sex): Shape[] {
  const { sh, el, wr } = armPts(b);
  const { hp, kn } = legPts(b);
  const a = b.arm;
  const S = b.S;
  const fem = sex === "female";
  return [
    { r: "traps", d: `M45.6 28.5Q${50 - S + 6} 30 ${50 - S + 1.5} 33L46.5 33.5Z` },
    { r: "frontDelts", d: ellipse(sh[0] + 1.6, 39.5, 3.4 * a, 6, 15) },
    { r: "sideDelts", d: ellipse(sh[0] - 2.2, 40, 2.2 * a, 5.6, 18) },
    {
      r: "chest",
      d: fem
        ? `M49.2 36.5Q${50 - S + 4} 33.6 ${50 - S + 2.6} 40Q${50 - S + 1.6} 47.5 ${50 - S + 6.4} 50.2Q47 51.4 49.2 47.4Z`
        : `M49.3 34.4L${50 - S + 4} 34.6Q${50 - S + 0.8} 41 ${50 - S + 3.8} 47.4Q43 51.8 49.3 50.6Z`,
    },
    { r: "biceps", d: taper([sh[0] + 0.4, 46], [el[0] + 0.8, 62.5], 3.3 * a, 2.4 * a) },
    { r: "forearms", d: taper([el[0], 69], [wr[0] + 0.4, 88], 3.2 * a, 1.8 * a) },
    // abs: 3 pairs + lower
    { r: "abs", d: `M44.6 53.5h4.7v6.6h-4.7z` },
    { r: "abs", d: `M44.4 61.4h4.9v6.8h-4.9z` },
    { r: "abs", d: `M44.5 69.5h4.8v7h-4.8z` },
    { r: "abs", d: `M45 77.8h4.3v13.5Q47 89 45.4 84Z` },
    { r: "obliques", d: `M43.4 53.6L${50 - S + 3.5} 51Q${50 - b.W - 0.6} 64 ${50 - b.W + 0.6} 79L44.4 86.5Z` },
    { r: "quads", d: taper([hp[0] - 2.6, 107], [kn[0] - 1.6, 139], 4.4 * b.thigh, 2.8) },
    { r: "quads", d: taper([hp[0] + 2.4, 106], [kn[0] + 1.6, 140], 4 * b.thigh, 2.6) },
    { r: "adductors", d: taper([46.4, 108], [hp[0] + 4.8, 128], 2.6, 1.4) },
    { r: "calves", d: taper([kn[0] - 2.8, 153], [kn[0] - 1.8, 174], 2.7, 1.4) },
    { r: "calves", d: taper([kn[0] + 2.6, 153], [kn[0] + 1.6, 171], 2.3, 1.2) },
  ];
}

function backShapes(b: Build, sex: Sex): Shape[] {
  const { sh, el, wr } = armPts(b);
  const { hp, kn } = legPts(b);
  const a = b.arm;
  const S = b.S;
  const g = sex === "female" ? 1.1 : 1;
  return [
    { r: "traps", d: `M50 22.5L45.2 28.5Q${50 - S + 5} 30.5 ${50 - S + 2} 33.4Q43 38 46 47L50 58Z` },
    { r: "sideDelts", d: ellipse(sh[0] - 2.2, 40, 2.2 * a, 5.6, 18) },
    { r: "rearDelts", d: ellipse(sh[0] + 1.6, 39.5, 3.4 * a, 6, 15) },
    { r: "upperBack", d: `M47.6 41.5L${50 - S + 5} 37.4Q${50 - S + 8.6} 42.5 ${50 - S + 7} 47.6L48 52.5Z` },
    { r: "lats", d: `M${50 - S + 3} 46Q${50 - S + 9} 49 47 53L48.4 66Q46.5 72 ${50 - b.W + 1.2} 80Q${50 - b.W - 1} 62 ${50 - S + 3} 46Z` },
    { r: "triceps", d: taper([sh[0] + 0.2, 45.5], [el[0] + 0.8, 63], 3.6 * a, 2.4 * a) },
    { r: "forearms", d: taper([el[0], 69], [wr[0] + 0.4, 88], 3.2 * a, 1.8 * a) },
    { r: "lowerBack", d: taper([47.4, 64], [47.2, 88], 2.2, 2.6) },
    { r: "glutes", d: ellipse(50 - b.leg + 0.4, 101, 7.4 * g, 8 * g, 8) },
    { r: "hamstrings", d: taper([hp[0] - 2, 113], [kn[0] - 1, 141], 3.8 * b.thigh, 2.4) },
    { r: "hamstrings", d: taper([hp[0] + 2.6, 113], [kn[0] + 1.4, 141], 3.5 * b.thigh, 2.2) },
    { r: "calves", d: taper([kn[0] - 2.4, 151], [kn[0] - 1.4, 170], 3.2, 1.6) },
    { r: "calves", d: taper([kn[0] + 2.6, 151], [kn[0] + 1.6, 167], 2.9, 1.4) },
  ];
}

function hair(sex: Sex, side: "front" | "back") {
  if (sex === "male") {
    return side === "front"
      ? "M42.8 12.6Q43 4.6 50 4.6Q57 4.6 57.2 12.6Q55 8.4 50 8.6Q45 8.4 42.8 12.6Z"
      : "M42.6 14Q42.4 4.6 50 4.6Q57.6 4.6 57.4 14Q56 20 50 20.4Q44 20 42.6 14Z";
  }
  return side === "front"
    ? "M42.6 16Q41.6 4.8 50 4.8Q58.4 4.8 57.4 16Q58.6 24 57.8 28Q56.4 22 56.4 14Q55 9.6 50 9.6Q45 9.6 43.6 14Q43.6 22 42.2 28Q41.4 24 42.6 16Z"
    : "M42.4 15Q41.6 4.6 50 4.6Q58.4 4.6 57.6 15Q58.8 24 57.4 29.5Q50 32 42.6 29.5Q41.2 24 42.4 15Z";
}

const MIRROR = "matrix(-1 0 0 1 100 0)";

export function BodyDiagram({
  side,
  sex,
  primary,
  secondary,
  focus,
  onPick,
  className,
}: {
  side: "front" | "back";
  sex: Sex;
  primary: Region[];
  secondary: Region[];
  focus?: Region | null;
  onPick?: (r: Region) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const b = BUILD[sex];
  const sil = silhouette(b, sex);
  const shapes = side === "front" ? frontShapes(b, sex) : backShapes(b, sex);
  const fill = (r: Region) => (focus === r || primary.includes(r) ? "var(--muscle)" : secondary.includes(r) ? "rgb(0 255 102 / 0.38)" : "#3a3e34");
  const cls = (r: Region) =>
    cn(
      "transition-[fill,opacity] duration-200",
      primary.includes(r) && !reduce && "mm-pulse",
      onPick && "cursor-pointer",
      focus && focus !== r && "opacity-40",
    );
  const half = (mirror: boolean) => (
    <g transform={mirror ? MIRROR : undefined}>
      {shapes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={fill(s.r)}
          stroke={focus === s.r ? "#f4f5f0" : "#16180f"}
          strokeWidth={focus === s.r ? 1 : 0.8}
          strokeLinejoin="round"
          className={cls(s.r)}
          filter={primary.includes(s.r) ? "url(#mm-glow)" : undefined}
          onClick={onPick ? () => onPick(s.r) : undefined}
          data-region={s.r}
        />
      ))}
    </g>
  );
  return (
    <svg viewBox="15 0 70 202" className={className} role="img" aria-label={`${sex === "female" ? "Woman" : "Man"}, ${side} view`}>
      <defs>
        <filter id="mm-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="50" cy="197" rx="22" ry="2.4" fill="rgb(255 255 255 / 0.05)" />
      <g>
        {sil.slice(0, 3).map((d, i) => (
          <path key={i} d={d} fill="#2a2d25" />
        ))}
        {[false, true].map((m) => (
          <g key={String(m)} transform={m ? MIRROR : undefined}>
            {sil.slice(3).map((d, i) => (
              <path key={i} d={d} fill="#2a2d25" />
            ))}
          </g>
        ))}
      </g>
      <path d={hair(sex, side)} fill="#16180f" stroke="#3a3e34" strokeWidth="0.5" />
      {side === "back" && <line x1="50" y1="58" x2="50" y2="92" stroke="#16180f" strokeWidth="0.8" />}
      {half(false)}
      {half(true)}
    </svg>
  );
}
