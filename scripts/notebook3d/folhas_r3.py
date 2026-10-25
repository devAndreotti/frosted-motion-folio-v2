# Monta as 3 folhas da rodada 3 (notebook 3D). Arquivos novos; não altera scripts existentes.
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps
R = '/mnt/volume-50gb/notebook-3d/estados/r3/'
FOTOS = '/mnt/volume-50gb/notebook-3d/fotos3/'
D = '/mnt/volume-50gb/worktrees/folio-notebook3d/docs/notebook-3d/'
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)

def tile(path, label, size, bg=(233, 234, 238)):
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    im.thumbnail(size)
    t = Image.new('RGB', size, bg)
    t.paste(im, ((size[0] - im.width) // 2, (size[1] - im.height) // 2))
    d = ImageDraw.Draw(t)
    # quebra o rotulo em duas linhas se nao couber na largura do quadro
    lines = [label]
    if d.textbbox((0, 0), label, font=F)[2] > size[0] - 40:
        ws = label.split(' '); best = None
        for i in range(1, len(ws)):
            a, b = ' '.join(ws[:i]), ' '.join(ws[i:])
            w = max(d.textbbox((0, 0), a, font=F)[2], d.textbbox((0, 0), b, font=F)[2])
            if best is None or w < best[0]: best = (w, [a, b])
        lines = best[1]
    y = 10
    for ln in lines:
        bb = d.textbbox((0, 0), ln, font=F)
        d.rectangle([10, y, 22 + bb[2], y + 10 + bb[3]], fill=(0, 0, 0))
        d.text((16, y + 3), ln, fill=(255, 255, 255), font=F)
        y += bb[3] + 16
    return t

def sheet(tiles, cols, out, gap=8):
    w, h = tiles[0].size
    rows = (len(tiles) + cols - 1) // cols
    s = Image.new('RGB', (cols * w + (cols - 1) * gap, rows * h + (rows - 1) * gap), (12, 12, 14))
    for i, t in enumerate(tiles):
        s.paste(t, ((i % cols) * (w + gap), (i // cols) * (h + gap)))
    s.save(D + out, quality=82)
    print(out, s.size)

# 1) modelo: 2 colunas
M = [('r3_frente', 'Frente'), ('r3_tres_quartos', '3/4'),
     ('r3_fechado_cima', 'Fechado, de cima: recuo no meio da traseira'),
     ('r3_traseira', 'Traseira: USB, USB, rede, HDMI, carga; grades com aletas azuis'),
     ('r3_webcam', 'Capinha da webcam (clicável)'),
     ('r3_frente_lado', 'Base afinando para a frente, alto-falante no chanfro'),
     ('r3_lado_esq', 'Lado esquerdo: grades, USB-C, P2'),
     ('r3_lado_dir', 'Lado direito: chave da câmera (vermelho = desligada), USB-A, grades')]
sheet([tile(R + f + '.png', l, (600, 400)) for f, l in M], 2, 'rodada3-modelo.jpg')

# 2) adesivos: 2 colunas
A = [('r3_deck_esq', 'Apoio esquerdo: holográficos'), ('r3_deck_dir', 'Apoio direito: holográficos'), ('r3_tampa', 'Tampa')]
sheet([tile(R + f + '.png', l, (600, 400)) for f, l in A], 2, 'rodada3-adesivos.jpg')

# 3) foto x modelo: pares lado a lado, altura 420, largura final 1100
P = [('10_f0d3293b', 'r3_fechado_cima'), ('09_7c6dbad4', 'r3_traseira'), ('03_120ff074', 'r3_webcam'),
     ('04_8b4eb01f', 'r3_lado_esq'), ('05_19bd73ca', 'r3_lado_dir'), ('08_fbdfd382', 'r3_deck_esq')]
H, GAP, W = 420, 16, 1100
rows = []
for foto, rend in P:
    a = ImageOps.exif_transpose(Image.open(FOTOS + foto + '.jpg')).convert('RGB')
    b = Image.open(R + rend + '.png').convert('RGB')
    a = a.resize((round(a.width * H / a.height), H), Image.LANCZOS)
    b = b.resize((round(b.width * H / b.height), H), Image.LANCZOS)
    par = Image.new('RGB', (a.width + GAP + b.width, H), (12, 12, 14))
    par.paste(a, (0, 0)); par.paste(b, (a.width + GAP, 0))
    # rótulos pequenos para ler o par
    for x, txt in ((0, 'Foto'), (a.width + GAP, 'Modelo')):
        d = ImageDraw.Draw(par); bb = d.textbbox((0, 0), txt, font=F)
        d.rectangle([x + 10, 10, x + 22 + bb[2], 20 + bb[3]], fill=(0, 0, 0))
        d.text((x + 16, 13), txt, fill=(255, 255, 255), font=F)
    rows.append(par.resize((W, round(par.height * W / par.width)), Image.LANCZOS))
    print(foto, rend, par.size, '->', rows[-1].size)
total_h = sum(r.height for r in rows) + 8 * (len(rows) - 1)
s = Image.new('RGB', (W, total_h), (12, 12, 14))
y = 0
for r in rows:
    s.paste(r, (0, y)); y += r.height + 8
s.save(D + 'rodada3-foto-x-modelo.jpg', quality=82)
print('rodada3-foto-x-modelo.jpg', s.size)
