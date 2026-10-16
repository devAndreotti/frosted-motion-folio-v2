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
  // once the record is gone each value stays on the panel, struck through, so the visitor sees what was removed
  const gone = (value: string) => (isEmpty ? (<><s>{value}</s><span className="pv-gone">{sim.gone}</span></>) : value);

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
        <dl className="pv-rows" data-gone={isEmpty}>
          <div className="pv-row"><dt>{sim.labels.email}</dt><dd>{gone(sim.values.email)}</dd></div>
          <div className="pv-row"><dt>{sim.labels.lang}</dt><dd>{gone(sim.values.lang)}</dd></div>
          <div className="pv-row"><dt>{sim.labels.requested}</dt><dd>{gone(sim.values.requested)}</dd></div>
          <div className="pv-row">
            <dt>{sim.labels.confirmed}</dt>
            <dd className={phase === 'waiting' ? 'pv-dim' : undefined}>
              {gone(phase === 'waiting' || phase === 'deleted' ? sim.values.notYet : sim.values.confirmed)}
            </dd>
          </div>
        </dl>
        {step === 0 && (
          <div className="pv-days">
            <span id="pv-days-l">{sim.slider}</span>
            <div role="group" aria-labelledby="pv-days-l" className="pv-bar">
              {SEGMENTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  className="pv-seg"
                  data-on={i < day && phase !== 'deleted'}
                  aria-pressed={day === i + 1}
                  aria-label={sim.dayTag(i + 1)}
                  // tapping the day you are on steps one back, so the bar can also go back to day 0
                  onClick={() => setDay(day === i + 1 ? i : i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="pv-note">{note}</p>
      </div>
    </section>
  );
};

export default PrivacySimulation;
