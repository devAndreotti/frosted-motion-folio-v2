// shoot-many.cjs <lista.json> <pasta>: várias fotos do visualizador numa única página (o GLB carrega do cache)
const puppeteer = require('/home/ubuntu/staging/folio-v2/pp/node_modules/puppeteer-core');
const fs = require('fs');
(async () => {
  const [lista, pasta] = process.argv.slice(2);
  const itens = JSON.parse(fs.readFileSync(lista, 'utf8'));
  const b = await puppeteer.launch({ executablePath: '/usr/local/bin/google-chrome', headless: 'new', timeout: 150000, protocolTimeout: 1200000,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const fs2 = require('fs');
  let p = null;
  let n = 0;
  for (const it of itens) {
    if (fs2.existsSync(`${pasta}/${it.nome}.png`)) continue;
    if (!p || n % 4 === 0) {  // página nova a cada 4 fotos: o SwiftShader segura poucos contextos WebGL
      if (p) await p.close();
      p = await b.newPage();
      p.on('pageerror', (e) => console.log('pageerror:', e.message));
    }
    n += 1;
    await p.setViewport({ width: it.w || 1200, height: it.h || 800, deviceScaleFactor: 1 });
    if (!p.url().startsWith('http')) await p.goto('http://127.0.0.1:8097/index.html', { waitUntil: 'load', timeout: 180000 });
    await p.waitForFunction('window.__shoot', { timeout: 180000 });
    await p.evaluate((q) => window.__shoot(q), it.q);
    await new Promise((r) => setTimeout(r, 300));
    await p.screenshot({ path: `${pasta}/${it.nome}.png`, omitBackground: it.q.bg === 'transparent' });
    console.log('ok', it.nome);
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
