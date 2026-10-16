import { Archive, ShieldCheck, Trash2, type LucideIcon } from 'lucide-react';
import type { PrivacyCopy } from '@/data/privacy';

// One icon per promise, in the order the copy lists them.
const ICONS: LucideIcon[] = [Archive, ShieldCheck, Trash2];

/** Top of the page: the kicker, the title, the lead and the three promises. */
const PrivacyHero = ({ copy }: { copy: PrivacyCopy }) => (
  <header className="pv-hero">
    <span className="lbl">{copy.kicker}</span>
    <h1 className="pv-h1">{copy.h1}</h1>
    <p className="pv-lead">{copy.lead}</p>
    <ul className="pv-promises">
      {copy.promises.map((promise, i) => {
        const Icon = ICONS[i];
        return (
          <li key={promise.title} className="pv-card pv-promise">
            <Icon className="pv-ic" aria-hidden="true" />
            <strong>{promise.title}</strong>
            <span>{promise.text}</span>
          </li>
        );
      })}
    </ul>
  </header>
);

export default PrivacyHero;
