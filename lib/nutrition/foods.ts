// FitPlanr food list: common US grocery foods with macros per serving (USDA FoodData Central, rounded).
// Used by the nutrition plan: portions are solved to hit each meal's targets.

export type FoodCat = "protein" | "carb" | "fruit" | "veg" | "fat";

export type Food = {
  id: string;
  name: string;
  cat: FoodCat;
  qty: number; // base serving amount, in `unit`
  unit: string; // "oz", "cup", "tbsp", "slice", "" (count)
  step: number; // rounding step, in `unit`
  max: number; // largest sensible amount per meal, in `unit`
  kcal: number;
  p: number;
  c: number;
  f: number;
  tip?: string;
};

export const FOODS: Food[] = [
  // protein
  { id: "chicken", name: "Chicken breast", cat: "protein", qty: 4, unit: "oz", step: 1, max: 10, kcal: 187, p: 35, c: 0, f: 4, tip: "Grilled or baked, cooked weight" },
  { id: "turkey", name: "Turkey breast", cat: "protein", qty: 4, unit: "oz", step: 1, max: 10, kcal: 153, p: 34, c: 0, f: 1 },
  { id: "beef93", name: "Lean ground beef (93%)", cat: "protein", qty: 4, unit: "oz", step: 1, max: 9, kcal: 196, p: 28, c: 0, f: 9, tip: "Cooked weight" },
  { id: "salmon", name: "Salmon", cat: "protein", qty: 4, unit: "oz", step: 1, max: 9, kcal: 235, p: 25, c: 0, f: 14, tip: "Omega-3 fats for recovery" },
  { id: "shrimp", name: "Shrimp", cat: "protein", qty: 4, unit: "oz", step: 1, max: 10, kcal: 112, p: 27, c: 0, f: 0.3 },
  { id: "tuna", name: "Canned tuna (in water)", cat: "protein", qty: 1, unit: "can", step: 0.5, max: 2.5, kcal: 120, p: 26, c: 0, f: 1 },
  { id: "tofu", name: "Firm tofu", cat: "protein", qty: 6, unit: "oz", step: 1, max: 14, kcal: 245, p: 29, c: 5, f: 15 },
  { id: "greek", name: "Greek yogurt (nonfat)", cat: "protein", qty: 1, unit: "cup", step: 0.25, max: 2.5, kcal: 133, p: 23, c: 8, f: 1, tip: "Plain: add your own fruit" },
  { id: "eggs", name: "Whole eggs", cat: "protein", qty: 2, unit: "", step: 1, max: 5, kcal: 143, p: 12.6, c: 0.7, f: 9.5 },
  { id: "whites", name: "Egg whites", cat: "protein", qty: 1, unit: "cup", step: 0.25, max: 2.5, kcal: 126, p: 26, c: 2, f: 0 },
  { id: "cottage", name: "Cottage cheese (low-fat)", cat: "protein", qty: 1, unit: "cup", step: 0.25, max: 2.5, kcal: 163, p: 28, c: 6, f: 2.3 },
  { id: "whey", name: "Whey protein shake", cat: "protein", qty: 1, unit: "scoop", step: 0.5, max: 2.5, kcal: 120, p: 24, c: 3, f: 1.5, tip: "Mixed with water" },
  // carbs
  { id: "oats", name: "Rolled oats", cat: "carb", qty: 0.5, unit: "cup", step: 0.25, max: 1.75, kcal: 150, p: 5, c: 27, f: 3, tip: "Dry measure" },
  { id: "toast", name: "Whole wheat toast", cat: "carb", qty: 2, unit: "slice", step: 1, max: 5, kcal: 160, p: 8, c: 28, f: 2 },
  { id: "bagel", name: "Plain bagel", cat: "carb", qty: 1, unit: "", step: 0.5, max: 2, kcal: 270, p: 10, c: 53, f: 1.5 },
  { id: "rice_brown", name: "Brown rice", cat: "carb", qty: 1, unit: "cup", step: 0.25, max: 3, kcal: 218, p: 5, c: 46, f: 1.6, tip: "Cooked" },
  { id: "rice_white", name: "White rice", cat: "carb", qty: 1, unit: "cup", step: 0.25, max: 3, kcal: 205, p: 4, c: 45, f: 0.4, tip: "Cooked" },
  { id: "quinoa", name: "Quinoa", cat: "carb", qty: 1, unit: "cup", step: 0.25, max: 3, kcal: 222, p: 8, c: 39, f: 3.6, tip: "Cooked" },
  { id: "sweet_potato", name: "Sweet potato", cat: "carb", qty: 1, unit: "medium", step: 0.5, max: 3, kcal: 130, p: 2.4, c: 30, f: 0.2 },
  { id: "potato", name: "Baked potato", cat: "carb", qty: 1, unit: "medium", step: 0.5, max: 3, kcal: 160, p: 4, c: 36, f: 0.2 },
  { id: "pasta", name: "Whole wheat pasta", cat: "carb", qty: 1, unit: "cup", step: 0.25, max: 3, kcal: 174, p: 7.5, c: 37, f: 0.8, tip: "Cooked" },
  { id: "tortilla", name: "Whole wheat tortilla", cat: "carb", qty: 1, unit: "large", step: 1, max: 4, kcal: 140, p: 4, c: 22, f: 3.5 },
  { id: "beans", name: "Black beans", cat: "carb", qty: 0.5, unit: "cup", step: 0.25, max: 2, kcal: 114, p: 7.6, c: 20, f: 0.5 },
  // fruit
  { id: "banana", name: "Banana", cat: "fruit", qty: 1, unit: "medium", step: 0.5, max: 2, kcal: 105, p: 1.3, c: 27, f: 0.4 },
  { id: "apple", name: "Apple", cat: "fruit", qty: 1, unit: "medium", step: 0.5, max: 2, kcal: 95, p: 0.5, c: 25, f: 0.3 },
  { id: "pear", name: "Pear", cat: "fruit", qty: 1, unit: "medium", step: 0.5, max: 2, kcal: 101, p: 0.6, c: 27, f: 0.2 },
  { id: "berries", name: "Blueberries", cat: "fruit", qty: 1, unit: "cup", step: 0.25, max: 2, kcal: 84, p: 1.1, c: 21, f: 0.5 },
  { id: "orange", name: "Orange", cat: "fruit", qty: 1, unit: "medium", step: 0.5, max: 2, kcal: 62, p: 1.2, c: 15, f: 0.2 },
  { id: "grapes", name: "Grapes", cat: "fruit", qty: 1, unit: "cup", step: 0.25, max: 2, kcal: 104, p: 1.1, c: 27, f: 0.2 },
  // vegetables
  { id: "broccoli", name: "Broccoli", cat: "veg", qty: 1, unit: "cup", step: 0.5, max: 3, kcal: 55, p: 3.7, c: 11, f: 0.6 },
  { id: "green_beans", name: "Green beans", cat: "veg", qty: 1, unit: "cup", step: 0.5, max: 3, kcal: 44, p: 2.4, c: 10, f: 0.4 },
  { id: "asparagus", name: "Asparagus", cat: "veg", qty: 1, unit: "cup", step: 0.5, max: 3, kcal: 40, p: 4.3, c: 7, f: 0.4 },
  { id: "salad", name: "Mixed green salad", cat: "veg", qty: 2, unit: "cup", step: 1, max: 4, kcal: 20, p: 1.5, c: 4, f: 0.2 },
  { id: "spinach", name: "Spinach", cat: "veg", qty: 2, unit: "cup", step: 1, max: 4, kcal: 14, p: 1.7, c: 2.2, f: 0.2, tip: "Raw" },
  { id: "peppers", name: "Bell peppers", cat: "veg", qty: 1, unit: "cup", step: 0.5, max: 3, kcal: 30, p: 1, c: 7, f: 0.3 },
  // fats
  { id: "avocado", name: "Avocado", cat: "fat", qty: 0.33, unit: "", step: 0.33, max: 1, kcal: 80, p: 1, c: 4, f: 7 },
  { id: "olive_oil", name: "Olive oil", cat: "fat", qty: 1, unit: "tbsp", step: 0.5, max: 2.5, kcal: 119, p: 0, c: 0, f: 13.5, tip: "For cooking or dressing" },
  { id: "pb", name: "Peanut butter", cat: "fat", qty: 1, unit: "tbsp", step: 0.5, max: 3, kcal: 95, p: 3.5, c: 3.5, f: 8 },
  { id: "almonds", name: "Almonds", cat: "fat", qty: 1, unit: "oz", step: 0.5, max: 2, kcal: 164, p: 6, c: 6, f: 14, tip: "About 23 almonds" },
  { id: "walnuts", name: "Walnuts", cat: "fat", qty: 0.5, unit: "oz", step: 0.5, max: 2, kcal: 93, p: 2, c: 2, f: 9 },
  { id: "cheese", name: "Cheddar cheese", cat: "fat", qty: 1, unit: "oz", step: 0.5, max: 2.5, kcal: 114, p: 7, c: 0.4, f: 9.4 },
  { id: "chia", name: "Chia seeds", cat: "fat", qty: 1, unit: "tbsp", step: 0.5, max: 3, kcal: 58, p: 2, c: 5, f: 3.7 },
];

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

const FRACTIONS: Record<string, string> = { "0.25": "¼", "0.33": "⅓", "0.5": "½", "0.66": "⅔", "0.67": "⅔", "0.75": "¾" };

/** 1.5 → "1½", 0.25 → "¼". */
export function fmtQty(q: number): string {
  const whole = Math.floor(q + 1e-6);
  const rest = +(q - whole).toFixed(2);
  if (rest < 0.05) return String(whole);
  const fr = FRACTIONS[rest.toFixed(2)] ?? FRACTIONS[rest.toFixed(2).replace(/0$/, "")];
  if (!fr) return q.toFixed(1).replace(/\.0$/, "");
  return whole ? `${whole}${fr}` : fr;
}

/** "5 oz", "1½ cup", "3 eggs" style label for an amount of a food. */
export function amountLabel(food: Food, amount: number): string {
  const q = fmtQty(amount);
  if (!food.unit) {
    if (food.id === "eggs") return `${q} egg${amount > 1 ? "s" : ""}`;
    return `${q} whole`;
  }
  if (food.unit === "medium" || food.unit === "large") return `${q} ${food.unit}`;
  const plural = amount > 1 && ["cup", "slice", "scoop", "can"].includes(food.unit) ? "s" : "";
  return `${q} ${food.unit}${plural}`;
}
