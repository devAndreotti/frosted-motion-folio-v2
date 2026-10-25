# grid.py <foto> <saida> [x0 y0 x1 y1] [largura]: overlay de coordenadas (pixels da foto original)
import sys
from PIL import Image, ImageOps, ImageDraw
im = ImageOps.exif_transpose(Image.open(sys.argv[1])).convert('RGB')
box = [int(v) for v in sys.argv[3:7]] if len(sys.argv) >= 7 else [0, 0, im.width, im.height]
W = int(sys.argv[7]) if len(sys.argv) >= 8 else 1500
c = im.crop(box)
s = W / c.width
c = c.resize((W, int(c.height * s)))
d = ImageDraw.Draw(c)
span = box[2] - box[0]
step = next(v for v in (10, 20, 25, 50, 100, 200, 250, 500) if span / v <= 24)
for x in range((box[0] // step + 1) * step, box[2], step):
    X = (x - box[0]) * s
    d.line([(X, 0), (X, c.height)], fill=(255, 255, 0) if x % (step * 5) == 0 else (255, 0, 255), width=1)
    d.text((X + 2, 2), str(x), fill=(255, 255, 0))
for y in range((box[1] // step + 1) * step, box[3], step):
    Y = (y - box[1]) * s
    d.line([(0, Y), (c.width, Y)], fill=(255, 255, 0) if y % (step * 5) == 0 else (255, 0, 255), width=1)
    d.text((2, Y + 2), str(y), fill=(255, 255, 0))
c.save(sys.argv[2], quality=88)
