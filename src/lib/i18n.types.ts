import type { BlogStrings } from './i18n.types.blog';
import type { NowStrings } from './i18n.types.now';
import type { NovidadesStrings } from './i18n.types.novidades';

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
    now: string;
    projects: string;
    skills: string;
    journey: string;
    contact: string;
    blog: string;
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
  now: NowStrings;
  novidades: NovidadesStrings;
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
    more: {
      title: string;
      subtitle: string;
      cardAria: (title: string) => string;
      showAll: (count: number) => string;
      showLess: string;
      notebook: {
        stageAria: string;
        poster: string;
        tap3d: string;
        prev: string;
        next: string;
        dotAria: (i: number, title: string) => string;
        open: string;
        light: string;
        lightLevels: [string, string, string];
        view: string;
        views: { frente: string; tampa: string; base: string };
        clickToUse: string;
        closeLive: string;
        lidOpen: string;
        lidClose: string;
        sound: string;
        liveTitle: (title: string) => string;
        controls: string;
        statusLive: string;
        statusPicture: string;
        dragHint: string;
        openSite: string;
        projects: string;
        tipsTitle: string;
        /** Pairs of a gesture (shown as a key cap) and what it does: with a mouse, and on a touch screen. */
        tips: { mouse: [string, string][]; touch: [string, string][] };
      };
    };
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
    imagesAria: string;
    goToImageAria: (index: number) => string;
    pauseAria: string;
    playAria: string;
  };
  timeline: {
    sectionLabel: string;
    title: string;
    /** Oldest first; the last one is "now" (its `year` reads "Hoje"/"Today"). */
    stops: { year: string; kind: string; title: string; desc: string }[];
    chapter: (n: number) => string;
    youAreHere: string;
    /** Accessible name of the scrollable list of earlier chapters. */
    pastLabel: string;
    nowTags: string[];
    /** Footer line of the "now" card: where the rest of the work lives. */
    nowFacts: string;
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
    quickLinks: { github: string; linkedin: string; instagram: string; x: string; email: string; projects: string };
    projectsHandle: (cases: number, others: number) => string;
    copyright: (name: string) => string;
    /** Second half of the copyright line; its own line on phones. */
    backToTop: string;
  };
  /** Easter eggs: the 03:17 haunted footer line and the Ctrl+P printed footer. */
  easter: {
    hauntedLine: string;
    printNote: string;
  };
  notFound: {
    badge: string;
    kicker: string;
    /** The headline in two parts: the second one takes the accent color on its own line. */
    title: string;
    titleAccent: string;
    body: string;
    tried: string;
    code: string;
    backHome: string;
    seeProjects: string;
    suggest: string;
    sections: Record<'projects' | 'blog' | 'uses' | 'novidades', { title: string; note: string }>;
    broken: string;
    game: {
      aria: string; title: string; hint: string;
      start: string; pressToStart: string; over: string; record: string;
      restart: string; restartHint: string; score: (points: number) => string;
      best: (points: number) => string; wave: (n: number) => string; waveCount: (n: number) => string; lives: (n: number) => string;
    };
  };
  blog: BlogStrings;
  colorPicker: {
    hueLabel: (label: string) => string;
    trigger: string;
    hueNames: Record<'black' | 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'yellow', string>;
  };
  eggs: {
    hireHelp: string;
    hireLines: string[];
    hireContact: (email: string) => string;
    sudoDenied: string;
    debug: {
      title: string; ariaLabel: string; viewport: string;
      theme: string; themeNames: Record<'dark' | 'light', string>; language: string;
      loadTime: string; notAvailable: string; exitHint: string;
    };
  };
}
