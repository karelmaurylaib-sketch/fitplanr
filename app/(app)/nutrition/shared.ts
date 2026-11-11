export const MACRO_COLORS = { p: "#C8FF3D", c: "#7EE787", f: "#3FD3A6" } as const;

/** Local calendar day, yyyy-mm-dd. */
export function localDay(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
