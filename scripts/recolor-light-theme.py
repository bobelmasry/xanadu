#!/usr/bin/env python3
"""Recolor light-on-dark logo assets for the light (white) theme.

The BrandMarkAssembly silhouette (`public/logos/parts/base.png`) was drawn as
a near-white outline for the old dark background — invisible on white. This
script remaps it to brand navy (#3D5A80), preserving per-pixel luminance
(anti-aliasing) and alpha. Idempotent-ish: running it on an already-navy
base.png is a no-op in practice (navy luminance remap stays navy).

Usage: python3 scripts/recolor-light-theme.py
"""
from PIL import Image
from pathlib import Path

TARGET = (0x3D, 0x5A, 0x80)  # --accent-primary
ROOT = Path(__file__).resolve().parent.parent


def remap(path: Path) -> None:
    im = Image.open(path).convert("RGBA")
    px = im.load()
    changed = 0
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # Grayscale-ish mark: use max-channel as luminance so AA edges fade.
            lum = max(r, g, b) / 255.0
            nr, ng, nb = (round(c * lum) for c in TARGET)
            if (nr, ng, nb) != (r, g, b):
                px[x, y] = (nr, ng, nb, a)
                changed += 1
    im.save(path)
    print(f"{path.relative_to(ROOT)}: {changed} px remapped -> navy {TARGET}")


if __name__ == "__main__":
    remap(ROOT / "public" / "logos" / "parts" / "base.png")
