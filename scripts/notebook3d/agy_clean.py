# agy_clean.py <id> [--fix "instrução extra"] [--so-pos] [--host emerald]
# Limpa um adesivo com o image-generator do agy (Gemini) e devolve arte/<id>.png com transparência,
# na mesma orientação da planta. --so-pos refaz só o recorte do fundo a partir de trabalho/<id>_raw.png.
import sys, json, subprocess, os, time, shlex
import numpy as np
from PIL import Image
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(BASE)
sid = sys.argv[1]
fix = sys.argv[sys.argv.index('--fix') + 1] if '--fix' in sys.argv else ''
d = json.load(open('adesivos.json'))
s = next(x for sup in ('lid', 'deck', 'bottom') for x in d[sup] if x['id'] == sid)
rot = s.get('rot', 0) or 0
bg = s['fundo']
raw = os.path.abspath('trabalho/%s_raw.png' % sid)
if '--so-pos' not in sys.argv:
    im = Image.open('recortes/%s.jpg' % sid).convert('RGB')
    if rot: im = im.rotate(rot, expand=True)
    inp = os.path.abspath('trabalho/%s_in.jpg' % sid)
    im.save(inp, quality=95)
    if os.path.exists(raw): os.rename(raw, raw.replace('_raw.png', '_raw_%d.png' % int(time.time())))
    prompt = (
        "Delegate to your image-generator subagent right away (do not analyze it yourself). "
        "Input image: %s . It is a straight-on photo of a die-cut vinyl sticker stuck on a grey laptop (%s). "
        "Edit it into a clean, flat, evenly lit digital artwork of ONLY the central sticker: keep the exact die-cut outline, "
        "proportions, line work, colours and every letter of any text exactly as in the photo, and keep the same orientation. "
        "Remove glare, reflections, the rainbow holographic sheen, dust and the grey laptop texture, and remove any other sticker "
        "that is cut off at the edges. Keep the sticker's own border. Put it on a perfectly flat solid %s background (no gradient, "
        "no shadow, no frame), centred and filling about 85%% of a square 1024x1024 image. %s"
        "Save the result as %s and reply with the path."
    ) % (inp, s['desc'], bg, (fix + ' ') if fix else '', raw)
    t = time.time()
    host = sys.argv[sys.argv.index('--host') + 1] if '--host' in sys.argv else ''
    if host:
        # agy de outra máquina (outra conta Google, outra cota): copia a entrada, roda lá e traz o resultado
        rdir = '/home/andreotti/nb3d/trabalho'
        rin, rraw = rdir + '/%s_in.jpg' % sid, rdir + '/%s_raw.png' % sid
        prompt = prompt.replace(inp, rin).replace(raw, rraw)
        subprocess.run(['ssh', host, 'mkdir -p %s && rm -f %s' % (rdir, rraw)], check=True, timeout=60)
        subprocess.run(['scp', '-q', inp, '%s:%s' % (host, rin)], check=True, timeout=120)
        r = subprocess.run(['ssh', host, 'cd %s && agy -p %s --output-format stream-json --print-timeout 600s' % (rdir, shlex.quote(prompt))],
                           capture_output=True, text=True, timeout=700)
        subprocess.run(['scp', '-q', '%s:%s' % (host, rraw), raw], timeout=120)
    else:
        r = subprocess.run(['agy', '-p', prompt, '--output-format', 'stream-json', '--print-timeout', '600s'],
                           cwd='trabalho', capture_output=True, text=True, timeout=700)
    open('trabalho/%s_agy.jsonl' % sid, 'w').write(r.stdout + r.stderr)
    print(json.dumps({'id': sid, 'agy_s': round(time.time() - t), 'saiu': os.path.exists(raw)}))
if not os.path.exists(raw):
    sys.exit(2)
# fundo -> transparência: cor de fundo = mediana da borda da imagem gerada
a = np.asarray(Image.open(raw).convert('RGB')).astype(np.float32)
borda = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
c = np.median(borda, axis=0)
dist = np.sqrt(((a - c) ** 2).sum(-1))
alpha = np.clip((dist - 45) / (110 - 45), 0, 1)
# tira o vazamento da cor de fundo nas bordas
k = int(np.argmax(c))
outros = [i for i in range(3) if i != k]
lim = a[..., outros].max(-1)
spill = (a[..., k] > lim) & (alpha < 1)
a[..., k] = np.where(spill, np.minimum(a[..., k], lim + (a[..., k] - lim) * alpha), a[..., k])
rgba = np.dstack([a, alpha * 255]).astype(np.uint8)
out = Image.fromarray(rgba, 'RGBA')
if rot: out = out.rotate(-rot, expand=True)
bb = out.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
out = out.crop((max(0, bb[0] - 6), max(0, bb[1] - 6), min(out.width, bb[2] + 6), min(out.height, bb[3] + 6)))
out.save('arte/%s.png' % sid)
# QA lado a lado: recorte | arte sobre cinza
cr = Image.open('recortes/%s.jpg' % sid).convert('RGB')
h = 420
cr = cr.resize((max(1, int(cr.width * h / cr.height)), h))
g = Image.new('RGBA', out.size, (110, 110, 116, 255)); g.alpha_composite(out)
g = g.convert('RGB').resize((max(1, int(out.width * h / out.height)), h))
q = Image.new('RGB', (cr.width + g.width + 16, h), (30, 30, 30)); q.paste(cr, (0, 0)); q.paste(g, (cr.width + 16, 0))
q.save('qa/%s.jpg' % sid, quality=88)
print(json.dumps({'id': sid, 'arte': 'arte/%s.png' % sid, 'qa': 'qa/%s.jpg' % sid, 'tamanho': out.size, 'fundo_detectado': c.round().tolist()}))
