# base_planta.py <plantas/bottom.jpg> <base.json>: mede na planta da base (5 px/mm, vista por baixo, traseira em
# cima) as fendas da grelha de admissão e os parafusos, já em coordenadas do modelo (x espelhado, y a partir da frente)
import json
import sys
import cv2
import numpy as np

S, W, D = 5.0, 359.6, 264.8
# parafusos marcados à mão na planta (mm, x da esquerda da foto, y a partir da traseira); o centro é refinado abaixo
PARAFUSOS = [(116.9, 9.0), (248.1, 9.0),            # faixa preta traseira
             (7.7, 30.4), (353.1, 30.6),            # cantos de cima do painel cinza
             (9.7, 140.6), (354.2, 138.2),          # laterais
             (22.5, 257.2), (118.4, 258.4), (253.2, 256.6), (344.6, 252.1)]   # borda da frente


def modelo(x, y):
    return round(W / 2 - x, 2), round(D - y, 2)


def fendas(g):
    roi = np.zeros_like(g)
    roi[int(50 * S):int(142 * S), int(10 * S):int(350 * S)] = 1
    escuro = ((g < 70) & (roi > 0)).astype(np.uint8)
    escuro = cv2.morphologyEx(escuro, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))   # fecha a tela furada
    escuro = cv2.morphologyEx(escuro, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    cs, _ = cv2.findContours(escuro, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    out = []
    for c in cs:
        if cv2.contourArea(c) < 150: continue
        p = cv2.approxPolyDP(c, 0.02 * cv2.arcLength(c, True), True).reshape(-1, 2) / S
        q = [modelo(x, y) for x, y in p]
        a = sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(q, q[1:] + q[:1]))
        out.append(q if a > 0 else q[::-1])          # anti-horário, como os outros polígonos do build
    return sorted(out, key=lambda q: (-q[0][1], q[0][0]))


def refina(g, x, y, r=4.0):
    """centro da cabeça do parafuso: círculo de raio 1,2 a 2,6 mm mais próximo da marcação, numa janela de ±r mm"""
    x0, y0 = int((x - r) * S), int((y - r) * S)
    win = cv2.medianBlur(g[y0:int((y + r) * S), x0:int((x + r) * S)], 3)
    cs = cv2.HoughCircles(win, cv2.HOUGH_GRADIENT, dp=1, minDist=5, param1=60, param2=10, minRadius=6, maxRadius=13)
    if cs is None: return x, y
    cx, cy, _ = min(cs[0], key=lambda c: (c[0] - r * S) ** 2 + (c[1] - r * S) ** 2)
    return (x0 + float(cx)) / S, (y0 + float(cy)) / S


def main(src, out):
    g = cv2.cvtColor(cv2.imread(src), cv2.COLOR_BGR2GRAY)
    base = {'_doc': 'gerado por base_planta.py a partir de plantas/bottom.jpg; mm no sistema do modelo',
            'fendas': fendas(g), 'parafusos': [modelo(*refina(g, x, y)) for x, y in PARAFUSOS]}
    json.dump(base, open(out, 'w'), indent=None, separators=(',', ':'))
    print('fendas', len(base['fendas']), 'parafusos', len(base['parafusos']))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
