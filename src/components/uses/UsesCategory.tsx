import type { UsesCategory as Category, UsesLang } from '@/data/uses';
import { USES_STRINGS } from '@/data/uses';

/** One category of the /uses/ page: its heading with the item count, and a card per item with the reason for the pick. */
const UsesCategory = ({ category, lang }: { category: Category; lang: UsesLang }) => {
  const headingId = `us-${category.id}`;
  const strings = USES_STRINGS[lang];
  return (
    <section className="us-sec" aria-labelledby={headingId}>
      <div className="us-sh">
        <h2 id={headingId} className="us-h2">
          {category.label[lang]}
        </h2>
        <span className="us-count">{strings.itemCount(category.items.length)}</span>
      </div>
      <ul className="us-list">
        {category.items.map((item) => (
          <li key={item.name} className={item.main ? 'us-card us-main' : 'us-card'}>
            <div className="us-top">
              <span className="us-name">{item.name}</span>
              {item.main && <span className="us-tag">{strings.mainTag}</span>}
            </div>
            {item.detail && <span className="us-detail">{item.detail[lang]}</span>}
            <p className="us-why">{item.why[lang]}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UsesCategory;
