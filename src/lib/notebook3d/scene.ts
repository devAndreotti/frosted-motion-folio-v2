import { CanvasTexture, MeshBasicMaterial, SRGBColorSpace, type Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { prepareModel, setupBacklight, setupLed, type Backlight, type HoloState } from './materials';
import { LED_COLORS, ROOM_LIGHT, ledState, lidAt, type BacklightLevel } from './logic';
import { createScreen, type ScreenSlide } from './screen';
import { bindPointer, cameraToggles, findParts, makePresser, type Parts } from './interact';
import { keyIdFromCode, keyKind } from './keymap';
import { createKeySound } from './keysound';
import { createLiveScreen, type LiveScreen, type LiveTarget } from './live';
import { createRig, createStage, disposeStage, VIEWS, type ViewName } from './rig';
import { createGlow } from './glow';

export { VIEWS, type ViewName };

const OPEN = (108 * Math.PI) / 180;
const LID_MS = 1100;
const deg = (d: number) => (d * Math.PI) / 180;

export interface NotebookOptions {
  glb: string;
  color: string;
  backlight: BacklightLevel;
  reducedMotion: boolean;
  sound: boolean;
  /** Let a click on the screen load the project's real page (desktop only); the label names its close button. */
  live: boolean;
  closeLiveLabel: string;
  /** Fixed camera and lid angle for screenshots (degrees and meters). */
  still?: { az: number; polar: number; dist: number; lid: number; target?: [number, number, number] };
  onReady?: () => void;
  /** The model failed to load or the GL context was lost. */
  onError?: () => void;
  /** The space bar was clicked: on the real laptop Fn+Space cycles the backlight. */
  onSpace?: () => void;
  /** The lid was opened or closed from the model (a click on it); the real page opened or closed on the screen. */
  onLid?: (open: boolean) => void;
  onLiveChange?: (open: boolean) => void;
}

export interface NotebookHandle {
  show(slide: ScreenSlide): void;
  /** The page a click on the screen opens for the current project (null: none); closes the one open. */
  setLiveTarget(target: LiveTarget | null): void;
  closeLive(): void;
  setBacklight(level: BacklightLevel, color: string): void;
  setLid(open: boolean): void;
  setSound(on: boolean): void;
  /** A key typed on the real keyboard: presses the same key on the model. Returns false when the model has no such key. */
  pressCode(code: string): boolean;
  view(name: ViewName): void;
  dispose(): void;
}

/** Mounts the Lenovo LOQ model in `host`: renders only while something moves and the stage is on screen. */
export function createNotebook(host: HTMLElement, opts: NotebookOptions): NotebookHandle {
  const { renderer, scene, pmrem, camera, controls } = createStage(host, !!opts.still);
  const glow = createGlow(renderer, scene, camera);
  const holo: HoloState = { shift: { value: 0 } };
  const screen = createScreen();
  const screenTex = new CanvasTexture(screen.canvas);
  screenTex.colorSpace = SRGBColorSpace;
  screenTex.flipY = false;
  const screenMat = new MeshBasicMaterial({ name: 'tela', map: screenTex, toneMapped: false });
  const screenDraw = (now: number) => ((screenTex.needsUpdate = true), screen.draw(now));
  const sound = createKeySound();
  sound.setEnabled(opts.sound);
  let backlight: Backlight | null = null;
  let led: ReturnType<typeof setupLed> | null = null;
  let live: LiveScreen | null = null;
  let parts: Parts | null = null;
  let level = opts.backlight;
  let color = opts.color;
  let pivot: Object3D | null = null;
  let lid = 1; // 0 closed .. 1 open
  let lidMove: { from: number; to: number; start: number } | null = null;
  let [screenOn, busy, visible, fading, disposed] = [true, false, false, false, false];
  let [raf, fitDist] = [0, 1];

  // closing the lid puts the laptop to sleep: screen, keyboard light and power LED go dark
  const awake = () => lid > 0.98 && screenOn;
  const applyPower = () => {
    const on = awake();
    backlight?.set(on ? level : 0, color);
    glow.setLevel(on ? level : 0, color);
    scene.environmentIntensity = ROOM_LIGHT[on ? level : 0];
    screenMat.map = on ? screenTex : null;
    screenMat.color.set(on ? '#ffffff' : '#050506');
    screenMat.needsUpdate = true;
    const state = ledState(lid > 0.5, screenOn, busy);
    led?.set(state === 'off' ? null : LED_COLORS[state]);
  };

  const frame = (now: number) => {
    raf = 0;
    if (disposed || !visible || document.hidden) return;
    let moving = rig.step(now) || controls.update();
    if (lidMove) {
      const ms = opts.reducedMotion ? 0 : LID_MS;
      const t = now - lidMove.start;
      lid = lidAt(lidMove.from, lidMove.to, t, ms);
      if (t >= ms) lidMove = null;
      if (pivot) pivot.rotation.x = -OPEN * lid;
      applyPower();
      moving = true;
    }
    if (fading) {
      fading = screenDraw(now);
      moving = moving || fading;
    }
    holo.shift.value = controls.getAzimuthalAngle() * 0.8 + controls.getPolarAngle() * 0.5;
    glow.render();
    live?.sync(camera, awake());
    if (moving) schedule();
  };
  const schedule = () => {
    if (!raf && !disposed) raf = requestAnimationFrame(frame);
  };
  controls.addEventListener('change', schedule);
  // a lost GL context (low memory, GPU reset) leaves a blank canvas: hand the stage back to the still picture
  const onLost = (e: Event) => {
    e.preventDefault();
    opts.onError?.();
  };
  renderer.domElement.addEventListener('webglcontextlost', onLost);

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    glow.setSize(w, h);
    live?.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // distance that fits ~0.5 m across and ~0.4 m up, whichever is tighter (the laptop is 0.36 m wide, 0.25 m tall open)
    const vf = Math.tan(deg(camera.fov / 2));
    fitDist = Math.max(0.25 / (vf * camera.aspect), 0.2 / vf);
    controls.maxDistance = fitDist * 1.6;
    schedule();
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  ro?.observe(host);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    // the real page only runs while the laptop is on screen
    if (!visible) live?.close();
    schedule();
  });
  io.observe(host);
  const onVis = () => schedule();
  document.addEventListener('visibilitychange', onVis);

  const rig = createRig(camera, controls, schedule);
  const setView = rig.go;

  const press = makePresser(schedule);
  const camera3 = cameraToggles(() => parts, schedule, () => sound.press('normal'));
  // closing turns the camera to the lid, from behind, where its stickers read the right way up; opening comes back to the front
  let liveTarget: LiveTarget | null = null;
  const setLid = (open: boolean) => {
    lidMove = { from: lid, to: open ? 1 : 0, start: performance.now() };
    if (!open) live?.close();
    const [az, polar] = VIEWS[open ? 'frente' : 'fechada'];
    setView(az, polar, Math.max(fitDist, camera.position.distanceTo(controls.target)), opts.reducedMotion);
  };
  const unbindPointer = bindPointer(renderer.domElement, camera, () => parts, {
    key(id, mesh) {
      press(mesh);
      sound.press(keyKind(id));
      if (id === 'espaco') opts.onSpace?.();
    },
    lid() {
      const open = (lidMove?.to ?? lid) < 0.5;
      setLid(open);
      opts.onLid?.(open);
    },
    screen() {
      if (liveTarget && awake()) live?.open(liveTarget);
      schedule();
    },
    power() {
      screenOn = !screenOn;
      if (!screenOn) live?.close();
      sound.press('normal');
      applyPower();
      schedule();
    },
    shutter: camera3.shutter,
    camSwitch: camera3.camSwitch,
  });

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    opts.glb,
    (gltf) => {
      if (disposed) return;
      const root = gltf.scene;
      const tela = prepareModel(root, holo, screenMat, Math.min(8, renderer.capabilities.getMaxAnisotropy()));
      pivot = root.getObjectByName('dobradica') ?? null;
      parts = findParts(root);
      backlight = setupBacklight(root);
      led = setupLed(root);
      if (tela && opts.live && !opts.still) {
        live = createLiveScreen(host, tela, {
          root,
          canvas: renderer.domElement,
          getCamera: () => camera,
          closeLabel: opts.closeLiveLabel,
          onBusy: (b) => {
            busy = b;
            applyPower();
            schedule();
          },
          onChange: (open) => (opts.onLiveChange?.(open), schedule()),
        });
      }
      // shaders compile off the main thread where the browser allows it (KHR_parallel_shader_compile), before the first frame
      renderer
        .compileAsync(root, camera, scene)
        .catch(() => undefined)
        .then(() => !disposed && start(root));
    },
    undefined,
    () => opts.onError?.(),
  );

  function start(root: Object3D) {
    scene.add(root);
    resize();
    const s = opts.still;
    if (s) {
      lid = s.lid / 108;
      if (s.target) controls.target.set(...s.target);
      controls.minDistance = 0.05;
      setView(s.az, s.polar, s.dist, true);
    } else {
      // starts exactly like the still picture it replaces: lid open, from the front
      setView(VIEWS.frente[0], VIEWS.frente[1], fitDist, true);
    }
    if (pivot) pivot.rotation.x = -OPEN * lid;
    applyPower();
    fading = true;
    schedule();
    opts.onReady?.();
  }

  return {
    show(slide) {
      screen.show(slide, performance.now(), opts.reducedMotion);
      fading = true;
      schedule();
    },
    setLiveTarget(t) {
      liveTarget = t;
      live?.close();
      schedule();
    },
    closeLive() {
      live?.close();
    },
    setBacklight(l, c) {
      level = l;
      color = c;
      applyPower();
      schedule();
    },
    setLid,
    setSound(on) {
      sound.setEnabled(on);
    },
    pressCode(code) {
      const id = keyIdFromCode(code);
      const key = id ? parts?.keys.get(id) : undefined;
      if (!id || !key) return false;
      press(key);
      sound.press(keyKind(id));
      return true;
    },
    view(name) {
      const [az, polar] = VIEWS[name];
      setView(az, polar, Math.max(fitDist, camera.position.distanceTo(controls.target)), opts.reducedMotion);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      unbindPointer();
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      controls.dispose();
      live?.dispose();
      glow.dispose();
      sound.dispose();
      screenTex.dispose();
      disposeStage(renderer, scene, pmrem);
    },
  };
}
