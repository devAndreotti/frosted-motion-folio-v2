import { ArrowRight, ArrowUp, ArrowUpRight, Clock, FileText, Github, Instagram, Linkedin, Mail } from 'lucide-react';
import { contact, personalInfo } from '@/data/personal';
import { projects } from '@/data/projects';
import { curatedProjects } from '@/data/curatedProjects';
import { useLanguage } from '@/contexts/LanguageContext';
import { track } from '@/lib/track';
import CopyEmailButton from './CopyEmailButton';
import XLogo from './XLogo';
import { useLocalClock } from '@/hooks/useLocalClock';

const CASES = curatedProjects.length + 1;

const Footer = () => {
  const { t } = useLanguage();
  const time = useLocalClock();

  const links = [
    { label: t.footer.quickLinks.github, handle: contact.githubHandle, href: contact.github, icon: Github, event: 'click-github' },
    { label: t.footer.quickLinks.linkedin, handle: contact.linkedinHandle, href: contact.linkedin, icon: Linkedin, event: 'click-linkedin' },
    { label: t.footer.quickLinks.instagram, handle: contact.instagramHandle, href: contact.instagram, icon: Instagram, event: 'click-instagram' },
    { label: t.footer.quickLinks.x, handle: contact.xHandle, href: contact.x, icon: XLogo, event: 'click-x' },
    { label: t.footer.quickLinks.email, handle: contact.email, href: `mailto:${contact.email}`, icon: Mail, event: 'click-send-email' },
    { label: t.footer.quickLinks.projects, handle: t.footer.projectsHandle(CASES, projects.length - CASES), href: '#projects', icon: ArrowRight },
  ];

  return (
    <section className="wrap sec" aria-labelledby="h-ct">
      <div className="ctc glass">
        <div>
          <div className="eyebrow">
            <span className="avail" style={{ margin: 0 }}>
              <span className="pulse" />
              {t.header.availability}
            </span>
            <span className="np fix">
              <Clock className="ic" />
              <span className="tabular-nums">{t.footer.localTime(time)}</span>
            </span>
          </div>
          <h2 id="h-ct" className="ct-h">
            {t.footer.heading}
          </h2>
          <p className="sub">{t.footer.paragraph}</p>
          <div className="ctas">
            <a className="btn btn-pri" href={`mailto:${contact.email}`} onClick={() => track('click-send-email')}>
              <Mail className="ic s" />
              {t.common.sendEmail}
            </a>
            <CopyEmailButton email={contact.email} />
            {contact.resume && (
              <a className="btn btn-gh" href={contact.resume} target="_blank" rel="noopener noreferrer" onClick={() => track('click-resume')}>
                <FileText className="ic s" />
                {t.footer.resume}
              </a>
            )}
          </div>
        </div>
        <div>
          <p className="k" style={{ marginTop: 6 }}>
            {t.footer.directLabel}
          </p>
          <nav className="dl" aria-label={t.footer.directLabel}>
            {links.map(({ label, handle, href, icon: Icon, event }) => {
              const external = href.startsWith('http');
              return (
                <a
                  key={label}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  onClick={event ? () => track(event) : undefined}
                >
                  <span className="dl-i">
                    <Icon className="ic s" />
                  </span>
                  <span className="dl-t">{label}</span>
                  <span className="dl-h">{handle}</span>
                  <ArrowUpRight className="ic s" />
                </a>
              );
            })}
          </nav>
        </div>
      </div>
      <footer className="ft">
        <span>{t.footer.copyright(personalInfo.name)}</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {t.footer.backToTop}
          <ArrowUp className="ic s" />
        </button>
      </footer>
    </section>
  );
};

export default Footer;
