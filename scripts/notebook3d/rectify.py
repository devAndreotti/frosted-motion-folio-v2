# rectify.py: plantas em mm (PX px/mm) a partir dos cantos medidos nas fotos
import json, cv2, numpy as np
from PIL import Image, ImageOps
PX = 5
W = 359.6
# cada superfície: foto, cantos na foto (TL, TR, BR, BL na imagem de saída) e tamanho em mm
SURF = {
    # deck visto de frente: topo da imagem = linha onde a tampa aberta encobre (217.4 mm da borda frontal)
    'deck': ('vista de cima do teclado.jpg', [[655, 335], [3505, 322], [3990, 2100], [190, 2200]], (W, 217.4)),
    # tampa vista por trás (esquerda da imagem = lado direito do notebook), dobradiça embaixo
    'lid': ('notebook aberto de costas.jpg', [[759, 288], [2993, 257], [2604, 2220], [307, 1687]], (W, 238.0)),
    # base vista por baixo, traseira em cima (esquerda da imagem = lado direito do notebook)
    'bottom': ('parte de baixo completa.jpg', [[464, 76], [3326, 109], [3318, 2130], [464, 2185]], (W, 264.8)),
}
def load(name):
    return cv2.cvtColor(np.array(ImageOps.exif_transpose(Image.open('fotos/' + name)).convert('RGB')), cv2.COLOR_RGB2BGR)
out = {}
for k, (f, pts, (w, h)) in SURF.items():
    img = load(f)
    dst = np.float32([[0, 0], [w * PX, 0], [w * PX, h * PX], [0, h * PX]])
    H = cv2.getPerspectiveTransform(np.float32(pts), dst)
    r = cv2.warpPerspective(img, H, (int(w * PX), int(h * PX)), flags=cv2.INTER_AREA)
    cv2.imwrite('plantas/%s.jpg' % k, r, [cv2.IMWRITE_JPEG_QUALITY, 90])
    out[k] = {'foto': f, 'cantos': pts, 'mm': [w, h], 'px_por_mm': PX, 'H': H.tolist()}
json.dump(out, open('plantas/homografias.json', 'w'), indent=1)
print('ok')
