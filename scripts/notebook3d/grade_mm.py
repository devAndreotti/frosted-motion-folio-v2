# grade_mm.py <saida> [x0 y0 x1 y1 em mm do modelo] [largura]: planta deck2 com os adesivos colocados e grade em mm do modelo
import json, sys
from PIL import Image, ImageDraw
PX = 5
X0, Y0, X1, Y1 = [float(v) for v in sys.argv[2:6]] if len(sys.argv) >= 6 else (-179.8, 0, 179.8, 238)
W = int(sys.argv[6]) if len(sys.argv) >= 7 else 1500
base = Image.open('plantas/deck2.jpg').convert('RGBA')
d = ImageDraw.Draw(base)
for s in json.load(open('saida/decals.json')):
    if s['sup'] != 'deck': continue
    b = ((s['cx'] - s['w'] / 2 + 179.8) * PX, (238 - s['cy'] - s['h'] / 2) * PX, (s['cx'] + s['w'] / 2 + 179.8) * PX, (238 - s['cy'] + s['h'] / 2) * PX)
    d.rectangle(b, outline=(0, 255, 255, 255), width=2)
c = base.crop(((X0 + 179.8) * PX, (238 - Y1) * PX, (X1 + 179.8) * PX, (238 - Y0) * PX)).convert('RGB')
s = W / c.width
c = c.resize((W, int(c.height * s)))
d = ImageDraw.Draw(c)
step = 10 if X1 - X0 > 120 else 5
x = (int(X0) // step + 1) * step
while x < X1:
    px = (x - X0) * PX * s
    d.line([(px, 0), (px, c.height)], fill=(255, 255, 0) if x % 50 == 0 else (255, 0, 255), width=1); d.text((px + 2, 2), str(x), fill=(255, 255, 0)); x += step
y = (int(Y0) // step + 1) * step
while y < Y1:
    py = (Y1 - y) * PX * s
    d.line([(0, py), (c.width, py)], fill=(255, 255, 0) if y % 50 == 0 else (255, 0, 255), width=1); d.text((2, py + 2), str(y), fill=(255, 255, 0)); y += step
c.save(sys.argv[1], quality=88)
