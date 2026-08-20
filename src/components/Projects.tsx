import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import ProjectCard from './ProjectCard';
import SectionHeading from './SectionHeading';
import { drift } from '@/lib/motion';

const Projects = () => {
  return (
    <section id="projects" className="py-20 md:py-32 relative">
      {/* Fundo animado com gradientes para efeito visual decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 right-0 w-72 h-72 bg-gradient-to-l from-purple-400/10 to-transparent rounded-full blur-3xl"
          {...drift(-50, 1.1, 8)}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-transparent rounded-full blur-3xl"
          {...drift(80, 1.2, 10, 1)}
        />
      </div>

      {/* Conteúdo central da seção */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Título e descrição da seção com animação de entrada */}
        <SectionHeading
          title="Projetos"
          description="Alguns que desenvolvi com foco em usabilidade, desempenho e boas práticas:"
        />

        {/* Grid de cards de projetos, responsivo para diferentes tamanhos de tela */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            // Renderiza um card para cada projeto com animação escalonada
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
