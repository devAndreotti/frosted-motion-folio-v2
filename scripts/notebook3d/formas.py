# formas.py: recortes holográficos lisos ("colados em formatos") do apoio de pulso, direto da planta deck2.
# Saída: arte/forma_NN.png (silhueta + filme claro) e entradas em adesivos.json (deck, fonte 'forma', modelo_rect em mm do modelo)
import json, cv2, numpy as np
from PIL import Image
PX = 5
img = cv2.imread('plantas/deck2.jpg')
H, W = img.shape[:2]
def to_px(x, y): return int(round((x + 179.8) * PX)), int(round((238 - y) * PX))
# fundo local (mediana de ~30 mm): a luz da foto varia muito de um lado ao outro do apoio
fundo = cv2.medianBlur(img, 151)
lab = cv2.cvtColor(cv2.medianBlur(img, 5), cv2.COLOR_BGR2LAB).astype(np.float32)
labf = cv2.cvtColor(fundo, cv2.COLOR_BGR2LAB).astype(np.float32)
dL = lab[..., 0] - labf[..., 0]
dC = np.sqrt(((lab[..., 1:] - labf[..., 1:]) ** 2).sum(-1))
m = ((dL > 16) | (dC > 14)).astype(np.uint8)
excl = np.zeros_like(m)
kb = json.load(open('teclado.json'))
for k in kb['keys']:
    cv2.fillPoly(excl, [np.int32([to_px(*p) for p in k['poly']])], 1)
excl = cv2.dilate(excl, np.ones((9, 9), np.uint8))
cv2.rectangle(excl, to_px(-104.5, 84), to_px(17.3, 7), 1, -1)                 # touchpad
cv2.circle(excl, to_px(-3.6, 214), 30, 1, -1)                                 # botão liga/desliga
for d in json.load(open('saida/decals.json')):
    if d['sup'] != 'deck': continue
    cv2.rectangle(excl, to_px(d['cx'] - d['w'] / 2 - 1.5, d['cy'] + d['h'] / 2 + 1.5), to_px(d['cx'] + d['w'] / 2 + 1.5, d['cy'] - d['h'] / 2 - 1.5), 1, -1)
st = json.load(open('adesivos.json'))
for s in st['deck']:  # adesivos ainda sem arte também ficam de fora (caixa medida)
    if s.get('fonte') == 'forma': continue
    x0, y0, x1, y1 = s['modelo_mm']
    cv2.rectangle(excl, to_px(x0 - 1.5, y1 + 1.5), to_px(x1 + 1.5, y0 - 1.5), 1, -1)
excl[:int(8 * PX)] = 1                                                        # borda de trás encoberta pela tela
excl[:, :int(1.5 * PX)] = 1; excl[:, -int(1.5 * PX):] = 1; excl[-int(1.5 * PX):] = 1      # fora do deck
m = m * (1 - excl)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
n, lab_cc, stt, _ = cv2.connectedComponentsWithStats(m)
st['deck'] = [s for s in st['deck'] if s.get('fonte') != 'forma']
dbg = img.copy()
# conferido na grid/formas.jpg: bordas laterais iluminadas, vão entre teclas, dobradiça e cantos não são adesivos
DESCARTAR = {2, 3, 6, 7, 8, 9, 15, 17}
k = 0
for i in range(1, n):
    x, y, w, h, a = stt[i]
    if a < 45 * PX * PX or w < 4 * PX or h < 4 * PX: continue          # menos de ~45 mm²: ruído
    sil = (lab_cc[y:y + h, x:x + w] == i).astype(np.uint8) * 255
    sil = cv2.GaussianBlur(cv2.resize(sil, (w * 4, h * 4), interpolation=cv2.INTER_CUBIC), (9, 9), 0)
    sil = np.where(sil > 127, 255, 0).astype(np.uint8)
    sil = cv2.GaussianBlur(sil, (3, 3), 0)
    # cor: tom médio da foto dentro da forma, clareado meio a meio com prata (o brilho vem do filme no shader)
    dentro = lab_cc[y:y + h, x:x + w] == i
    bgr = np.median(img[y:y + h, x:x + w][dentro], 0)
    cor = (0.5 * bgr[::-1] + 0.5 * np.array([226, 226, 232])).astype(np.uint8)
    rgba = np.zeros((h * 4, w * 4, 4), np.uint8); rgba[..., :3] = cor; rgba[..., 3] = sil
    k += 1
    sid = 'forma_%02d' % k
    if k in DESCARTAR:
        continue
    Image.fromarray(rgba, 'RGBA').save('arte/%s.png' % sid)
    X0, X1 = x / PX - 179.8, (x + w) / PX - 179.8
    Y1, Y0 = 238 - y / PX, 238 - (y + h) / PX
    st['deck'].append({'id': sid, 'fonte': 'forma', 'brilho': 'holo', 'desc': 'recorte holográfico liso', 'modelo_rect': [round(X0, 2), round(Y0, 2), round(X1, 2), round(Y1, 2)]})
    cv2.rectangle(dbg, (x, y), (x + w, y + h), (255, 0, 255), 2); cv2.putText(dbg, sid, (x, y - 3), cv2.FONT_HERSHEY_SIMPLEX, .5, (0, 255, 255), 1)
json.dump(st, open('adesivos.json', 'w'), indent=1, ensure_ascii=False)
cv2.imwrite('grid/formas.jpg', cv2.resize(dbg, (W * 5 // 6, H * 5 // 6)), [cv2.IMWRITE_JPEG_QUALITY, 85])
print(k, 'formas')
