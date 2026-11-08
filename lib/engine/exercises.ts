// FitPlanr exercise database. Every exercise lists the gear it needs (ALL of `requires`),
// its movement pattern, the joints it stresses, a starting load for a true beginner, and form cues.

export type Gear =
  | "dumbbells"
  | "adjustable"
  | "barbell"
  | "rack"
  | "bench"
  | "cables"
  | "machines"
  | "kettlebell"
  | "pullup"
  | "bands";

export type Pattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "hpush"
  | "vpush"
  | "hpull"
  | "vpull"
  | "biceps"
  | "triceps"
  | "delts"
  | "core"
  | "calves"
  | "glutes";

export type Joint = "knees" | "back" | "shoulders";
export type LoadKind = "db" | "bb" | "kb" | "stack" | "bw" | "band";
export type Anim =
  | "squat"
  | "hinge"
  | "lunge"
  | "pressFlat"
  | "pressUp"
  | "row"
  | "pulldown"
  | "curl"
  | "extension"
  | "raise"
  | "pushup"
  | "bridge"
  | "plank"
  | "calf";

export type Exercise = {
  id: string;
  name: string;
  pattern: Pattern;
  muscles: string[];
  requires: Gear[];
  stresses: Joint[];
  load: LoadKind;
  /** starting load in lb for someone who never lifted (per hand for dumbbells) */
  base: number;
  compound: boolean;
  anim: Anim;
  cues: [string, string, string];
};

export const GEAR_LABELS: Record<Gear, string> = {
  dumbbells: "Dumbbells (fixed pair)",
  adjustable: "Adjustable dumbbells",
  barbell: "Barbell + plates",
  rack: "Squat rack",
  bench: "Flat / incline bench",
  cables: "Cable machine",
  machines: "Weight machines",
  kettlebell: "Kettlebell",
  pullup: "Pull-up bar",
  bands: "Resistance bands",
};

export const EXERCISES: Exercise[] = [
  // ---------- squat ----------
  { id: "goblet-squat", name: "Goblet Squat", pattern: "squat", muscles: ["Quads", "Glutes"], requires: ["dumbbells"], stresses: ["knees"], load: "db", base: 20, compound: true, anim: "squat", cues: ["Hold the dumbbell tight to your chest", "Sit down between your heels, chest tall", "Push the floor away to stand up"] },
  { id: "db-box-squat", name: "Dumbbell Box Squat", pattern: "squat", muscles: ["Quads", "Glutes"], requires: ["dumbbells", "bench"], stresses: [], load: "db", base: 15, compound: true, anim: "squat", cues: ["Bench just behind you, feet shoulder-width", "Sit back until you lightly touch the bench", "Stand up without rocking"] },
  { id: "bb-back-squat", name: "Barbell Back Squat", pattern: "squat", muscles: ["Quads", "Glutes", "Core"], requires: ["barbell", "rack"], stresses: ["knees", "back"], load: "bb", base: 45, compound: true, anim: "squat", cues: ["Bar on your upper back, not your neck", "Brace like you are about to be poked", "Knees follow your toes on the way down"] },
  { id: "leg-press", name: "Leg Press", pattern: "squat", muscles: ["Quads", "Glutes"], requires: ["machines"], stresses: [], load: "stack", base: 90, compound: true, anim: "squat", cues: ["Feet mid-platform, shoulder-width", "Lower until your knees reach about 90°", "Never lock your knees at the top"] },
  { id: "bw-squat", name: "Bodyweight Squat", pattern: "squat", muscles: ["Quads", "Glutes"], requires: [], stresses: [], load: "bw", base: 0, compound: true, anim: "squat", cues: ["Arms forward for balance", "Hips back and down, chest up", "Full foot on the floor the whole time"] },
  { id: "kb-goblet-squat", name: "Kettlebell Goblet Squat", pattern: "squat", muscles: ["Quads", "Glutes"], requires: ["kettlebell"], stresses: ["knees"], load: "kb", base: 18, compound: true, anim: "squat", cues: ["Hold the bell by the horns at your chest", "Elbows travel inside your knees", "Drive up through your whole foot"] },

  // ---------- hinge ----------
  { id: "db-rdl", name: "Dumbbell Romanian Deadlift", pattern: "hinge", muscles: ["Hamstrings", "Glutes"], requires: ["dumbbells"], stresses: ["back"], load: "db", base: 20, compound: true, anim: "hinge", cues: ["Soft knees, push your hips back", "Dumbbells slide down your thighs", "Stop when you feel your hamstrings stretch"] },
  { id: "bb-rdl", name: "Barbell Romanian Deadlift", pattern: "hinge", muscles: ["Hamstrings", "Glutes", "Back"], requires: ["barbell"], stresses: ["back"], load: "bb", base: 65, compound: true, anim: "hinge", cues: ["Bar stays against your legs", "Flat back, hips go back like closing a car door", "Squeeze your glutes to stand"] },
  { id: "kb-deadlift", name: "Kettlebell Deadlift", pattern: "hinge", muscles: ["Hamstrings", "Glutes"], requires: ["kettlebell"], stresses: [], load: "kb", base: 26, compound: true, anim: "hinge", cues: ["Bell between your feet", "Hips back, flat back, grab the handle", "Stand tall and squeeze your glutes"] },
  { id: "band-pull-through", name: "Band Pull-Through", pattern: "hinge", muscles: ["Glutes", "Hamstrings"], requires: ["bands"], stresses: [], load: "band", base: 0, compound: true, anim: "hinge", cues: ["Band anchored low behind you", "Hinge at the hips, arms long", "Snap your hips forward to stand"] },
  { id: "cable-pull-through", name: "Cable Pull-Through", pattern: "hinge", muscles: ["Glutes", "Hamstrings"], requires: ["cables"], stresses: [], load: "stack", base: 30, compound: true, anim: "hinge", cues: ["Face away from a low pulley", "Hinge back with a flat back", "Drive hips forward, do not lean back"] },

  // ---------- glutes ----------
  { id: "glute-bridge", name: "Glute Bridge", pattern: "glutes", muscles: ["Glutes"], requires: [], stresses: [], load: "bw", base: 0, compound: false, anim: "bridge", cues: ["Lie on your back, heels close to your hips", "Push through your heels to lift your hips", "Pause and squeeze at the top"] },
  { id: "db-hip-thrust", name: "Dumbbell Hip Thrust", pattern: "glutes", muscles: ["Glutes"], requires: ["dumbbells", "bench"], stresses: [], load: "db", base: 25, compound: false, anim: "bridge", cues: ["Upper back on the bench edge", "Dumbbell on your hips, chin tucked", "Lift until your body is a flat table"] },

  // ---------- lunge ----------
  { id: "db-split-squat", name: "Dumbbell Split Squat", pattern: "lunge", muscles: ["Quads", "Glutes"], requires: ["dumbbells"], stresses: ["knees"], load: "db", base: 10, compound: true, anim: "lunge", cues: ["Long stance, back heel up", "Drop your back knee straight down", "Front foot stays flat"] },
  { id: "db-step-back-lunge", name: "Reverse Lunge", pattern: "lunge", muscles: ["Quads", "Glutes"], requires: ["dumbbells"], stresses: ["knees"], load: "db", base: 10, compound: true, anim: "lunge", cues: ["Step one foot back", "Lower until both knees bend about 90°", "Push through the front heel to return"] },
  { id: "bw-split-squat", name: "Split Squat", pattern: "lunge", muscles: ["Quads", "Glutes"], requires: [], stresses: ["knees"], load: "bw", base: 0, compound: true, anim: "lunge", cues: ["Hands on hips, long stance", "Lower slowly, torso tall", "Drive up through the front foot"] },

  // ---------- horizontal push ----------
  { id: "db-bench", name: "Dumbbell Bench Press", pattern: "hpush", muscles: ["Chest", "Triceps"], requires: ["dumbbells", "bench"], stresses: ["shoulders"], load: "db", base: 15, compound: true, anim: "pressFlat", cues: ["Feet flat, shoulder blades pinched", "Lower until elbows sit a bit below the bench", "Press up and slightly in"] },
  { id: "db-floor-press", name: "Dumbbell Floor Press", pattern: "hpush", muscles: ["Chest", "Triceps"], requires: ["dumbbells"], stresses: [], load: "db", base: 15, compound: true, anim: "pressFlat", cues: ["Lie on the floor, knees bent", "Lower until your upper arms touch the floor", "Press up, elbows at 45°"] },
  { id: "bb-bench", name: "Barbell Bench Press", pattern: "hpush", muscles: ["Chest", "Triceps", "Shoulders"], requires: ["barbell", "bench", "rack"], stresses: ["shoulders"], load: "bb", base: 45, compound: true, anim: "pressFlat", cues: ["Eyes under the bar, grip just outside shoulders", "Lower to the middle of your chest", "Press up in a slight arc back"] },
  { id: "machine-chest-press", name: "Machine Chest Press", pattern: "hpush", muscles: ["Chest", "Triceps"], requires: ["machines"], stresses: [], load: "stack", base: 40, compound: true, anim: "pressFlat", cues: ["Handles at mid-chest height", "Press out without locking hard", "Slow on the way back"] },
  { id: "pushup", name: "Push-Up", pattern: "hpush", muscles: ["Chest", "Triceps", "Core"], requires: [], stresses: [], load: "bw", base: 0, compound: true, anim: "pushup", cues: ["Hands under shoulders, body in one line", "Lower your chest to a fist above the floor", "Knees down is fine: keep the line"] },
  { id: "band-chest-press", name: "Band Chest Press", pattern: "hpush", muscles: ["Chest", "Triceps"], requires: ["bands"], stresses: [], load: "band", base: 0, compound: true, anim: "pressFlat", cues: ["Band behind your upper back", "Press forward to arm's length", "Control the band back"] },

  // ---------- vertical push ----------
  { id: "db-ohp", name: "Seated Dumbbell Shoulder Press", pattern: "vpush", muscles: ["Shoulders", "Triceps"], requires: ["dumbbells", "bench"], stresses: ["shoulders"], load: "db", base: 10, compound: true, anim: "pressUp", cues: ["Sit tall, back on the bench", "Start with dumbbells at ear level", "Press up until arms are straight"] },
  { id: "db-standing-press", name: "Standing Dumbbell Press", pattern: "vpush", muscles: ["Shoulders", "Triceps", "Core"], requires: ["dumbbells"], stresses: ["shoulders", "back"], load: "db", base: 10, compound: true, anim: "pressUp", cues: ["Squeeze glutes and abs", "Press straight up, head through at the top", "Do not lean back"] },
  { id: "landmine-press", name: "Half-Kneeling Dumbbell Press", pattern: "vpush", muscles: ["Shoulders", "Triceps"], requires: ["dumbbells"], stresses: [], load: "db", base: 10, compound: true, anim: "pressUp", cues: ["One knee down, glute squeezed", "Press one dumbbell up and slightly forward", "Ribs stay down"] },
  { id: "bb-ohp", name: "Barbell Overhead Press", pattern: "vpush", muscles: ["Shoulders", "Triceps"], requires: ["barbell", "rack"], stresses: ["shoulders", "back"], load: "bb", base: 45, compound: true, anim: "pressUp", cues: ["Bar on your front shoulders", "Move your head back, press straight up", "Lock out with the bar over your mid-foot"] },
  { id: "machine-shoulder-press", name: "Machine Shoulder Press", pattern: "vpush", muscles: ["Shoulders", "Triceps"], requires: ["machines"], stresses: [], load: "stack", base: 30, compound: true, anim: "pressUp", cues: ["Seat so handles start at shoulder height", "Press up smoothly", "Lower until hands reach your chin"] },
  { id: "pike-pushup", name: "Pike Push-Up", pattern: "vpush", muscles: ["Shoulders", "Triceps"], requires: [], stresses: ["shoulders"], load: "bw", base: 0, compound: true, anim: "pushup", cues: ["Hips high, body like an upside-down V", "Lower the top of your head toward the floor", "Push back up"] },

  // ---------- horizontal pull ----------
  { id: "db-row", name: "One-Arm Dumbbell Row", pattern: "hpull", muscles: ["Back", "Biceps"], requires: ["dumbbells"], stresses: [], load: "db", base: 20, compound: true, anim: "row", cues: ["Hand and knee on a bench or chair", "Pull the dumbbell to your hip pocket", "Lower until your arm is long"] },
  { id: "db-chest-row", name: "Chest-Supported Dumbbell Row", pattern: "hpull", muscles: ["Back", "Biceps"], requires: ["dumbbells", "bench"], stresses: [], load: "db", base: 15, compound: true, anim: "row", cues: ["Lie face-down on an incline bench", "Row both dumbbells, elbows back", "Squeeze your shoulder blades"] },
  { id: "bb-row", name: "Barbell Row", pattern: "hpull", muscles: ["Back", "Biceps"], requires: ["barbell"], stresses: ["back"], load: "bb", base: 45, compound: true, anim: "row", cues: ["Hinge to about 45°, flat back", "Pull the bar to your belly button", "Lower with control"] },
  { id: "cable-row", name: "Seated Cable Row", pattern: "hpull", muscles: ["Back", "Biceps"], requires: ["cables"], stresses: [], load: "stack", base: 50, compound: true, anim: "row", cues: ["Sit tall, slight knee bend", "Pull the handle to your stomach", "Let your shoulders reach forward at the end"] },
  { id: "band-row", name: "Band Row", pattern: "hpull", muscles: ["Back", "Biceps"], requires: ["bands"], stresses: [], load: "band", base: 0, compound: true, anim: "row", cues: ["Band anchored at chest height", "Pull elbows back past your ribs", "Slow return"] },
  { id: "table-row", name: "Inverted Row (table or bar)", pattern: "hpull", muscles: ["Back", "Biceps"], requires: [], stresses: [], load: "bw", base: 0, compound: true, anim: "row", cues: ["Lie under a sturdy table, grip the edge", "Body straight, pull your chest up", "Bend knees to make it easier"] },

  // ---------- vertical pull ----------
  { id: "lat-pulldown", name: "Lat Pulldown", pattern: "vpull", muscles: ["Back", "Biceps"], requires: ["cables"], stresses: [], load: "stack", base: 50, compound: true, anim: "pulldown", cues: ["Grip a bit wider than shoulders", "Pull the bar to your upper chest", "Lean back only slightly"] },
  { id: "assisted-pullup", name: "Band-Assisted Pull-Up", pattern: "vpull", muscles: ["Back", "Biceps"], requires: ["pullup", "bands"], stresses: [], load: "bw", base: 0, compound: true, anim: "pulldown", cues: ["Band looped on the bar under one knee", "Pull your chest to the bar", "Lower all the way down"] },
  { id: "negative-pullup", name: "Slow Pull-Up Negative", pattern: "vpull", muscles: ["Back", "Biceps"], requires: ["pullup"], stresses: [], load: "bw", base: 0, compound: true, anim: "pulldown", cues: ["Jump or step up to the top position", "Lower yourself over 3–5 seconds", "Reset and repeat"] },
  { id: "band-pulldown", name: "Band Pulldown", pattern: "vpull", muscles: ["Back"], requires: ["bands"], stresses: [], load: "band", base: 0, compound: true, anim: "pulldown", cues: ["Band anchored high", "Pull elbows down to your sides", "Control it back up"] },
  { id: "db-pullover", name: "Dumbbell Pullover", pattern: "vpull", muscles: ["Back", "Chest"], requires: ["dumbbells", "bench"], stresses: ["shoulders"], load: "db", base: 15, compound: false, anim: "pulldown", cues: ["Lie on the bench, one dumbbell over your chest", "Lower it behind your head, arms nearly straight", "Pull it back over your chest"] },

  // ---------- arms ----------
  { id: "db-curl", name: "Dumbbell Curl", pattern: "biceps", muscles: ["Biceps"], requires: ["dumbbells"], stresses: [], load: "db", base: 10, compound: false, anim: "curl", cues: ["Elbows pinned to your sides", "Curl up, turn pinkies in at the top", "Lower over 2 seconds"] },
  { id: "hammer-curl", name: "Hammer Curl", pattern: "biceps", muscles: ["Biceps", "Forearms"], requires: ["dumbbells"], stresses: [], load: "db", base: 10, compound: false, anim: "curl", cues: ["Palms face each other", "Curl without swinging", "Squeeze at the top"] },
  { id: "cable-curl", name: "Cable Curl", pattern: "biceps", muscles: ["Biceps"], requires: ["cables"], stresses: [], load: "stack", base: 20, compound: false, anim: "curl", cues: ["Stand close to the low pulley", "Curl the bar to your chest", "Keep elbows still"] },
  { id: "band-curl", name: "Band Curl", pattern: "biceps", muscles: ["Biceps"], requires: ["bands"], stresses: [], load: "band", base: 0, compound: false, anim: "curl", cues: ["Stand on the band", "Curl up slowly", "Fight the band on the way down"] },
  { id: "db-oh-extension", name: "Overhead Dumbbell Extension", pattern: "triceps", muscles: ["Triceps"], requires: ["dumbbells"], stresses: ["shoulders"], load: "db", base: 15, compound: false, anim: "extension", cues: ["Hold one dumbbell with both hands overhead", "Lower it behind your head", "Elbows point forward, not out"] },
  { id: "db-skullcrusher", name: "Dumbbell Skull Crusher", pattern: "triceps", muscles: ["Triceps"], requires: ["dumbbells", "bench"], stresses: [], load: "db", base: 10, compound: false, anim: "extension", cues: ["Lie on the bench, arms straight up", "Bend only at the elbows", "Stop beside your ears"] },
  { id: "cable-pushdown", name: "Cable Triceps Pushdown", pattern: "triceps", muscles: ["Triceps"], requires: ["cables"], stresses: [], load: "stack", base: 25, compound: false, anim: "extension", cues: ["Elbows tucked at your sides", "Push down until arms are straight", "Let it up to 90°"] },
  { id: "bench-dip", name: "Bench Dip", pattern: "triceps", muscles: ["Triceps"], requires: ["bench"], stresses: ["shoulders"], load: "bw", base: 0, compound: false, anim: "extension", cues: ["Hands on the bench behind you", "Lower until elbows reach 90°", "Push back up"] },
  { id: "diamond-pushup", name: "Close-Grip Push-Up", pattern: "triceps", muscles: ["Triceps", "Chest"], requires: [], stresses: [], load: "bw", base: 0, compound: false, anim: "pushup", cues: ["Hands under your chest, close together", "Elbows brush your ribs", "Knees down if needed"] },

  // ---------- delts ----------
  { id: "db-lateral-raise", name: "Dumbbell Lateral Raise", pattern: "delts", muscles: ["Side delts"], requires: ["dumbbells"], stresses: [], load: "db", base: 5, compound: false, anim: "raise", cues: ["Slight bend in the elbows", "Raise to shoulder height, not higher", "Lower slowly"] },
  { id: "cable-lateral-raise", name: "Cable Lateral Raise", pattern: "delts", muscles: ["Side delts"], requires: ["cables"], stresses: [], load: "stack", base: 10, compound: false, anim: "raise", cues: ["Low pulley, handle across your body", "Raise out to the side", "Pause at shoulder height"] },
  { id: "band-face-pull", name: "Band Face Pull", pattern: "delts", muscles: ["Rear delts", "Upper back"], requires: ["bands"], stresses: [], load: "band", base: 0, compound: false, anim: "row", cues: ["Band at face height", "Pull toward your eyes, elbows high", "Squeeze, then return"] },

  // ---------- core / calves ----------
  { id: "plank", name: "Plank", pattern: "core", muscles: ["Core"], requires: [], stresses: [], load: "bw", base: 0, compound: false, anim: "plank", cues: ["Elbows under shoulders", "Squeeze glutes, body in one line", "Breathe, do not hold your breath"] },
  { id: "dead-bug", name: "Dead Bug", pattern: "core", muscles: ["Core"], requires: [], stresses: [], load: "bw", base: 0, compound: false, anim: "bridge", cues: ["Lower back pressed into the floor", "Reach opposite arm and leg out", "Move slowly"] },
  { id: "calf-raise", name: "Standing Calf Raise", pattern: "calves", muscles: ["Calves"], requires: [], stresses: [], load: "bw", base: 0, compound: false, anim: "calf", cues: ["Balls of your feet on a step", "Rise as high as you can", "Lower the heels below the step"] },
  { id: "db-calf-raise", name: "Dumbbell Calf Raise", pattern: "calves", muscles: ["Calves"], requires: ["dumbbells"], stresses: [], load: "db", base: 20, compound: false, anim: "calf", cues: ["Dumbbells at your sides", "Pause at the top for a second", "Full stretch at the bottom"] },
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function hasGear(available: Gear[], ex: Exercise) {
  const set = new Set<Gear>(available);
  if (set.has("adjustable")) set.add("dumbbells");
  return ex.requires.every((g) => set.has(g));
}
