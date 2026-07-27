import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

async function read(relativePath: string): Promise<string> {
  return readFile(resolve(root, relativePath), "utf8");
}

async function readPngDimensions(
  relativePath: string,
): Promise<{ width: number; height: number }> {
  const png = await readFile(resolve(root, relativePath));

  expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");

  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

describe("Cloudflare Pages production assets", () => {
  it("declares bounded liveness and readiness responses", async () => {
    const live = JSON.parse(await read("public/health/live.json"));
    const ready = JSON.parse(await read("public/health/ready.json"));

    expect(live).toEqual({
      status: "ok",
      service: "saving_ryan",
      version: "0.1.0",
    });
    expect(ready).toEqual(live);
  });

  it("maps the stable health paths without a runtime function", async () => {
    const redirects = await read("public/_redirects");

    expect(redirects).toContain("/health /health/ready.json 200");
    expect(redirects).toContain("/health/live /health/live.json 200");
    expect(redirects).toContain("/health/ready /health/ready.json 200");
  });

  it("ships restrictive document and media security headers", async () => {
    const headers = await read("public/_headers");

    expect(headers).toContain("Content-Security-Policy:");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("media-src 'self'");
    expect(headers).toContain("X-Frame-Options: DENY");
    expect(headers).toContain("X-Robots-Tag: noindex");
  });

  it("has install metadata and deliberately blocks indexing", async () => {
    const manifest = JSON.parse(await read("public/site.webmanifest"));
    const robots = await read("public/robots.txt");

    expect(manifest).toMatchObject({
      name: "Saving Ryan",
      start_url: "/",
      display: "standalone",
    });
    expect(manifest.icons).toContainEqual(
      expect.objectContaining({
        src: "/icons/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      }),
    );
    expect(robots).toContain("Disallow: /");
  });

  it("ships correctly sized PWA and iOS home-screen icons", async () => {
    await expect(readPngDimensions("public/icons/app-icon-192.png")).resolves.toEqual({
      width: 192,
      height: 192,
    });
    await expect(readPngDimensions("public/icons/app-icon-512.png")).resolves.toEqual({
      width: 512,
      height: 512,
    });
    await expect(
      readPngDimensions("public/icons/apple-touch-icon.png"),
    ).resolves.toEqual({
      width: 180,
      height: 180,
    });
  });
});
