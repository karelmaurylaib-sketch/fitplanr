export const MACRO_COLORS = { p: "#C8FF3D", c: "#7EE787", f: "#3FD3A6" } as const;

/** Local calendar day, yyyy-mm-dd. */
export function localDay(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Any image (camera frame or file) → JPEG data URL, longest side ≤ max px. */
export function toJpeg(src: CanvasImageSource, w: number, h: number, max = 1024): string {
  const k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * k);
  c.height = Math.round(h * k);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82);
}

export function fileToJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        resolve(toJpeg(img, img.naturalWidth, img.naturalHeight));
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => (URL.revokeObjectURL(url), reject(new Error("bad image")));
    img.src = url;
  });
}
