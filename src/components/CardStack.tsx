import { personalInfo } from '@/data/personal';
import { featuredProject, curatedProjects } from '@/data/curatedProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { HeroCard } from './HeroCardParts';
import HeroDeck from './HeroDeck';
import HeroFan from './HeroFan';

// The photo plus four real projects -- the same curation as the projects
// section, so the hero and the list below tell one story.
const STACK_PROJECT_IDS = [26, 9, 2, 30];
const ALL_CURATED = [featuredProject, ...curatedProjects];
const STACK_PROJECTS = STACK_PROJECT_IDS.map((id) => ALL_CURATED.find((p) => p.id === id)!);

/** The fan needs the hero's second column; once the hero stacks into one column (v2.css, 960px) the deck takes over. */
export const FAN_QUERY = '(min-width: 961px)';

/** The hero's cards: a fan on wide screens, a deck on narrow ones. */
const CardStack = () => {
  const { lang, t } = useLanguage();
  const wide = useMediaQuery(FAN_QUERY, true);

  const cards: HeroCard[] = [
    {
      id: 'photo',
      me: true,
      img: './profile.webp',
      title: personalInfo.name,
      line: personalInfo.title[lang],
      type: '',
      tint: '',
      label: t.header.photoAlt(personalInfo.name),
    },
    ...STACK_PROJECTS.map((p) => ({
      id: String(p.id),
      me: false,
      img: p.image,
      title: p.title,
      line: p.tagline[lang],
      type: p.id === featuredProject.id ? t.projects.casePrincipalBadge : p.type[lang],
      tint: p.tint,
      label: t.header.projectAlt(p.title),
    })),
  ];

  return wide ? <HeroFan cards={cards} /> : <HeroDeck cards={cards} />;
};

export default CardStack;
