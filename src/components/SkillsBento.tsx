import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { edgeFadeProps, useScrollEdges } from '@/hooks/useScrollEdges';
import { projects } from '@/data/projects';
import { ALSO_KNOWN, STACK_AREAS, STACK_TIERS, type StackArea, type StackTier, type TierTool } from '@/data/skills';
import { inArea, projectsUsing } from '@/lib/stackCounts';

const ALL_TOOLS = STACK_TIERS.flatMap((tier) => tier.tools);

const Badge = ({ tool }: { tool: TierTool }) => (
  <span className="bdg" style={{ background: tool.tint }}>
    {tool.mono}
  </span>
);

const TierHead = ({ tier }: { tier: StackTier }) => {
  const { lang } = useLanguage();
  return (
    <div className="sk-h">
      <span className={`tm m${tier.level}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <div>
        <span className="sk-t">{tier.title[lang]}</span>
        <span className="sk-s">{tier.desc[lang]}</span>
      </div>
    </div>
  );
};

/**
 * The stack grouped by how much each tool gets used: daily drivers as big
 * tiles with how many portfolio projects use them (Git: public repos), the
 * rest as chips. The area filter fades out whatever doesn't belong to it.
 */
const SkillsBento = ({ repoCount = null }: { repoCount?: number | null }) => {
  const { lang, t } = useLanguage();
  const [area, setArea] = useState<StackArea | 'all'>('all');
  const filterRow = useScrollEdges<HTMLDivElement>();
  const [daily, comfortable, learning] = STACK_TIERS;

  const off = (tool: TierTool) => (inArea(tool, area) ? '' : ' off');
  // A number + unit when there's something to count, otherwise the tool's note.
  const metric = (tool: TierTool): { num: number | null; unit: string } => {
    if (tool.repos && repoCount != null) return { num: repoCount, unit: t.skills.reposUnit };
    const used = tool.matches ? projectsUsing(projects, tool.matches) : [];
    if (used.length > 0) return { num: used.length, unit: t.skills.projectsUnit(used.length) };
    return { num: null, unit: tool.note?.[lang] ?? '' };
  };
  // Chips name the project when only one uses the tool ("Chef AI"), count otherwise.
  const chipMeta = (tool: TierTool) => {
    const used = tool.matches ? projectsUsing(projects, tool.matches) : [];
    if (used.length === 1) return used[0].title;
    if (used.length > 1) return `${used.length} ${t.skills.projectsUnit(used.length)}`;
    return tool.note?.[lang] ?? '';
  };

  const chip = (tool: TierTool) => (
    <div key={tool.name} className={`chp${off(tool)}`}>
      <Badge tool={tool} />
      <span>
        <span className="chp-n">{tool.name}</span>
        <span className="chp-m">{chipMeta(tool)}</span>
      </span>
    </div>
  );

  const filters: { id: StackArea | 'all'; label: string; tint?: string }[] = [
    { id: 'all', label: t.skills.allAreas },
    ...STACK_AREAS.map((a) => ({ id: a.id, label: a.label[lang], tint: a.tint })),
  ];

  return (
    <>
      <div className="sk-bar">
        <p className="k">{t.skills.areaFilterLabel}</p>
        <div ref={filterRow.ref} className="af edge-fade" role="group" aria-label={t.skills.areaFilterLabel} {...edgeFadeProps(filterRow.edges)}>
          {filters.map((f) => {
            const active = area === f.id;
            const count = f.id === 'all' ? ALL_TOOLS.length : ALL_TOOLS.filter((tool) => inArea(tool, f.id)).length;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setArea(active && f.id !== 'all' ? 'all' : f.id)}
                className={`np${active ? ' on' : ''}`}
              >
                {f.tint && <i className="np-dot" style={{ background: f.tint }} />}
                <span>{f.label}</span>
                <span className="np-n">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sk-grid">
        <article className="sk-card sk-main glass">
          <TierHead tier={daily} />
          <div className="tiles">
            {daily.tools.map((tool, i) => {
              const m = metric(tool);
              const wide = i === daily.tools.length - 1 && daily.tools.length % 2 === 1;
              return (
                <div key={tool.name} className={`tile${wide ? ' wide' : ''}${off(tool)}`} data-tool={tool.name}>
                  <div className="tile-top">
                    <Badge tool={tool} />
                    <span className="tile-n">{tool.name}</span>
                  </div>
                  <div className="tile-v">
                    {m.num != null && <span className="tile-num">{m.num}</span>}
                    <span className="tile-u">{m.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
        <article className="sk-card glass">
          <TierHead tier={comfortable} />
          <div className="chips">{comfortable.tools.map(chip)}</div>
        </article>
        <article className="sk-card sk-learn glass">
          <TierHead tier={learning} />
          <div className="chips">{learning.tools.map(chip)}</div>
        </article>
      </div>
      <p className="sk-foot">
        {t.skills.alsoKnown}: <span className="sk-foot-b">{ALSO_KNOWN.join(' · ')}</span>
      </p>
    </>
  );
};

export default SkillsBento;
