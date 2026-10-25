# overlay.py: desenha cada adesivo (arte) na planta da superfície, na posição/tamanho do decals.json, para conferir
import json
from PIL import Image, ImageDraw
dec = json.load(open('saida/decals.json'))
PL = {'deck': 'plantas/deck2.jpg', 'lid': 'plantas/lid.jpg', 'bottom': 'plantas/bottom.jpg'}
for sup, f in PL.items():
    base = Image.open(f).convert('RGBA')
    over = Image.new('RGBA', base.size, (0, 0, 0, 0))
    dr = ImageDraw.Draw(over)
    for s in dec:
        if s['sup'] != sup: continue
        art = Image.open('arte/%s.png' % s['id']).convert('RGBA')
        cx, cy, w, h = s['cx'], s['cy'], s['w'], s['h']
        if sup == 'deck': box = ((cx - w / 2 + 179.8) * 5, (238 - cy - h / 2) * 5, (cx + w / 2 + 179.8) * 5, (238 - cy + h / 2) * 5)
        elif sup == 'lid': box = ((179.8 - cx - w / 2) * 5, (cy - h / 2) * 5, (179.8 - cx + w / 2) * 5, (cy + h / 2) * 5)
        else: box = ((179.8 - cx - w / 2) * 5, (264.8 - cy - h / 2) * 5, (179.8 - cx + w / 2) * 5, (264.8 - cy + h / 2) * 5)
        box = tuple(int(round(v)) for v in box)
        a = art.resize((max(1, box[2] - box[0]), max(1, box[3] - box[1])))
        al = a.getchannel('A').point(lambda v: v * 0.55)
        a.putalpha(al)
        over.alpha_composite(a, (box[0], box[1]))
        dr.rectangle(box, outline=(255, 0, 255, 255), width=2)
        dr.text((box[0] + 3, box[1] + 3), s['id'], fill=(255, 255, 0, 255))
    base.alpha_composite(over)
    base.convert('RGB').resize((base.width * 5 // 6, base.height * 5 // 6)).save('grid/overlay_%s.jpg' % sup, quality=85)
print('ok')
