"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { Check, ImageUp, Minus, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MainButton } from "@/components/ui/button";
import { FOODS, amountLabel, fmtQty } from "@/lib/nutrition/foods";
import { mealForHour, type LogMeal } from "@/lib/nutrition/plan";
import type { FoodLog } from "@/lib/nutrition/server";
import { cn } from "@/lib/utils";
import { MACRO_COLORS, fileToJpeg, toJpeg } from "./shared";

type Item = { key: string; name: string; portion: string; kcal: number; protein: number; carbs: number; fat: number; mult: number };
type Phase = "camera" | "reading" | "result" | "error";

const EASE = [0.22, 0.8, 0.24, 1] as const;
const STEPS = ["Finding the foods", "Sizing the portions", "Counting the macros"];
const MEALS: { k: LogMeal; n: string }[] = [
  { k: "breakfast", n: "Breakfast" },
  { k: "lunch", n: "Lunch" },
  { k: "dinner", n: "Dinner" },
  { k: "snack", n: "Snack" },
];

export function MealScanner({
  mode,
  ai,
  today,
  onClose,
  onSaved,
  onQuota,
  onScanned,
}: {
  mode: null | "camera" | "upload";
  ai: boolean;
  today: string | null;
  onClose: () => void;
  onSaved: (log: FoodLog) => void;
  onQuota: () => void;
  onScanned: () => void;
}) {
  const open = mode !== null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("camera");
  const [camState, setCamState] = useState<"starting" | "live" | "off">("starting");
  const [photo, setPhoto] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [dish, setDish] = useState("");
  const [confidence, setConfidence] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [picker, setPicker] = useState(false);
  const [meal, setMeal] = useState<LogMeal>("lunch");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setPhase("camera");
    setPhoto(null);
    setItems([]);
    setDish("");
    setConfidence(null);
    setScanId(null);
    setManual(false);
    setPicker(false);
    setErr(null);
    setStep(0);
    setMeal(mealForHour(new Date().getHours()));
  }, []);

  const startCam = useCallback(async () => {
    setCamState("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera");
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play().catch(() => {});
      }
      setCamState("live");
    } catch {
      setCamState("off");
    }
  }, []);

  // open: reset, lock scroll, start the camera (or the file picker for "upload")
  useEffect(() => {
    if (!open) return;
    reset();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (mode === "upload") {
      setCamState("off");
      setTimeout(() => fileRef.current?.click(), 50);
    } else startCam();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      stopCam();
    };
  }, [open, mode, reset, startCam, stopCam]);

  async function read(dataUrl: string) {
    stopCam();
    setPhoto(dataUrl);
    setPhase("reading");
    setStep(0);
    const ticker = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 900);
    const started = Date.now();
    try {
      const r = await fetch("/api/nutrition/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl, type: "image/jpeg" }) });
      const j = await r.json().catch(() => ({}));
      // let the steps play out: a scan that returns in 300 ms feels fake
      await new Promise((res) => setTimeout(res, Math.max(0, 2200 - (Date.now() - started))));
      if (r.status === 402 && j.error === "quota") return onQuota();
      if (j.mode === "manual") {
        setManual(true);
        setPicker(true);
        setDish("My meal");
        setPhase("result");
        return;
      }
      if (!r.ok) {
        setErr(j.error === "not_food" ? "No food in this photo. Try again with your plate filling the frame." : "We couldn't read this photo. Try again, or add the foods by hand.");
        setPhase("error");
        return;
      }
      onScanned();
      setScanId(j.scanId ?? null);
      setDish(j.dish || "My meal");
      setConfidence(j.confidence ?? null);
      setItems(
        (j.items as Omit<Item, "key" | "mult">[]).map((i, k) => ({ ...i, key: `ai${k}`, mult: 1 })),
      );
      setPhase("result");
    } catch {
      setErr("No connection. Check your internet and try again.");
      setPhase("error");
    } finally {
      clearInterval(ticker);
    }
  }

  function shoot() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    // square crop from the middle, like the frame on screen
    const s = Math.min(v.videoWidth, v.videoHeight);
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    c.getContext("2d")!.drawImage(v, (v.videoWidth - s) / 2, (v.videoHeight - s) / 2, s, s, 0, 0, s, s);
    read(toJpeg(c, s, s));
  }

  async function onFile(f: File | undefined) {
    if (!f) return;
    try {
      read(await fileToJpeg(f));
    } catch {
      setErr("That file isn't a photo we can open. Try a JPG or PNG.");
      setPhase("error");
    }
  }

  function addFood(id: string) {
    const f = FOODS.find((x) => x.id === id)!;
    setItems((l) => [...l, { key: `${id}-${Date.now()}`, name: f.name, portion: amountLabel(f, f.qty), kcal: f.kcal, protein: f.p, carbs: f.c, fat: f.f, mult: 1 }]);
  }

  const total = items.reduce((a, i) => ({ kcal: a.kcal + i.kcal * i.mult, p: a.p + i.protein * i.mult, c: a.c + i.carbs * i.mult, f: a.f + i.fat * i.mult }), { kcal: 0, p: 0, c: 0, f: 0 });

  async function save() {
    if (!today || !items.length) return;
    setSaving(true);
    const r = await fetch("/api/nutrition/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eatenOn: today,
        meal,
        title: dish.slice(0, 60) || "My meal",
        source: manual ? "manual" : "scan",
        scanId,
        items: items.map((i) => ({
          name: i.name,
          portion: i.mult === 1 ? i.portion : `${i.portion} × ${fmtQty(i.mult)}`.slice(0, 40),
          kcal: i.kcal * i.mult,
          protein: i.protein * i.mult,
          carbs: i.carbs * i.mult,
          fat: i.fat * i.mult,
        })),
      }),
    }).catch(() => null);
    setSaving(false);
    if (!r || !r.ok) return setErr("Couldn't add it to today. Try again.");
    const j = await r.json();
    onSaved(j.log as FoodLog);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] bg-black" role="dialog" aria-modal="true" aria-label="Meal scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => (onFile(e.target.files?.[0]), (e.target.value = ""))} data-testid="meal-file" />

          {/* top bar */}
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-4 sm:px-6">
            <button onClick={onClose} aria-label="Close" className="press flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.08] backdrop-blur hover:bg-white/[0.14]">
              <X size={20} />
            </button>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-lime">[ Meal scan ]</div>
            <span className="w-11" />
          </div>

          {/* viewfinder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-[150px] pt-[80px]">
            <div className="relative aspect-square w-full max-w-[420px] max-h-full">
              <div className="absolute inset-0 overflow-hidden rounded-[32px] bg-[#0b0c09]">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="Your meal" className="h-full w-full object-cover" />
                ) : (
                  <video ref={videoRef} playsInline muted className={cn("h-full w-full object-cover transition-opacity duration-500", camState === "live" ? "opacity-100" : "opacity-0")} />
                )}
                {!photo && camState !== "live" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                    {camState === "starting" ? (
                      <div className="skeleton h-full w-full rounded-[24px]" aria-label="Starting the camera" />
                    ) : (
                      <>
                        <ImageUp size={30} className="text-muted" />
                        <p className="text-[15px] text-muted">{mode === "upload" ? "Pick a photo of your meal." : "Camera not available here. Upload a photo of your plate instead."}</p>
                        <button onClick={() => fileRef.current?.click()} className="press h-11 rounded-full bg-white px-5 text-[14px] font-semibold text-ink">
                          Choose a photo
                        </button>
                      </>
                    )}
                  </div>
                )}
                {phase === "reading" && (
                  <>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="scan-line absolute inset-x-0 top-0 h-[10%]" />
                  </>
                )}
              </div>
              <div className={cn("pointer-events-none absolute inset-0 rounded-[32px]", phase !== "result" && "scan-frame")} />
              {(["left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-[32px]", "right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-[32px]", "left-0 bottom-0 border-l-[3px] border-b-[3px] rounded-bl-[32px]", "right-0 bottom-0 border-r-[3px] border-b-[3px] rounded-br-[32px]"] as const).map((c) => (
                <span key={c} className={cn("pointer-events-none absolute h-12 w-12 border-lime", c)} />
              ))}
            </div>
            <div className="mt-5 h-12 text-center">
              {phase === "camera" && <p className="text-[14px] text-fg/80">{ai ? "Fit your whole plate in the frame" : "Snap your plate, then tap what's on it"}</p>}
              {phase === "reading" && (
                <div aria-live="polite">
                  <div className="display text-[22px]">Reading your plate…</div>
                  <div className="mt-1 flex items-center justify-center gap-2 text-[13px] text-muted">
                    <Check size={14} className="text-lime" /> {STEPS[step]}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* shutter row */}
          {phase === "camera" && (
            <div className="safe-bottom absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-10 pb-8">
              <button onClick={() => fileRef.current?.click()} aria-label="Upload a photo" className="press flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.1] backdrop-blur hover:bg-white/[0.16]">
                <ImageUp size={20} />
              </button>
              <button
                onClick={shoot}
                disabled={camState !== "live"}
                aria-label="Take photo"
                className="press group flex h-[78px] w-[78px] items-center justify-center rounded-full border-[3px] border-white/90 disabled:opacity-40"
              >
                <span className="h-[62px] w-[62px] rounded-full bg-lime shadow-[0_0_30px_rgb(200_255_61/0.6)] transition-transform group-active:scale-90" />
              </button>
              <span className="w-12" />
            </div>
          )}

          {/* error */}
          {phase === "error" && (
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", damping: 32, stiffness: 340 }} className="safe-bottom absolute inset-x-0 bottom-0 z-30 mx-auto max-w-[560px] rounded-t-[24px] border-t border-line bg-[#0b0c09] px-5 pb-6 pt-6 sm:bottom-6 sm:rounded-[24px] sm:border">
              <p role="alert" className="text-[15px]">{err}</p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => (reset(), startCam())} className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-lime text-[15px] font-semibold text-lime-ink">
                  <RotateCcw size={16} /> Try again
                </button>
                <button onClick={() => (setManual(true), setPicker(true), setDish("My meal"), setErr(null), setPhase("result"))} className="press h-12 flex-1 rounded-full border border-line-2 text-[15px] font-semibold">
                  Add by hand
                </button>
              </div>
            </motion.div>
          )}

          {/* breakdown card */}
          <AnimatePresence>
            {phase === "result" && (
              <motion.section
                aria-label="Meal breakdown"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 z-30 mx-auto flex max-h-[86dvh] max-w-[560px] flex-col rounded-t-[28px] border-t border-line-2 bg-[#0b0c09] shadow-[0_-30px_80px_-10px_rgb(0_0_0/0.9)] sm:bottom-6 sm:rounded-[28px] sm:border"
              >
                <div className="flex justify-center pb-1 pt-3"><span className="h-1.5 w-11 rounded-full bg-white/20" /></div>
                <div className="overflow-y-auto px-5 pb-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-lime">
                        {manual ? "Tap what's on your plate" : `Estimate · ${confidence ?? "medium"} confidence`}
                      </div>
                      <input
                        value={dish}
                        onChange={(e) => setDish(e.target.value.slice(0, 60))}
                        aria-label="Meal name"
                        className="display mt-1 w-full bg-transparent text-[28px] outline-none focus:text-lime"
                      />
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-display text-[40px] font-bold leading-none tabular-nums" data-testid="scan-kcal"><Count to={Math.round(total.kcal)} /></div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">kcal</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {(
                      [
                        ["Protein", total.p, MACRO_COLORS.p],
                        ["Carbs", total.c, MACRO_COLORS.c],
                        ["Fat", total.f, MACRO_COLORS.f],
                      ] as const
                    ).map(([n, v, color]) => {
                      const grams = total.p + total.c + total.f || 1;
                      return (
                        <div key={n} className="rounded-xl bg-white/[0.04] px-3 py-2.5">
                          <div className="text-[12px] text-muted">{n}</div>
                          <div className="font-display text-[22px] font-bold tabular-nums" style={{ color }}>{Math.round(v)} g</div>
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                            <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${(v / grams) * 100}%` }} transition={{ duration: 0.8, ease: EASE }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <ul className="mt-4 space-y-2">
                    <AnimatePresence initial={false}>
                      {items.map((i, k) => (
                        <motion.li
                          key={i.key}
                          layout
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, ease: EASE, delay: k < 6 ? 0.15 + k * 0.06 : 0 }}
                          className="rounded-2xl border border-line bg-white/[0.02] px-3.5 py-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[14px] font-semibold">{i.name}</div>
                              <div className="text-[12px] text-muted">
                                {i.portion}
                                {i.mult !== 1 ? ` × ${fmtQty(i.mult)}` : ""}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[15px] font-semibold tabular-nums">{Math.round(i.kcal * i.mult)} kcal</div>
                              <div className="text-[11px] tabular-nums text-muted">
                                <span style={{ color: MACRO_COLORS.p }}>P {Math.round(i.protein * i.mult)}</span> · C {Math.round(i.carbs * i.mult)} · F {Math.round(i.fat * i.mult)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <button aria-label={`Less ${i.name}`} onClick={() => setItems((l) => l.map((x) => (x.key === i.key ? { ...x, mult: Math.max(0.25, x.mult - 0.25) } : x)))} className="press flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1]">
                              <Minus size={14} />
                            </button>
                            <span className="w-12 text-center text-[13px] font-semibold tabular-nums">{fmtQty(i.mult)}×</span>
                            <button aria-label={`More ${i.name}`} onClick={() => setItems((l) => l.map((x) => (x.key === i.key ? { ...x, mult: Math.min(4, x.mult + 0.25) } : x)))} className="press flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.1]">
                              <Plus size={14} />
                            </button>
                            <button aria-label={`Remove ${i.name}`} onClick={() => setItems((l) => l.filter((x) => x.key !== i.key))} className="press ml-auto flex h-8 w-8 items-center justify-center rounded-full text-dim hover:bg-white/[0.06] hover:text-fg">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                  {items.length === 0 && !picker && <p className="mt-4 text-[14px] text-muted">No foods yet. Add what&apos;s on the plate.</p>}

                  {picker ? (
                    <FoodPicker onAdd={addFood} onDone={() => setPicker(false)} canClose={items.length > 0} />
                  ) : (
                    <button onClick={() => setPicker(true)} className="press mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-dashed border-line-2 text-[14px] text-muted hover:text-fg">
                      <Plus size={16} /> Add a food
                    </button>
                  )}

                  <div className="mt-5 text-[12px] text-muted">Add to</div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Meal">
                    {MEALS.map((m) => (
                      <button key={m.k} role="radio" aria-checked={meal === m.k} onClick={() => setMeal(m.k)} className={cn("press h-10 rounded-xl border text-[13px] font-semibold", meal === m.k ? "border-lime/60 bg-lime/10" : "border-line text-muted")}>
                        {m.n}
                      </button>
                    ))}
                  </div>
                  {err && <p role="alert" className="mt-3 text-[14px] text-danger">{err}</p>}
                  {!manual && <p className="mt-3 text-[12px] text-dim">Photo estimates can be off by 20% or more. Adjust portions if you know them.</p>}
                </div>
                <div className="safe-bottom border-t border-line px-5 pt-3 sm:px-6">
                  <MainButton className="w-full" onClick={save} disabled={saving || !items.length || !today}>
                    {saving ? "Adding…" : "Add to today"}
                  </MainButton>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FoodPicker({ onAdd, onDone, canClose }: { onAdd: (id: string) => void; onDone: () => void; canClose: boolean }) {
  const [q, setQ] = useState("");
  const [added, setAdded] = useState<string | null>(null);
  const list = FOODS.filter((f) => f.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, q ? 20 : 42);
  return (
    <div className="mt-3 rounded-2xl border border-line bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-white/[0.05] px-3">
          <Search size={15} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods" aria-label="Search foods" className="w-full bg-transparent text-[14px] outline-none placeholder:text-dim" />
        </div>
        {canClose && (
          <button onClick={onDone} className="press h-10 rounded-xl px-3 text-[13px] font-semibold text-lime">
            Done
          </button>
        )}
      </div>
      <div className="no-scrollbar mt-2 flex max-h-[200px] flex-wrap gap-1.5 overflow-y-auto">
        {list.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              onAdd(f.id);
              setAdded(f.id);
              setTimeout(() => setAdded(null), 700);
            }}
            className={cn("press flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors", added === f.id ? "border-lime bg-lime/15 text-fg" : "border-line text-fg/90 hover:border-white/25")}
          >
            {added === f.id ? <Check size={13} className="text-lime" /> : <Plus size={13} className="text-muted" />} {f.name}
          </button>
        ))}
        {list.length === 0 && <p className="p-2 text-[13px] text-muted">No match. Try &ldquo;chicken&rdquo; or &ldquo;rice&rdquo;.</p>}
      </div>
    </div>
  );
}

function Count({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  const from = useRef(0);
  useEffect(() => {
    if (reduce) return setV(to);
    const c = animate(from.current, to, { duration: 1.3, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    from.current = to;
    return () => c.stop();
  }, [to, reduce]);
  return <>{v}</>;
}
