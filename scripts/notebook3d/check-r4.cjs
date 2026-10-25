// check-r4.cjs <pasta>: rodada 4 no site (build local): luz alta com bloom, clique na tela abre o site, vista de baixo sem o site vazando, × fecha
const puppeteer = require('/home/ubuntu/staging/folio-v2/pp/node_modules/puppeteer-core');
(async () => {
  const [pasta] = process.argv.slice(2);
  const b = await puppeteer.launch({ executablePath: '/usr/local/bin/google-chrome', headless: 'new', timeout: 150000, protocolTimeout: 900000,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.evaluateOnNewDocument(() => { localStorage.setItem('hue', 'green'); localStorage.setItem('theme', 'dark'); localStorage.setItem('nb.luz', '2'); localStorage.setItem('lang.picked', 'pt'); });
  await p.goto((process.env.SITE || 'http://127.0.0.1:8098/') + '?lang=pt', { waitUntil: 'load', timeout: 180000 });
  await p.evaluate(() => document.getElementById('projects')?.scrollIntoView());
  await p.waitForSelector('.nb3d', { timeout: 180000 });
  await p.evaluate(() => document.querySelector('.nb3d').scrollIntoView({ block: 'center' }));
  await p.waitForSelector('.nb3d-stage.is-live', { timeout: 420000 });
  await new Promise((r) => setTimeout(r, 2500));
  const shot = async (nome) => { const el = await p.$('.nb3d-stage'); await el.screenshot({ path: `${pasta}/${nome}.png` }); console.log('ok', nome); };
  await shot('luz_alta_verde');
  console.log('iframe antes do clique:', await p.evaluate(() => !!document.querySelector('.nb3d-live-win iframe[src]')));
  // clica no meio da tela do notebook (o 3D começa de frente: a tela fica no terço de cima do palco)
  const r = await p.evaluate(() => { const q = document.querySelector('.nb3d-stage').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height * 0.32 }; });
  await p.mouse.click(r.x, r.y);
  const loaded = await p.waitForSelector('.nb3d-live-win.is-loaded', { timeout: 120000 }).then(() => true, () => false);
  console.log('site abriu com o clique:', loaded);
  await new Promise((r2) => setTimeout(r2, 2500));
  await shot('site_aberto');
  // vista de baixo: arrasta para olhar o notebook por baixo; o site não pode aparecer através do corpo
  // arrasta a partir do apoio de pulso (fora da tela), para cima: a câmera desce e olha o notebook por baixo
  const st = await p.evaluate(() => { const q = document.querySelector('.nb3d-stage').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height * 0.82 }; });
  await p.mouse.move(st.x, st.y); await p.mouse.down();
  for (let i = 1; i <= 14; i++) { await p.mouse.move(st.x + i * 3, st.y - i * 16); await new Promise((r2) => setTimeout(r2, 40)); }
  await p.mouse.up();
  await new Promise((r2) => setTimeout(r2, 2500));
  await shot('vista_de_baixo');
  await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Voltar à imagem'))?.click());
  await new Promise((r2) => setTimeout(r2, 800));
  console.log('fechou no ×:', !(await p.evaluate(() => !!document.querySelector('.nb3d-live-win iframe[src]'))));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
