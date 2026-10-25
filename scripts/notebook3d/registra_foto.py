# registra_foto.py <foto> <saida.jpg>: registra uma foto do apoio na planta deck2 (SIFT) e desenha os adesivos atuais por cima
import sys, json, cv2, numpy as np
from PIL import Image, ImageOps
PX = 5
plan = cv2.imread('plantas/deck2.jpg'); PH, PW = plan.shape[:2]
img = cv2.cvtColor(np.array(ImageOps.exif_transpose(Image.open(sys.argv[1])).convert('RGB')), cv2.COLOR_RGB2BGR)
sift = cv2.SIFT_create(nfeatures=9000)
def feats(im, maxw):
    s = min(1.0, maxw / max(im.shape[:2])); g = cv2.cvtColor(cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    g = cv2.createCLAHE(2.0, (8, 8)).apply(g); k, d = sift.detectAndCompute(g, None); return np.float32([p.pt for p in k]) / s, d
kp, dp = feats(plan, 1500); kc, dc = feats(img, 1600)
m = cv2.BFMatcher(cv2.NORM_L2).knnMatch(dc, dp, k=2)
good = [a for a, b in m if a.distance < 0.75 * b.distance]
H, inl = cv2.findHomography(kc[[g.queryIdx for g in good]], kp[[g.trainIdx for g in good]], cv2.RANSAC, 5.0)
print('inliers', int(inl.sum()))
np.save(sys.argv[2] + '.H.npy', H)
w = cv2.warpPerspective(img, H, (PW, PH), flags=cv2.INTER_AREA)
for s in json.load(open('saida/decals.json')):
    if s['sup'] != 'deck': continue
    a = np.asarray(Image.open('arte/%s.png' % s['id']).convert('RGBA'))[..., 3]
    x0 = int((s['cx'] - s['w'] / 2 + 179.8) * PX); y0 = int((238 - s['cy'] - s['h'] / 2) * PX)
    mm = cv2.resize(a, (max(2, int(s['w'] * PX)), max(2, int(s['h'] * PX)))) > 100
    cnts, _ = cv2.findContours(mm.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in cnts: cv2.polylines(w, [c + [x0, y0]], True, (255, 0, 255), 2)
    cv2.putText(w, s['id'], (x0, y0 + 12), cv2.FONT_HERSHEY_SIMPLEX, .4, (0, 255, 255), 1)
cv2.imwrite(sys.argv[2], w, [cv2.IMWRITE_JPEG_QUALITY, 88])
