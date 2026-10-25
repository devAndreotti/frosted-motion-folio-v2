# teclado.py: layout do teclado ABNT2 do LOQ 15IRH8 medido na planta deck2 (5 px/mm) -> teclado.json + texturas
import json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
PLAN = 5.0
def mx(px): return round(px / PLAN - 179.8, 2)
def my(py): return round(238 - py / PLAN, 2)
ROWS = {  # linha: (y0, y1) em px da planta
    'F': (171, 221), 'N': (233, 307), 'Q': (320, 396), 'A': (409, 484), 'Z': (498, 573), 'B': (586, 662), 'S': (665, 740)}
# (id, x0, x1, legendas) ; legendas: lista de (texto, posição, escala)
K = {
 'F': [('esc', 78, 160, [('Esc', 'tl', 1), ('FnLock', 'bl', .7)]), ('f1', 170, 242, [('F1', 'tl', 1), ('mudo', 'br', 0)]), ('f2', 252, 325, [('F2', 'tl', 1), ('vol-', 'br', 0)]),
       ('f3', 333, 407, [('F3', 'tl', 1), ('vol+', 'br', 0)]), ('f4', 415, 488, [('F4', 'tl', 1), ('mic', 'br', 0)]), ('f5', 496, 568, [('F5', 'tl', 1), ('sol-', 'br', 0)]),
       ('f6', 579, 650, [('F6', 'tl', 1), ('sol+', 'br', 0)]), ('f7', 659, 731, [('F7', 'tl', 1), ('tela', 'br', 0)]), ('f8', 740, 811, [('F8', 'tl', 1), ('aviao', 'br', 0)]),
       ('f9', 820, 892, [('F9', 'tl', 1), ('estrela', 'br', 0)]), ('f10', 898, 968, [('F10', 'tl', 1)]), ('f11', 979, 1050, [('F11', 'tl', 1)]), ('f12', 1059, 1131, [('F12', 'tl', 1)]),
       ('insert', 1140, 1213, [('Insert', 'tc', 1)]), ('prtsc', 1222, 1294, [('PrtSc', 'tc', 1)]), ('delete', 1301, 1385, [('Delete', 'tc', 1)]),
       ('home', 1393, 1458, [('Home', 'tc', 1)]), ('end', 1468, 1531, [('End', 'tc', 1)]), ('pgup', 1540, 1605, [('PgUp', 'tc', 1)]), ('pgdn', 1613, 1678, [('PgDn', 'tc', 1)])],
 'N': [('aspas', 78, 143, [('"', 'tl', 1), ("'", 'bl', 1)]), ('n1', 153, 234, [('!', 'tl', 1), ('1', 'bl', 1), ('¹', 'br', .8)]), ('n2', 245, 328, [('@', 'tl', 1), ('2', 'bl', 1), ('²', 'br', .8)]),
       ('n3', 338, 418, [('#', 'tl', 1), ('3', 'bl', 1), ('³', 'br', .8)]), ('n4', 430, 511, [('$', 'tl', 1), ('4', 'bl', 1), ('£', 'br', .8)]), ('n5', 523, 603, [('%', 'tl', 1), ('5', 'bl', 1), ('¢', 'br', .8)]),
       ('n6', 615, 696, [('¨', 'tl', 1), ('6', 'bl', 1), ('¬', 'br', .8)]), ('n7', 708, 788, [('&', 'tl', 1), ('7', 'bl', 1)]), ('n8', 799, 880, [('*', 'tl', 1), ('8', 'bl', 1)]),
       ('n9', 889, 971, [('(', 'tl', 1), ('9', 'bl', 1)]), ('n0', 981, 1063, [(')', 'tl', 1), ('0', 'bl', 1)]), ('menos', 1072, 1155, [('_', 'tl', 1), ('-', 'bl', 1)]),
       ('igual', 1163, 1245, [('+', 'tl', 1), ('=', 'bl', 1), ('§', 'br', .8)]), ('backspace', 1254, 1383, [('⌫', 'tr', 1.3)]),
       ('numlock', 1393, 1461, [('Num', 'tc', .8), ('Lock', 'cc', .8)]), ('div', 1468, 1534, [('÷', 'tc', 1.2)]), ('mult', 1542, 1608, [('×', 'tc', 1.2)]), ('sub', 1616, 1681, [('−', 'tc', 1.2)])],
 'Q': [('tab', 74, 184, [('⇤', 'tl', 1.2), ('⇥', 'bl', 1.2)])] + [(c.lower(), a, b, [(c, 'tl', 1.25)]) for c, a, b in
       [('Q', 196, 278), ('W', 289, 369), ('E', 382, 462), ('R', 475, 556), ('T', 568, 648), ('Y', 661, 741), ('U', 753, 832), ('I', 845, 925), ('O', 936, 1015), ('P', 1027, 1106)]] +
      [('agudo', 1118, 1197, [('`', 'tl', 1), ('´', 'bl', 1)]), ('colchete_a', 1209, 1291, [('{', 'tl', 1), ('[', 'bl', 1), ('ª', 'br', .8)]),
       ('n_7', 1398, 1464, [('7', 'tl', 1.1), ('Home', 'br', .6)]), ('n_8', 1471, 1537, [('8', 'tl', 1.1), ('↑', 'br', .8)]), ('n_9', 1546, 1612, [('9', 'tl', 1.1), ('PgUp', 'br', .6)])],
 'A': [('caps', 72, 207, [('CapsLk', 'cl', .9)])] + [(c.lower(), a, b, [(c, 'tl', 1.25)]) for c, a, b in
       [('A', 219, 301), ('S', 313, 395), ('D', 407, 489), ('F', 501, 583), ('G', 594, 675), ('H', 687, 768), ('J', 779, 860), ('K', 870, 952), ('L', 962, 1043)]] +
      [('cedilha', 1055, 1135, [('Ç', 'tl', 1.25)]), ('til', 1147, 1228, [('^', 'tl', 1), ('~', 'bl', 1)]), ('colchete_f', 1239, 1309, [('}', 'tl', 1), (']', 'bl', 1), ('º', 'br', .8)]),
       ('n_4', 1398, 1464, [('4', 'tl', 1.1), ('←', 'br', .8)]), ('n_5', 1471, 1537, [('5', 'tl', 1.1)]), ('n_6', 1546, 1612, [('6', 'tl', 1.1), ('→', 'br', .8)])],
 'Z': [('shift_e', 68, 155, [('⇧', 'cl', 1.3)]), ('barra_inv', 169, 250, [('|', 'tl', 1), ('\\', 'bl', 1)])] + [(c.lower(), a, b, [(c, 'tl', 1.25)]) for c, a, b in
       [('Z', 265, 345), ('X', 359, 441), ('C', 452, 533), ('V', 546, 628), ('B', 640, 722), ('N', 732, 814), ('M', 826, 907)]] +
      [('virgula', 918, 1000, [('<', 'tl', 1), (',', 'bl', 1)]), ('ponto', 1010, 1090, [('>', 'tl', 1), ('.', 'bl', 1)]), ('pv', 1102, 1188, [(':', 'tl', 1), (';', 'bl', 1)]),
       ('shift_d', 1200, 1390, [('⇧', 'cr', 1.3)]), ('n_1', 1402, 1467, [('1', 'tl', 1.1), ('End', 'br', .6)]), ('n_2', 1476, 1540, [('2', 'tl', 1.1), ('↓', 'br', .8)]),
       ('n_3', 1552, 1616, [('3', 'tl', 1.1), ('PgDn', 'br', .6)])],
 'B': [('ctrl_e', 66, 157, [('Ctrl', 'cl', .95)]), ('fn', 169, 251, [('Fn', 'cl', .95)]), ('win', 263, 345, [('win', 'cc', 0)]), ('alt', 357, 439, [('Alt', 'cl', .95)]),
       ('espaco', 452, 905, [('luz', 'cl', 0)]), ('altgr', 916, 997, [('AltGr', 'cl', .95)]), ('barra', 1008, 1090, [('?', 'tl', 1), ('/', 'bl', 1), ('°', 'br', .8)]),
       ('cima', 1203, 1291, [('▲', 'cc', .9)]), ('n_0', 1402, 1546, [('0', 'tl', 1.1), ('Ins', 'br', .6)]), ('n_virg', 1555, 1620, [(',', 'tl', 1.1), ('Del', 'br', .6)])],
 'S': [('esq', 1103, 1193, [('◀', 'cc', .9)]), ('baixo', 1204, 1291, [('▼', 'cc', .9)]), ('dir', 1304, 1393, [('▶', 'cc', .9)])],
}
keys = []
for row, ks in K.items():
    y0, y1 = ROWS[row]
    for kid, x0, x1, leg in ks:
        poly = [(mx(x0), my(y1)), (mx(x1), my(y1)), (mx(x1), my(y0)), (mx(x0), my(y0))]
        keys.append({'id': kid, 'fileira': row, 'poly': poly, 'leg': leg})
# teclas especiais: Enter ISO em L, + e Enter do numérico em altura dupla
QY, AY, ZY, BY = ROWS['Q'], ROWS['A'], ROWS['Z'], ROWS['B']
keys.append({'id': 'enter', 'fileira': 'Q', 'leg': [('↵', 'tr', 1.3)], 'poly': [
    (mx(1311), my(AY[1])), (mx(1386), my(AY[1])), (mx(1386), my(QY[0])), (mx(1301), my(QY[0])), (mx(1301), my(QY[1])), (mx(1311), my(QY[1]))]})
keys.append({'id': 'n_mais', 'fileira': 'Q', 'leg': [('+', 'cc', 1.2)], 'poly': [(mx(1619), my(AY[1])), (mx(1685), my(AY[1])), (mx(1685), my(QY[0])), (mx(1619), my(QY[0]))]})
keys.append({'id': 'n_enter', 'fileira': 'Z', 'leg': [('Enter', 'cc', .75)], 'poly': [(mx(1628), my(BY[1])), (mx(1695), my(BY[1])), (mx(1695), my(ZY[0])), (mx(1628), my(ZY[0]))]})
xs = [p[0] for k in keys for p in k['poly']]; ys = [p[1] for k in keys for p in k['poly']]
BB = [math.floor(min(xs)) - 4, math.floor(min(ys)) - 4, math.ceil(max(xs)) + 4, math.ceil(max(ys)) + 4]
TPX = 10  # px/mm da textura
W, H = int((BB[2] - BB[0]) * TPX), int((BB[3] - BB[1]) * TPX)
json.dump({'keys': keys, 'textura_bbox_mm': BB, 'textura_px_por_mm': TPX, 'textura_px': [W, H]}, open('teclado.json', 'w'), indent=1, ensure_ascii=False)
def P(x, y): return ((x - BB[0]) * TPX, (BB[3] - y) * TPX)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
cor = Image.new('RGB', (W, H), (52, 53, 57))
luz = Image.new('L', (W, H), 0)
forma = Image.new('L', (W, H), 0)
dc, dl, df = ImageDraw.Draw(cor), ImageDraw.Draw(luz), ImageDraw.Draw(forma)
LEG_COR = (172, 174, 179)
def icone(d, nome, cx, cy, s, fill):
    if nome == 'win':
        g = s * .22
        for ox in (-1, 1):
            for oy in (-1, 1):
                d.rectangle([cx + ox * g * .55 - g / 2, cy + oy * g * .55 - g / 2, cx + ox * g * .55 + g / 2, cy + oy * g * .55 + g / 2], fill=fill)
    elif nome == 'luz':  # ícone da retroiluminação (meia lua de raios) na barra de espaço
        r = s * .16
        d.line([cx - r, cy + r * .5, cx + r, cy + r * .5], fill=fill, width=max(2, int(s * .03)))
        for a in range(20, 170, 30):
            t = math.radians(a)
            d.line([cx + math.cos(t) * r * .55, cy + r * .2 - math.sin(t) * r * .55, cx + math.cos(t) * r, cy + r * .2 - math.sin(t) * r], fill=fill, width=max(2, int(s * .03)))
    else:  # ícones de função: um traço pequeno discreto
        d.ellipse([cx - s * .05, cy - s * .05, cx + s * .05, cy + s * .05], outline=fill, width=max(1, int(s * .02)))
for k in keys:
    pts = [P(*p) for p in k['poly']]
    dc.polygon(pts, fill=(56, 57, 61)); df.polygon(pts, fill=255)
    x0 = min(p[0] for p in pts); x1 = max(p[0] for p in pts); y0 = min(p[1] for p in pts); y1 = max(p[1] for p in pts)
    hh = 14.5 * TPX  # altura de referência de uma tecla comum
    if k['id'] in ('enter',): y1 = y0 + (ROWS['Q'][1] - ROWS['Q'][0]) / PLAN * TPX
    m = 2.2 * TPX
    for txt, pos, esc in k['leg']:
        if esc == 0:
            cx = {'cc': (x0 + x1) / 2, 'cl': x0 + m + hh * .2, 'br': x1 - m - hh * .08}[pos]
            cy = {'cc': (y0 + y1) / 2, 'cl': (y0 + y1) / 2, 'br': y1 - m - hh * .08}[pos]
            for d, f in ((dc, LEG_COR), (dl, 255)): icone(d, txt, cx, cy, hh, f)
            continue
        f = ImageFont.truetype(FONT, int(hh * .3 * esc))
        bb = f.getbbox(txt); tw, th = bb[2] - bb[0], bb[3] - bb[1]
        ax = {'tl': x0 + m, 'bl': x0 + m, 'cl': x0 + m, 'tc': (x0 + x1 - tw) / 2, 'cc': (x0 + x1 - tw) / 2, 'br': x1 - m - tw, 'tr': x1 - m - tw, 'cr': x1 - m - tw}[pos]
        ay = {'tl': y0 + m * .8, 'tc': y0 + m * .8, 'tr': y0 + m * .8, 'bl': y1 - m - th, 'br': y1 - m - th, 'cl': (y0 + y1 - th) / 2, 'cc': (y0 + y1 - th) / 2, 'cr': (y0 + y1 - th) / 2}[pos]
        for d, c in ((dc, LEG_COR), (dl, 255)): d.text((ax - bb[0], ay - bb[1]), txt, font=f, fill=c)
cor.save('texturas/teclas_cor.png'); luz.save('texturas/teclas_luz.png')
# fundo iluminado: a luz sai de baixo de todas as teclas e enche o vão entre elas (as teclas tampam o meio de cada uma);
# cai suave até ~3 mm fora do teclado
f = np.asarray(forma, np.float32) / 255
cheio = np.asarray(forma.filter(ImageFilter.MaxFilter(int(3.2 * TPX) | 1)).filter(ImageFilter.GaussianBlur(1.6 * TPX)), np.float32) / 255
halo = np.clip(cheio * 1.15, 0, 1) ** 0.8
Image.fromarray((halo * 255).astype(np.uint8)).save('texturas/teclas_halo.png')
# brilho das legendas (o "bloom" das letras): a máscara das legendas borrada, desenhada um pouco acima das teclas
leg = np.asarray(luz.filter(ImageFilter.GaussianBlur(0.55 * TPX)), np.float32) / 255
Image.fromarray((np.clip(leg * 2.2, 0, 1) * 255).astype(np.uint8)).save('texturas/teclas_brilho.png')
print(len(keys), 'teclas; textura', W, 'x', H, 'bbox', BB)
