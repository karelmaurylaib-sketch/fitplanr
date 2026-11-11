// Captures Chrome screencast frames (JPEG, device pixels) with wall-clock timestamps and named marks.
import fs from "node:fs";
import path from "node:path";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function recorder(page, dir) {
  const name = path.basename(dir);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  const marks = {};
  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    const file = String(frames.length).padStart(5, "0") + ".jpg";
    fs.writeFileSync(path.join(dir, file), Buffer.from(data, "base64"));
    frames.push({ file, t: metadata.timestamp });
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  await wait(300);
  return {
    mark: (k) => (marks[k] = Date.now() / 1000),
    async stop() {
      await wait(300);
      await cdp.send("Page.stopScreencast");
      fs.writeFileSync(path.join(dir, "frames.json"), JSON.stringify(frames));
      fs.writeFileSync(path.join(dir, "marks.json"), JSON.stringify(marks));
      console.log(name, frames.length, "frames", JSON.stringify(marks));
    },
  };
}
