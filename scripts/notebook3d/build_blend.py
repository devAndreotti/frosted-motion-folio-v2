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
PIVO = (0.0, 232.0, 19.0)         # eixo da dobradiça: com a tampa aberta o queixo encosta no deck em Y≈229 (como na foto)
DX = 3.5                          # a planta do apoio (teclas, touchpad, adesivos) estava 3,5 mm à esquerda do centro
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
    'verde_agua': mat('verde_agua', srgb(22, 168, 160), 0.1, 0.35),      # hastes verde-água das grades traseiras
    'borracha': mat('borracha', srgb(30, 30, 32), 0.0, 0.9),
    'touchpad': mat('touchpad', srgb(112, 114, 120), 0.35, 0.3),
    'botao': mat('botao', srgb(16, 16, 18), 0.2, 0.25),                  # botão liga/desliga, preto brilhante
    'led': mat('led', srgb(40, 110, 255), 0.0, 0.3),                      # o site pinta: azul, vermelho no esforço
    'led_branco': mat('led_branco', srgb(240, 240, 240), 0.0, 0.3),
    'dobradica': mat('dobradica', srgb(34, 35, 38), 0.3, 0.45),           # dobradiças e capas de plástico escuro
    'lingua': mat('lingua', srgb(96, 98, 104), 0.1, 0.5),                # línguas das portas
    'ouro': mat('ouro', srgb(212, 170, 80), 1.0, 0.35),                   # contatos
    'aleta': mat('aleta', srgb(28, 29, 32), 0.2, 0.6),                    # divisórias e peças escuras
    'aleta_azul': mat('aleta_azul', srgb(34, 118, 158), 0.3, 0.45),       # aletas azuis do dissipador, vistas pelas grades
    'vermelho': mat('vermelho', srgb(200, 30, 34), 0.0, 0.4),             # fundo vermelho da chave da câmera (câmera desligada)
    'lente': mat('lente', srgb(10, 12, 20), 0.6, 0.08),                   # lente da webcam
    'capa': mat('capa', srgb(14, 14, 15), 0.0, 0.7),                      # capinha deslizante da webcam (plástico preto fosco)
    'traseira_topo': mat('traseira_topo', tex='texturas/traseira_topo.png', rough=0.75),
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
def prism(name, poly, z0, z1, bev_top=0.0, bev_bot=0.0, mats=('carcaca',), mat_top=0, mat_bot=0, mat_side=0, uv=None, parent=None, cap_bot=True, top_steps=None):
    """prisma vertical com chanfro em cima/embaixo. poly anti-horário em mm.
    top_steps: perfil arredondado do topo, lista de (recuo, distância abaixo do topo), de fora para dentro."""
    bm = bmesh.new()
    rings = []
    def ring(p, z): return [bm.verts.new((x * MM, y * MM, z * MM)) for x, y in p]
    if bev_bot > 0: rings.append(ring(offset(poly, bev_bot), z0))
    rings.append(ring(poly, z0 + bev_bot))
    if top_steps:
        for ins, dz in top_steps: rings.append(ring(offset(poly, ins) if ins else poly, z1 - dz))
    else:
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

def cyl_z(name, cx, cy, z0, z1, r, material, parent=None, seg=32):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r * MM, radius2=r * MM, depth=(z1 - z0) * MM)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(M[material])
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
    ob.location = (cx * MM, cy * MM, (z0 + z1) / 2 * MM)
    if parent: ob.parent = parent
    return ob

def slab(name, poly, d0, d1, to3d, material, parent=None):
    """prisma de um polígono 2D (a, b) extrudado na profundidade d; to3d(a, b, d) -> (x, y, z) em mm"""
    bm = bmesh.new()
    f = [bm.verts.new([c * MM for c in to3d(a, b, d0)]) for a, b in poly]
    k = [bm.verts.new([c * MM for c in to3d(a, b, d1)]) for a, b in poly]
    n = len(poly)
    bm.faces.new(f); bm.faces.new(list(reversed(k)))
    for i in range(n):
        bm.faces.new((f[i], f[(i + 1) % n], k[(i + 1) % n], k[i]))
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bmesh.ops.triangulate(bm, faces=[x for x in bm.faces if len(x.verts) > 4])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(M[material])
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
    if parent: ob.parent = parent
    return ob

def recortar(alvo, cortadores):
    """boolean: tira os cortadores do alvo; as paredes novas ficam com o material do cortador (preto)"""
    bpy.ops.object.select_all(action='DESELECT')
    for c in cortadores: c.select_set(True)
    bpy.context.view_layer.objects.active = cortadores[0]
    if len(cortadores) > 1: bpy.ops.object.join()
    cut = cortadores[0]
    mod = alvo.modifiers.new('cortes', 'BOOLEAN')
    mod.operation = 'DIFFERENCE'; mod.solver = 'EXACT'; mod.object = cut
    try: mod.material_mode = 'TRANSFER'
    except Exception: pass
    bpy.ops.object.select_all(action='DESELECT')
    alvo.select_set(True); bpy.context.view_layer.objects.active = alvo
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cut, do_unlink=True)

def rect(w, h, r=0.0, ca=0.0, cb=0.0):
    p = [(ca - w / 2, cb - h / 2), (ca + w / 2, cb - h / 2), (ca + w / 2, cb + h / 2), (ca - w / 2, cb + h / 2)]
    return fillet(p, r, 4) if r > 0 else p

# ---------- base que afina para a frente ----------
# PSREF: 22,1 mm na frente, 25,2 atrás. O fundo sobe para a frente (cunha) e tem um chanfro grande e escuro embaixo.
SUBIDA = 2.4          # quanto o fundo sobe da traseira até a borda da frente
CH_IN = CH_ALT = 3.5       # chanfro de baixo: recuo e altura
def zfundo(y): return Z0 + SUBIDA * max(0.0, min(1.0, 1 - y / 240.0))
def cunha(ob, ztopo_fixo):
    """sobe os vértices de baixo conforme Y: o chanfro sobe inteiro, a parede vai se esticando até o topo, que fica onde está"""
    zch = Z0 + CH_IN
    for v in ob.data.vertices:
        y, z = v.co.y / MM, v.co.z / MM
        sobe = zfundo(y) - Z0
        if z <= zch + 0.01:
            v.co.z = (z + sobe) * MM
        elif z < ztopo_fixo:
            v.co.z = (z + sobe * (ztopo_fixo - z) / (ztopo_fixo - zch)) * MM
    ob.data.update()

raiz = bpy.data.objects.new('notebook', None); scene.collection.objects.link(raiz)
H = W / 2
corpo_poly = fillet([(-H, 0), (H, 0), (H, 240), (-H, 240)], [10, 10, 3, 3])
corpo = prism('corpo', corpo_poly, Z0, Z_DECK, bev_bot=CH_IN, mats=('carcaca', 'furo'), parent=raiz,
              top_steps=[(0, 3.4), (0.45, 2.0), (1.3, 1.0), (2.3, 0.35), (3.4, 0.0)])
cunha(corpo, Z_DECK - 3.5)
# bloco traseiro escuro: as duas asas das grades saltam para trás; o meio, com as portas, fica recuado (encave)
RE = 4.5                # recuo do meio
DR = D - RE             # face das portas
tras = [(-H, 238), (H, 238), (H, D), (84, D), (76, DR), (-76, DR), (-84, D), (-H, D)]
tras_poly = fillet(tras, [1, 1, 6, 2, 3, 3, 2, 6], 5)
traseira = prism('traseira', tras_poly, Z0, Z_REAR, bev_top=2.0, bev_bot=1.4, mats=('traseira', 'furo'), parent=raiz)
# fundo: foto retificada da base, inclinado como a cunha
fundo_poly = fillet([(-H + CH_IN, CH_IN), (H - CH_IN, CH_IN), (H - CH_IN, D - 1.6), (-H + CH_IN, D - 1.6)], [8, 8, 5, 5])
bm = bmesh.new(); vs = [bm.verts.new((x * MM, y * MM, (zfundo(y) - 0.02) * MM)) for x, y in reversed(fundo_poly)]
bm.faces.new(vs); bmesh.ops.triangulate(bm, faces=list(bm.faces))
me = bpy.data.meshes.new('fundo'); bm.to_mesh(me); bm.free(); me.materials.append(M['fundo'])
lay = me.uv_layers.new(name='UVMap')
for loop in me.loops:
    v = me.vertices[loop.vertex_index].co
    lay.data[loop.index].uv = ((H - v.x / MM) / W, 1 - (D - v.y / MM) / D)
o = bpy.data.objects.new('fundo', me); scene.collection.objects.link(o); o.parent = raiz
# pés de borracha (os da frente são mais altos: o fundo sobe)
for sx in (-1, 1):
    a, b = sorted((sx * 126, sx * 154))
    prism('pe_frente_%s' % ('e' if sx < 0 else 'd'), fillet([(a, 29), (b, 29), (b, 36), (a, 36)], 3.4), 0.0, zfundo(32.5), bev_bot=0.5, mats=('borracha',), parent=raiz)
prism('pe_tras', fillet([(-152, 233), (152, 233), (152, 239), (-152, 239)], 2.9), 0.0, Z0, bev_bot=0.5, mats=('borracha',), parent=raiz)

# ---------- traseira: portas no meio recuado, grades nas asas ----------
def tras3d(a, b, d): return (a, D - d, b)
def meio3d(a, b, d): return (a, DR - d, b)
ZP = 10.6
cortes_tras, cortes_lado = [], []
PORTAS = [('usb_a_1', 64.0, 'usb'), ('usb_a_2', 38.5, 'usb'), ('rj45', 13.0, 'rj45'), ('hdmi', -20.5, 'hdmi'), ('dc_in', -48.0, 'dc')]
def contorno(tipo, ca, cb):
    if tipo == 'usb': return rect(12.6, 4.8, 0.5, ca, cb)
    if tipo == 'dc': return rect(11.0, 4.6, 1.2, ca, cb)
    if tipo == 'hdmi':
        return [(ca - 7.2, cb + 2.3), (ca - 7.2, cb - 0.5), (ca - 5.4, cb - 2.3), (ca + 5.4, cb - 2.3), (ca + 7.2, cb - 0.5), (ca + 7.2, cb + 2.3)][::-1]
    # RJ-45 de notebook fino: boca de cima e a mandíbula que abre para baixo
    return [(ca - 7.9, cb + 3.4), (ca - 7.9, cb - 1.4), (ca - 5.6, cb - 1.4), (ca - 5.6, cb - 4.4), (ca + 5.6, cb - 4.4), (ca + 5.6, cb - 1.4), (ca + 7.9, cb - 1.4), (ca + 7.9, cb + 3.4)][::-1]
for nome, xc, tipo in PORTAS:
    cortes_tras.append(slab('corte_' + nome, contorno(tipo, xc, ZP), -1.0, 7.0, meio3d, 'furo'))
    if tipo == 'usb':
        slab(nome + '_lingua', rect(11.2, 1.7, 0.2, xc, ZP + 0.9), 1.0, 7.0, meio3d, 'aleta', parent=raiz)
        for i in range(4):
            slab('%s_contato_%d' % (nome, i), rect(1.2, 0.2, 0.0, xc - 3.6 + i * 2.4, ZP + 0.0), 1.4, 6.8, meio3d, 'ouro', parent=raiz)
    elif tipo == 'hdmi':
        slab(nome + '_lingua', rect(10.6, 1.1, 0.0, xc, ZP + 0.3), 1.0, 6.8, meio3d, 'aleta', parent=raiz)
        for i in range(10):
            slab('%s_pino_%d' % (nome, i), rect(0.45, 0.22, 0.0, xc - 4.5 + i * 1.0, ZP + 0.95), 1.3, 6.6, meio3d, 'ouro', parent=raiz)
    elif tipo == 'rj45':
        for i in range(8):
            slab('%s_pino_%d' % (nome, i), rect(0.45, 1.0, 0.0, xc - 3.15 + i * 0.9, ZP + 2.6), 2.4, 6.6, meio3d, 'ouro', parent=raiz)
        # mandíbula (tampinha articulada) um pouco saltada
        slab(nome + '_mandibula', rect(10.8, 2.6, 0.4, xc, ZP - 3.0), -0.5, 0.6, meio3d, 'aleta', parent=raiz)
        slab(nome + '_trava', rect(3.2, 1.4, 0.2, xc, ZP - 0.6), 3.0, 6.6, meio3d, 'aleta', parent=raiz)
    else:
        slab(nome + '_pino', rect(5.2, 1.0, 0.3, xc, ZP), 1.6, 6.8, meio3d, 'lingua', parent=raiz)
        slab(nome + '_pino_metal', rect(4.6, 0.4, 0.0, xc, ZP), 1.4, 6.8, meio3d, 'ouro', parent=raiz)
# grades nas asas: duas fileiras de 3 segmentos, com a haste verde-água entre elas e aletas azuis por dentro
for sx in (-1, 1):
    a0, a1 = sorted((sx * 88.0, sx * 174.0))
    seg = (a1 - a0 - 2 * 1.6) / 3
    for fila, zc in enumerate((5.0, 13.4)):
        for k in range(3):
            c0 = a0 + k * (seg + 1.6)
            cortes_tras.append(slab('corte_grade_%d_%d_%d' % (sx, fila, k), rect(seg, 4.0, 0.8, c0 + seg / 2, zc), -1.0, 6.0, tras3d, 'furo'))
            n = int(seg / 1.25)
            for i in range(n):
                slab('aleta_tras_%d_%d_%d_%02d' % (sx, fila, k, i), rect(0.35, 4.2, 0.0, c0 + 0.7 + i * 1.25, zc), 1.6, 6.0, tras3d, 'aleta_azul', parent=raiz)
    h0, h1 = sorted((sx * 85.5, sx * 176.6))
    slab('haste_%d' % sx, rect(h1 - h0, 2.4, 1.15, (h0 + h1) / 2, 9.2), -0.6, 1.4, tras3d, 'verde_agua', parent=raiz)

# ---------- laterais ----------
def lado3d(sx):
    return lambda a, b, d: (sx * (H - d), a, b)
def zlado(y): return zfundo(y) + CH_ALT
# esquerda: grades, USB-C e P2; direita: chave da câmera, USB-A e grades
cortes_lado.append(slab('corte_usb_c', rect(8.9, 3.3, 1.6, 122.0, zlado(122) + 3.2), -1.0, 4.5, lado3d(-1), 'furo'))
slab('usb_c_lingua', rect(6.6, 0.7, 0.0, 122.0, zlado(122) + 3.2), 0.8, 4.5, lado3d(-1), 'aleta', parent=raiz)
cortes_lado.append(slab('corte_p2', fillet(rect(3.7, 3.7, 0.0, 97.0, zlado(97) + 3.2), 1.84, 6), -1.0, 4.5, lado3d(-1), 'furo'))
cortes_lado.append(slab('corte_usb_a_lado', rect(12.6, 4.8, 0.5, 126.0, zlado(126) + 3.4), -1.0, 5.5, lado3d(1), 'furo'))
slab('usb_a_lado_lingua', rect(11.2, 1.7, 0.2, 126.0, zlado(126) + 4.3), 1.0, 5.5, lado3d(1), 'aleta', parent=raiz)
ZCH = zlado(102) + 3.2
cortes_lado.append(slab('corte_chave_camera', rect(6.6, 2.5, 1.2, 102.0, ZCH), -1.0, 2.2, lado3d(1), 'furo'))
# o vermelho fica na metade de trás do trilho: aparece com o botão na frente (câmera desligada, como nas fotos)
slab('chave_vermelho', rect(2.8, 1.9, 0.6, 103.4, ZCH), 1.6, 2.0, lado3d(1), 'vermelho', parent=raiz)
slab('chave_camera_botao', fillet(rect(2.8, 2.0, 0.0, 100.6, ZCH), 0.95, 5), -0.25, 1.7, lado3d(1), 'aleta', parent=raiz)
for sx in (-1, 1):
    for fila, dz in enumerate((1.6, 5.0)):
        for i in range(4):
            yc = 168.0 + i * 19.2
            zc = zlado(yc) + dz
            cortes_lado.append(slab('corte_grade_lado_%d_%d_%d' % (sx, fila, i), rect(17.6, 2.8, 1.1, yc, zc), -1.0, 4.0, lado3d(sx), 'furo'))
            for j in range(13):
                slab('aleta_lado_%d_%d_%d_%02d' % (sx, fila, i, j), rect(0.35, 3.0, 0.0, yc - 7.6 + j * 1.27, zc), 1.2, 4.0, lado3d(sx), 'aleta_azul', parent=raiz)
recortar(traseira, cortes_tras)
recortar(corpo, cortes_lado)
# alto-falantes: fendas no chanfro de baixo, perto da frente, nos dois lados
for sx in (-1, 1):
    for i in range(16):
        y0 = 14.0 + i * 2.8
        zb = zfundo(y0)
        p_in = (sx * (H - CH_IN), zb); p_out = (sx * H, zb + CH_ALT)
        def em(t, dy, eps=0.06):
            x = p_in[0] + (p_out[0] - p_in[0]) * t + sx * eps * 0.7
            z = p_in[1] + (p_out[1] - p_in[1]) * t - eps * 0.7
            return (x * MM, (y0 + dy) * MM, z * MM)
        bm = bmesh.new()
        vs = [bm.verts.new(em(0.22, 0)), bm.verts.new(em(0.82, 0)), bm.verts.new(em(0.82, 1.3)), bm.verts.new(em(0.22, 1.3))]
        f = bm.faces.new(vs if sx > 0 else list(reversed(vs)))
        me = bpy.data.meshes.new('alto_falante'); bm.to_mesh(me); bm.free(); me.materials.append(M['furo'])
        ob = bpy.data.objects.new('alto_falante_%d_%02d' % (sx, i), me); scene.collection.objects.link(ob); ob.parent = raiz
# topo do bloco traseiro: textura de pontinhos com as legendas das portas, e o LED branco
plane('traseira_topo', [(-176.0, 240.5), (176.0, 240.5), (176.0, 258.0), (-176.0, 258.0)], Z_REAR + 0.02, 'traseira_topo',
      uv=((1, 1), (0, 1), (0, 0), (1, 0)), parent=raiz)
cyl_z('led_traseira', -36.0, 255.6, Z_REAR, Z_REAR + 0.12, 0.55, 'led_branco', parent=raiz, seg=16)

# ---------- teclado (cada tecla é um objeto, para afundar e tocar sozinha) ----------
kb = json.load(open(os.path.join(BASE, 'teclado.json')))
bx0, by0, bx1, by1 = kb['textura_bbox_mm']
def kuv(x, y): return ((x - DX - bx0) / (bx1 - bx0), (y - by0) / (by1 - by0))
for k in kb['keys']:
    poly = [(x + DX, y) for x, y in k['poly']]
    raios = [1.1, 1.1, 1.1, 1.1, 1.1, 0.0] if k['id'] == 'enter' else 1.1
    prism('tk_' + k['id'], fillet(poly, raios, 3), Z_DECK - 0.8, Z_DECK + T_KEY, bev_top=0.45, mats=('teclas',), uv=kuv, parent=raiz, cap_bot=False)
plane('brilho_teclas', [(bx0 + DX, by0), (bx1 + DX, by0), (bx1 + DX, by1), (bx0 + DX, by1)], Z_DECK + 0.05, 'brilho_teclas', parent=raiz)
tp = fillet([(-103.6 + DX, 8.0), (16.4 + DX, 8.0), (16.4 + DX, 83.0), (-103.6 + DX, 83.0)], 4.0, 5)
prism('touchpad_sulco', offset(tp, -0.6), Z_DECK - 0.4, Z_DECK + 0.03, mats=('furo',), parent=raiz, cap_bot=False)
prism('touchpad', tp, Z_DECK - 0.4, Z_DECK + 0.06, bev_top=0.25, mats=('touchpad',), parent=raiz, cap_bot=False)
PW = (-3.6 + DX, 214.0)
cyl_z('botao_anel', PW[0], PW[1], Z_DECK - 0.3, Z_DECK + 0.25, 5.3, 'furo', parent=raiz, seg=40)
cyl_z('botao_power', PW[0], PW[1], Z_DECK - 0.2, Z_DECK + 0.55, 4.7, 'botao', parent=raiz, seg=40)
cyl_z('led_power', PW[0], PW[1], Z_DECK + 0.55, Z_DECK + 0.62, 0.85, 'led', parent=raiz, seg=20)

# ---------- dobradiças ----------
for sx in (-1, 1):
    cyl_x('dobradica_%s' % ('e' if sx < 0 else 'd'), sx * 125.0, PIVO[1], PIVO[2], 4.3, 48.0, 'dobradica', parent=raiz, seg=28)

# ---------- tampa ----------
pivo = bpy.data.objects.new('dobradica', None); scene.collection.objects.link(pivo); pivo.parent = raiz
pivo.location = (PIVO[0] * MM, PIVO[1] * MM, PIVO[2] * MM)
tampa_grp = bpy.data.objects.new('tampa', None); scene.collection.objects.link(tampa_grp); tampa_grp.parent = pivo
tampa_grp.location = (-PIVO[0] * MM, -PIVO[1] * MM, -PIVO[2] * MM)
lid = [(-H, 0), (-52, 0), (-48, -3.0), (48, -3.0), (52, 0), (H, 0), (H, D_LID), (-H, D_LID)]
lid_poly = fillet(lid, [6, 2.5, 2.5, 2.5, 2.5, 6, 1.5, 1.5], 6)
prism('tampa_casca', lid_poly, Z_LID0, Z_LID1, bev_top=1.1, bev_bot=0.6, mats=('carcaca', 'moldura'), mat_top=0, mat_side=0, mat_bot=1, parent=tampa_grp)
for sx in (-1, 1):
    a0, a1 = sorted((sx * 101.0, sx * 149.0))
    prism('capa_dobradica_%d' % sx, fillet([(a0, 224.0), (a1, 224.0), (a1, D_LID + 0.15), (a0, D_LID + 0.15)], 1.2, 4), Z_LID0 - 0.12, Z_LID1 + 0.22,
          bev_top=0.8, bev_bot=0.4, mats=('dobradica',), parent=tampa_grp)
plane('tela', [(-172.1, 11.5), (172.1, 11.5), (172.1, 205.1), (-172.1, 205.1)], Z_LID0 - 0.05, 'tela',
      uv=((0, 1), (1, 1), (1, 0), (0, 0)), parent=tampa_grp, down=True)
# webcam no meio da moldura de cima, com a capinha deslizante que o dono colou (trilho + capa que corre em X)
LENTE = (0.0, 4.2)
cyl_z('webcam', LENTE[0], LENTE[1], Z_LID0 - 0.06, Z_LID0 - 0.01, 1.7, 'furo', parent=tampa_grp, seg=28)
cyl_z('webcam_lente', LENTE[0], LENTE[1], Z_LID0 - 0.08, Z_LID0 - 0.05, 0.9, 'lente', parent=tampa_grp, seg=24)
trilho = prism('camera_trilho', fillet(rect(24.0, 5.6, 0.0, 2.0, LENTE[1]), 2.75, 8), Z_LID0 - 0.75, Z_LID0 - 0.02, mats=('aleta',), parent=tampa_grp)
recortar(trilho, [prism('corte_trilho', fillet(rect(5.0, 3.8, 0.0, 0.0, LENTE[1]), 1.8, 6), Z_LID0 - 1.5, Z_LID0 + 0.5, mats=('furo',))])
prism('camera_capa', fillet(rect(12.0, 5.0, 0.0, -3.5, LENTE[1]), 2.45, 8), Z_LID0 - 1.0, Z_LID0 - 0.7, bev_bot=0.2, mats=('capa',), parent=tampa_grp)

# adesivos (quads com recorte por alpha, atlas único); os do apoio seguem o deslocamento DX das teclas; os da base, a cunha
dec = os.path.join(BASE, 'saida/decals.json')
if os.path.exists(dec) and 'adesivos' in M:
    for s in json.load(open(dec)):
        cx, cy, w, h, rot = s['cx'], s['cy'], s['w'], s['h'], math.radians(s.get('rot', 0))
        if s['sup'] == 'deck': cx += DX
        c, sn = math.cos(rot), math.sin(rot)
        q = [(cx + c * dx - sn * dy, cy + sn * dx + c * dy) for dx, dy in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2))]
        u0, v0, u1, v1 = s['uv']
        uvq = ((u0, v0), (u1, v0), (u1, v1), (u0, v1))
        if s['sup'] == 'deck':
            plane('sticker_' + s['id'], q, Z_DECK + 0.08, 'adesivos', uv=uvq, parent=raiz)
        elif s['sup'] == 'lid':
            plane('sticker_' + s['id'], q, Z_LID1 + 0.08, 'adesivos', uv=uvq, parent=tampa_grp)
        else:
            ob = plane('sticker_' + s['id'], q, Z0 - 0.1, 'adesivos', uv=uvq, parent=raiz, down=True)
            for v in ob.data.vertices:
                v.co.z = (zfundo(v.co.y / MM) - 0.1) * MM

INTERATIVAS = ('tk_', 'tela', 'tampa_casca', 'led_power', 'botao_power', 'brilho_teclas', 'corpo', 'traseira', 'fundo', 'touchpad',
               'camera_capa', 'camera_trilho', 'chave_camera_botao')
grupos = {}
for ob in list(scene.objects):
    if ob.type != 'MESH' or ob.name.startswith(INTERATIVAS): continue
    grupos.setdefault((ob.parent.name if ob.parent else '', ob.data.materials[0].name), []).append(ob)
for (pai, mat_nome), obs in grupos.items():
    if len(obs) < 2: continue
    bpy.ops.object.select_all(action='DESELECT')
    for ob in obs: ob.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    bpy.ops.object.join()
    obs[0].name = 'grupo_%s_%s' % (pai, mat_nome)

for ob in scene.objects:
    if ob.type == 'MESH':
        ob.data.use_auto_smooth = True; ob.data.auto_smooth_angle = math.radians(40)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True, export_texcoords=True,
                          export_normals=True, export_materials='EXPORT', export_image_format='AUTO', export_extras=False)
print('OK', OUT, sum(1 for o in scene.objects if o.type == 'MESH'), 'malhas')
