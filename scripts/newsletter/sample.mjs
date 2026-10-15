// Dados de exemplo para prévia e testes do e-mail (nada disto vai para os inscritos).
export const SAMPLE = {
  pt: {
    lang: 'pt',
    week: 43,
    range: '19–25 out',
    intro: 'Duas coisas esta semana: a memória do projeto que não depende de provedor de IA e como este blog virou um arquivo Markdown com git push.',
    posts: [
      {
        title: 'A memória do projeto não deveria ser refém do provedor de IA',
        description: 'O ai-memory mantém decisões, regras e gotchas do projeto fora da sessão de chat, e qualquer modelo continua de onde o outro parou.',
        minutes: 2,
        tags: ['ia', 'mcp', 'ai-memory'],
        url: 'https://devandreotti.com/blog/ai-memory-memoria-do-projeto/',
      },
      {
        title: 'Um blog dentro do portfólio, publicado com git push',
        description: 'Como os posts viram páginas de verdade a partir de arquivos Markdown, sem CMS, e tudo o que dá para usar num post.',
        minutes: 3,
        tags: ['blog', 'vite', 'cloudflare'],
        url: 'https://devandreotti.com/blog/um-blog-publicado-com-git-push/',
      },
    ],
    behind: 'No Memory Apartment, a cozinha ganhou janelas novas e a luz do corredor foi refeita. Ainda estou ajustando o tom das sombras à noite.',
    links: [
      { title: 'Exemplo de link curado', url: 'https://example.com/um', note: 'Uma frase sua dizendo por que vale a leitura.' },
      { title: 'Outro link da semana', url: 'https://example.com/dois', note: 'Comentário curto, com a sua opinião.' },
    ],
    unsubscribeUrl: 'https://devandreotti.com/api/newsletter/unsubscribe?t=exemplo',
    otherLangUrl: 'https://devandreotti.com/blog/?lang=en',
    siteUrl: 'https://devandreotti.com',
  },
};
