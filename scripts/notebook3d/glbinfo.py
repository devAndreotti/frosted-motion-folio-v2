# glbinfo.py <arquivo.glb>: lista nós, malhas, materiais por primitiva e tamanho das imagens
import json, struct, sys
b = open(sys.argv[1], 'rb').read()
n = struct.unpack('<I', b[12:16])[0]
g = json.loads(b[20:20 + n])
mats = [m.get('name') for m in g.get('materials', [])]
for nd in g['nodes']:
    if 'mesh' in nd:
        m = g['meshes'][nd['mesh']]
        print('%-22s' % nd.get('name'), [mats[p['material']] if 'material' in p else None for p in m['primitives']])
for i, im in enumerate(g.get('images', [])):
    bv = g['bufferViews'][im['bufferView']] if 'bufferView' in im else {}
    print('img', i, im.get('name'), im.get('mimeType'), bv.get('byteLength'))
print('materiais:', [(m.get('name'), m.get('alphaMode'), 'emis' if m.get('emissiveTexture') else '') for m in g.get('materials', [])])
print('extensoes:', g.get('extensionsUsed'))
