/**
 * The address of a project picture (public/projects/...). The data keeps the path relative ("./projects/...");
 * on /projetos/<slug>/ a relative path resolves under that slug, so the picture is looked up from the site base.
 */
export const projectAsset = (src: string): string => `${import.meta.env.BASE_URL}${src.replace(/^\.\//, '')}`;
