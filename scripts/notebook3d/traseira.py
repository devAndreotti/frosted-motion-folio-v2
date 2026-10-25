# traseira.py: textura do topo do bloco traseiro (X -176..176, Y 240.5..262.6), lida de trás:
# imagem à esquerda = X positivo, embaixo = borda de trás. Pontinhos em relevo e as legendas das portas.
import numpy as np
from PIL import Image, ImageDraw, ImageFont
PX = 8
X0, X1, Y0, Y1 = -176.0, 176.0, 240.5, 262.6
W, H = int((X1 - X0) * PX), int((Y1 - Y0) * PX)
im = Image.new('RGB', (W, H), (30, 31, 34))
a = np.asarray(im).astype(np.int16)
yy, xx = np.mgrid[0:H, 0:W]
p = 0.9 * PX   # pontinhos de 0,9 mm em grade alternada
dots = ((xx % p - p / 2) ** 2 + ((yy + (xx // p % 2) * p / 2) % p - p / 2) ** 2) < (0.22 * PX) ** 2
a[dots] += 14
im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
d = ImageDraw.Draw(im)
def px(x): return (X1 - x) * PX          # de trás: X positivo à esquerda
def py(y): return (Y1 - y) * PX          # borda de trás embaixo
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(2.2 * PX))
COR = (150, 152, 158)
def txt(x, y, s, f=F):
    bb = d.textbbox((0, 0), s, font=f); d.text((px(x) - (bb[2] - bb[0]) / 2, py(y) - (bb[3] - bb[1]) / 2 - bb[1]), s, fill=COR, font=f)
def usb(x, y):   # ícone SuperSpeed 10 Gbps: seta dupla + 10
    cx, cy = px(x), py(y); s = PX
    d.line([cx - 2.6 * s, cy, cx + 1.0 * s, cy], fill=COR, width=max(1, int(0.25 * s)))
    d.polygon([(cx + 1.0 * s, cy - 0.6 * s), (cx + 1.8 * s, cy), (cx + 1.0 * s, cy + 0.6 * s)], fill=COR)
    d.ellipse([cx - 3.2 * s, cy - 0.6 * s, cx - 2.0 * s, cy + 0.6 * s], outline=COR, width=max(1, int(0.2 * s)))
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(1.6 * PX))
    d.text((cx + 2.2 * s, cy - 1.0 * s), '10', fill=COR, font=f)
def lan(x, y):   # ícone de rede: três quadradinhos ligados
    cx, cy = px(x), py(y); s = PX; w = max(1, int(0.22 * s))
    for ox, oy in ((0, -1.1), (-1.6, 1.0), (1.6, 1.0)):
        d.rectangle([cx + (ox - 0.55) * s, cy + (oy - 0.45) * s, cx + (ox + 0.55) * s, cy + (oy + 0.45) * s], outline=COR, width=w)
    d.line([cx, cy - 0.65 * s, cx, cy + 0.2 * s], fill=COR, width=w); d.line([cx - 1.6 * s, cy + 0.2 * s, cx + 1.6 * s, cy + 0.2 * s], fill=COR, width=w)
    d.line([cx - 1.6 * s, cy + 0.2 * s, cx - 1.6 * s, cy + 0.55 * s], fill=COR, width=w); d.line([cx + 1.6 * s, cy + 0.2 * s, cx + 1.6 * s, cy + 0.55 * s], fill=COR, width=w)
LY = 259.4
usb(45.0, LY); usb(23.0, LY); lan(1.0, LY); txt(-21.0, LY, 'HDMI')
im.save('texturas/traseira_topo.png'); print(im.size)
