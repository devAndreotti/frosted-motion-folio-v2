import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { KNOB_STEP, TV_CHANNELS } from '@/data/memoryTv';
import { useTvFx } from '@/hooks/useTvFx';
import { closeTvAudio, loadTvSounds, startTvHum, stopTvHum, tvClick, tvClunk } from '@/lib/tvAudio';

const BOOT_MS = 600;
const HIT_MS = 700;
const SOUND_KEY = 'tv.sound';

/** The visitor's choice survives between visits; sound starts on, since opening the TV was a click on purpose. */
const savedSound = () => {
  try {
    return localStorage.getItem(SOUND_KEY) !== '0';
  } catch {
    return true;
  }
};

/**
 * The tube TV of Memory Apartment, with its own dial, +/- keys and power button: the error screen ("under
 * construction") and the bridge. Taken from the game's site and trimmed to the two channels, with its own sounds (the
 * only ones on this site) and no links. The antenna and the screen can be touched.
 */
const MemoryTv = () => {
  const { t } = useLanguage();
  const tv = t.now.tv;
  const [ch, setCh] = useState(0);
  const [turns, setTurns] = useState(0); // the knob keeps turning the same way, so it counts steps, not channels
  const [off, setOff] = useState(false);
  const [boot, setBoot] = useState(false);
  const [zap, setZap] = useState<'' | 'za' | 'zb'>('');
  const [wobble, setWobble] = useState<'' | 'wa' | 'wb'>('');
  const [hit, setHit] = useState<'' | 'ant' | 'tap'>('');
  const [sound, setSound] = useState(savedSound);
  const [live, setLive] = useState('');
  const fx = useRef<HTMLCanvasElement>(null);
  const timers = useRef<{ boot?: ReturnType<typeof setTimeout>; hit?: ReturnType<typeof setTimeout> }>({});
  const channel = TV_CHANNELS[ch];
  const label = channel.kind === 'error' ? tv.channelError : tv.channelBridge;

  // a hit (the antenna, a knock) fills the screen with static for a moment, whatever channel it is on
  useTvFx(fx, hit || channel.kind === 'error' ? 'snow' : 'grain', !off);

  useEffect(() => {
    if (!sound) return;
    void loadTvSounds();
    return () => stopTvHum();
  }, [sound]);
  useEffect(() => {
    if (sound && !off) startTvHum();
    else stopTvHum();
  }, [sound, off]);
  useEffect(
    () => () => {
      clearTimeout(timers.current.boot);
      clearTimeout(timers.current.hit);
      closeTvAudio();
    },
    []
  );

  const click = (gain?: number) => sound && tvClick(gain);
  const go = (step: number) => {
    const next = (ch + step + TV_CHANNELS.length) % TV_CHANNELS.length;
    setCh(next);
    setTurns((n) => n + step);
    setZap((z) => (z === 'za' ? 'zb' : 'za')); // alternating the class restarts the flash
    setLive(`CH ${TV_CHANNELS[next].num}: ${TV_CHANNELS[next].kind === 'error' ? tv.channelError : tv.channelBridge}`);
    if (off) power();
    else click();
  };
  const power = () => {
    const turnOn = off;
    clearTimeout(timers.current.boot);
    if (turnOn) timers.current.boot = setTimeout(() => setBoot(false), BOOT_MS);
    if (sound) (turnOn ? tvClick : tvClunk)(0.8);
    setOff(!turnOn);
    setBoot(turnOn);
    setLive(turnOn ? tv.tvOn : tv.tvOff);
  };
  const touch = (kind: 'ant' | 'tap') => {
    if (kind === 'ant') setWobble((w) => (w === 'wa' ? 'wb' : 'wa'));
    if (off) return power(); // touching the dead TV turns it on
    if (sound) (kind === 'ant' ? tvClick : tvClunk)(0.9);
    clearTimeout(timers.current.hit);
    setHit(kind);
    timers.current.hit = setTimeout(() => setHit(''), HIT_MS);
  };
  const toggleSound = () => {
    const on = !sound;
    try {
      localStorage.setItem(SOUND_KEY, on ? '1' : '0');
    } catch {
      /* private mode: the choice just lasts until the dialog closes */
    }
    setSound(on);
    if (on) tvClick();
  };

  const crt = `mtv-crt${zap && !off ? ` ${zap}` : ''}${off ? ' off' : ''}${boot ? ' on' : ''}${hit ? ` hit-${hit}` : ''}`;

  return (
    <div className="mtv-wrap">
      <div className="mtv">
        <button type="button" className={`mtv-ant${wobble ? ` ${wobble}` : ''}`} aria-label={tv.antenna} onClick={() => touch('ant')}>
          <i />
          <i />
          <b />
        </button>
        <div className="mtv-cab">
          <div className="mtv-bezel">
            <div className={crt} role="img" aria-label={tv.screenAria(label)}>
              {channel.kind === 'bridge' ? (
                <img className="mtv-bg" src="./now/tv/ponte.webp" alt="" draggable={false} />
              ) : (
                <>
                  <span className="mtv-snow" />
                  <span className="mtv-nosig">
                    <b>{tv.errTitle}</b>
                    <small>{tv.errSub}</small>
                  </span>
                </>
              )}
              <canvas ref={fx} className="mtv-fx" width={160} height={120} aria-hidden="true" />
              <span className="mtv-scan" />
              <span className={`mtv-osd${channel.kind === 'error' ? ' red' : ''}`} style={{ left: '7%', top: '7%' }}>
                {channel.kind === 'error' ? tv.osdError : '▶'}
              </span>
              <span className="mtv-osd" style={{ right: '7%', top: '7%' }}>
                CH {channel.num}
              </span>
              <span className="mtv-osd" style={{ left: '7%', bottom: '7%' }}>
                {tv.osdDate}
              </span>
              <span className="mtv-osd" style={{ right: '7%', bottom: '7%' }}>
                {channel.time}
              </span>
              <span className="mtv-zap" />
              <span className="mtv-glass" />
              <span className="mtv-offdot" />
              <button type="button" className="mtv-tap" aria-label={tv.tap} onClick={() => touch('tap')} />
            </div>
          </div>
          <div className="mtv-panel">
            <span className="mtv-brand">AURORA</span>
            <span className="mtv-led" aria-hidden="true">
              {off ? '--' : channel.num}
            </span>
            <div className="mtv-knobwrap">
              <button className="mtv-knob" type="button" onClick={() => go(1)} aria-label={tv.next} style={{ transform: `rotate(${turns * KNOB_STEP}deg)` }}>
                <i />
              </button>
              <span className="mtv-klbl">{tv.knob}</span>
            </div>
            <div className="mtv-chbtns">
              <button type="button" onClick={() => go(-1)} aria-label={tv.prev}>
                −
              </button>
              <button type="button" onClick={() => go(1)} aria-label={tv.next}>
                +
              </button>
            </div>
            <div className="mtv-grille" aria-hidden="true" />
            <div className="mtv-pwrrow">
              <button className="mtv-pwr" type="button" onClick={power} aria-pressed={!off} aria-label={tv.power}>
                <i />
              </button>
              <span className={`mtv-pled${off ? '' : ' on'}`} />
            </div>
          </div>
        </div>
        <div className="mtv-feet" aria-hidden="true">
          <i />
          <i />
        </div>
      </div>
      <div className="mtv-foot">
        <p className="mtv-cap" aria-live="polite">
          {off ? '' : `CH ${channel.num} · ${label}`}
          <span className="sr-only">{live}</span>
        </p>
        <button type="button" className="mtv-snd" aria-pressed={sound} onClick={toggleSound}>
          {sound ? <Volume2 className="ic s" aria-hidden="true" /> : <VolumeX className="ic s" aria-hidden="true" />}
          {sound ? tv.soundOn : tv.soundOff}
        </button>
      </div>
    </div>
  );
};

export default MemoryTv;
