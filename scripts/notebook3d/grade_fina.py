# grade_fina.py <saida> x0 y0 x1 y1 [passo_mm] [largura]: planta deck2 (sem adesivos) com grade fina em mm do referencial da planta
import sys
from PIL import Image, ImageDraw
PX = 5
X0, Y0, X1, Y1 = [float(v) for v in sys.argv[2:6]]
step = float(sys.argv[6]) if len(sys.argv) > 6 else 2
W = int(sys.argv[7]) if len(sys.argv) > 7 else 1200
im = Image.open('plantas/deck2.jpg').convert('RGB').crop((int((X0 + 179.8) * PX), int((238 - Y1) * PX), int((X1 + 179.8) * PX), int((238 - Y0) * PX)))
s = W / im.width
im = im.resize((W, int(im.height * s)), Image.LANCZOS)
d = ImageDraw.Draw(im)
x = (int(X0 / step) + 1) * step
while x < X1:
    px = (x - X0) * PX * s
    d.line([(px, 0), (px, im.height)], fill=(255, 255, 0) if abs(x % 10) < 1e-6 else (255, 0, 255), width=1)
    if abs(x % 10) < 1e-6: d.text((px + 2, 2), '%g' % x, fill=(255, 255, 0))
    x += step
y = (int(Y0 / step) + 1) * step
while y < Y1:
    py = (Y1 - y) * PX * s
    d.line([(0, py), (im.width, py)], fill=(255, 255, 0) if abs(y % 10) < 1e-6 else (255, 0, 255), width=1)
    if abs(y % 10) < 1e-6: d.text((2, py + 2), '%g' % y, fill=(255, 255, 0))
    y += step
im.save(sys.argv[1], quality=90)
