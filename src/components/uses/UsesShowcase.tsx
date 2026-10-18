import { useState } from 'react';
import type { UsesLang } from '@/data/uses';
import { USES_CATEGORIES, USES_STRINGS, USES_TABS } from '@/data/uses';
import UsesCarousel, { type UsesCardData } from './UsesCarousel';
import UsesTabs from './UsesTabs';

/** The /uses/ list: one tab per category group, and the selected group's cards in a carousel. */
const UsesShowcase = ({ lang }: { lang: UsesLang }) => {
  const strings = USES_STRINGS[lang];
  const tabs = USES_TABS.map((tab) => {
    const categories = USES_CATEGORIES.filter((category) => tab.categoryIds.includes(category.id));
    const multi = categories.length > 1;
    const cards: UsesCardData[] = categories.flatMap((category) =>
      category.items.map((item) => ({
        key: `${category.id}-${item.name}`,
        item,
        categoryLabel: multi ? category.label[lang] : null,
      }))
    );
    return { id: tab.id, label: multi ? strings.editorTerminal : (categories[0]?.label[lang] ?? ''), cards };
  });
  const [selected, setSelected] = useState(0);
  const active = tabs[selected];

  return (
    <section className="us-show">
      <UsesTabs label={strings.tabsLabel} tabs={tabs} selected={selected} onSelect={setSelected} />
      <div role="tabpanel" id={`us-panel-${active.id}`} aria-labelledby={`us-tab-${active.id}`} className="us-panel">
        <span className="us-count">{strings.itemCount(active.cards.length)}</span>
        <UsesCarousel key={active.id} cards={active.cards} lang={lang} strings={strings} />
      </div>
    </section>
  );
};

export default UsesShowcase;
