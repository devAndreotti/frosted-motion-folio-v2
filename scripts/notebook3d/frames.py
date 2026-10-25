# frames.py: planta final do deck no referencial do modelo + caixas de todos os adesivos em coordenadas do modelo (mm)
# Modelo: X para a direita do usuário, Y da borda frontal para trás, origem no centro da borda frontal.
#   deck:   X, Y direto (borda frontal Y=0, dobradiça Y=238)
#   lid:    tampa fechada; X = 179.8 - u, Y = v   (u, v da planta vista por trás)
#   bottom: X = 179.8 - p, Y = 264.8 - q        (p, q da planta vista por baixo, traseira em cima)
import json, cv2, numpy as np
from PIL import Image, ImageOps
PX = 5
TP = np.float32([[1163, 1386], [2301, 1386], [2348, 2095], [1086, 2112]])   # cantos do touchpad na foto 16
H_tp = cv2.getPerspectiveTransform(TP, np.float32([[0, 75], [120, 75], [120, 0], [0, 0]]))
CX, Y0 = 104.4, 8.0     # centro do deck no referencial do touchpad; touchpad começa 8 mm atrás da borda frontal
M = np.array([[PX, 0, (179.8 - CX) * PX], [0, -PX, (238 - Y0) * PX], [0, 0, 1]]) @ H_tp
img = cv2.cvtColor(np.array(ImageOps.exif_transpose(Image.open('fotos/vista de cima do teclado.jpg')).convert('RGB')), cv2.COLOR_RGB2BGR)
cv2.imwrite('plantas/deck2.jpg', cv2.warpPerspective(img, M, (int(359.6 * PX), 238 * PX), flags=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 90])
homs = json.load(open('plantas/homografias.json'))
H_old = np.array(homs['deck']['H'])
d = json.load(open('adesivos.json'))
def old_to_model(b):
    x0, y0, x1, y1 = b
    c = np.float32([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]).reshape(-1, 1, 2) * PX
    p = cv2.perspectiveTransform(cv2.perspectiveTransform(c, np.linalg.inv(H_old)), M).reshape(-1, 2) / PX
    X = p[:, 0] - 179.8; Y = 238 - p[:, 1]
    return [round(float(X.min()), 1), round(float(Y.min()), 1), round(float(X.max()), 1), round(float(Y.max()), 1)]
for s in d['deck']: s['modelo_mm'] = old_to_model(s['bbox_mm'])
for s in d['lid']:
    u0, v0, u1, v1 = s['bbox_mm']; s['modelo_mm'] = [round(179.8 - u1, 1), v0, round(179.8 - u0, 1), v1]
for s in d['bottom']:
    p0, q0, p1, q1 = s['bbox_mm']; s['modelo_mm'] = [round(179.8 - p1, 1), round(264.8 - q1, 1), round(179.8 - p0, 1), round(264.8 - q0, 1)]
d['_frames'] = {'deck_M_foto16_para_planta': M.tolist(), 'deck2_px_por_mm': PX, 'deck2': 'coluna = (X+179.8)*5, linha = (238-Y)*5'}
json.dump(d, open('adesivos.json', 'w'), indent=1, ensure_ascii=False)
for s in d['deck']: print('%-16s %s -> %s' % (s['id'], s['bbox_mm'], s['modelo_mm']))
