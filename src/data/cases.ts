import { featuredProject, curatedProjects, type CuratedProject } from './curatedProjects';
import { moreProjects } from './moreProjects';

/** Every project with a case: the ones the popup opens and each one's page at /projetos/<slug>/. */
export const CASES: CuratedProject[] = [featuredProject, ...curatedProjects, ...moreProjects];

export const caseBySlug = (slug: string | undefined): CuratedProject | undefined => CASES.find((c) => c.slug === slug);
