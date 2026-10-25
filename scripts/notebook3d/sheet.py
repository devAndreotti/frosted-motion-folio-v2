# sheet.py <pasta|glob> <saida> [lado]: folha de contato com nomes
import sys, glob, os
from PIL import Image, ImageDraw
fs = sorted(glob.glob(sys.argv[1]))
S = int(sys.argv[3]) if len(sys.argv) > 3 else 260
cols = 6
rows = (len(fs) + cols - 1) // cols
sh = Image.new('RGB', (cols * (S + 10), rows * (S + 28)), (45, 45, 45))
d = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f)
    if im.mode == 'RGBA':
        bg = Image.new('RGBA', im.size, (90, 90, 96, 255)); bg.alpha_composite(im); im = bg
    im = im.convert('RGB'); im.thumbnail((S, S))
    x, y = (i % cols) * (S + 10), (i // cols) * (S + 28)
    sh.paste(im, (x + 5, y + 5)); d.text((x + 6, y + S + 10), os.path.basename(f).rsplit('.', 1)[0], fill=(255, 255, 0))
sh.save(sys.argv[2], quality=86)
