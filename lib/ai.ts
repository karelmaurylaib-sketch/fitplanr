import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

// The only place FitPlanr calls an AI model. Server only. Off unless ANTHROPIC_API_KEY is set:
// without it, the meal scan falls back to "tap what's on your plate" (the food list, no AI).

export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY;

const MODEL = () => process.env.AI_MODEL || "claude-opus-5-5";

const ScanZ = z.object({
  is_food: z.boolean(),
  dish: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      portion: z.string(),
      grams: z.number(),
      kcal: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    }),
  ),
  confidence: z.enum(["low", "medium", "high"]),
});
export type MealScan = z.infer<typeof ScanZ>;

const SYSTEM = `You estimate the nutrition of a meal from one photo, for a US fitness app.
List each visible food separately with a portion a person would recognize in US units (oz, cups, tbsp, pieces) and its estimated weight in grams.
Give calories and grams of protein, carbs and fat per item, using USDA-style values for the portion you see. Count visible oils, sauces and dressings as their own items when they are clear.
Be realistic, not optimistic: when unsure of a portion, use the typical restaurant or home serving.
Keep "dish" to 2-5 words (e.g. "Chicken rice bowl"). If the photo shows no food or drink, set is_food to false and items to an empty list.`;

export type ScanResult = { ok: true; scan: MealScan } | { ok: false; error: "off" | "not_food" | "failed" };

export async function scanMeal(base64: string, mediaType: "image/jpeg" | "image/png" | "image/webp"): Promise<ScanResult> {
  if (!aiEnabled()) return { ok: false, error: "off" };
  try {
    const client = new Anthropic({ timeout: 45_000, maxRetries: 1 });
    const res = await client.beta.messages.parse({
      model: MODEL(),
      // if the model declines, the API re-runs the request on a fallback model in the same call
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      max_tokens: 4000,
      system: SYSTEM,
      output_config: { effort: "low", format: betaZodOutputFormat(ScanZ) },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: "Estimate this meal." },
          ],
        },
      ],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) return { ok: false, error: "failed" };
    const scan = res.parsed_output;
    if (!scan.is_food || scan.items.length === 0) return { ok: false, error: "not_food" };
    const clean = (n: number, max: number) => Math.max(0, Math.min(max, Math.round(Number.isFinite(n) ? n : 0)));
    scan.items = scan.items.slice(0, 12).map((i) => ({
      name: i.name.slice(0, 60),
      portion: i.portion.slice(0, 40),
      grams: clean(i.grams, 3000),
      kcal: clean(i.kcal, 3000),
      protein: clean(i.protein, 300),
      carbs: clean(i.carbs, 400),
      fat: clean(i.fat, 300),
    }));
    scan.dish = scan.dish.slice(0, 60);
    return { ok: true, scan };
  } catch (e) {
    if (e instanceof Anthropic.APIError) console.error("[ai] scan failed", e.status, e.message);
    else console.error("[ai] scan failed", e);
    return { ok: false, error: "failed" };
  }
}
