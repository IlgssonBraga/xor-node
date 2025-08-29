import express, { Request, Response } from "express";
import { spawn } from "child_process";

const app = express();
app.use(express.json({ limit: "5mb" }));

const XOR_KEY = process.env.XOR_KEY || "default-key";

function runXorBin(input: Buffer, key: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const proc = spawn("/usr/local/bin/xorbin", [key]);

    const chunks: Buffer[] = [];
    const errs: Buffer[] = [];

    proc.stdout.on("data", (d: Buffer) => chunks.push(d));
    proc.stderr.on("data", (d: Buffer) => errs.push(d));

    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        const err = Buffer.concat(errs).toString() || `xorbin exit ${code}`;
        reject(new Error(err));
      }
    });

    proc.stdin.write(input);
    proc.stdin.end();
  });
}

app.post("/xor", async (req: Request, res: Response) => {
  try {
    const { data, encoding = "utf8", output = "base64" } = req.body || {};
    if (typeof data !== "string") {
      return res.status(400).json({ error: "Body deve incluir { data: string }" });
    }

    const input = Buffer.from(data, encoding as BufferEncoding);
    const outBuf = await runXorBin(input, XOR_KEY);

    let payload: string;
    if (output === "hex") payload = outBuf.toString("hex");
    else if (output === "utf8") payload = outBuf.toString("utf8");
    else if (output === "base64") payload = outBuf.toString("base64");
    else payload = outBuf.toString("base64");

    res.json({ result: payload });
  } catch (e: any) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, keyLen: XOR_KEY.length });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server on http://0.0.0.0:${port}`);
});
