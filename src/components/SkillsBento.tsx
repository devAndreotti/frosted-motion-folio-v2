import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { projects } from '@/data/projects';
import { ALSO_KNOWN, STACK_AREAS, STACK_TIERS, type StackArea, type StackTier, type TierTool } from '@/data/skills';
import { countProjectsUsing, inArea } from '@/lib/stackCounts';

const ALL_TOOLS = STACK_TIERS.flatMap((tier) => tier.tools);

const Mono = ({ tool, large }: { tool: TierTool; large?: boolean }) => (
  <span
    className={`${large ? 'w-9 h-9 text-[13px] rounded-[10px]' : 'w-8 h-8 text-[11px] rounded-[9px]'} flex items-center justify-center font-extrabold flex-shrink-0`}
    style={{ background: `linear-gradient(155deg, ${tool.tint}, ${tool.tint}99)`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}
  >
    {tool.mono}
  </span>
);

/** Three rising bars, `level` of them lit -- how much a tier gets used, at a glance. */
const LevelMeter = ({ level }: { level: number }) => (
  <span className="flex items-end gap-[3px] h-5 pt-0.5 flex-shrink-0" aria-hidden="true">
    {[8, 12, 16].map((h, i) => (
      <span key={h} className="block w-[5px] rounded-sm" style={{ height: h, background: i < level ? 'var(--accent)' : 'var(--border-2)' }} />
    ))}
  </span>
);

const TierCard = ({ tier, className = '', children }: { tier: StackTier; className?: string; children: React.ReactNode }) => {
  const { lang } = useLanguage();
  return (
    <div className={`glass rounded-3xl p-5 md:p-6 flex flex-col gap-4 ${className}`}>
      <div className="flex items-start gap-3.5">
        <LevelMeter level={tier.level} />
        <div>
          <div className="text-[17px] font-extrabold leading-tight">{tier.title[lang]}</div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--fg-4)' }}>
            {tier.desc[lang]}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

/**
 * The stack grouped by how much each tool gets used: daily drivers as big
 * tiles with the number of portfolio projects that use them, the rest as
 * chips. The area filter fades out whatever doesn't belong to it.
 */
const SkillsBento = () => {
  const { lang, t } = useLanguage();
  const [area, setArea] = useState<StackArea | 'all'>('all');
  const [daily, comfortable, learning] = STACK_TIERS;

  const fade = (tool: TierTool) => (inArea(tool, area) ? '' : ' opacity-20 grayscale');
  const meta = (tool: TierTool) => {
    const count = tool.matches ? countProjectsUsing(projects, tool.matches) : 0;
    return count > 0 ? { count, label: t.skills.projectsUnit(count) } : { count: null, label: tool.note?.[lang] ?? '' };
  };
  const metaText = (tool: TierTool) => {
    const m = meta(tool);
    return m.count == null ? m.label : `${m.count} ${m.label}`;
  };

  const chip = (tool: TierTool, dashed: boolean) => (
    <div
      key={tool.name}
      className={`flex-auto flex items-center gap-2.5 h-[46px] pl-1.5 pr-3.5 rounded-2xl transition-all duration-300${fade(tool)}`}
      style={{ border: `1px ${dashed ? 'dashed' : 'solid'} var(--border-1)`, background: dashed ? 'transparent' : 'var(--surface-1)' }}
    >
      <Mono tool={tool} />
      <span>
        <span className="block text-[14px] font-bold leading-tight">{tool.name}</span>
        <span className="block text-[10.5px] font-mono mt-0.5" style={{ color: 'var(--fg-4)' }}>
          {metaText(tool)}
        </span>
      </span>
    </div>
  );

  const filters: { id: StackArea | 'all'; label: string; tint?: string }[] = [
    { id: 'all', label: t.skills.allAreas },
    ...STACK_AREAS.map((a) => ({ id: a.id, label: a.label[lang], tint: a.tint })),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--fg-4)' }}>
          {t.skills.areaFilterLabel}
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.skills.areaFilterLabel}>
          {filters.map((f) => {
            const active = area === f.id;
            const count = f.id === 'all' ? ALL_TOOLS.length : ALL_TOOLS.filter((tool) => inArea(tool, f.id)).length;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setArea(active && f.id !== 'all' ? 'all' : f.id)}
                className="glass h-[34px] px-3 rounded-full flex items-center gap-1.5 text-[12px] font-semibold"
                style={active ? { background: 'var(--accent)', color: 'var(--accent-text)', borderColor: 'transparent' } : { color: 'var(--fg-2)' }}
              >
                {f.tint && <span className="w-2 h-2 rounded-full" style={{ background: f.tint }} />}
                <span>{f.label}</span>
                <span className="font-mono text-[11px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-[1.15fr_1fr] gap-3.5">
        <TierCard tier={daily} className="md:row-span-2">
          <div className="grid grid-cols-2 gap-2.5 flex-1">
            {daily.tools.map((tool, i) => {
              const m = meta(tool);
              const wide = i === daily.tools.length - 1 && daily.tools.length % 2 === 1;
              return (
                <div
                  key={tool.name}
                  className={`flex ${wide ? 'col-span-2 flex-row items-center justify-between' : 'flex-col justify-between'} gap-5 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5${fade(tool)}`}
                  style={{ border: '1px solid var(--border-1)', background: 'var(--surface-1)' }}
                >
                  <span className="flex items-center gap-3">
                    <Mono tool={tool} large />
                    <span className="text-[15px] font-bold">{tool.name}</span>
                  </span>
                  <span className="flex items-baseline gap-2">
                    {m.count != null && (
                      <span className="text-[30px] md:text-[34px] font-extrabold leading-none tracking-tight" style={{ color: 'var(--accent)' }}>
                        {m.count}
                      </span>
                    )}
                    <span className="text-[11.5px] font-mono" style={{ color: 'var(--fg-4)' }}>
                      {m.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </TierCard>

        <TierCard tier={comfortable}>
          <div className="flex flex-wrap gap-2">{comfortable.tools.map((tool) => chip(tool, false))}</div>
        </TierCard>

        <TierCard tier={learning}>
          <div className="flex flex-wrap gap-2">{learning.tools.map((tool) => chip(tool, true))}</div>
        </TierCard>
      </div>

      <p className="mt-4 text-[12px] font-mono" style={{ color: 'var(--fg-4)' }}>
        {t.skills.alsoKnown}: <span style={{ color: 'var(--fg-2)' }}>{ALSO_KNOWN.join(' · ')}</span>
      </p>
    </div>
  );
};

export default SkillsBento;
