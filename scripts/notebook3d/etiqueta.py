# etiqueta.py <fundo.jpg> <saida.jpg>: troca os dados de série da etiqueta da base por valores fictícios
# A foto da base vira textura pública (site e GLB): MO, SN, data de fabricação e QR code reais não podem aparecer.
# Os valores abaixo foram sorteados uma vez e ficam fixos, para o build ser reprodutível; modelo, MTM e Anatel são
# públicos (catálogo da Lenovo) e ficam como estão.
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W_MM = 359.6
FICTICIO = {'mo': 'PE0686128175', 'sn': 'PFZTVV5X', 'data': '2024-07-07'}
# caixas em mm na planta da base (vista por baixo, traseira em cima): (x0, y0, x1, y1)
CAMPOS = {'mo': (38.4, 147.7, 56.4, 152.2), 'sn': (85.9, 147.7, 98.4, 152.2), 'data': (110.6, 147.7, 126.2, 152.2)}
QR = (126.4, 161.1, 138.6, 172.9)
TINTA = (34, 34, 36)
CAP_MM = 1.75           # altura das maiúsculas na etiqueta real
FONTES = ('/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf', '/usr/share/fonts/TTF/DejaVuSansCondensed-Bold.ttf')


def fonte(px):
    for f in FONTES:
        try:
            return ImageFont.truetype(f, int(px))
        except OSError:
            pass
    return ImageFont.load_default(size=px)


def apagar(img, s, caixa):
    """inpainting só nos traços escuros da caixa: o fundo prateado da etiqueta continua com a mesma textura"""
    x0, y0, x1, y1 = (int(round(v * s)) for v in caixa)
    g = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY)
    m = (g < np.median(g) - 18).astype(np.uint8) * 255
    m = cv2.dilate(m, np.ones((3, 3), np.uint8))
    mask = np.zeros(img.shape[:2], np.uint8)
    mask[y0:y1, x0:x1] = m
    return cv2.inpaint(img, mask, 4, cv2.INPAINT_TELEA)


def qr_falso(n=21, seed=159122):
    """matriz com cara de QR (três marcadores de canto) e miolo aleatório: não decodifica para nada"""
    rng = np.random.default_rng(seed)
    q = rng.random((n, n)) < 0.5
    for r, c in ((0, 0), (0, n - 7), (n - 7, 0)):
        q[r:r + 7, c:c + 7] = False
        q[r:r + 7, c] = q[r:r + 7, c + 6] = q[r, c:c + 7] = q[r + 6, c:c + 7] = True
        q[r + 2:r + 5, c + 2:c + 5] = True
        rr, cc = max(r - 1, 0), max(c - 1, 0)
        q[rr:r + 8, c + 7 if c == 0 else cc] = False
        q[r + 7 if r == 0 else rr, cc:c + 8] = False
    return q


def main(src, out):
    img = cv2.imread(src)
    s = img.shape[1] / W_MM
    for caixa in CAMPOS.values():
        img = apagar(img, s, caixa)
    # QR: limpa o quadrado inteiro (fica a zona branca do adesivo) e desenha o falso por cima
    x0, y0, x1, y1 = (int(round(v * s)) for v in QR)
    branco = np.percentile(img[y0:y1, x0:x1].reshape(-1, 3), 90, axis=0)
    img[y0:y1, x0:x1] = branco
    pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    # texto e QR desenhados em 4x e reduzidos, para o traço ficar macio como o da foto
    k = 4
    for nome, caixa in CAMPOS.items():
        x0, y0, x1, y1 = (int(round(v * s)) for v in caixa)
        patch = pil.crop((x0, y0, x1, y1)).resize(((x1 - x0) * k, (y1 - y0) * k), Image.LANCZOS)
        d = ImageDraw.Draw(patch)
        d.text((k, (y1 - y0 + 0.1 * s) * k / 2), FICTICIO[nome], font=fonte(CAP_MM / 0.73 * s * k), fill=TINTA, anchor='lm')
        pil.paste(patch.resize((x1 - x0, y1 - y0), Image.LANCZOS), (x0, y0))
    x0, y0, x1, y1 = (int(round(v * s)) for v in QR)
    lado = min(x1 - x0, y1 - y0) - 2
    q = qr_falso()
    mod = Image.fromarray(np.where(q, 30, 245).astype(np.uint8)).convert('RGB').resize((lado * k, lado * k), Image.NEAREST)
    pil.paste(mod.resize((lado, lado), Image.LANCZOS), (x0 + 1, y0 + 1))
    pil.save(out, quality=92)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
