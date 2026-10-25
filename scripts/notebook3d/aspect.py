# aspect.py: estima focal e proporção (largura/profundidade) de um retângulo plano a partir de 4 cantos na foto
import sys, json, numpy as np, cv2
def aspect(pts, w, h):
    src = np.float32([[0, 0], [1, 0], [1, 1], [0, 1]])
    H, _ = cv2.findHomography(src, np.float32(pts))
    cx, cy = w / 2, h / 2
    h1, h2 = H[:, 0], H[:, 1]
    # ortogonalidade de K^-1 h1 e K^-1 h2 com K = [[f,0,cx],[0,f,cy],[0,0,1]]
    a = lambda v: np.array([v[0] - cx * v[2], v[1] - cy * v[2]])
    A1, A2 = a(h1), a(h2)
    f2 = -(A1 @ A2) / (h1[2] * h2[2])
    f = np.sqrt(f2) if f2 > 0 else float('nan')
    K = np.array([[f, 0, cx], [0, f, cy], [0, 0, 1]])
    Ki = np.linalg.inv(K)
    r = np.linalg.norm(Ki @ h1) / np.linalg.norm(Ki @ h2)
    return f, r
if __name__ == '__main__':
    pts = json.loads(sys.argv[1]); w, h = int(sys.argv[2]), int(sys.argv[3])
    f, r = aspect(pts, w, h)
    print('focal_px=%.0f  W/D=%.4f  D(se W=359.6)=%.1f mm' % (f, r, 359.6 / r))
    for ff in (2800, 2958, 3100, 3300):
        K = np.array([[ff, 0, w/2], [0, ff, h/2], [0, 0, 1]]); Ki = np.linalg.inv(K)
        Hh, _ = cv2.findHomography(np.float32([[0,0],[1,0],[1,1],[0,1]]), np.float32(pts))
        rr = np.linalg.norm(Ki @ Hh[:, 0]) / np.linalg.norm(Ki @ Hh[:, 1])
        print('  com f=%d: D=%.1f mm' % (ff, 359.6 / rr))
