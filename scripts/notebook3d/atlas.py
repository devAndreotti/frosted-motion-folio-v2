# atlas.py: encaixa cada arte na silhueta do recorte (escala/posição), monta o atlas e saida/decals.json
#   texturas/adesivos.png (RGBA: arte + recorte), texturas/adesivos_mr.png (R = iridescência, G = rugosidade, B = filme holográfico)
import json, os, cv2, numpy as np
from PIL import Image
OUT = 12        # px/mm dos recortes
S = 6.0         # px/mm no atlas (38 adesivos cabem em 2048²; o gltf-transform reduziria um atlas maior pela metade)
AW = 2048
d = json.load(open('adesivos.json'))
H_old = np.array(json.load(open('plantas/homografias.json'))['deck']['H'])
M_new = np.array(d['_frames']['deck_M_foto16_para_planta'])
def deck_old_to_model(pts):
    p = cv2.perspectiveTransform(np.float32(pts).reshape(-1, 1, 2) * 5, np.linalg.inv(H_old))
    p = cv2.perspectiveTransform(p, M_new).reshape(-1, 2) / 5
    return np.stack([p[:, 0] - 179.8, 238 - p[:, 1]], 1)
def to_model(sup, pts):
    pts = np.float32(pts)
    if sup == 'deck': return deck_old_to_model(pts)
    if sup == 'lid': return np.stack([179.8 - pts[:, 0], pts[:, 1]], 1)
    return np.stack([179.8 - pts[:, 0], 264.8 - pts[:, 1]], 1)
def _mascara_recorte(img):  # (não usada: o encaixe por correlação errava em adesivos retangulares)
    lab = cv2.cvtColor(cv2.medianBlur(img, 5), cv2.COLOR_BGR2LAB).astype(np.float32)
    b = np.concatenate([lab[:6].reshape(-1, 3), lab[-6:].reshape(-1, 3), lab[:, :6].reshape(-1, 3), lab[:, -6:].reshape(-1, 3)])
    m = (np.sqrt(((lab - np.median(b, 0)) ** 2).sum(-1)) > 24).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    return m.astype(np.float32)
itens = []
for sup in ('lid', 'deck', 'bottom'):
    for s in d[sup]:
        f = 'arte/%s.png' % s['id']
        if not os.path.exists(f): print('sem arte:', s['id']); continue
        art = Image.open(f).convert('RGBA')
        if s.get('modelo_rect'):   # formas holográficas: já em mm do modelo
            X0, Y0, X1, Y1 = s['modelo_rect']
            itens.append({'id': s['id'], 'sup': sup, 'cx': round((X0 + X1) / 2, 2), 'cy': round((Y0 + Y1) / 2, 2), 'w': round(X1 - X0, 2), 'h': round(Y1 - Y0, 2),
                          'iou': 0.0, 'holo': True, 'art': art})
            continue
        x0, y0, x1, y1 = s['bbox_mm']
        meta = 'arte/%s.json' % s['id']
        if os.path.exists(meta):
            px0, py0, px1, py1 = json.load(open(meta))['rect_mm']
        else:
            px0, py0, px1, py1 = x0, y0, x1, y1
        if s.get('tamanho_mm'):   # mesma peça de fábrica medida em outro lugar: mantém o centro da caixa
            c, e = ((x0 + x1) / 2, (y0 + y1) / 2), s['tamanho_mm']
            px0, py0, px1, py1 = c[0] - e[0] / 2, c[1] - e[1] / 2, c[0] + e[0] / 2, c[1] + e[1] / 2
        iou = 0.0
        q = to_model(sup, [[px0, py0], [px1, py0], [px1, py1], [px0, py1]])
        cx, cy = q.mean(0)
        wmm = (np.linalg.norm(q[1] - q[0]) + np.linalg.norm(q[2] - q[3])) / 2
        hmm = (np.linalg.norm(q[3] - q[0]) + np.linalg.norm(q[2] - q[1])) / 2
        itens.append({'id': s['id'], 'sup': sup, 'cx': round(float(cx), 2), 'cy': round(float(cy), 2), 'w': round(float(wmm), 2), 'h': round(float(hmm), 2),
                      'iou': round(float(iou), 3), 'holo': s['brilho'] == 'holo', 'art': art})
        print('%-16s %-6s %5.1f x %5.1f mm em (%6.1f, %6.1f)' % (s['id'], sup, wmm, hmm, cx, cy))
# empacotamento em prateleiras
itens.sort(key=lambda it: -it['h'])
x = y = sh = 0
PAD = 6
for it in itens:
    pw, ph = int(round(it['w'] * S)), int(round(it['h'] * S))
    if x + pw + PAD > AW: x, y, sh = 0, y + sh + PAD, 0
    it['px'] = (x, y, pw, ph); x += pw + PAD; sh = max(sh, ph)
AH = 1 << int(np.ceil(np.log2(y + sh + PAD)))
cor = Image.new('RGBA', (AW, AH), (0, 0, 0, 0))
mr = np.zeros((AH, AW, 3), np.uint8); mr[..., 1] = 150
for it in itens:
    x, y, pw, ph = it['px']
    a = it['art'].resize((pw, ph), Image.LANCZOS)
    arr = np.asarray(a).astype(np.float32) / 255
    # estende a cor para fora do recorte (sem franja escura nos mipmaps)
    rgb = arr[..., :3].copy(); al = arr[..., 3]
    inside = (al > 0.5).astype(np.uint8)
    if inside.any():
        dist, lab = cv2.distanceTransformWithLabels(1 - inside, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
        ys, xs = np.where(inside)
        idx = np.zeros(lab.max() + 1, int); idx[lab[ys, xs]] = np.arange(len(ys))
        src = idx[lab]
        rgb = rgb[ys[src], xs[src]]
    cor.paste(Image.fromarray(np.dstack([rgb, al]).__mul__(255).astype(np.uint8), 'RGBA'), (x, y))
    if it['holo']:
        hsv = cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32) / 255
        claro = np.clip((hsv[..., 2] - 0.55) / 0.35, 0, 1) * (1 - hsv[..., 1])
        # os adesivos do dono são todos de filme holográfico: forte nas partes claras e nas bordas, médio sob a tinta;
        # as formas lisas são só filme
        base = 1.0 if it['id'].startswith('forma') else 0.45
        filme = np.clip(base + 0.55 * claro, 0, 1) * (al > 0.02)
        mr[y:y + ph, x:x + pw, 2] = (filme * 255).astype(np.uint8)
        mr[y:y + ph, x:x + pw, 0] = (filme * 255).astype(np.uint8)   # R: máscara da iridescência
        mr[y:y + ph, x:x + pw, 1] = (np.where(al > 0.02, 0.22 + 0.25 * (1 - filme), 0.6) * 255).astype(np.uint8)
    elif it['id'] == 'atalhos_windows':   # vinil preto brilhante, sem arco-íris
        mr[y:y + ph, x:x + pw, 1] = np.where(al > 0.02, 38, 150).astype(np.uint8)
    u0, u1 = x / AW, (x + pw) / AW
    v1, v0 = 1 - y / AH, 1 - (y + ph) / AH   # convenção do Blender (v para cima)
    if it['sup'] == 'lid': u0, u1, v0, v1 = u1, u0, v1, v0     # tampa: 180° em relação à planta vista por trás
    if it['sup'] == 'bottom': u0, u1 = u1, u0                   # base vista por baixo: espelhada em X
    it['uv'] = [round(u0, 6), round(v0, 6), round(u1, 6), round(v1, 6)]
cor.save('texturas/adesivos.png')
Image.fromarray(mr, 'RGB').save('texturas/adesivos_mr.png')
json.dump([{k: v for k, v in it.items() if k not in ('art', 'px')} for it in itens], open('saida/decals.json', 'w'), indent=1)
print('atlas', AW, 'x', AH, '|', len(itens), 'adesivos')
