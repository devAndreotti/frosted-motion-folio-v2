export type Lang = 'pt' | 'en';

export interface Localized<T> {
  pt: T;
  en: T;
}

export function pick<T>(value: Localized<T>, lang: Lang): T {
  return value[lang];
}

interface Stat {
  label: string;
  desc: string;
}

export interface Strings {
  common: {
    sendEmail: string;
    copyEmail: string;
    emailCopied: string;
    skipToContent: string;
    close: string;
  };
  nav: {
    home: string;
    projects: string;
    skills: string;
    journey: string;
    contact: string;
    reposLabel: (count: number) => string;
    themeToggleAria: string;
    langToggleAria: string;
    menuOpenAria: string;
    menuCloseAria: string;
  };
  header: {
    roles: string[];
    lead1: string;
    lead2: string;
    badge: string;
    location: string;
    paragraph: string;
    availability: string;
    ctaProjects: string;
    ctaRecruiter: string;
    stackPrev: string;
    stackNext: string;
    stats: {
      projects: Stat & { value: string };
      repos: Stat;
      contributions: Stat;
      semester: Stat & { value: string };
    };
    recruiterLabel: string;
    recruiterRole: string;
    recruiterBullets: string[];
    recruiterQuick: string;
    recruiterDialogAria: string;
    photoAlt: (name: string) => string;
    projectAlt: (title: string) => string;
  };
  marquee: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    boostBtn: string;
    boostOff: string;
    ariaLabel: string;
    catLabels: Record<'lang' | 'frontend' | 'backend' | 'data' | 'tool' | 'automation', string>;
  };
  skills: {
    areaFilterLabel: string;
    allAreas: string;
    projectsUnit: (count: number) => string;
    reposUnit: string;
    alsoKnown: string;
  };
  projects: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    categoryFilters: Record<'all' | 'web' | 'ia' | 'mobile' | 'tool', string>;
    filterAria: string;
    casePrincipalBadge: string;
    detailLabels: { tipo: string; frente: string; duracao: string; status: string };
    featuredMeta: { frente: string; duracao: string; status: string };
    openCase: string;
    demo: string;
    code: string;
    emptyCategory: string;
    moreProjects: (count: number) => string;
    viewDetailsAria: (title: string) => string;
  };
  caseModal: {
    whatIDid: string;
    viewRepo: string;
    viewLive: string;
    closeAria: string;
    dialogAria: (title: string) => string;
    prevImageAria: string;
    nextImageAria: string;
    imageAlt: (title: string, index: number) => string;
  };
  timeline: {
    sectionLabel: string;
    title: string;
    stops: { year: string; title: string; desc: string }[];
  };
  activity: {
    sectionLabel: string;
    title: string;
    updated: (time: string) => string;
    viewProfile: string;
    inRepo: string;
    emptyState: string;
    summary: { contributions: string; activeDays: string; streak: string; streakValue: (days: number) => string };
    heatmapAria: (total: string) => string;
    heatmapLess: string;
    heatmapMore: string;
    heatmapTooltip: (count: number, date: string) => string;
  };
  footer: {
    localTime: (time: string) => string;
    heading: string;
    paragraph: string;
    resume: string;
    directLabel: string;
    quickLinks: { github: string; linkedin: string; email: string; projects: string };
    projectsHandle: (cases: number, others: number) => string;
    copyright: (name: string) => string;
    backToTop: string;
  };
  notFound: {
    message: string;
    backHome: string;
  };
  colorPicker: {
    hueLabel: (label: string) => string;
    trigger: string;
    hueNames: Record<'black' | 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'yellow', string>;
  };
}
