"""Side-by-side mockup | app at matching 390x845 (3x)."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

MOCK = Path("/workspace/sujood-mockups")
SHOTS = Path("/workspace/sujood-work/shots")
OUT = Path("/workspace/sujood-compare")
OUT.mkdir(parents=True, exist_ok=True)

SCREENS = [
    "splash","onboarding","home","azan","month","qibla","tasbih",
    "quran-list","quran-reader","hadith","books","books-reader",
    "names","mosques","notifications","settings",
]

def font(size, bold=False):
    path = "/usr/share/fonts/truetype/sand-box/google/Plus Jakarta Sans/PlusJakartaSans-VariableFont_wght.ttf"
    try:
        return ImageFont.truetype(path, size=size)
    except Exception:
        return ImageFont.load_default()

def main():
    names = sys.argv[1].split(",") if len(sys.argv) > 1 else SCREENS
    for name in names:
        m = Image.open(MOCK / f"{name}.png").convert("RGB")
        s = Image.open(SHOTS / f"{name}.png").convert("RGB")
        # both should be 1170x2535 if 390x845 @3x
        target = (1170, 2535)
        m = m.resize(target, Image.Resampling.LANCZOS)
        s = s.resize(target, Image.Resampling.LANCZOS)
        pad = 40
        label_h = 56
        canvas = Image.new("RGB", (target[0] * 2 + pad * 3, target[1] + label_h + pad), (255, 252, 250))
        canvas.paste(m, (pad, label_h))
        canvas.paste(s, (pad * 2 + target[0], label_h))
        d = ImageDraw.Draw(canvas)
        f = font(28)
        d.text((pad, 16), "MOCKUP", fill=(58, 47, 42), font=f)
        d.text((pad * 2 + target[0], 16), "APP", fill=(58, 47, 42), font=f)
        dest = OUT / f"{name}.png"
        canvas.save(dest, optimize=True)
        # also a smaller preview
        preview = canvas.copy()
        preview.thumbnail((900, 1100), Image.Resampling.LANCZOS)
        preview.convert("RGB").save(f"/workspace/sujood-work/cmp-{name}.jpg", quality=88)
        print("compare", dest, dest.stat().st_size)
        # simple pixel diff stats
        import numpy as np
        a = np.asarray(m).astype("float")
        b = np.asarray(s).astype("float")
        if a.shape == b.shape:
            mae = float(np.mean(np.abs(a - b)))
            print(f"  MAE {mae:.2f}")

if __name__ == "__main__":
    main()
