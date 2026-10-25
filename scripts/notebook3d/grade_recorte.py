# grade_recorte.py: o recorte (lado esquerdo de trabalho/gc_<id>.jpg) ampliado com grade de 1 mm e rótulos em mm do modelo
import sys, cv2
from PIL import Image, ImageDraw
CAIXAS = {'xC': (159, 149, 173, 172), 'xD': (159, 130, 172, 146), 'xG': (28, 210, 43, 224), 'xH': (57, 211, 87, 226), 'xI': (144, 206, 171, 227)}
OUT, M, Z = 10, 2.5, 3
for sid in sys.argv[1:]:
    x0, y0, x1, y1 = CAIXAS[sid]
    X0, Y1 = x0 - M, y1 + M
    W = int((x1 - x0 + 2 * M) * OUT)
    im = Image.open('trabalho/gc_%s.jpg' % sid).convert('RGB')
    im = im.crop((0, 0, W, im.height)).resize((W * Z, im.height * Z), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    x = int(X0) + 1
    while x < X0 + W / OUT:
        px = (x - X0) * OUT * Z
        d.line([(px, 0), (px, im.height)], fill=(255, 255, 0) if x % 5 == 0 else (255, 0, 255), width=1)
        if x % 2 == 0: d.text((px + 2, 2), str(x), fill=(255, 255, 0))
        x += 1
    y = int(Y1)
    while y > Y1 - im.height / Z / OUT:
        py = (Y1 - y) * OUT * Z
        d.line([(0, py), (im.width, py)], fill=(255, 255, 0) if y % 5 == 0 else (255, 0, 255), width=1)
        if y % 2 == 0: d.text((2, py + 2), str(y), fill=(255, 255, 0))
        y -= 1
    im.save('grid/rec_%s.jpg' % sid, quality=88)
