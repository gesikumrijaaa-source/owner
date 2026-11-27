"""Render a looping hero reel from real photos: slow camera moves + gold-seam before/after wipes.
usage: python3 -I reel.py <photos_dir> <out_dir> landscape|portrait
"""
import sys, os, math, subprocess
import numpy as np
from PIL import Image

SRC, OUT, MODE = sys.argv[1], sys.argv[2], sys.argv[3]
FPS = 30
XF = 0.9  # crossfade seconds
GOLD = np.array([232, 201, 138], dtype=np.float32)

if MODE == "landscape":
    W, H = 1280, 720
    SHOTS = [
        dict(kind="reveal", a="pair-1-before", b="pair-1-after", dur=6.4, z=(1.02, 1.10), c0=(0.50, 0.52), c1=(0.47, 0.50)),
        dict(kind="still", a="bathroom-04", dur=4.0, z=(1.10, 1.02), c0=(0.62, 0.50), c1=(0.42, 0.50)),
        dict(kind="reveal", a="pair-3-before", b="pair-3-after", dur=6.4, z=(1.00, 1.08), c0=(0.50, 0.56), c1=(0.52, 0.50)),
        dict(kind="still", a="bathroom-01", dur=4.0, z=(1.00, 1.09), c0=(0.45, 0.50), c1=(0.55, 0.46)),
        dict(kind="reveal", a="pair-4-before", b="pair-4-after", dur=6.4, z=(1.00, 1.06), c0=(0.50, 0.56), c1=(0.50, 0.50)),
        dict(kind="still", a="bathroom-08", dur=4.0, z=(1.08, 1.00), c0=(0.40, 0.50), c1=(0.55, 0.52)),
    ]
else:
    W, H = 720, 1280
    SHOTS = [
        dict(kind="reveal", a="pair-2-before", b="pair-2-after", dur=6.4, z=(1.02, 1.10), c0=(0.50, 0.52), c1=(0.50, 0.48)),
        dict(kind="still", a="bathroom-06", dur=4.0, z=(1.10, 1.02), c0=(0.50, 0.40), c1=(0.50, 0.58)),
        dict(kind="reveal", a="pair-4-before", b="pair-4-after", dur=6.4, z=(1.00, 1.08), c0=(0.50, 0.50), c1=(0.50, 0.55)),
        dict(kind="still", a="bathroom-09", dur=4.0, z=(1.00, 1.08), c0=(0.50, 0.55), c1=(0.50, 0.45)),
        dict(kind="reveal", a="pair-3-before", b="pair-3-after", dur=6.4, z=(1.00, 1.06), c0=(0.62, 0.50), c1=(0.58, 0.50)),
        dict(kind="still", a="bathroom-13", dur=4.0, z=(1.08, 1.00), c0=(0.50, 0.45), c1=(0.50, 0.55)),
    ]

cache = {}
def load(name):
    if name not in cache:
        cache[name] = Image.open(os.path.join(SRC, name + ".jpg")).convert("RGB")
    return cache[name]

def ease(p):
    p = min(max(p, 0.0), 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * p)

def camera(img, p, z, c0, c1):
    """Crop with output aspect, zoom z(p), centre c(p); sub-pixel smooth via EXTENT."""
    sw, sh = img.size
    a = W / H
    bw, bh = (sw, sw / a) if sw / sh < a else (sh * a, sh)
    e = ease(p)
    zz = z[0] + (z[1] - z[0]) * e
    cw, ch = bw / zz, bh / zz
    cx = (c0[0] + (c1[0] - c0[0]) * e) * sw
    cy = (c0[1] + (c1[1] - c0[1]) * e) * sh
    x0 = min(max(cx - cw / 2, 0), sw - cw)
    y0 = min(max(cy - ch / 2, 0), sh - ch)
    out = img.transform((W, H), Image.EXTENT, (x0, y0, x0 + cw, y0 + ch), Image.BICUBIC)
    return np.asarray(out, dtype=np.float32)

XS = np.arange(W, dtype=np.float32)[None, :, None]

def render(shot, t):
    p = t / shot["dur"]
    A = camera(load(shot["a"]), p, shot["z"], shot["c0"], shot["c1"])
    if shot["kind"] == "still":
        return A
    B = camera(load(shot["b"]), p, shot["z"], shot["c0"], shot["c1"])
    # hold before 1.9s, wipe 1.9s (right -> left, revealing after), hold after
    wp = ease((t - 1.9) / 1.9)
    if wp <= 0:
        return A
    seam = W * (1.0 - wp)
    soft = np.clip((XS - seam) / 2.0 + 0.5, 0, 1)  # 0 left (before), 1 right (after)
    F = A * (1 - soft) + B * soft
    if 0 < wp < 1:
        d = np.abs(XS - seam)
        core = np.clip(1.6 - d, 0, 1)
        glow = np.exp(-(d / 14.0) ** 2) * 0.32
        k = np.clip(core + glow, 0, 1)
        F = F * (1 - k) + GOLD * k
    return F

starts, s = [], 0.0
for sh in SHOTS:
    starts.append(s)
    s += sh["dur"] - XF
TOTAL = s  # last shot's tail overlaps the first shot's head -> seamless loop
NF = int(round(TOTAL * FPS))

os.makedirs(OUT, exist_ok=True)
name = f"roland-reel-{'16x9' if MODE == 'landscape' else '9x16'}"
mp4 = os.path.join(OUT, name + ".mp4")
ff = subprocess.Popen([
    "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
    "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "25",
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", mp4], stdin=subprocess.PIPE)

poster = None
for i in range(NF):
    T = (i / FPS + XF) % TOTAL  # start XF in, so frame 0 is shot 0 alone; wraps seamlessly
    layers = []
    for k, sh in enumerate(SHOTS):
        t = (T - starts[k]) % TOTAL
        if t < sh["dur"]:
            layers.append((t, k))
    layers.sort(reverse=True)  # outgoing (larger t) first, incoming last
    F = render(SHOTS[layers[0][1]], layers[0][0])
    if len(layers) > 1:
        t2, k2 = layers[-1]
        a = ease(t2 / XF)
        F = F * (1 - a) + render(SHOTS[k2], t2) * a
    frame = np.clip(F, 0, 255).astype(np.uint8)
    if poster is None and len(layers) == 1 and layers[0][1] == 0 and layers[0][0] >= 4.6:
        poster = frame
    ff.stdin.write(frame.tobytes())
first = poster
ff.stdin.close(); ff.wait()
Image.fromarray(first).save(os.path.join(OUT, name + "-poster.webp"), "WEBP", quality=72)
print(mp4, f"{TOTAL:.1f}s", NF, "frames", os.path.getsize(mp4) // 1024, "KB")
