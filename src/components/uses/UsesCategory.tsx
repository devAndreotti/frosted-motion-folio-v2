import type { UsesCategory as Category, UsesLang } from '@/data/uses';

/** One category of the /uses/ page: its heading and a card per item, with the reason for the pick. */
const UsesCategory = ({ category, lang }: { category: Category; lang: UsesLang }) => {
  const headingId = `us-${category.id}`;
  return (
    <section className="us-sec" aria-labelledby={headingId}>
      <h2 id={headingId} className="us-h2">
        {category.label[lang]}
      </h2>
      <ul className="us-list">
        {category.items.map((item) => (
          <li key={item.name} className="us-card">
            <span className="us-name">{item.name}</span>
            {item.detail && <span className="us-detail">{item.detail[lang]}</span>}
            <p className="us-why">{item.why[lang]}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UsesCategory;
