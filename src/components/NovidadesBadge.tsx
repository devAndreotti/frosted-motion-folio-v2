import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { hasUnseen, readSeen } from '@/lib/novidades';

/** The small "Novo" link in the footers. It shows while there is a change the visitor has not seen. */
const NovidadesBadge = () => {
  const { t } = useLanguage();
  const [unseen, setUnseen] = useState(() => hasUnseen(readSeen()));
  if (!unseen) return null;
  return (
    <Link className="nv-badge" to="/novidades/" aria-label={t.novidades.badgeAria} onClick={() => setUnseen(false)}>
      {t.novidades.badge}
    </Link>
  );
};

export default NovidadesBadge;
