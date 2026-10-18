import type { UsesLang, UsesStrings } from '@/data/uses';
import type { UsesCardData } from './UsesCarousel';

/** One item of the selected category: name, detail, reason, and the main or level tag. */
const UsesCard = ({ card, lang, strings }: { card: UsesCardData; lang: UsesLang; strings: UsesStrings }) => {
  const { item } = card;
  return (
    <li className={item.main ? 'us-card us-main' : 'us-card'}>
      {card.categoryLabel && <span className="us-cat">{card.categoryLabel}</span>}
      <div className="us-top">
        <span className="us-name">{item.name}</span>
        {item.main && <span className="us-tag">{strings.mainTag}</span>}
        {item.level && <span className="us-tag us-level">{strings.level[item.level]}</span>}
      </div>
      {item.detail && <span className="us-detail">{item.detail[lang]}</span>}
      <p className="us-why">{item.why[lang]}</p>
    </li>
  );
};

export default UsesCard;
