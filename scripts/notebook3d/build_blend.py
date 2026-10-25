# build_blend.py: monta o Lenovo LOQ 15IRH8 no Blender (4.0, headless) e exporta GLB.
#   blender -b --factory-startup --python-exit-code 1 -P scripts/build_blend.py -- <saida.glb>
# Medidas em mm (convertidas para metros). X = direita do usuário, Y = da borda frontal para trás, Z = cima.
import bpy, bmesh, json, math, os, sys
from mathutils import Vector
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else os.path.join(BASE, 'saida/notebook.glb')
MM = 0.001
W, D, D_LID = 359.6, 264.8, 238.0
Z0, Z_DECK = 1.5, 16.1            # fundo do corpo (acima dos pés) e topo do deck
Z_LID0, Z_LID1 = 17.3, 23.3       # tampa fechada (face interna, face externa)
Z_REAR = 18.8                     # topo do bloco traseiro escuro
PIVO = (0.0, 239.0, 20.3)         # eixo da dobradiça
T_KEY = 1.0                       # altura da tecla acima do deck

for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.images):
    for b in list(coll): coll.remove(b)
scene = bpy.context.scene

# ---------- materiais ----------
def img(path, colorspace='sRGB'):
    i = bpy.data.images.load(os.path.join(BASE, path), check_existing=True)
    i.colorspace_settings.name = colorspace
    return i
def mat(name, cor=(0.5, 0.5, 0.5), metal=0.0, rough=0.5, tex=None, emis=None, alpha_tex=False, blend=None, mr=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; p = nt.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*cor, 1); p.inputs['Metallic'].default_value = metal; p.inputs['Roughness'].default_value = rough
    if tex:
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = img(tex)
        nt.links.new(t.outputs['Color'], p.inputs['Base Color'])
        if alpha_tex: nt.links.new(t.outputs['Alpha'], p.inputs['Alpha'])
    if emis:
        e = nt.nodes.new('ShaderNodeTexImage'); e.image = img(emis)
        nt.links.new(e.outputs['Color'], p.inputs['Emission Color']); p.inputs['Emission Strength'].default_value = 1.0
    if mr:   # textura metallicRoughness do glTF: G = rugosidade, B = metal (máscara do filme holográfico)
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = img(mr, 'Non-Color')
        s = nt.nodes.new('ShaderNodeSeparateColor')
        nt.links.new(t.outputs['Color'], s.inputs['Color'])
        nt.links.new(s.outputs['Green'], p.inputs['Roughness']); nt.links.new(s.outputs['Blue'], p.inputs['Metallic'])
    if blend: m.blend_method = blend
    if blend == 'CLIP': m.alpha_threshold = 0.5
    return m
def srgb(r, g, b): return tuple(((c / 255 + 0.055) / 1.055) ** 2.4 if c / 255 > 0.04045 else c / 255 / 12.92 for c in (r, g, b))
M = {
    'carcaca': mat('carcaca', srgb(118, 120, 126), 0.45, 0.42),          # Storm grey pintado (tampa e deck)
    'traseira': mat('traseira', srgb(38, 39, 42), 0.1, 0.55),            # bloco traseiro e dobradiças
    'moldura': mat('moldura', srgb(12, 12, 14), 0.0, 0.85),               # borda preta da tela
    'tela': mat('tela', tex='texturas/tela_apagada.png', rough=0.2),    # o site troca por CanvasTexture (a textura mantém as UVs no GLB otimizado)
    'furo': mat('furo', srgb(8, 8, 9), 0.0, 0.8),                        # portas e grades
    'verde_agua': mat('verde_agua', srgb(40, 190, 170), 0.1, 0.4),       # acento das grades traseiras
    'borracha': mat('borracha', srgb(30, 30, 32), 0.0, 0.9),
    'touchpad': mat('touchpad', srgb(112, 114, 120), 0.35, 0.3),
    'teclas': mat('teclas', tex='texturas/teclas_cor.png', emis='texturas/teclas_luz.png', metal=0.0, rough=0.7),
    'brilho_teclas': mat('brilho_teclas', srgb(118, 120, 126), tex='texturas/teclas_halo_rgba.png', emis='texturas/teclas_halo.png', alpha_tex=True, blend='BLEND'),
    'fundo': mat('fundo', tex='texturas/fundo.jpg', rough=0.7),
}
if os.path.exists(os.path.join(BASE, 'texturas/adesivos.png')):
    M['adesivos'] = mat('adesivos', tex='texturas/adesivos.png', alpha_tex=True, blend='CLIP', mr='texturas/adesivos_mr.png')

# ---------- geometria ----------
def fillet(poly, raios, seg=6):
    """cantos arredondados: poly em sentido anti-horário, raios por canto (mm)"""
    out = []
    n = len(poly)
    for i in range(n):
        p0, p1, p2 = Vector(poly[i - 1]), Vector(poly[i]), Vector(poly[(i + 1) % n])
        r = raios[i] if isinstance(raios, (list, tuple)) else raios
        if r <= 0: out.append(p1); continue
        a, b = (p0 - p1).normalized(), (p2 - p1).normalized()
        ang = math.acos(max(-1, min(1, a.dot(b))))
        t = r / math.tan(ang / 2)
        t = min(t, (p0 - p1).length * .49, (p2 - p1).length * .49)
        r2 = t * math.tan(ang / 2)
        c = p1 + (a + b).normalized() * (r2 / math.sin(ang / 2))
        s, e = p1 + a * t, p1 + b * t
        a0, a1 = math.atan2(s.y - c.y, s.x - c.x), math.atan2(e.y - c.y, e.x - c.x)
        da = a1 - a0
        while da > math.pi: da -= 2 * math.pi
        while da < -math.pi: da += 2 * math.pi
        for k in range(seg + 1):
            q = a0 + da * k / seg
            out.append(Vector((c.x + r2 * math.cos(q), c.y + r2 * math.sin(q))))
    return [(v.x, v.y) for v in out]
def offset(poly, d):
    """contração simples (polígono convexo-ish) em direção ao centróide pelas normais dos vértices"""
    n = len(poly); out = []
    for i in range(n):
        p0, p1, p2 = Vector(poly[i - 1]), Vector(poly[i]), Vector(poly[(i + 1) % n])
        e1, e2 = (p1 - p0).normalized(), (p2 - p1).normalized()
        n1, n2 = Vector((-e1.y, e1.x)), Vector((-e2.y, e2.x))
        nn = (n1 + n2); nn = nn.normalized() if nn.length > 1e-6 else n1
        k = 1 / max(.3, nn.dot(n1))
        out.append((p1.x + nn.x * d * k, p1.y + nn.y * d * k))
    return out
def prism(name, poly, z0, z1, bev_top=0.0, bev_bot=0.0, mats=('carcaca',), mat_top=0, mat_bot=0, mat_side=0, uv=None, parent=None, cap_bot=True):
    """prisma vertical com chanfro em cima/embaixo. poly anti-horário em mm."""
    bm = bmesh.new()
    rings = []
    def ring(p, z): return [bm.verts.new((x * MM, y * MM, z * MM)) for x, y in p]
    if bev_bot > 0: rings.append(ring(offset(poly, bev_bot), z0))
    rings.append(ring(poly, z0 + bev_bot))
    rings.append(ring(poly, z1 - bev_top))
    if bev_top > 0: rings.append(ring(offset(poly, bev_top), z1))
    n = len(poly)
    for a, b in zip(rings[:-1], rings[1:]):
        for i in range(n):
            f = bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i])); f.material_index = mat_side; f.smooth = True
    top = bm.faces.new(rings[-1]); top.material_index = mat_top; top.smooth = False
    if cap_bot:
        bot = bm.faces.new(list(reversed(rings[0]))); bot.material_index = mat_bot; bot.smooth = False
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for m in mats: me.materials.append(M[m])
    if uv:
        lay = me.uv_layers.new(name='UVMap')
        for loop in me.loops:
            v = me.vertices[loop.vertex_index].co
            lay.data[loop.index].uv = uv(v.x / MM, v.y / MM)
    me.update()
    # sombreamento: suaviza só as laterais (normais divididas pelo ângulo)
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
    if parent: ob.parent = parent
    return ob
def plane(name, quad, z, material, uv=((0, 0), (1, 0), (1, 1), (0, 1)), parent=None, down=False):
    bm = bmesh.new()
    vs = [bm.verts.new((x * MM, y * MM, z * MM)) for x, y in quad]
    f = bm.faces.new(list(reversed(vs)) if down else vs)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(M[material])
    lay = me.uv_layers.new(name='UVMap')
    order = list(reversed(range(4))) if down else list(range(4))
    for li, loop in enumerate(me.loops): lay.data[loop.index].uv = uv[order[li]]
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
    if parent: ob.parent = parent
    return ob
def box(name, x0, y0, z0, x1, y1, z1, material, parent=None):
    return prism(name, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], z0, z1, mats=(material,), parent=parent)
def cyl_x(name, cx, cy, cz, r, l, material, parent=None, seg=20):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r * MM, radius2=r * MM, depth=l * MM)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(M[material])
    for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
    ob.rotation_euler = (0, math.pi / 2, 0); ob.location = (cx * MM, cy * MM, cz * MM)
    if parent: ob.parent = parent
    return ob

raiz = bpy.data.objects.new('notebook', None); scene.collection.objects.link(raiz)
H = W / 2
# corpo prata (deck): cantos da frente r=10, de trás r=3
corpo_poly = fillet([(-H, 0), (H, 0), (H, 240), (-H, 240)], [10, 10, 3, 3])
prism('corpo', corpo_poly, Z0, Z_DECK, bev_top=1.2, bev_bot=1.4, mats=('carcaca',), parent=raiz)
# bloco traseiro escuro com as portas
tras_poly = fillet([(-H, 236), (H, 236), (H, D), (-H, D)], [1, 1, 6, 6])
prism('traseira', tras_poly, Z0, Z_REAR, bev_top=2.0, bev_bot=1.4, mats=('traseira',), parent=raiz)
# fundo: foto retificada da base (vista por baixo, traseira em cima, esquerda da foto = direita do notebook)
fundo_poly = fillet([(-H + 1.2, 1.2), (H - 1.2, 1.2), (H - 1.2, D - 1.2), (-H + 1.2, D - 1.2)], [9, 9, 5, 5])
bm = bmesh.new(); vs = [bm.verts.new((x * MM, y * MM, (Z0 - 0.02) * MM)) for x, y in reversed(fundo_poly)]
bm.faces.new(vs); bmesh.ops.triangulate(bm, faces=list(bm.faces))
me = bpy.data.meshes.new('fundo'); bm.to_mesh(me); bm.free(); me.materials.append(M['fundo'])
lay = me.uv_layers.new(name='UVMap')
for loop in me.loops:
    v = me.vertices[loop.vertex_index].co
    lay.data[loop.index].uv = ((H - v.x / MM) / W, 1 - (D - v.y / MM) / D)
o = bpy.data.objects.new('fundo', me); scene.collection.objects.link(o); o.parent = raiz
# pés de borracha
for sx in (-1, 1):
    prism('pe_frente_%s' % ('e' if sx < 0 else 'd'), fillet([(sx * 126 - 14 * (sx > 0), 29), (sx * 126 + 14 * (sx < 0) + (28 if sx > 0 else 0) - 14 * (sx > 0) * 0, 29), (sx * 126 + 14, 36), (sx * 126 - 14, 36)], 3) if False else
          fillet([(min(sx * 126, sx * 154), 29), (max(sx * 126, sx * 154), 29), (max(sx * 126, sx * 154), 36), (min(sx * 126, sx * 154), 36)], 3.4), 0.0, Z0, bev_bot=0.5, mats=('borracha',), parent=raiz)
prism('pe_tras', fillet([(-152, 233), (152, 233), (152, 239), (-152, 239)], 2.9), 0.0, Z0, bev_bot=0.5, mats=('borracha',), parent=raiz)

# teclado
kb = json.load(open(os.path.join(BASE, 'teclado.json')))
bx0, by0, bx1, by1 = kb['textura_bbox_mm']
def kuv(x, y): return ((x - bx0) / (bx1 - bx0), (y - by0) / (by1 - by0))
teclas_bm_objs = []
for k in kb['keys']:
    poly = [tuple(p) for p in k['poly']]
    if k['id'] == 'enter':
        raios = [1.1, 1.1, 1.1, 1.1, 0.0, 0.0]   # canto interno do L sem raio
        raios = [1.1, 1.1, 1.1, 1.1, 1.1, 0.0]
    else:
        raios = 1.1
    p = fillet(poly, raios, 3)
    nome = 'tecla_espaco' if k['id'] == 'espaco' else 'tk_' + k['id']
    teclas_bm_objs.append(prism(nome, p, Z_DECK - 0.8, Z_DECK + T_KEY, bev_top=0.45, mats=('teclas',), uv=kuv, parent=raiz, cap_bot=False))
# junta todas as teclas menos a barra de espaço (ela fica separada para o clique liga/desliga a luz)
bpy.ops.object.select_all(action='DESELECT')
juntar = [o for o in teclas_bm_objs if o.name != 'tecla_espaco']
for o in juntar: o.select_set(True)
bpy.context.view_layer.objects.active = juntar[0]
bpy.ops.object.join(); juntar[0].name = 'teclas'; juntar[0].data.name = 'teclas'
# halo da retroiluminação, logo acima do deck
plane('brilho_teclas', [(bx0, by0), (bx1, by0), (bx1, by1), (bx0, by1)], Z_DECK + 0.05, 'brilho_teclas', parent=raiz)
# touchpad 120 x 75 (PSREF), sulco escuro em volta
tp = fillet([(-103.6, 8.0), (16.4, 8.0), (16.4, 83.0), (-103.6, 83.0)], 4.0, 5)
prism('touchpad_sulco', offset(tp, -0.6), Z_DECK - 0.4, Z_DECK + 0.03, mats=('furo',), parent=raiz, cap_bot=False)
prism('touchpad', tp, Z_DECK - 0.4, Z_DECK + 0.06, bev_top=0.25, mats=('touchpad',), parent=raiz, cap_bot=False)
# botão liga/desliga ao lado do adesivo do Mr. Robot
prism('botao_power', fillet([(-8.0, 209.6), (0.8, 209.6), (0.8, 218.4), (-8.0, 218.4)], 4.39, 6), Z_DECK - 0.2, Z_DECK + 0.5, bev_top=0.3, mats=('traseira',), parent=raiz)

# laterais: grades (2 fileiras x 4) na metade de trás, portas na frente
def furo_lado(nome, lado, y0, y1, z0, z1):
    x = lado * (H + 0.02)
    prism(nome, [(x - 0.6, y0), (x + 0.6, y0), (x + 0.6, y1), (x - 0.6, y1)], z0, z1, mats=('furo',), parent=raiz)
for lado, tag in ((-1, 'e'), (1, 'd')):
    for fila, (z0, z1) in enumerate(((4.6, 7.8), (9.4, 12.6))):
        for i in range(4):
            y0 = 128 + i * 26.5
            furo_lado('grade_%s_%d_%d' % (tag, fila, i), lado, y0, y0 + 24.0, z0, z1)
furo_lado('usb_c', -1, 80.0, 88.8, 7.0, 10.2)
furo_lado('p2_audio', -1, 58.0, 61.6, 6.8, 10.4)
furo_lado('usb_a_lado', 1, 62.0, 74.5, 6.2, 11.0)
furo_lado('chave_camera', 1, 44.0, 50.5, 7.4, 9.8)
# traseira: 2x USB-A, RJ-45, HDMI, DC-in e grades com acento verde-água nos cantos
def furo_tras(nome, x0, x1, z0, z1, m='furo'):
    prism(nome, [(x0, D - 0.6), (x1, D - 0.6), (x1, D + 0.04), (x0, D + 0.04)], z0, z1, mats=(m,), parent=raiz)
for nome, x0, x1, z0, z1 in (('usb_a_1', 62, 74.5, 6.0, 10.8), ('usb_a_2', 40, 52.5, 6.0, 10.8), ('rj45', 14, 30, 4.4, 15.0),
                              ('hdmi', -16, -1, 6.0, 11.4), ('dc_in', -50, -38, 5.6, 11.6)):
    furo_tras(nome, x0, x1, z0, z1)
for sx in (-1, 1):
    a, b = sorted((sx * 92, sx * 172))
    furo_tras('grade_tras_%d' % sx, a, b, 4.0, 13.8)
    a2, b2 = sorted((sx * 96, sx * 176))
    prism('acento_%d' % sx, [(a2, D - 0.2), (b2, D - 0.2), (b2, D + 0.3), (a2, D + 0.3)], 14.4, 15.6, mats=('verde_agua',), parent=raiz)
# cilindros das dobradiças (simétricos no eixo, então não giram com a tampa)
for sx in (-1, 1):
    cyl_x('dobradica_%s' % ('e' if sx < 0 else 'd'), sx * 98, PIVO[1], PIVO[2], 3.4, 36, 'traseira', parent=raiz)

# tampa (filha do pivô da dobradiça; fechada no GLB, o site abre girando em X)
pivo = bpy.data.objects.new('dobradica', None); scene.collection.objects.link(pivo); pivo.parent = raiz
pivo.location = (PIVO[0] * MM, PIVO[1] * MM, PIVO[2] * MM)
tampa_grp = bpy.data.objects.new('tampa', None); scene.collection.objects.link(tampa_grp); tampa_grp.parent = pivo
tampa_grp.location = (-PIVO[0] * MM, -PIVO[1] * MM, -PIVO[2] * MM)
# contorno com a saliência central da webcam na borda de cima (frente, com a tampa fechada)
lid = [(-H, 0), (-52, 0), (-48, -3.0), (48, -3.0), (52, 0), (H, 0), (H, D_LID), (-H, D_LID)]
lid_poly = fillet(lid, [6, 2.5, 2.5, 2.5, 2.5, 6, 1.5, 1.5], 6)
prism('tampa_casca', lid_poly, Z_LID0, Z_LID1, bev_top=1.1, bev_bot=0.6, mats=('carcaca', 'moldura'), mat_top=0, mat_side=0, mat_bot=1, parent=tampa_grp)
# quad anti-horário (visto de cima) e invertido: a face olha para baixo com a tampa fechada, para o usuário com ela aberta.
# v=1 na borda de cima da tela (Y=11.5), v=0 no queixo (Y=205.1)
plane('tela', [(-172.1, 11.5), (172.1, 11.5), (172.1, 205.1), (-172.1, 205.1)], Z_LID0 - 0.05, 'tela',
      uv=((0, 1), (1, 1), (1, 0), (0, 0)), parent=tampa_grp, down=True)
prism('webcam', fillet([(-1.6, -2.4), (1.6, -2.4), (1.6, 0.8), (-1.6, 0.8)], 1.55, 6), Z_LID0 - 0.12, Z_LID0 - 0.02, mats=('furo',), parent=tampa_grp, cap_bot=True)

# adesivos (quads com recorte por alpha, atlas único)
dec = os.path.join(BASE, 'saida/decals.json')
if os.path.exists(dec) and 'adesivos' in M:
    for s in json.load(open(dec)):
        cx, cy, w, h, rot = s['cx'], s['cy'], s['w'], s['h'], math.radians(s.get('rot', 0))
        c, sn = math.cos(rot), math.sin(rot)
        q = [(cx + c * dx - sn * dy, cy + sn * dx + c * dy) for dx, dy in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2))]
        u0, v0, u1, v1 = s['uv']
        uvq = ((u0, v0), (u1, v0), (u1, v1), (u0, v1))
        if s['sup'] == 'deck':
            plane('sticker_' + s['id'], q, Z_DECK + 0.08, 'adesivos', uv=uvq, parent=raiz)
        elif s['sup'] == 'lid':
            plane('sticker_' + s['id'], q, Z_LID1 + 0.08, 'adesivos', uv=uvq, parent=tampa_grp)
        else:
            plane('sticker_' + s['id'], q, Z0 - 0.1, 'adesivos', uv=uvq, parent=raiz, down=True)

# normais: laterais suaves, tampos planos (auto smooth por ângulo)
for ob in scene.objects:
    if ob.type == 'MESH':
        ob.data.use_auto_smooth = True; ob.data.auto_smooth_angle = math.radians(40)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True, export_texcoords=True,
                          export_normals=True, export_materials='EXPORT', export_image_format='AUTO', export_extras=False)
print('OK', OUT, sum(1 for o in scene.objects if o.type == 'MESH'), 'malhas')
