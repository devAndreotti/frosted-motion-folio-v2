// shoot.cjs <saida.png> <query> [largura altura]: captura o visualizador com Chrome headless (SwiftShader)
const puppeteer = require('/home/ubuntu/staging/folio-v2/pp/node_modules/puppeteer-core');
(async () => {
  const [out, query, w = '1200', h = '800'] = process.argv.slice(2);
  const b = await puppeteer.launch({ executablePath: '/usr/local/bin/google-chrome', headless: 'new', timeout: 150000, protocolTimeout: 300000,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage();
  await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
  p.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.goto('http://127.0.0.1:8097/index.html?' + query, { waitUntil: 'load', timeout: 180000 });
  await p.waitForFunction('window.__ready || window.__error', { timeout: 120000 });
  await new Promise((r) => setTimeout(r, 500));
  await p.screenshot({ path: out, omitBackground: query.includes('bg=transparent') });
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
