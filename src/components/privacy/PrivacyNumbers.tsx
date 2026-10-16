import type { PrivacyCopy } from '@/data/privacy';

/** The four numbers the page is built on. Each one is a fact the copy states elsewhere. */
const PrivacyNumbers = ({ copy }: { copy: PrivacyCopy }) => (
  <ul className="pv-numbers">
    {copy.numbers.map((n) => (
      <li key={n.big} className="pv-card pv-num">
        <strong className="pv-num-big">{n.big}</strong>
        <span className="pv-num-small">{n.small}</span>
      </li>
    ))}
  </ul>
);

export default PrivacyNumbers;
