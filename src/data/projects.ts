
export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Cook App",
    description: "Aplicação móvel desenvolvida em React Native, Expo e Supabase para gerenciamento de dados. Criada como parte de um curso da Rocketseat, oferece uma experiência de usuário completa e funcional em dispositivos Android e iOS.",
    image: "./projects/httpsgithub.comdevAndreotticook-app/project.png",
    technologies: ["React Native", "Expo", "Supabase", "TypeScript"],
    githubUrl: "https://github.com/devAndreotti/cook-app"
  },
  {
    id: 2,
    title: "Chef AI",
    description: "Uma aplicação feita com React, Tailwind e n8n, que usa o modelo Gemini para sugerir receitas personalizadas a partir dos ingredientes enviados pelo usuário. A interface é simples e responsiva.",
    image: "./projects/httpsgithub.comdevAndreottimy-first-vibe-coding-project.png",
    technologies: ["React", "Tailwind CSS", "n8n", "Gemini (Modelo de IA)", "TypeScript"],
    githubUrl: "https://github.com/devAndreotti/my-first-vibe-coding-project",
    liveUrl: "https://tasty-ai-chef.lovable.app/"
  },
  {
    id: 3,
    title: "Financial Vision",
    description: "Uma landing page moderna e dinâmica para uma aplicação de gestão financeira empresarial. Desenvolvida com HTML, CSS e JavaScript, a página oferece uma experiência de usuário envolvente e responsiva, com seções interativas e um grid animado.",
    image: "./projects/httpsgithub.comdevAndreottifinancial-vision.png",
    technologies: ["HTML", "JavaScript", "CSS"],
    githubUrl: "https://github.com/devAndreotti/financial-vision",
    liveUrl: "https://devandreotti.github.io/financial-vision"
  },
  {
    id: 4,
    title: "Powder Gate",
    description: "Plataforma de streaming fictícia desenvolvida com HTML, CSS e JavaScript. Possui layout responsivo, carrossel interativo, busca dinâmica e visual 3D com Spline para destacar habilidades em front-end.",
    image: "./projects/httpsgithub.comdevAndreottipowder-gate.png",
    technologies: ["HTML", "CSS", "JavaScript", "Spline (Visual 3D)"],
    githubUrl: "https://github.com/devAndreotti/powder-gate",
    liveUrl: "https://devandreotti.github.io/powder-gate/"
  },
  {
    id: 5,
    title: "IdeaForge Nexus Genesis",
    description: "Agente criativo de geração de projetos, construído com foco em design de jogos, storytelling e prototipagem inteligente.",
    image: "./projects/httpsgithub.comdevAndreottiideaforge-nexus-genesis.png",
    technologies: ["Lovable", "shadcn/ui", "Vite", "React", "TypeScript", "Tailwind CSS"],
    githubUrl: "https://github.com/devAndreotti/ideaforge-nexus-genesis",
    liveUrl: "https://ideaforge-nexus-genesis.lovable.app"
  },
  {
    id: 6,
    title: "Innovation Degree MVC",
    description: "Aplicação web MVC com integração a banco de dados, desenvolvida em um curso Técnico e otimizada para ser totalmente responsiva.",
    image: "./projects/httpsgithub.comdevAndreottiinnovation-degree-mvctreemain/home.png",
    technologies: ["ASP.NET Core MVC", "MySQL", "C#", "JavaScript", "HTML5", "CSS3", "Bootstrap"],
    githubUrl: "https://github.com/devAndreotti/innovation-degree-mvc"
  },
  {
    id: 7,
    title: "APS-04",
    description: "Estação Meteorológica: Monitoramento climático via sensores e interface Java. Projeto acadêmico que realiza coleta e visualização de dados meteorológicos em tempo real, com sensores ligados a um Arduino.",
    image: "./projects/httpsgithub.comdevAndreottiAPS-04.png",
    technologies: ["XHTML", "Java Orientado a Obj.", "Arduino"],
    githubUrl: "https://github.com/devAndreotti/APS-04"
  },
  {
    id: 8,
    title: "UPA Clinic",
    description: "Site para clínica odontológica, feito com HTML, CSS e JavaScript. Criado durante curso técnico e atualizado em 2024 com foco em usabilidade, design moderno e formulários com validação.",
    image: "./projects/httpsgithub.comdevAndreottiupa-clinic/new-footer.png",
    technologies: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/devAndreotti/upa-clinic",
    liveUrl: "https://devandreotti.github.io/upa-clinic"
  },
  {
    id: 9,
    title: "Gold Portfolio Analyzer",
    description: "Ferramenta inteligente de análise e otimização de carteiras de investimento, construída com foco em mercado brasileiro, diversificação inteligente e recomendações personalizadas.",
    image: "./projects/httpsgithub.comdevAndreottigold-portfolio-analyzer.png",
    technologies: ["React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Recharts", "Vite", "Lovable", "Supabase"],
    githubUrl: "https://github.com/devAndreotti/gold-portfolio-analyzer",
    liveUrl: "https://gold-portfolio-analyzer.lovable.app"
  },
  {
    id: 10,
    title: "Dev TLOU",
    description: "Página interativa sobre \"The Last Of Us\", desenvolvida em HTML, CSS e JavaScript. Inclui carrossel de imagens, descrição da série e ícones sociais, com design responsivo.",
    image: "./projects/httpsgithub.comdevAndreottidev-tlou.png",
    technologies: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/devAndreotti/dev-tlou",
    liveUrl: "https://devandreotti.github.io/dev-tlou"
  },
  {
    id: 11,
    title: "My First Spline Project",
    description: "Este é um ambiente 3D desenvolvido com HTML, CSS, JavaScript e a plataforma Spline. Possui navegação intuitiva, efeitos visuais e design responsivo para diferentes dispositivos.",
    image: "./projects/httpsgithub.comdevAndreottimy-first-spline-project.png",
    technologies: ["HTML", "CSS", "JavaScript", "Spline (Visual 3D)"],
    githubUrl: "https://github.com/devAndreotti/my-first-spline-project",
    liveUrl: "https://devandreotti.github.io/my-first-spline-project/"
  },
  {
    id: 12,
    title: "Starbucks",
    description: "Página inspirada no Starbucks, desenvolvida para praticar HTML e CSS. Apresenta o slogan da empresa, links para redes sociais e um design focado na experiência visual.",
    image: "./projects/httpsgithub.comdevAndreottistarbuckstab=readme-ov-file.png",
    technologies: ["HTML", "CSS"],
    githubUrl: "https://github.com/devAndreotti/starbucks",
    liveUrl: "https://devandreotti.github.io/starbucks"
  },
  {
    id: 13,
    title: "Responsive Login",
    description: "Página de login responsiva com design moderno e animações suaves. Utiliza HTML e CSS para uma experiência visual atraente em diferentes dispositivos.",
    image: "./projects/httpsgithub.comdevAndreottiresponsive-login.png",
    technologies: ["HTML", "CSS"],
    githubUrl: "https://github.com/devAndreotti/responsive-login",
    liveUrl: "https://devandreotti.github.io/responsive-login"
  },
  {
    id: 14,
    title: "JS Background",
    description: "Este projeto feito com o anime.js usa HTML e CSS para criar animações dinâmicas em elementos da página. O projeto demonstra a aplicação de efeitos visuais interativos com JavaScript.",
    image: "./projects/httpsgithub.comdevAndreottijs-background.png",
    technologies: ["HTML", "CSS", "JavaScript", "Anime.js"],
    githubUrl: "https://github.com/devAndreotti/js-background",
    liveUrl: "https://devandreotti.github.io/js-background"
  },
  {
    id: 15,
    title: "Gradient Cards",
    description: "Utiliza HTML, CSS e JavaScript para criar cartões interativos com efeito de inclinação e mudança de cor ao passar o mouse. Inclui um cursor personalizado.",
    image: "./projects/httpsgithub.comdevAndreottigradient-cards.png",
    technologies: ["HTML", "CSS", "JavaScript", "VanillaTilt.js"],
    githubUrl: "https://github.com/devAndreotti/gradient-cards",
    liveUrl: "https://devandreotti.github.io/gradient-cards"
  },
  {
    id: 16,
    title: "Animated Burger",
    description: "Este projeto usa HTML, CSS e JavaScript para criar um cartão interativo com animação de imagem. Permite alternar entre uma imagem estática e uma animação do produto.",
    image: "./projects/httpsgithub.comdevAndreottianimated-burger.png",
    technologies: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/devAndreotti/animated-burger",
    liveUrl: "https://devandreotti.github.io/animated-burger"
  },
  {
    id: 17,
    title: "Dev Hero Selector",
    description: "Projeto de seleção de personagens no estilo de jogos de luta. Permite escolher heróis e vilões, atualizando a imagem e o nome do personagem principal. Desenvolvido com HTML5, CSS3 e JavaScript.",
    image: "./projects/httpsgithub.comdevAndreottidev-hero-selector.png",
    technologies: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/devAndreotti/dev-hero-selector",
    liveUrl: "https://devandreotti.github.io/dev-hero-selector"
  },
  {
    id: 18,
    title: "Cubes Background",
    description: "Este projeto utiliza animações em CSS para criar uma série de cubos animados com efeitos visuais dinâmicos em uma página web, transformando e movimentando cubos para gerar um fundo animado e visualmente interessante. Desenvolvido com HTML e CSS.",
    image: "./projects/httpsgithub.comdevAndreotticubes-background.png",
    technologies: ["HTML", "CSS"],
    githubUrl: "https://github.com/devAndreotti/cubes-background",
    liveUrl: "https://devandreotti.github.io/cubes-background"
  },
  {
    id: 19,
    title: "E-Geek",
    description: "Loja de produtos geek focada no universo Star Wars. Originalmente desenvolvida em curso técnico, foi atualizada em 2024 com design responsivo, barra de pesquisa, navegação intuitiva e exibição de produtos em destaque, utilizando HTML5, CSS3 e JavaScript.",
    image: "./projects/httpsgithub.comdevAndreottie-geek.png",
    technologies: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/devAndreotti/e-geek"
  },
  {
    id: 20,
    title: "Dev One Piece",
    description: "Página para seleção de personagens do anime One Piece, com JavaScript responsável por exibir detalhes ao clicar em cada personagem e CSS responsivo que garante boa visualização em diferentes dispositivos.",
    image: "./projects/httpsgithub.comdevAndreottidev-one-piece.png",
    technologies: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/devAndreotti/dev-one-piece",
    liveUrl: "https://devandreotti.github.io/dev-one-piece"
  },
  {
    id: 21,
    title: "Healthy City MVC",
    description: "Esta é uma aplicação web que promove saúde urbana com eventos, dicas e patrocinadores, utilizando ASP.NET Core e Bootstrap. A versão atual oferece um design novo e funcionalidades interativas.",
    image: "./projects/httpsgithub.comdevAndreottihealthy-city-mvc/projeto-novo.png",
    technologies: ["MVC", "ASP.NET Core", "Bootstrap", "C#"],
    githubUrl: "https://github.com/devAndreotti/healthy-city-mvc"
  },
  {
    id: 22,
    title: "Slider Pokemon",
    description: "Este projeto apresenta um slider de cartões que utiliza HTML, CSS e JavaScript para navegação e estilização, permitindo visualizar e alternar entre cartões com botões.",
    image: "./projects/httpsgithub.comdevAndreottisliderpokemon.png",
    technologies: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/devAndreotti/sliderpokemon",
    liveUrl: "https://devandreotti.github.io/sliderpokemon"
  },
  {
    id: 23,
    title: "Soft Dropdown",
    description: "Projeto de um dropdown para seleção de categorias, criado com HTML, CSS e JavaScript, e com ícones Lucide para uma interface moderna e elegante.",
    image: "./projects/httpsgithub.comdevAndreottisoft-dropdown.png",
    technologies: ["HTML", "CSS", "JavaScript", "Lucide (ícones)"],
    githubUrl: "https://github.com/devAndreotti/soft-dropdown",
    liveUrl: "https://devandreotti.github.io/soft-dropdown"
  },
  {
    id: 24,
    title: "APS-01",
    description: "Earth Solutions: Trabalho acadêmico que promove práticas seguras e sustentáveis no ambiente de trabalho, com informações sobre segurança e proteção ambiental.",
    image: "./projects/httpsgithub.comdevAndreottiAPS-01.png",
    technologies: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/devAndreotti/APS-01",
  },
  {
    id: 25,
    title: "APS-03",
    description: "Sistema digital desenvolvido em Java com interface gráfica Swing, projetado para coletar pesquisas de satisfação de visitantes em exposições sobre exploração robótica no planeta Marte. Transforma feedbacks em dados úteis para curadores e organizadores.",
    image: "./projects/httpsgithub.comdevAndreottiAPS-03.png",
    technologies: ["Java Orientado a Obj.", "Swing"],
    githubUrl: "https://github.com/devAndreotti/APS-03"
  },
  {
    id: 26,
    title: "Self-Sync Daily",
    description: "Aplicação de produtividade pessoal construída com foco em gestão de tempo, monitoramento de energia e reflexão diária.",
    image: "./projects/httpsgithub.comdevAndreottiself-sync-daily.png",
    technologies: ["Lovable", "React", "TypeScript", "Supabase", "Tailwind CSS", "shadcn/ui", "Vite", "React Query", "React Router", "Recharts"],
    githubUrl: "https://github.com/devAndreotti/self-sync-daily",
    liveUrl: "https://self-sync-daily.lovable.app"
  },
  {
    id: 27,
    title: "Pokedex",
    description: "Uma aplicação web interativa para exibir informações detalhadas sobre Pokémon, com design responsivo e navegação intuitiva entre os cartões. Desenvolvida com HTML, CSS e JavaScript.",
    image: "./projects/httpsgithub.comdevAndreottipokedex.png",
    technologies: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/devAndreotti/pokedex",
    liveUrl: "https://devandreotti.github.io/pokedex"
  }
];

export const skills = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Tailwind CSS",
  "Vue.js",
  "MongoDB",
  "PostgreSQL",
  "Git",
  "Docker",
  "AWS"
];

export const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com/devAndreotti",
    icon: "github"
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/ricardo-andreotti-gon%C3%A7alves-0b5785283/",
    icon: "linkedin"
  },
  {
    name: "Email",
    url: "mailto:OrlaEK@proton.me",
    icon: "mail"
  }
];

export const personalInfo = {
  name: "Ricardo A. Gonçalves",
  title: "Desenvolvedor Full Stack",
  bio: "Desenvolvedor apaixonado por criar experiências digitais. Especializado em React, Node.js e outras tecnologias modernas. Foco em soluções criativas, performance e usabilidade.",
  avatar: "/placeholder.svg",
  location: "São Paulo, Brasil"
};
