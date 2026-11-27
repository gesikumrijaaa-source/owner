import sys, os, shutil
from PIL import Image, ImageDraw, ImageOps
src, out = sys.argv[1], sys.argv[2]
P = lambda n: os.path.join(src, f"WhatsApp Image 2026-11-27 at {n}.jpeg")
pairs = {
 "pair-1-before": "19.50.20", "pair-1-after": "19.50.20 (1)",
 "pair-2-before": "19.50.19 (1)", "pair-2-after": "19.50.20 (19)",
 "pair-3-before": "19.50.19 (2)", "pair-3-after": "19.50.19 (3)",
 "pair-4-before": "19.50.19 (4)", "pair-4-after": "19.50.20 (12)",
}
gallery = ["19.50.20 (11)","19.50.20 (14)","19.50.20 (7)","19.50.20 (13)","19.50.20 (17)",
 "19.50.20 (2)","19.50.20 (16)","19.50.20 (8)","19.50.20 (5)","19.50.20 (10)",
 "19.50.20 (3)","19.50.20 (9)","19.50.20 (15)","19.50.20 (6)","19.50.20 (18)","19.50.20 (4)"]
names = dict(pairs)
for i,g in enumerate(gallery,1): names[f"bathroom-{i:02d}"] = g
img = os.path.join(out,"site","img"); orig = os.path.join(out,"foto-originali")
os.makedirs(img, exist_ok=True); os.makedirs(orig, exist_ok=True)
for name, n in names.items():
    im = ImageOps.exif_transpose(Image.open(P(n))).convert("RGB")
    shutil.copy(P(n), os.path.join(orig, name+".jpg"))
    for w in (800, 1600):
        x = im.copy()
        if x.width > w: x = x.resize((w, round(x.height*w/x.width)), Image.LANCZOS)
        x.save(os.path.join(img, f"{name}-{w}.webp"), "WEBP", quality=78, method=6)
    print(name, im.size)
# logo
shutil.copy(P("19.50.19"), os.path.join(orig, "logo.jpg"))
L = Image.open(P("19.50.19")).convert("RGBA"); W = L.width
r = int(W*float(sys.argv[3])) ; c = W//2
m = Image.new("L", (W*4, W*4), 0); ImageDraw.Draw(m).ellipse((4*(c-r),4*(c-r),4*(c+r),4*(c+r)), fill=255)
m = m.resize((W,W), Image.LANCZOS); L.putalpha(m); L = L.crop((c-r,c-r,c+r,c+r))
for s in (512, 192, 64, 32):
    L.resize((s,s), Image.LANCZOS).save(os.path.join(img, f"logo-{s}.png"))
L.resize((180,180), Image.LANCZOS).save(os.path.join(img, "apple-touch-icon.png"))
# og image: hero after
og = ImageOps.fit(Image.open(P("19.50.20 (1)")).convert("RGB"), (1200,630)); og.save(os.path.join(img,"og.jpg"), quality=82)
