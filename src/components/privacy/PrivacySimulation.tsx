import { useState } from 'react';
import type { PrivacyCopy } from '@/data/privacy';
import { DELETE_AFTER_DAYS, phaseFor } from './simulation';

const SEGMENTS = Array.from({ length: DELETE_AFTER_DAYS }, (_, i) => i);

/** "What if I subscribe?": three steps, and the panel shows what exists about the visitor at each one. */
const PrivacySimulation = ({ copy }: { copy: PrivacyCopy }) => {
  const sim = copy.sim;
  const [step, setStep] = useState(0);
  const [day, setDay] = useState(0);
  const phase = phaseFor(step, day);
  const info = sim.phases[phase];
  const note = phase === 'waiting' ? `${info.note} ${sim.faltam(DELETE_AFTER_DAYS - day)}` : info.note;
  const isEmpty = phase === 'deleted' || phase === 'left';

  return (
    <section className="pv-section" aria-labelledby="pv-sim-h">
      <div className="pv-sec-head">
        <h2 id="pv-sim-h" className="pv-h2">{sim.title}</h2>
        <p>{sim.lead}</p>
      </div>
      <div role="group" aria-label={sim.group} className="pv-tabs">
        {sim.steps.map((label, i) => (
          <button key={label} type="button" className="pv-tab" aria-pressed={step === i} onClick={() => setStep(i)}>
            {label}
          </button>
        ))}
      </div>
      <div className="pv-card pv-sim" aria-live="polite">
        <div className="pv-sim-top">
          <span className="pv-sim-title">{sim.panel}</span>
          <span className="pv-status" data-tone={phase}>{info.status}</span>
        </div>
        {(phase === 'waiting' || phase === 'active') && (
          <dl className="pv-rows">
            <div className="pv-row"><dt>{sim.labels.email}</dt><dd>{sim.values.email}</dd></div>
            <div className="pv-row"><dt>{sim.labels.lang}</dt><dd>{sim.values.lang}</dd></div>
            <div className="pv-row"><dt>{sim.labels.requested}</dt><dd>{sim.values.requested}</dd></div>
            <div className="pv-row">
              <dt>{sim.labels.confirmed}</dt>
              <dd className={phase === 'waiting' ? 'pv-dim' : undefined}>
                {phase === 'waiting' ? sim.values.notYet : sim.values.confirmed}
              </dd>
            </div>
          </dl>
        )}
        {isEmpty && <div className="pv-empty">{sim.empty}</div>}
        {step === 0 && (
          <>
            <div className="pv-bar" aria-hidden="true">
              {SEGMENTS.map((i) => (
                <span key={i} className="pv-seg" data-on={i < day && phase !== 'deleted'} />
              ))}
            </div>
            <div className="pv-bar-txt">
              <span>{sim.dayTag(day)}</span>
              <span>{sim.deletedTag}</span>
            </div>
            <label className="pv-range">
              {sim.slider}
              <input
                type="range"
                min={0}
                max={DELETE_AFTER_DAYS}
                step={1}
                value={day}
                aria-valuetext={sim.dayTag(day)}
                onChange={(e) => setDay(Number(e.target.value))}
              />
            </label>
          </>
        )}
        <p className="pv-note">{note}</p>
      </div>
    </section>
  );
};

export default PrivacySimulation;
