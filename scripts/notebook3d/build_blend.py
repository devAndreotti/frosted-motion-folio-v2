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
    'aleta': mat('aleta', srgb(28, 29, 32), 0.2, 0.6),                    # aletas das grades
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

raiz = bpy.data.objects.new('notebook', None); scene.collection.objects.link(raiz)
H = W / 2
# corpo prata (deck): cantos da frente r=10, de trás r=3; a borda de cima é arredondada (a parte plana fica ~3,4 mm para dentro)
corpo_poly = fillet([(-H, 0), (H, 0), (H, 240), (-H, 240)], [10, 10, 3, 3])
corpo = prism('corpo', corpo_poly, Z0, Z_DECK, bev_bot=1.4, mats=('carcaca', 'furo'), parent=raiz,
              top_steps=[(0, 3.4), (0.45, 2.0), (1.3, 1.0), (2.3, 0.35), (3.4, 0.0)])
# bloco traseiro escuro com as portas (começa onde termina a tampa fechada)
tras_poly = fillet([(-H, 238), (H, 238), (H, D), (-H, D)], [1, 1, 6, 6])
traseira = prism('traseira', tras_poly, Z0, Z_REAR, bev_top=2.0, bev_bot=1.4, mats=('traseira', 'furo'), parent=raiz)
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
    prism('pe_frente_%s' % ('e' if sx < 0 else 'd'), fillet([(min(sx * 126, sx * 154), 29), (max(sx * 126, sx * 154), 29), (max(sx * 126, sx * 154), 36), (min(sx * 126, sx * 154), 36)], 3.4),
          0.0, Z0, bev_bot=0.5, mats=('borracha',), parent=raiz)
prism('pe_tras', fillet([(-152, 233), (152, 233), (152, 239), (-152, 239)], 2.9), 0.0, Z0, bev_bot=0.5, mats=('borracha',), parent=raiz)

# ---------- portas e grades (recortes de verdade no corpo) ----------
# traseira: face em Y = D; a = X, b = Z, d = profundidade para dentro
def tras3d(a, b, d): return (a, D - d, b)
ZP = 11.4   # linha de centro das portas traseiras
cortes_tras, cortes_lado = [], []
PORTAS = [('usb_a_1', 45.0, 'usb'), ('usb_a_2', 23.0, 'usb'), ('rj45', 1.0, 'rj45'), ('hdmi', -21.0, 'hdmi'), ('dc_in', -43.0, 'dc')]
def contorno(tipo, ca, cb):
    if tipo == 'usb': return rect(12.6, 4.7, 0.4, ca, cb)
    if tipo == 'dc': return rect(10.6, 4.2, 1.0, ca, cb)
    if tipo == 'hdmi':
        return [(ca - 7.0, cb + 2.25), (ca - 7.0, cb - 0.55), (ca - 5.3, cb - 2.25), (ca + 5.3, cb - 2.25), (ca + 7.0, cb - 0.55), (ca + 7.0, cb + 2.25)][::-1]
    # RJ-45 fino (tampinha que abre para baixo): retângulo com o encaixe da trava embaixo
    return [(ca - 5.9, cb + 3.0), (ca - 5.9, cb - 1.6), (ca - 3.4, cb - 1.6), (ca - 3.4, cb - 3.2), (ca + 3.4, cb - 3.2), (ca + 3.4, cb - 1.6), (ca + 5.9, cb - 1.6), (ca + 5.9, cb + 3.0)][::-1]
for nome, xc, tipo in PORTAS:
    cortes_tras.append(slab('corte_' + nome, contorno(tipo, xc, ZP), -1.0, 5.0, tras3d, 'furo'))
    if tipo == 'usb':
        slab(nome + '_lingua', rect(11.0, 1.5, 0.0, xc, ZP + 0.85), 0.7, 5.0, tras3d, 'lingua', parent=raiz)
    elif tipo == 'hdmi':
        slab(nome + '_lingua', rect(10.4, 1.0, 0.0, xc, ZP + 0.2), 0.9, 5.0, tras3d, 'aleta', parent=raiz)
        for i in range(9):
            slab('%s_pino_%d' % (nome, i), rect(0.5, 0.25, 0.0, xc - 4.4 + i * 1.1, ZP + 0.82), 1.2, 4.8, tras3d, 'ouro', parent=raiz)
    elif tipo == 'rj45':
        for i in range(8):
            slab('%s_pino_%d' % (nome, i), rect(0.45, 0.9, 0.0, xc - 3.15 + i * 0.9, ZP + 2.3), 2.2, 4.8, tras3d, 'ouro', parent=raiz)
    else:
        slab(nome + '_pino', rect(1.6, 2.2, 0.3, xc + 3.6, ZP), 1.0, 5.0, tras3d, 'ouro', parent=raiz)
# grades dos cantos (com aletas) e a haste verde-água por cima de cada uma
for sx in (-1, 1):
    a0, a1 = sorted((sx * 62.0, sx * 173.0))
    cortes_tras.append(slab('corte_grade_%d' % sx, rect(a1 - a0, 5.6, 1.2, (a0 + a1) / 2, 5.4), -1.0, 6.0, tras3d, 'furo'))
    n = int((a1 - a0 - 2) / 2.6)
    for i in range(n):
        xa = a0 + 1.8 + i * 2.6
        slab('aleta_%d_%02d' % (sx, i), rect(0.7, 5.6, 0.0, xa, 5.4), 0.9, 5.5, tras3d, 'aleta', parent=raiz)
    h0, h1 = sorted((sx * 60.0, sx * 176.5))
    haste = slab('haste_%d' % sx, rect(h1 - h0, 2.6, 1.25, (h0 + h1) / 2, 9.4), -0.55, 1.2, tras3d, 'verde_agua', parent=raiz)
# lado esquerdo: USB-C e P2; lado direito: USB-A e a chave da câmera (a = Y, b = Z)
def lado3d(sx):
    return lambda a, b, d: (sx * (H - d), a, b)
cortes_lado.append(slab('corte_usb_c', rect(8.8, 3.2, 1.5, 84.4, 8.6), -1.0, 4.5, lado3d(-1), 'furo'))
slab('usb_c_lingua', rect(6.6, 0.7, 0.0, 84.4, 8.6), 0.8, 4.5, lado3d(-1), 'lingua', parent=raiz)
cortes_lado.append(slab('corte_p2', fillet(rect(3.6, 3.6, 0.0, 59.8, 8.6), 1.79, 6), -1.0, 4.5, lado3d(-1), 'furo'))
cortes_lado.append(slab('corte_usb_a_lado', rect(12.6, 4.7, 0.4, 68.2, 8.6), -1.0, 5.0, lado3d(1), 'furo'))
slab('usb_a_lado_lingua', rect(11.0, 1.5, 0.0, 68.2, 9.45), 0.7, 5.0, lado3d(1), 'lingua', parent=raiz)
cortes_lado.append(slab('corte_chave_camera', rect(6.5, 2.4, 1.1, 47.2, 8.6), -1.0, 2.5, lado3d(1), 'furo'))
slab('chave_camera_botao', rect(2.6, 1.6, 0.6, 45.6, 8.6), -0.3, 2.5, lado3d(1), 'aleta', parent=raiz)
# grades laterais (2 fileiras x 4 na metade de trás)
for sx in (-1, 1):
    for fila, zc in enumerate((6.2, 11.0)):
        for i in range(4):
            cortes_lado.append(slab('corte_grade_lado_%d_%d_%d' % (sx, fila, i), rect(24.0, 3.0, 1.2, 140 + i * 26.5, zc), -1.0, 3.5, lado3d(sx), 'furo'))
recortar(traseira, cortes_tras)
recortar(corpo, cortes_lado)
# topo do bloco traseiro: textura de pontinhos com as legendas das portas, e o LED branco
plane('traseira_topo', [(-176.0, 240.5), (176.0, 240.5), (176.0, 262.6), (-176.0, 262.6)], Z_REAR + 0.02, 'traseira_topo',
      uv=((1, 1), (0, 1), (0, 0), (1, 0)), parent=raiz)
cyl_z('led_traseira', -33.0, 261.2, Z_REAR, Z_REAR + 0.12, 0.55, 'led_branco', parent=raiz, seg=16)

# ---------- teclado (cada tecla é um objeto, para afundar e tocar sozinha) ----------
kb = json.load(open(os.path.join(BASE, 'teclado.json')))
bx0, by0, bx1, by1 = kb['textura_bbox_mm']
def kuv(x, y): return ((x - DX - bx0) / (bx1 - bx0), (y - by0) / (by1 - by0))
for k in kb['keys']:
    poly = [(x + DX, y) for x, y in k['poly']]
    raios = [1.1, 1.1, 1.1, 1.1, 1.1, 0.0] if k['id'] == 'enter' else 1.1
    prism('tk_' + k['id'], fillet(poly, raios, 3), Z_DECK - 0.8, Z_DECK + T_KEY, bev_top=0.45, mats=('teclas',), uv=kuv, parent=raiz, cap_bot=False)
# halo da retroiluminação, logo acima do deck
plane('brilho_teclas', [(bx0 + DX, by0), (bx1 + DX, by0), (bx1 + DX, by1), (bx0 + DX, by1)], Z_DECK + 0.05, 'brilho_teclas', parent=raiz)
# touchpad 120 x 75 (PSREF), sulco escuro em volta
tp = fillet([(-103.6 + DX, 8.0), (16.4 + DX, 8.0), (16.4 + DX, 83.0), (-103.6 + DX, 83.0)], 4.0, 5)
prism('touchpad_sulco', offset(tp, -0.6), Z_DECK - 0.4, Z_DECK + 0.03, mats=('furo',), parent=raiz, cap_bot=False)
prism('touchpad', tp, Z_DECK - 0.4, Z_DECK + 0.06, bev_top=0.25, mats=('touchpad',), parent=raiz, cap_bot=False)
# botão liga/desliga redondo com o LED no meio (fica no centro, ao lado do adesivo do Mr. Robot)
PW = (-3.6 + DX, 214.0)
cyl_z('botao_anel', PW[0], PW[1], Z_DECK - 0.3, Z_DECK + 0.25, 5.3, 'furo', parent=raiz, seg=40)
cyl_z('botao_power', PW[0], PW[1], Z_DECK - 0.2, Z_DECK + 0.55, 4.7, 'botao', parent=raiz, seg=40)
cyl_z('led_power', PW[0], PW[1], Z_DECK + 0.55, Z_DECK + 0.62, 0.85, 'led', parent=raiz, seg=20)

# ---------- dobradiças ----------
for sx in (-1, 1):
    cyl_x('dobradica_%s' % ('e' if sx < 0 else 'd'), sx * 125.0, PIVO[1], PIVO[2], 4.3, 48.0, 'dobradica', parent=raiz, seg=28)

# tampa (filha do pivô da dobradiça; fechada no GLB, o site abre girando em X)
pivo = bpy.data.objects.new('dobradica', None); scene.collection.objects.link(pivo); pivo.parent = raiz
pivo.location = (PIVO[0] * MM, PIVO[1] * MM, PIVO[2] * MM)
tampa_grp = bpy.data.objects.new('tampa', None); scene.collection.objects.link(tampa_grp); tampa_grp.parent = pivo
tampa_grp.location = (-PIVO[0] * MM, -PIVO[1] * MM, -PIVO[2] * MM)
# contorno com a saliência central da webcam na borda de cima (frente, com a tampa fechada)
lid = [(-H, 0), (-52, 0), (-48, -3.0), (48, -3.0), (52, 0), (H, 0), (H, D_LID), (-H, D_LID)]
lid_poly = fillet(lid, [6, 2.5, 2.5, 2.5, 2.5, 6, 1.5, 1.5], 6)
prism('tampa_casca', lid_poly, Z_LID0, Z_LID1, bev_top=1.1, bev_bot=0.6, mats=('carcaca', 'moldura'), mat_top=0, mat_side=0, mat_bot=1, parent=tampa_grp)
# capas escuras das dobradiças na base da tampa (de trás aparecem como as peças pretas nos cantos)
for sx in (-1, 1):
    a0, a1 = sorted((sx * 101.0, sx * 149.0))
    prism('capa_dobradica_%d' % sx, fillet([(a0, 224.0), (a1, 224.0), (a1, D_LID + 0.15), (a0, D_LID + 0.15)], 1.2, 4), Z_LID0 - 0.12, Z_LID1 + 0.22,
          bev_top=0.8, bev_bot=0.4, mats=('dobradica',), parent=tampa_grp)
# quad anti-horário (visto de cima) e invertido: a face olha para baixo com a tampa fechada, para o usuário com ela aberta.
# v=1 na borda de cima da tela (Y=11.5), v=0 no queixo (Y=205.1)
plane('tela', [(-172.1, 11.5), (172.1, 11.5), (172.1, 205.1), (-172.1, 205.1)], Z_LID0 - 0.05, 'tela',
      uv=((0, 1), (1, 1), (1, 0), (0, 0)), parent=tampa_grp, down=True)
prism('webcam', fillet([(-1.6, -2.4), (1.6, -2.4), (1.6, 0.8), (-1.6, 0.8)], 1.55, 6), Z_LID0 - 0.12, Z_LID0 - 0.02, mats=('furo',), parent=tampa_grp, cap_bot=True)

# adesivos (quads com recorte por alpha, atlas único); os do apoio seguem o mesmo deslocamento DX das teclas
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
            plane('sticker_' + s['id'], q, Z0 - 0.1, 'adesivos', uv=uvq, parent=raiz, down=True)

# junta as peças estáticas por (pai, material): menos chamadas de desenho; as interativas ficam separadas
INTERATIVAS = ('tk_', 'tela', 'tampa_casca', 'led_power', 'botao_power', 'brilho_teclas', 'corpo', 'traseira', 'fundo', 'touchpad')
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

# normais: laterais suaves, tampos planos (auto smooth por ângulo)
for ob in scene.objects:
    if ob.type == 'MESH':
        ob.data.use_auto_smooth = True; ob.data.auto_smooth_angle = math.radians(40)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=True, export_apply=True, export_texcoords=True,
                          export_normals=True, export_materials='EXPORT', export_image_format='AUTO', export_extras=False)
print('OK', OUT, sum(1 for o in scene.objects if o.type == 'MESH'), 'malhas')
