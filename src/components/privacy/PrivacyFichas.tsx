import { useState } from 'react';
import { FICHA_IDS, type FichaId, type PrivacyCopy } from '@/data/privacy';

/** One card per part of the site, picked with tabs: what it keeps, what it doesn't, and the details. */
const PrivacyFichas = ({ copy }: { copy: PrivacyCopy }) => {
  const [tab, setTab] = useState<FichaId>('newsletter');
  const ficha = copy.fichas[tab];

  return (
    <section className="pv-section" aria-labelledby="pv-fichas-h">
      <div className="pv-sec-head">
        <h2 id="pv-fichas-h" className="pv-h2">{copy.fichasTitle}</h2>
        <p>{copy.fichasLead}</p>
      </div>
      <div role="group" aria-label={copy.fichasTitle} className="pv-tabs">
        {FICHA_IDS.map((id) => (
          <button key={id} type="button" className="pv-tab" aria-pressed={tab === id} onClick={() => setTab(id)}>
            {copy.fichas[id].label}
          </button>
        ))}
      </div>
      <article className="pv-card pv-ficha">
        <div>
          <h3 className="pv-h3">{ficha.title}</h3>
          <p className="pv-sum">{ficha.sum}</p>
        </div>
        <div className="pv-chips-grid">
          <div>
            <span className="pv-chips-k pv-keep-k">{copy.keepLabel}</span>
            <ul className="pv-chips">
              {ficha.keep.map((item) => (
                <li key={item} className="pv-chip pv-chip-keep">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="pv-chips-k pv-not-k">{copy.notLabel}</span>
            <ul className="pv-chips">
              {ficha.not.map((item) => (
                <li key={item} className="pv-chip pv-chip-not">{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <dl className="pv-rows">
          {ficha.rows.map((row) => (
            <div key={row.k} className="pv-row">
              <dt>{row.k}</dt>
              <dd>{row.v}</dd>
            </div>
          ))}
        </dl>
      </article>
    </section>
  );
};

export default PrivacyFichas;
