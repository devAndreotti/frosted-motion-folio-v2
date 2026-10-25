# formas_grabcut.py: formas holográficas que faltaram, segmentadas por GrabCut nas fotos novas (mais nítidas)
# registradas na planta deck2 (SIFT). Caixas em mm do referencial da planta (antes do deslocamento DX).
import json, sys, cv2, numpy as np
from PIL import Image, ImageOps
PX = 5        # planta deck2
OUT = 10      # px/mm do recorte para segmentar
def mm2plan(x, y): return (x + 179.8) * PX, (238 - y) * PX
CAIXAS = {'xA': (-179, 144, -166, 165), 'xB': (-178, 127, -167, 142), 'xC': (159, 149, 173, 172), 'xD': (159, 130, 172, 146),
          'xE': (159, 116, 172, 130), 'xF': (94, 3, 126, 34), 'xG': (28, 210, 43, 224), 'xH': (57, 211, 87, 226), 'xI': (144, 206, 171, 227)}
# por caixa: foto preferida e limites (mm) que com certeza são fundo: quina do deck, teclas, dobradiça
PREF = {'xG': 'fotos2/teclado_cima_esquerda.jpg', 'xH': 'fotos2/teclado_cima_esquerda.jpg', 'xI': 'plantas/deck2.jpg',
        'xC': 'plantas/deck2.jpg', 'xD': 'plantas/deck2.jpg'}
# contornos à mão (mm), tirados das grades de 1 mm sobre os recortes: a segmentação automática não separa essas formas pálidas
MANUAL = {
    'xC': [(166.0, 151.2), (168.2, 151.6), (169.0, 153.0), (168.9, 157.0), (168.5, 160.0), (167.7, 161.2), (167.5, 162.8), (168.3, 164.0), (168.6, 166.0),
           (168.3, 168.5), (167.4, 170.0), (166.0, 170.3), (164.9, 169.5), (164.3, 167.5), (163.9, 165.0), (163.4, 161.0), (163.2, 157.0), (163.4, 154.0),
           (164.2, 152.3), (165.0, 151.5)],
    'xD': [(165.0, 144.0), (167.0, 143.7), (168.6, 142.6), (169.4, 141.0), (169.3, 139.5), (168.2, 138.5), (167.4, 137.2), (167.7, 135.6), (166.8, 134.0),
           (165.0, 133.3), (163.2, 133.8), (161.9, 135.2), (161.2, 137.5), (161.3, 140.0), (162.0, 142.0), (163.4, 143.5)],
    'xG': [(29.5, 221.0), (31.5, 221.3), (33.0, 219.5), (34.5, 218.6), (36.0, 219.5), (37.5, 221.3), (39.5, 221.0), (40.6, 218.5), (40.5, 214.5),
           (39.0, 211.0), (36.5, 209.2), (33.5, 209.0), (31.0, 210.5), (29.6, 213.5), (29.0, 217.5)],
    'xH': [(61.0, 223.5), (67.0, 223.5), (68.8, 220.0), (70.5, 223.5), (80.0, 223.5), (81.0, 220.0), (80.0, 217.5), (77.5, 215.6), (74.0, 214.0),
           (70.0, 213.6), (66.5, 214.8), (64.0, 216.5), (62.0, 218.5), (60.8, 220.2)],
    'xI': [(144.6, 211.5), (145.5, 214.0), (148.0, 215.6), (151.5, 215.8), (154.5, 214.8), (156.6, 216.8), (159.0, 218.0), (162.0, 217.6), (164.4, 215.5),
           (165.6, 212.0), (165.2, 208.0), (163.0, 205.6), (160.0, 205.0), (157.5, 206.0), (155.0, 207.6), (151.5, 207.2), (148.0, 207.0), (145.5, 208.5)],
}
OTSU = {'xC', 'xD', 'xG', 'xH', 'xI'}   # formas claras e pálidas: limiar de Otsu na diferença de cor (o GrabCut vaza)
FUNDO = {'xC': dict(xmin=162.4, xmax=169.3), 'xD': dict(xmin=162.4, xmax=169.3), 'xE': dict(xmin=160.3, xmax=168.9),
         'xF': dict(xmin=95.0, ymax=32.8), 'xG': dict(ymin=206.5, ymax=221.0), 'xH': dict(ymin=206.5, ymax=221.0),
         'xI': dict(ymin=206.5, ymax=221.5, xmax=171.0)}
FOTOS = ['fotos2/teclado_cima_esquerda.jpg', 'fotos2/apoio_esquerda.jpg', 'fotos2/apoio_direita.jpg', 'fotos2/teclado_escuro_direita.jpg']
plan = cv2.imread('plantas/deck2.jpg')
sift = cv2.SIFT_create(nfeatures=15000)
def feats(img, maxw):
    s = min(1.0, maxw / max(img.shape[:2])); g = cv2.cvtColor(cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    g = cv2.createCLAHE(2.0, (8, 8)).apply(g); k, d = sift.detectAndCompute(g, None); return np.float32([p.pt for p in k]) / s, d
kp, dp = feats(plan, 1800)
regs = []
for f in FOTOS:
    img = cv2.cvtColor(np.array(ImageOps.exif_transpose(Image.open(f)).convert('RGB')), cv2.COLOR_RGB2BGR)
    kc, dc = feats(img, 2000)
    m = cv2.BFMatcher(cv2.NORM_L2).knnMatch(dc, dp, k=2)
    good = [a for a, b in m if a.distance < 0.75 * b.distance]
    if len(good) < 20: print(f, 'poucos matches', len(good)); continue
    Hm, inl = cv2.findHomography(kc[[g.queryIdx for g in good]], kp[[g.trainIdx for g in good]], cv2.RANSAC, 6.0)
    print('%-40s matches %4d inliers %4d' % (f, len(good), int(inl.sum())))
    if inl.sum() >= 40: regs.append((f, img, Hm))
st = json.load(open('adesivos.json'))
st['deck'] = [s for s in st['deck'] if not s['id'].startswith('forma_x')]
dbg = plan.copy()
for sid, (x0, y0, x1, y1) in CAIXAS.items():
    M = 2.5
    X0, Y0, X1, Y1 = x0 - M, y0 - M, x1 + M, y1 + M
    best = None
    for f, img, Hm in regs:   # foto com mais resolução que cobre a caixa inteira
        cs = cv2.perspectiveTransform(np.float32([mm2plan(X0, Y1), mm2plan(X1, Y1), mm2plan(X1, Y0), mm2plan(X0, Y0)]).reshape(-1, 1, 2), np.linalg.inv(Hm)).reshape(-1, 2)
        h, w = img.shape[:2]
        if cs.min() < 0 or cs[:, 0].max() >= w or cs[:, 1].max() >= h: continue
        res = np.sqrt(cv2.contourArea(cs) / ((X1 - X0) * (Y1 - Y0)))
        if best is None or res > best[0]: best = (res, f, img, Hm)
    for f, img, Hm in regs:
        if PREF.get(sid) == f: best = (0, f, img, Hm)
    if best is None or PREF.get(sid) == 'plantas/deck2.jpg':   # nenhuma foto nova cobre: usa a própria planta
        best = (PX, 'plantas/deck2.jpg', plan, np.eye(3))
    res, f, img, Hm = best
    A = np.array([[OUT / PX, 0, -mm2plan(X0, Y1)[0] * OUT / PX], [0, OUT / PX, -mm2plan(X0, Y1)[1] * OUT / PX], [0, 0, 1]])
    W, H = int((X1 - X0) * OUT), int((Y1 - Y0) * OUT)
    crop = cv2.warpPerspective(img, A @ Hm, (W, H), flags=cv2.INTER_CUBIC)
    mask = np.full((H, W), cv2.GC_BGD, np.uint8)
    mi = int(M * OUT)
    mask[mi:H - mi, mi:W - mi] = cv2.GC_PR_BGD
    # semente provável: pixels de saturação alta ou claros em relação ao entorno
    lab = cv2.cvtColor(cv2.GaussianBlur(crop, (5, 5), 0), cv2.COLOR_BGR2LAB).astype(np.float32)
    borda = np.concatenate([lab[:mi].reshape(-1, 3), lab[-mi:].reshape(-1, 3), lab[:, :mi].reshape(-1, 3), lab[:, -mi:].reshape(-1, 3)])
    dist = np.sqrt(((lab - np.median(borda, 0)) ** 2).sum(-1))
    inner = np.zeros_like(mask, bool); inner[mi:H - mi, mi:W - mi] = True
    mask[(dist > np.percentile(dist[inner], 55)) & inner] = cv2.GC_PR_FGD
    mask[(dist > np.percentile(dist[inner], 85)) & inner] = cv2.GC_FGD
    lim = FUNDO.get(sid, {})
    xs_mm = X0 + (np.arange(W) + 0.5) / OUT; ys_mm = Y1 - (np.arange(H) + 0.5) / OUT
    fora = np.zeros((H, W), bool)
    if 'xmin' in lim: fora |= xs_mm[None, :] < lim['xmin']
    if 'xmax' in lim: fora |= xs_mm[None, :] > lim['xmax']
    if 'ymin' in lim: fora |= ys_mm[:, None] < lim['ymin']
    if 'ymax' in lim: fora |= ys_mm[:, None] > lim['ymax']
    mask[fora] = cv2.GC_BGD
    bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    if sid in MANUAL:
        pts = np.int32([[(X - X0) * OUT, (Y1 - Y) * OUT] for X, Y in MANUAL[sid]])
        sil = np.zeros((H, W), np.uint8); cv2.fillPoly(sil, [pts], 255)
        sil = cv2.GaussianBlur(sil, (9, 9), 0); sil = np.where(sil > 127, 255, 0).astype(np.uint8)
    elif sid in OTSU:
        ok = (~fora) & inner
        ref = np.median(lab[ok], 0)
        dd = np.sqrt(((lab - ref) ** 2 * np.array([0.6, 1.6, 1.6])).sum(-1))
        v = np.clip(dd / max(1e-3, np.percentile(dd[ok], 99)) * 255, 0, 255).astype(np.uint8)
        t, _ = cv2.threshold(v[ok], 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        sil = np.where((v > t) & ok, 255, 0).astype(np.uint8)
    else:
        cv2.grabCut(crop, mask, None, bg, fg, 6, cv2.GC_INIT_WITH_MASK)
        sil = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    sil = cv2.morphologyEx(sil, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)); sil = cv2.morphologyEx(sil, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab_cc, stt, _ = cv2.connectedComponentsWithStats(sil)
    if n < 2: print(sid, 'vazio'); continue
    big = 1 + int(np.argmax(stt[1:, cv2.CC_STAT_AREA]))
    sil = np.where(lab_cc == big, 255, 0).astype(np.uint8)
    ys, xs = np.where(sil > 0)
    bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    s2 = cv2.GaussianBlur(sil[by0:by1, bx0:bx1], (3, 3), 0)
    rgb = cv2.cvtColor(cv2.GaussianBlur(crop[by0:by1, bx0:bx1], (5, 5), 0), cv2.COLOR_BGR2RGB).astype(np.float32)
    rgb = (0.55 * rgb + 0.45 * np.array([226, 226, 232])).astype(np.uint8)
    Image.fromarray(np.dstack([rgb, s2]), 'RGBA').save('arte/forma_%s.png' % sid)
    rect = [round(float(X0 + bx0 / OUT), 2), round(float(Y1 - by1 / OUT), 2), round(float(X0 + bx1 / OUT), 2), round(float(Y1 - by0 / OUT), 2)]
    st['deck'].append({'id': 'forma_' + sid, 'fonte': 'forma', 'brilho': 'holo', 'desc': 'recorte holográfico liso', 'modelo_rect': rect})
    area = (sil > 0).sum() / OUT ** 2
    print('%s %-34s %.1f px/mm  rect %s  área %.0f mm²' % (sid, f.split('/')[-1], res, rect, area))
    # conferência: contorno sobre a planta
    cnts, _ = cv2.findContours(sil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in cnts:
        c = c.reshape(-1, 2).astype(np.float32)
        pts = np.stack([(X0 + c[:, 0] / OUT + 179.8) * PX, (238 - (Y1 - c[:, 1] / OUT)) * PX], 1).astype(np.int32)
        cv2.polylines(dbg, [pts], True, (255, 0, 255), 2)
    cv2.putText(dbg, sid, (int(mm2plan(x0, y1)[0]), int(mm2plan(x0, y1)[1]) - 4), cv2.FONT_HERSHEY_SIMPLEX, .6, (0, 255, 255), 2)
    cv2.imwrite('trabalho/gc_%s.jpg' % sid, np.hstack([crop, cv2.cvtColor(sil, cv2.COLOR_GRAY2BGR)]))
json.dump(st, open('adesivos.json', 'w'), indent=1, ensure_ascii=False)
cv2.imwrite('grid/formas_gc.jpg', dbg, [cv2.IMWRITE_JPEG_QUALITY, 85])
