import { useEffect, useState } from 'react';
import { Skeleton } from 'boneyard-js/react';
import { ArrowUp, ArrowUpRight, Clock, Github, Linkedin } from 'lucide-react';
import { personalInfo } from '@/data/personal';
import { useGithubActivity } from '@/hooks/useGithubActivity';

function localTime(): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date());
  } catch {
    return '--:--';
  }
}

const QUICK_LINKS = [
  { label: 'GitHub', href: 'https://github.com/devAndreotti' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ricardo-andreotti-gon%C3%A7alves-0b5785283/' },
  { label: 'Projetos', href: '#projects' },
  { label: 'Skills', href: '#skills' },
];

const Footer = () => {
  const [time, setTime] = useState(localTime());
  const { lastCommit, loading: activityLoading } = useGithubActivity();

  useEffect(() => {
    const timer = setInterval(() => setTime(localTime()), 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer id="contact" className="relative py-16 md:py-20 overflow-hidden">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full pointer-events-none animate-orb-drift"
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.07) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 container mx-auto px-4">
        <div className="glass-strong rounded-[28px] p-8 md:p-12 grid md:grid-cols-[1.3fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="relative w-2 h-2 rounded-full bg-green-400">
                <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-dot" />
              </span>
              <span className="text-[12.5px]" style={{ color: 'var(--fg-3)' }}>
                Disponível para novos projetos
              </span>
              <span className="glass flex items-center gap-1.5 px-3 py-1 rounded-full ml-1.5">
                <Clock className="w-2.5 h-2.5" style={{ color: 'var(--fg-3)' }} />
                <span className="text-[11.5px] tabular-nums" style={{ color: 'var(--fg-3)' }}>
                  {time} em Sorocaba, SP
                </span>
              </span>
            </div>
            <h2 className="text-3xl md:text-[38px] font-extrabold leading-tight mb-3.5">
              Vamos construir
              <br />
              algo real?
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed mb-7" style={{ color: 'var(--fg-3)' }}>
              Sempre aberto a novas oportunidades, freelas e ideias fora do comum.
            </p>

            <Skeleton
              name="footer-github-activity"
              loading={activityLoading}
              fixture={
                <div className="glass rounded-2xl p-4 mb-7 max-w-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--fg-4)' }}>
                      Atividade no GitHub
                    </span>
                    <span className="text-[10.5px]" style={{ color: 'var(--fg-4)' }}>
                      há 12 min
                    </span>
                  </div>
                  <div className="text-[13px] font-bold mb-1">devAndreotti/self-sync-daily</div>
                  <div className="text-[12.5px]" style={{ color: 'var(--fg-3)' }}>
                    fix: corrige cálculo de energia semanal
                  </div>
                </div>
              }
            >
              <div className="glass rounded-2xl p-4 mb-7 max-w-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10.5px] uppercase tracking-wide" style={{ color: 'var(--fg-4)' }}>
                    Atividade no GitHub
                  </span>
                  {lastCommit && (
                    <span className="text-[10.5px]" style={{ color: 'var(--fg-4)' }}>
                      {lastCommit.relativeTime}
                    </span>
                  )}
                </div>
                {lastCommit ? (
                  <>
                    <div className="text-[13px] font-bold mb-1">devAndreotti/{lastCommit.repo}</div>
                    <div className="text-[12.5px]" style={{ color: 'var(--fg-3)' }}>
                      {lastCommit.message}
                    </div>
                  </>
                ) : (
                  <div className="text-[12.5px]" style={{ color: 'var(--fg-3)' }}>
                    Sem atividade pública recente —{' '}
                    <a href="https://github.com/devAndreotti" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>
                      confira o perfil
                    </a>
                    .
                  </div>
                )}
              </div>
            </Skeleton>

            <div className="flex gap-3 flex-wrap">
              <a
                href="mailto:OrlaEK@proton.me"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-[14.5px]"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                Enviar e-mail
              </a>
              <a href="#header" className="glass px-6 py-3.5 rounded-2xl font-semibold text-[14.5px]">
                Currículo
              </a>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--fg-4)' }}>
              Direto ao ponto
            </div>
            {QUICK_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-between py-3.5 px-2 rounded-lg transition-all hover:pl-3 hover:bg-[var(--surface-1)] group"
                style={{ borderBottom: '1px solid var(--border-1)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                    {link.label === 'GitHub' ? <Github className="w-3.5 h-3.5" /> : link.label === 'LinkedIn' ? <Linkedin className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-[14.5px] font-semibold">{link.label}</span>
                </div>
                <ArrowUpRight className="w-[15px] h-[15px] opacity-30 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between mt-6 px-1">
          <p className="text-[13px]" style={{ color: 'var(--fg-4)' }}>
            © 2026 {personalInfo.name} — feito com React, Tailwind CSS e muito café.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Voltar ao topo"
            className="glass w-9 h-9 rounded-full flex items-center justify-center hover:-translate-y-1 hover:bg-[var(--surface-2)] transition-all"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
