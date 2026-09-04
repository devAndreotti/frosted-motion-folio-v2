export type Lang = 'pt' | 'en';

export interface Localized<T> {
  pt: T;
  en: T;
}

export function pick<T>(value: Localized<T>, lang: Lang): T {
  return value[lang];
}

export interface Strings {
  common: {
    sendEmail: string;
    copyEmail: string;
    emailCopied: string;
    skipToContent: string;
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
    paragraph: string;
    availability: string;
    ctaProjects: string;
    ctaRecruiter: string;
    cardStackHint: string;
    stats: { value: string; label: string; desc: string }[];
    scrollCueAria: string;
    recruiterLabel: string;
    recruiterBullets: string[];
    recruiterBack: string;
    recruiterDialogAria: string;
    photoAlt: (name: string) => string;
    projectAlt: (title: string) => string;
  };
  marquee: {
    sectionLabel: string;
    title: string;
    boostBtn: string;
    ariaLabel: string;
    catLabels: Record<'lang' | 'frontend' | 'backend' | 'data' | 'tool' | 'automation', string>;
  };
  skills: {
    sectionLabel: string;
    title: string;
    bentoTab: string;
    radarTab: string;
    coreTitle: string;
    coreDesc: string;
    learningBadge: string;
    radarTitle: string;
    radarDesc: string;
    radarSvgAria: string;
  };
  projects: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    categoryFilters: Record<'all' | 'web' | 'ia' | 'mobile' | 'tool', string>;
    featuredBadge: string;
    casePrincipalBadge: string;
    detailLabels: { tipo: string; frente: string; duracao: string; status: string };
    openCase: string;
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
    prevAria: string;
    nextAria: string;
    stops: { year: string; title: string; desc: string }[];
  };
  activity: {
    sectionLabel: string;
    title: string;
    updated: (time: string) => string;
    prevAria: string;
    nextAria: string;
    emptyState: string;
    emptyStateLink: string;
    viewAllGithub: string;
    heatmapLess: string;
    heatmapMore: string;
    heatmapTooltip: (count: number, date: string) => string;
  };
  footer: {
    localTime: (time: string) => string;
    heading1: string;
    heading2: string;
    paragraph: string;
    resume: string;
    directLabel: string;
    quickLinks: { github: string; linkedin: string; projects: string; skills: string };
    copyright: (name: string) => string;
    backToTopAria: string;
  };
  notFound: {
    message: string;
    backHome: string;
  };
  colorPicker: {
    hueLabel: (label: string) => string;
    hueNames: Record<'black' | 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'yellow', string>;
  };
}
