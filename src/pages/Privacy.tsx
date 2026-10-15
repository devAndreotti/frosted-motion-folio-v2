import { useLanguage } from '@/contexts/LanguageContext';
import BlogShell from '@/components/blog/BlogShell';
import { contact } from '@/data/personal';

// What is written here has to match what worker/newsletter.js and worker/likes.js actually do:
// change one, change the other (and the tests in worker/ that hold the numbers).
interface Section {
  title: string;
  items: string[];
}

const COPY = {
  pt: {
    title: 'Privacidade',
    lead: 'O que acontece com os seus dados neste site. Resumo: guardo o mínimo, não vendo nem compartilho nada, e você apaga tudo quando quiser.',
    updated: 'Atualizado em 15 de outubro de 2026.',
    sections: [
      {
        title: 'Newsletter',
        items: [
          'O que eu guardo: o seu e-mail, o idioma que você escolheu e as datas do pedido e da confirmação. Mais nada: sem nome, sem IP e sem rastreamento de abertura ou de clique nos e-mails.',
          'Para que serve: enviar o e-mail de confirmação e, depois de confirmado, a newsletter semanal (segundas-feiras). Nada além disso.',
          'Por quanto tempo: até você sair da lista. Quem pede a inscrição e não confirma tem o endereço apagado em até 7 dias. Ao sair, o endereço é apagado na hora, e não fica nenhuma lista de quem saiu.',
          'Quem trata os dados: a lista fica no banco D1 da Cloudflare, e os e-mails saem pelo serviço Email Delivery da Oracle Cloud. Eles só tratam os dados para entregar o serviço.',
          'Como sair ou apagar: pelo link "Sair da lista" que vem em todo e-mail, ou escrevendo para o endereço de contato abaixo.',
        ],
      },
      {
        title: 'Proteção contra abuso',
        items: [
          'O formulário usa o Cloudflare Turnstile, uma verificação anti-robô, e limita as tentativas por visitante. Para isso guardo, por até 2 horas, um código criptográfico (hash) derivado da sua rede. O seu IP não é guardado.',
        ],
      },
      {
        title: 'Curtidas',
        items: ['O botão de curtir guarda um código criptográfico (hash) da sua rede e do seu navegador junto do post curtido, sem cookie e sem conta, só para impedir curtidas repetidas.'],
      },
      {
        title: 'Cookies e armazenamento',
        items: ['O site não usa cookies de rastreamento. Ele guarda no seu navegador apenas as suas escolhas de tema, cor e idioma.'],
      },
      {
        title: 'Seus direitos',
        items: ['Pela LGPD você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento. É só escrever para o contato abaixo.'],
      },
    ] as Section[],
    contact: 'Contato',
  },
  en: {
    title: 'Privacy',
    lead: 'What happens with your data on this site. In short: I keep the minimum, I sell and share nothing, and you can delete everything whenever you like.',
    updated: 'Updated on October 15, 2026.',
    sections: [
      {
        title: 'Newsletter',
        items: [
          'What I keep: your email, the language you chose, and the dates of the request and the confirmation. Nothing else: no name, no IP address, and no tracking of opens or clicks in the emails.',
          'What it is for: sending the confirmation email and, once you confirm, the weekly newsletter (Mondays). Nothing beyond that.',
          'For how long: until you leave the list. If you ask to subscribe and never confirm, the address is deleted within 7 days. When you leave, the address is deleted at once, and no list of who left is kept.',
          'Who handles the data: the list lives in Cloudflare’s D1 database, and the emails go out through Oracle Cloud’s Email Delivery service. They handle the data only to provide the service.',
          'How to leave or delete: with the "Unsubscribe" link in every email, or by writing to the contact address below.',
        ],
      },
      {
        title: 'Abuse protection',
        items: [
          'The form uses Cloudflare Turnstile, an anti-robot check, and limits attempts per visitor. For that I keep, for up to 2 hours, a cryptographic code (hash) derived from your network. Your IP address is not stored.',
        ],
      },
      {
        title: 'Likes',
        items: ['The like button stores a cryptographic code (hash) of your network and browser next to the post you liked, with no cookie and no account, only to stop repeated likes.'],
      },
      {
        title: 'Cookies and storage',
        items: ['The site uses no tracking cookies. It keeps only your theme, color and language choices in your browser.'],
      },
      {
        title: 'Your rights',
        items: ['Under Brazil’s LGPD you can ask for access, correction or deletion of your data at any time. Just write to the contact below.'],
      },
    ] as Section[],
    contact: 'Contact',
  },
};

/** /privacidade/ -- plain words about the newsletter and the likes, in the visitor's language. */
const Privacy = () => {
  const { lang } = useLanguage();
  const c = COPY[lang];
  return (
    <BlogShell title={`${c.title} — Ricardo A. Gonçalves`}>
      <main className="wrap blog-main">
        <article className="post" lang={lang === 'en' ? 'en' : 'pt-BR'}>
          <h1 className="post-h">{c.title}</h1>
          <p className="lead">{c.lead}</p>
          <div className="prose">
            {c.sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
            <h2>{c.contact}</h2>
            <p>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
            <p className="blog-note">{c.updated}</p>
          </div>
        </article>
      </main>
    </BlogShell>
  );
};

export default Privacy;
