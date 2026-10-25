# register.py: registra fotos de perto na planta (SIFT + RANSAC) e recorta cada adesivo retificado
import json, cv2, numpy as np
from PIL import Image, ImageOps
PX = 5          # px/mm das plantas
OUT = 12        # px/mm dos recortes
MARGEM = 3.0    # mm em volta da caixa
CLOSE = {
    'lid': ['notebook fechado adesivos.jpg', 'adesivos notebook fechado (2).jpg', 'adesivos notebook fechado.jpg', 'mais adesivos notebook fechado.jpg'],
    'deck': ['adesivos htl css js e react alem dos colados em formatos.jpg', 'adesivos thor, code,cademy,arduino,gnu linux, rapberry, windows advides.jpg', 'foco no teclado adesivo acima do mr tobot, intel core i5, nvidea geforce rtx, ayrton senna adesivo.jpg'],
    'bottom': ['adesivos da parte de baixo.jpg', 'mais da parte de baixo.jpg'],
}
def load(name):
    return cv2.cvtColor(np.array(ImageOps.exif_transpose(Image.open('fotos/' + name)).convert('RGB')), cv2.COLOR_RGB2BGR)
sift = cv2.SIFT_create(nfeatures=12000)
def feats(img, maxw):
    s = min(1.0, maxw / max(img.shape[:2]))
    g = cv2.cvtColor(cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    g = cv2.createCLAHE(2.0, (8, 8)).apply(g)
    k, d = sift.detectAndCompute(g, None)
    return np.float32([p.pt for p in k]) / s, d
homs = json.load(open('plantas/homografias.json'))
stick = json.load(open('adesivos.json'))
reg = {}
for sup, fotos in CLOSE.items():
    plan = cv2.imread('plantas/%s.jpg' % sup)
    kp, dp = feats(plan, 1800)
    cands = [(homs[sup]['foto'], np.array(homs[sup]['H']), 0)]
    for f in fotos:
        img = load(f)
        kc, dc = feats(img, 2000)
        m = cv2.BFMatcher(cv2.NORM_L2).knnMatch(dc, dp, k=2)
        good = [a for a, b in m if a.distance < 0.75 * b.distance]
        if len(good) < 12:
            print(sup, f, 'poucos matches', len(good)); continue
        H, inl = cv2.findHomography(kc[[g.queryIdx for g in good]], kp[[g.trainIdx for g in good]], cv2.RANSAC, 6.0)
        n = int(inl.sum()) if inl is not None else 0
        print('%s | %-60s matches %4d inliers %4d' % (sup, f[:60], len(good), n))
        if H is not None and n >= 40: cands.append((f, H, n))
    reg[sup] = [(f, H.tolist(), n) for f, H, n in cands]
    cache = {}
    for s in stick[sup]:
        x0, y0, x1, y1 = s['bbox_mm']
        x0 -= MARGEM; y0 -= MARGEM; x1 += MARGEM; y1 += MARGEM
        best = None
        for f, H, n in cands:
            Hi = np.linalg.inv(H)
            if f not in cache: cache[f] = load(f)
            img = cache[f]
            corners = cv2.perspectiveTransform(np.float32([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]).reshape(-1, 1, 2) * PX, Hi).reshape(-1, 2)
            h, w = img.shape[:2]
            if corners.min() < 0 or corners[:, 0].max() >= w or corners[:, 1].max() >= h: continue
            res = np.sqrt(cv2.contourArea(corners) / ((x1 - x0) * (y1 - y0)))   # px da foto por mm
            if best is None or res > best[0]: best = (res, f, H)
        if best is None:
            print('  sem foto que cubra', s['id']); continue
        res, f, H = best
        A = np.array([[OUT / PX, 0, -x0 * OUT], [0, OUT / PX, -y0 * OUT], [0, 0, 1]])
        out = cv2.warpPerspective(cache[f], A @ H, (int((x1 - x0) * OUT), int((y1 - y0) * OUT)), flags=cv2.INTER_CUBIC)
        cv2.imwrite('recortes/%s.jpg' % s['id'], out, [cv2.IMWRITE_JPEG_QUALITY, 93])
        s['recorte'] = {'foto': f, 'px_por_mm_foto': round(float(res), 1)}
        print('  %-16s <- %-45s %.1f px/mm' % (s['id'], f[:45], res))
json.dump(stick, open('adesivos.json', 'w'), indent=1, ensure_ascii=False)
json.dump(reg, open('plantas/registro.json', 'w'))
