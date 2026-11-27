"""Hero reel for Roland Luxury Bathrooms: finished bathrooms only.

Opening "lights on" on the black twin-basin bathroom, slow camera moves, split-screen panels with
gold dividers, a quick-cut detail burst, and gold-seam / zoom / light-sweep transitions.
Warm grade and vignette. Loops seamlessly.

usage: python3 -I reel.py <foto-originali dir> <out dir> landscape|portrait
"""
import sys, os, math, subprocess
import numpy as np
from PIL import Image, ImageFilter

SRC, OUT, MODE = sys.argv[1], sys.argv[2], sys.argv[3]
FPS = 30
GOLD = np.array([236, 204, 140], dtype=np.float32)
ONYX = np.array([21, 18, 15], dtype=np.float32)

def mv(z0, z1, c0, c1):
    return dict(z=(z0, z1), c0=c0, c1=c1)

PUSH = mv(1.00, 1.12, (0.5, 0.5), (0.5, 0.5))
SLOWPUSH = mv(1.00, 1.08, (0.5, 0.5), (0.5, 0.5))
PULL = mv(1.13, 1.00, (0.5, 0.5), (0.5, 0.5))
PAN_R = mv(1.10, 1.12, (0.30, 0.5), (0.70, 0.5))
PAN_L = mv(1.10, 1.12, (0.70, 0.5), (0.30, 0.5))
TILT_D = mv(1.03, 1.08, (0.5, 0.22), (0.5, 0.78))
TILT_U = mv(1.03, 1.08, (0.5, 0.78), (0.5, 0.22))
DRIFT_D = mv(1.02, 1.06, (0.5, 0.40), (0.5, 0.60))
DRIFT_U = mv(1.02, 1.06, (0.5, 0.60), (0.5, 0.40))

def shot(name, dur, move, tin, tlen, **kw):
    return dict(kind="shot", name=name, dur=dur, move=move, tin=tin, tlen=tlen, **kw)

def panels(names, dur, tin="cut", tlen=0.0):
    return dict(kind="panels", names=names, dur=dur, tin=tin, tlen=tlen)

def detail(name, c, z=1.22):
    return shot(name, 0.85, mv(z, z + 0.07, c, c), "cut", 0.0)

if MODE == "landscape":
    W, H = 1280, 720
    TIMELINE = [
        shot("pair-1-after", 3.8, SLOWPUSH, "seam_r", 0.6, lights=True),
        shot("bathroom-02", 2.6, TILT_D, "zoom", 0.55),
        panels(["bathroom-06", "bathroom-09", "bathroom-13"], 3.1),
        shot("bathroom-04", 2.5, PAN_L, "seam_l", 0.6),
        shot("bathroom-05", 0.85, mv(1.22, 1.29, (0.42, 0.62), (0.42, 0.62)), "sweep", 0.5),
        detail("bathroom-03", (0.55, 0.45)),
        detail("bathroom-12", (0.40, 0.45)),
        detail("bathroom-14", (0.45, 0.55)),
        shot("pair-3-after", 2.5, PAN_R, "zoom", 0.55),
        shot("bathroom-15", 2.5, TILT_D, "seam_d", 0.6),
        panels(["bathroom-10", "pair-4-after", "bathroom-16"], 3.1),
        shot("bathroom-01", 2.5, PULL, "seam_r", 0.6),
        shot("bathroom-11", 2.5, TILT_U, "sweep", 0.6),
        shot("bathroom-07", 2.5, TILT_D, "zoom", 0.55),
        shot("bathroom-08", 2.7, PAN_R, "seam_l", 0.6),
    ]
else:
    W, H = 720, 1280
    TIMELINE = [
        shot("pair-1-after", 3.8, mv(1.00, 1.04, (0.20, 0.5), (0.62, 0.5)), "seam_r", 0.6, lights=True),
        shot("bathroom-02", 2.6, PUSH, "zoom", 0.55),
        panels(["bathroom-04", "bathroom-01"], 3.1),
        shot("bathroom-05", 2.5, TILT_U, "seam_l", 0.6),
        shot("bathroom-03", 0.85, mv(1.12, 1.19, (0.5, 0.5), (0.5, 0.5)), "sweep", 0.5),
        detail("bathroom-12", (0.5, 0.45), 1.12),
        detail("bathroom-14", (0.5, 0.5), 1.12),
        detail("bathroom-09", (0.5, 0.5), 1.12),
        shot("bathroom-15", 2.5, PULL, "zoom", 0.55),
        shot("pair-4-after", 2.5, PUSH, "seam_d", 0.6),
        panels(["bathroom-08", "pair-3-after"], 3.1),
        shot("bathroom-10", 2.5, TILT_D, "seam_r", 0.6),
        shot("bathroom-11", 2.5, PUSH, "sweep", 0.6),
        shot("pair-2-after", 2.5, TILT_U, "zoom", 0.55),
        shot("bathroom-13", 2.7, TILT_D, "seam_l", 0.6),
    ]

cache = {}
def load(name):
    if name not in cache:
        cache[name] = Image.open(os.path.join(SRC, name + ".jpg")).convert("RGB")
    return cache[name]

def ease(p):
    p = min(max(p, 0.0), 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * p)

def ease_out(p):
    p = min(max(p, 0.0), 1.0)
    return 1 - (1 - p) ** 3

def smooth(p):
    p = min(max(p, 0.0), 1.0)
    return 0.15 * p + 0.85 * ease(p)

def camera(name, p, move, size, sharpen=True):
    img = load(name)
    sw, sh = img.size
    ow, oh = size
    a = ow / oh
    bw, bh = (sw, sw / a) if sw / sh < a else (sh * a, sh)
    e = smooth(p)
    z = move["z"][0] + (move["z"][1] - move["z"][0]) * e
    cw, ch = bw / z, bh / z
    cx = (move["c0"][0] + (move["c1"][0] - move["c0"][0]) * e) * sw
    cy = (move["c0"][1] + (move["c1"][1] - move["c0"][1]) * e) * sh
    x0 = min(max(cx - cw / 2, 0), sw - cw)
    y0 = min(max(cy - ch / 2, 0), sh - ch)
    out = img.transform((ow, oh), Image.EXTENT, (x0, y0, x0 + cw, y0 + ch), Image.BICUBIC)
    if sharpen and cw < ow * 1.05:  # only when upscaling
        out = out.filter(ImageFilter.UnsharpMask(radius=1.3, percent=40, threshold=2))
    return np.asarray(out, dtype=np.float32)

def zoom_frame(F, z):
    if abs(z - 1) < 1e-3:
        return F
    im = Image.fromarray(np.clip(F, 0, 255).astype(np.uint8))
    cw, ch = W / z, H / z
    x0, y0 = (W - cw) / 2, (H - ch) / 2
    return np.asarray(im.transform((W, H), Image.EXTENT, (x0, y0, x0 + cw, y0 + ch), Image.BICUBIC), dtype=np.float32)

XS = np.arange(W, dtype=np.float32)[None, :, None]
YS = np.arange(H, dtype=np.float32)[:, None, None]
nx, ny = (XS / W - 0.5) * 2, (YS / H - 0.5) * 2
VIGNETTE = 1.0 - 0.30 * np.clip((nx ** 2 + ny ** 2) / 2.0, 0, 1) ** 1.3
DIAG = (XS + YS * 0.55) / (W + H * 0.55)

def grade(F):
    F = (F - 128.0) * 1.07 + 128.0
    F = F * np.array([1.025, 1.0, 0.965], dtype=np.float32)
    return F * VIGNETTE

def render_panels(seg, t):
    names = seg["names"]
    n = len(names)
    horizontal = MODE == "landscape"  # side by side in landscape, stacked in portrait
    F = np.empty((H, W, 3), dtype=np.float32); F[:] = ONYX
    p = t / seg["dur"]
    gap = 2
    for i, name in enumerate(names):
        if horizontal:
            x0 = round(i * W / n); x1 = round((i + 1) * W / n)
            size = (x1 - x0, H)
        else:
            y0 = round(i * H / n); y1 = round((i + 1) * H / n)
            size = (W, y1 - y0)
        move = (DRIFT_D if i % 2 == 0 else DRIFT_U) if horizontal else (PAN_R if i % 2 == 0 else PAN_L)
        P = camera(name, p, move, size, sharpen=False)
        k = ease_out((t - 0.12 * i) / 0.75)  # staggered slide-in
        if k <= 0:
            continue
        if horizontal:
            off = int(round((1 - k) * H)) * (1 if i % 2 == 0 else -1)
            ys, ye = max(0, off), min(H, H + off)
            F[ys:ye, x0:x1] = P[ys - off:ye - off]
        else:
            off = int(round((1 - k) * W)) * (1 if i % 2 == 0 else -1)
            xs, xe = max(0, off), min(W, W + off)
            F[y0:y1, xs:xe] = P[:, xs - off:xe - off]
    # gold dividers draw in after the panels land
    g = ease((t - 0.55) / 0.5)
    if g > 0:
        for i in range(1, n):
            if horizontal:
                x = round(i * W / n)
                L = int(H * g)
                F[:L, x - gap // 2:x + gap // 2] = GOLD
            else:
                y = round(i * H / n)
                L = int(W * g)
                F[y - gap // 2:y + gap // 2, :L] = GOLD
    return F

def render(seg, t):
    if seg["kind"] == "panels":
        return render_panels(seg, t)
    F = camera(seg["name"], t / seg["dur"], seg["move"], (W, H))
    if seg.get("lights"):  # room starts dim and the lights come up
        k = ease((t - 0.15) / 1.4)
        F = F * (0.22 + 0.78 * k)
    return F

def seam_layer(A, B, a, axis, reverse):
    coord, size = (XS, W) if axis == "x" else (YS, H)
    pos = size * (1 - a) if not reverse else size * a
    m = np.clip((coord - pos) / 2.0 + 0.5, 0, 1) if not reverse else np.clip((pos - coord) / 2.0 + 0.5, 0, 1)
    F = A * (1 - m) + B * m
    if 0 < a < 1:
        d = np.abs(coord - pos)
        k = np.clip(np.clip(1.8 - d, 0, 1) + np.exp(-(d / 16.0) ** 2) * 0.38, 0, 1)
        F = F * (1 - k) + GOLD * k
    return F

def transition(kind, A, B, a):
    if kind == "zoom":  # punch through: outgoing scales up, incoming settles in
        A = zoom_frame(A, 1 + 0.18 * a)
        B = zoom_frame(B, 1 + 0.10 * (1 - a))
        m = ease((a - 0.25) / 0.5)
        return A * (1 - m) + B * m
    if kind == "sweep":  # gold light passes across, the cut hides under it
        m = ease((a - 0.3) / 0.4)
        F = A * (1 - m) + B * m
        band = np.exp(-((DIAG - (-0.25 + 1.5 * a)) / 0.08) ** 2) * 0.5
        return F + (GOLD - F) * band * (F / 255.0) ** 0.4
    if kind == "seam_r":
        return seam_layer(A, B, a, "x", False)
    if kind == "seam_l":
        return seam_layer(A, B, a, "x", True)
    if kind == "seam_d":
        return seam_layer(A, B, a, "y", True)
    return A * (1 - a) + B * a

# timeline: each segment overlaps the previous one by its own incoming transition length
n = len(TIMELINE)
starts = [0.0]
for k in range(1, n):
    starts.append(starts[-1] + TIMELINE[k - 1]["dur"] - TIMELINE[k]["tlen"])
TOTAL = starts[-1] + TIMELINE[-1]["dur"] - TIMELINE[0]["tlen"]
NF = int(round(TOTAL * FPS))
OFFSET = TIMELINE[0]["tlen"]  # frame 0 shows the opening shot on its own

os.makedirs(OUT, exist_ok=True)
name = f"roland-reel-{'16x9' if MODE == 'landscape' else '9x16'}"
mp4 = os.path.join(OUT, name + ".mp4")
ff = subprocess.Popen([
    "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
    "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "23",
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", mp4], stdin=subprocess.PIPE)

poster = None
for i in range(NF):
    T = (i / FPS + OFFSET) % TOTAL
    active = []
    for k in range(n):
        t = (T - starts[k]) % TOTAL
        if t < TIMELINE[k]["dur"]:
            active.append((t, k))
    active.sort(reverse=True)  # outgoing first, incoming last
    t1, k1 = active[0]
    F = render(TIMELINE[k1], t1)
    if len(active) > 1:
        t2, k2 = active[-1]
        seg = TIMELINE[k2]
        if seg["tlen"] > 0:
            F = transition(seg["tin"], F, render(seg, t2), ease(t2 / seg["tlen"]))
        else:
            F = render(seg, t2)
    frame = np.clip(grade(F), 0, 255).astype(np.uint8)
    if poster is None and len(active) == 1 and k1 == 0 and t1 >= 1.8:
        poster = frame
    ff.stdin.write(frame.tobytes())
ff.stdin.close(); ff.wait()
Image.fromarray(poster).save(os.path.join(OUT, name + "-poster.webp"), "WEBP", quality=74)
print(mp4, f"{TOTAL:.1f}s", NF, "frames", os.path.getsize(mp4) // 1024, "KB")
