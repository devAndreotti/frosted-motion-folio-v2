import { useRef, type KeyboardEvent } from 'react';

export interface UsesTabItem {
  id: string;
  label: string;
}

/** The category tabs: arrow keys move between them (wrapping), Home and End jump to the ends. Selecting a tab shows its cards. */
const UsesTabs = ({
  label,
  tabs,
  selected,
  onSelect,
}: {
  label: string;
  tabs: UsesTabItem[];
  selected: number;
  onSelect: (index: number) => void;
}) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = tabs.length - 1;

  const targetFor = (key: string): number | null => {
    switch (key) {
      case 'ArrowRight':
        return selected >= last ? 0 : selected + 1;
      case 'ArrowLeft':
        return selected <= 0 ? last : selected - 1;
      case 'Home':
        return 0;
      case 'End':
        return last;
      default:
        return null;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = targetFor(event.key);
    if (next === null) return;
    event.preventDefault();
    onSelect(next);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="us-tabs" onKeyDown={onKeyDown}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="button"
          role="tab"
          id={`us-tab-${tab.id}`}
          aria-selected={index === selected}
          aria-controls={`us-panel-${tab.id}`}
          tabIndex={index === selected ? 0 : -1}
          className="us-tab"
          onClick={() => onSelect(index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default UsesTabs;
