import type { ReactNode } from 'react';
import { GoldPortfolioCardArt } from './cardArt/GoldPortfolioArt';
import { SelfSyncCardArt } from './cardArt/SelfSyncArt';
import { ChefAiCardArt } from './cardArt/ChefAiArt';
import { GitWizardCardArt } from './cardArt/GitWizardArt';
import { PersonalCardArt } from './cardArt/PersonalArt';

export { GoldPortfolioCardArt, SelfSyncCardArt, ChefAiCardArt, GitWizardCardArt, PersonalCardArt };

/**
 * Returns the theme-reactive vector SVG artwork for a project in CardStack.
 */
export const getProjectCardSvg = (projectId: number): ReactNode => {
  switch (projectId) {
    case 9:
      return <GoldPortfolioCardArt />;
    case 26:
      return <SelfSyncCardArt />;
    case 2:
      return <ChefAiCardArt />;
    case 30:
      return <GitWizardCardArt />;
    default:
      return null;
  }
};
