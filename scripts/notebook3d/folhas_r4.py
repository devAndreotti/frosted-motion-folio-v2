import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

BASE = "/mnt/volume-50gb/notebook-3d"
OUT = "/mnt/volume-50gb/worktrees/folio-notebook3d/docs/notebook-3d"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
BG = (24, 24, 24)
LANCZOS = Image.Resampling.LANCZOS


def font(sz):
    return ImageFont.truetype(FONT, sz)


def load(rel):
    im = Image.open(os.path.join(BASE, rel))
    return ImageOps.exif_transpose(im).convert("RGB")


def fit(im, w, h):
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), LANCZOS)


def wrap(draw, text, f, maxw):
    lines, cur = [], ""
    for word in text.split():
        t = (cur + " " + word).strip()
        if not cur or draw.textlength(t, font=f) <= maxw:
            cur = t
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def label(canvas, x, y, text, sz, maxw):
    d = ImageDraw.Draw(canvas)
    f = font(sz)
    lines = wrap(d, text, f, maxw)
    pad = 6
    lh = int(sz * 1.25)
    w = max(d.textlength(l, font=f) for l in lines)
    h = lh * len(lines)
    d.rectangle([x, y, x + w + 2 * pad, y + h + 2 * pad], fill=(0, 0, 0))
    for i, l in enumerate(lines):
        d.text((x + pad, y + pad + i * lh), l, font=f, fill=(255, 255, 255))


def board_correcoes():
    items = [
        ("estados/r4/luz_alta_verde.png", "Luz alta (verde): fundo aceso entre as teclas + brilho"),
        ("estados/r4v/r4_teclado_luz.png", "Teclado de perto: teclas escuras, luz nas frestas"),
        ("estados/r4/site_aberto.png", "Clique na tela: o site abre (só então carrega)"),
        ("estados/r4/vista_de_baixo.png", "Vista de baixo: o site não vaza pelo corpo"),
        ("estados/r4v/r4_selos.png", "Intel, RTX e Senna refeitos"),
        ("estados/r4v/r4_arduino.png", "Arduino e codecademy na proporção certa"),
        ("estados/r4v/r4_traseira.png", "Portas com espaçamento igual + símbolos"),
        ("estados/r4v/r4_junta.png", "Linha acima da junta"),
    ]
    cw, ch, m, g = 640, 400, 12, 12
    W = m * 3 + cw * 2
    H = m * 5 + ch * 4
    canvas = Image.new("RGB", (W, H), BG)
    for i, (path, text) in enumerate(items):
        col, row = i % 2, i // 2
        x0 = m + col * (cw + m)
        y0 = m + row * (ch + m)
        im = fit(load(path), cw, ch)
        canvas.paste(im, (x0 + (cw - im.width) // 2, y0 + (ch - im.height) // 2))
        label(canvas, x0 + 8, y0 + 8, text, 20, cw - 8 - 16)
    canvas.save(os.path.join(OUT, "rodada4-correcoes.jpg"), "JPEG", quality=92)
    return canvas.size


def board_foto_modelo():
    pairs = [
        ("fotos4/IMG_20261025_190815777_HDR_AE.jpg", "estados/r4v/r4_selos.png"),
        ("fotos4/IMG_20261025_190756902_HDR_AE.jpg", "estados/r4v/r4_arduino.png"),
        ("fotos3/10_f0d3293b.jpg", "estados/r4v/r4_fechado_cima.png"),
        ("fotos4/IMG_20261025_190830090_HDR_AE.jpg", "estados/r4v/r4_junta.png"),
        ("fotos3/09_7c6dbad4.jpg", "estados/r4v/r4_traseira.png"),
    ]
    W, H_ROW, m, g = 1100, 380, 10, 10
    cell_w = (W - 3 * m) // 2
    H = m * (len(pairs) + 1) + H_ROW * len(pairs)
    canvas = Image.new("RGB", (W, H), BG)
    for r, (foto, modelo) in enumerate(pairs):
        y0 = m + r * (H_ROW + m)
        for c, (path, name) in enumerate([(foto, "Foto"), (modelo, "Modelo")]):
            x0 = m + c * (cell_w + m)
            im = fit(load(path), cell_w, H_ROW)
            canvas.paste(im, (x0 + (cell_w - im.width) // 2, y0 + (H_ROW - im.height) // 2))
            label(canvas, x0 + 6, y0 + 6, name, 16, cell_w)
    canvas.save(os.path.join(OUT, "rodada4-foto-x-modelo.jpg"), "JPEG", quality=92)
    return canvas.size


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("correcoes", board_correcoes())
    print("foto-x-modelo", board_foto_modelo())
