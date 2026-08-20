import { Github, Linkedin, Mail } from 'lucide-react';

interface SocialIconProps {
  icon: string;
  className?: string;
}

// Renders the Lucide icon matching a social link's `icon` key.
// Shared by Header and Footer so the icon mapping only lives in one place.
const SocialIcon = ({ icon, className = 'w-6 h-6' }: SocialIconProps) => {
  switch (icon) {
    case 'github':
      return <Github className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'mail':
      return <Mail className={className} />;
    default:
      return null;
  }
};

export default SocialIcon;
