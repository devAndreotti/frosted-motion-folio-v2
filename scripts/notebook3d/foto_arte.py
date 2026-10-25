# foto_arte.py <id> [raio_mm]: arte a partir do recorte retificado (adesivos retangulares e marcas de fábrica), sem IA
import sys, json, cv2, numpy as np
from PIL import Image, ImageFilter, ImageEnhance
OUT = 12  # px/mm dos recortes
sid = sys.argv[1]
raio = float(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else 1.2
img = cv2.imread('recortes/%s.jpg' % sid)
h, w = img.shape[:2]
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
borda = np.concatenate([lab[:8].reshape(-1, 3), lab[-8:].reshape(-1, 3), lab[:, :8].reshape(-1, 3), lab[:, -8:].reshape(-1, 3)])
fundo = np.median(borda, axis=0)
if sid == 'loq_logo':
    # letras pretas gravadas: só o que é bem mais escuro que a tampa
    L = lab[..., 0]
    m = np.clip((fundo[0] - 28 - L) / 22, 0, 1)
    m = cv2.GaussianBlur(m, (3, 3), 0)
    rgba = np.zeros((h, w, 4), np.uint8); rgba[..., :3] = (21, 21, 23); rgba[..., 3] = (m * 255).astype(np.uint8)
    out = Image.fromarray(rgba, 'RGBA')
else:
    # bordas do retângulo: o recorte tem 3 mm de margem; em cada lado procura o gradiente mais forte a +-3 mm da borda esperada
    g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32), (5, 5), 0)
    gx = np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)); gy = np.abs(cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3))
    M3 = 3 * OUT
    cols = gx[int(h * .2):int(h * .8)].mean(0); rows = gy[:, int(w * .2):int(w * .8)].mean(1)
    def pico(perfil, centro):
        a, b = max(0, centro - M3), min(len(perfil), centro + M3)
        return a + int(np.argmax(perfil[a:b]))
    x0, x1 = pico(cols, M3), pico(cols, w - M3)
    y0, y1 = pico(rows, M3), pico(rows, h - M3)
    if '--bordas' in sys.argv:  # bordas fixas (mm a partir da caixa) quando o gradiente engana
        b = [float(v) for v in sys.argv[sys.argv.index('--bordas') + 1].split(',')]
        x0, x1, y0, y1 = int(M3 + b[0] * OUT), int(w - M3 - b[1] * OUT), int(M3 + b[2] * OUT), int(h - M3 - b[3] * OUT)
    crop = img[y0:y1, x0:x1]
    print('retângulo %.1f x %.1f mm (bordas a %.1f/%.1f/%.1f/%.1f mm da caixa)' % ((x1 - x0) / OUT, (y1 - y0) / OUT, (x0 - M3) / OUT, (w - M3 - x1) / OUT, (y0 - M3) / OUT, (h - M3 - y1) / OUT))
    im = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
    im = ImageEnhance.Contrast(im).enhance(1.12)
    im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    a = Image.new('L', im.size, 0)
    from PIL import ImageDraw
    ImageDraw.Draw(a).rounded_rectangle([0, 0, im.width - 1, im.height - 1], radius=int(raio * OUT), fill=255)
    out = im.convert('RGBA'); out.putalpha(a)
bb = out.getchannel('A').point(lambda v: 255 if v > 30 else 0).getbbox()
out = out.crop(bb)
# retângulo final em mm na planta: canto do recorte = caixa - 3 mm
st = json.load(open('adesivos.json'))
cx0, cy0 = next(x for sup in ('lid', 'deck', 'bottom') for x in st[sup] if x['id'] == sid)['bbox_mm'][:2]
ox, oy = (0, 0) if sid == 'loq_logo' else (x0, y0)
r = [cx0 - 3 + (ox + bb[0]) / OUT, cy0 - 3 + (oy + bb[1]) / OUT, cx0 - 3 + (ox + bb[2]) / OUT, cy0 - 3 + (oy + bb[3]) / OUT]
json.dump({'rect_mm': [round(v, 2) for v in r]}, open('arte/%s.json' % sid, 'w'))
out.save('arte/%s.png' % sid)
cr = Image.open('recortes/%s.jpg' % sid).convert('RGB'); H = 300
cr = cr.resize((max(1, int(cr.width * H / cr.height)), H))
g = Image.new('RGBA', out.size, (110, 110, 116, 255)); g.alpha_composite(out); g = g.convert('RGB').resize((max(1, int(out.width * H / out.height)), H))
q = Image.new('RGB', (cr.width + g.width + 16, H), (30, 30, 30)); q.paste(cr, (0, 0)); q.paste(g, (cr.width + 16, 0)); q.save('qa/%s.jpg' % sid, quality=88)
print(sid, out.size)
