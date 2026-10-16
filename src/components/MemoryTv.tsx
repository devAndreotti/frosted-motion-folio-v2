import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { KNOB_STEP, TV_CHANNELS } from '@/data/memoryTv';
import { useTvFx } from '@/hooks/useTvFx';

const BOOT_MS = 600;

/**
 * The tube TV of Memory Apartment, with its own dial, +/- keys and power button: the error screen ("under
 * construction") and the bridge. Taken from the game's site and trimmed to the two channels; no sound, no links.
 */
const MemoryTv = () => {
  const { t } = useLanguage();
  const tv = t.now.tv;
  const [ch, setCh] = useState(0);
  const [turns, setTurns] = useState(0); // the knob keeps turning the same way, so it counts steps, not channels
  const [off, setOff] = useState(false);
  const [boot, setBoot] = useState(false);
  const [zap, setZap] = useState<'' | 'za' | 'zb'>('');
  const [live, setLive] = useState('');
  const fx = useRef<HTMLCanvasElement>(null);
  const bootTimer = useRef<ReturnType<typeof setTimeout>>();
  const channel = TV_CHANNELS[ch];
  const label = channel.kind === 'error' ? tv.channelError : tv.channelBridge;

  useTvFx(fx, channel.kind === 'error' ? 'snow' : 'grain', !off);
  useEffect(() => () => clearTimeout(bootTimer.current), []);

  const go = (step: number) => {
    const next = (ch + step + TV_CHANNELS.length) % TV_CHANNELS.length;
    setCh(next);
    setTurns((n) => n + step);
    setZap((z) => (z === 'za' ? 'zb' : 'za')); // alternating the class restarts the flash
    setLive(`CH ${TV_CHANNELS[next].num}: ${TV_CHANNELS[next].kind === 'error' ? tv.channelError : tv.channelBridge}`);
    if (off) power();
  };
  const power = () => {
    const turnOn = off;
    clearTimeout(bootTimer.current);
    if (turnOn) bootTimer.current = setTimeout(() => setBoot(false), BOOT_MS);
    setOff(!turnOn);
    setBoot(turnOn);
    setLive(turnOn ? tv.tvOn : tv.tvOff);
  };

  const crt = `mtv-crt${zap && !off ? ` ${zap}` : ''}${off ? ' off' : ''}${boot ? ' on' : ''}`;

  return (
    <div className="mtv-wrap">
      <div className="mtv">
        <div className="mtv-ant" aria-hidden="true">
          <i />
          <i />
          <b />
        </div>
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
            </div>
          </div>
          <div className="mtv-panel">
            <span className="mtv-brand">AURORA</span>
            <span className="mtv-led" aria-hidden="true">
              {off ? '--' : channel.num}
            </span>
            <button className="mtv-knob" type="button" onClick={() => go(1)} aria-label={tv.next} style={{ transform: `rotate(${turns * KNOB_STEP}deg)` }}>
              <i />
            </button>
            <span className="mtv-klbl">{tv.knob}</span>
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
      <p className="mtv-cap" aria-live="polite">
        {off ? '' : `CH ${channel.num} · ${label}`}
        <span className="sr-only">{live}</span>
      </p>
    </div>
  );
};

export default MemoryTv;
