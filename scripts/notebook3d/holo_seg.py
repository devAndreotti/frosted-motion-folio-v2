# holo_seg.py: formas holográficas do apoio de pulso, segmentadas nas fotos novas (coloridas) registradas na planta deck2.
# Saída: trabalho/holo_mask.png (planta, 5 px/mm), trabalho/holo_cor.png (cor da foto levada para a planta) e grid/holo_check.jpg
import json, cv2, numpy as np
from PIL import Image, ImageOps
PX = 5
FOTOS = ['fotos3/01_18bd5063.jpg', 'fotos3/02_6060ead7.jpg', 'fotos3/07_773f2469.jpg', 'fotos3/08_fbdfd382.jpg',
         'fotos2/apoio_esquerda.jpg', 'fotos2/apoio_direita.jpg', 'fotos2/teclado_cima_esquerda.jpg']
plan = cv2.imread('plantas/deck2.jpg'); PH, PW = plan.shape[:2]
def to_px(x, y): return int(round((x + 179.8) * PX)), int(round((238 - y) * PX))
sift = cv2.SIFT_create(nfeatures=9000)
def feats(img, maxw):
    s = min(1.0, maxw / max(img.shape[:2])); g = cv2.cvtColor(cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    g = cv2.createCLAHE(2.0, (8, 8)).apply(g); k, d = sift.detectAndCompute(g, None); return np.float32([p.pt for p in k]) / s, d
kp, dp = feats(plan, 1500)
# o que não é forma: teclas, touchpad, botão e os adesivos impressos (caixas), bordas da planta
excl = np.zeros((PH, PW), np.uint8)
for k in json.load(open('teclado.json'))['keys']:
    cv2.fillPoly(excl, [np.int32([to_px(*p) for p in k['poly']])], 1)
excl = cv2.dilate(excl, np.ones((7, 7), np.uint8))
cv2.rectangle(excl, to_px(-104.5, 84), to_px(17.3, 7), 1, -1)
cv2.circle(excl, to_px(-3.6, 214), 30, 1, -1)
for d in json.load(open('saida/decals.json')):
    if d['sup'] != 'deck' or d['id'].startswith('forma'): continue
    cv2.rectangle(excl, to_px(d['cx'] - d['w'] / 2 - 0.8, d['cy'] + d['h'] / 2 + 0.8), to_px(d['cx'] + d['w'] / 2 + 0.8, d['cy'] - d['h'] / 2 - 0.8), 1, -1)
excl[:int(5 * PX)] = 1; excl[-int(1.2 * PX):] = 1; excl[:, :int(1.2 * PX)] = 1; excl[:, -int(1.2 * PX):] = 1
votos = np.zeros((PH, PW), np.float32); vistos = np.zeros((PH, PW), np.float32)
cor = np.zeros((PH, PW, 3), np.float32); peso = np.zeros((PH, PW), np.float32)
for f in FOTOS:
    img = cv2.cvtColor(np.array(ImageOps.exif_transpose(Image.open(f)).convert('RGB')), cv2.COLOR_RGB2BGR)
    kc, dc = feats(img, 1600)
    m = cv2.BFMatcher(cv2.NORM_L2).knnMatch(dc, dp, k=2)
    good = [a for a, b in m if a.distance < 0.75 * b.distance]
    if len(good) < 30: print(f, 'poucos', len(good)); continue
    H, inl = cv2.findHomography(kc[[g.queryIdx for g in good]], kp[[g.trainIdx for g in good]], cv2.RANSAC, 5.0)
    n = int(inl.sum()); print('%-36s inliers %d' % (f, n))
    if n < 60: continue
    w = cv2.warpPerspective(img, H, (PW, PH), flags=cv2.INTER_AREA)
    ok = cv2.warpPerspective(np.ones(img.shape[:2], np.uint8), H, (PW, PH)) > 0
    ok = cv2.erode(ok.astype(np.uint8), np.ones((15, 15), np.uint8)) > 0
    lab = cv2.cvtColor(cv2.medianBlur(w, 5), cv2.COLOR_BGR2LAB).astype(np.float32)
    fundo = cv2.cvtColor(cv2.medianBlur(w, 101), cv2.COLOR_BGR2LAB).astype(np.float32)
    hsv = cv2.cvtColor(cv2.medianBlur(w, 5), cv2.COLOR_BGR2HSV).astype(np.float32)
    dL = np.abs(lab[..., 0] - fundo[..., 0]); dC = np.sqrt(((lab[..., 1:] - fundo[..., 1:]) ** 2).sum(-1))
    holo = ((dC > 12) | (dL > 22) | ((hsv[..., 1] > 70) & (hsv[..., 2] > 70))).astype(np.float32)
    votos += holo * ok; vistos += ok
    wgt = (hsv[..., 1] / 255 + 0.2) * ok   # a cor vem da foto onde o adesivo está mais colorido
    cor += w.astype(np.float32) * wgt[..., None]; peso += wgt
frac = np.where(vistos > 0, votos / np.maximum(vistos, 1), 0)
mask = ((frac >= 0.5) & (vistos >= 2) & (excl == 0)).astype(np.uint8)
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)); mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
cv2.imwrite('trabalho/holo_mask.png', mask * 255)
cv2.imwrite('trabalho/holo_cor.png', (cor / np.maximum(peso, 1e-3)[..., None]).astype(np.uint8))
n, lab_cc, st, _ = cv2.connectedComponentsWithStats(mask)
dbg = plan.copy()
for i in range(1, n):
    x, y, w_, h_, a = st[i]
    if a < 25 * PX * PX: continue
    cnts, _ = cv2.findContours((lab_cc == i).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.polylines(dbg, cnts, True, (255, 0, 255), 2); cv2.putText(dbg, str(i), (x, y + 12), cv2.FONT_HERSHEY_SIMPLEX, .45, (0, 255, 255), 1)
cv2.imwrite('grid/holo_check.jpg', dbg, [cv2.IMWRITE_JPEG_QUALITY, 88])
cv2.imwrite('grid/holo_check_esq.jpg', dbg[:, :PW // 2]); cv2.imwrite('grid/holo_check_dir.jpg', dbg[:, PW // 2:])
print(n - 1, 'componentes')
