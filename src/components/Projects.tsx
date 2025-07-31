import { motion } from 'framer-motion';
import { projects } from '@/data/projects';
import ProjectCard from './ProjectCard';

const Projects = () => {
  return (
    <section id="projects" className="py-20 md:py-32 relative">
      {/* Fundo animado com gradientes para efeito visual decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 right-0 w-72 h-72 bg-gradient-to-l from-purple-400/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],      // Animação horizontal oscilante
            scale: [1, 1.1, 1],  // Animação de leve aumento de escala
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 80, 0],       // Oscilação horizontal no sentido oposto
            scale: [1, 1.2, 1],  // Animação de leve aumento de escala
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Conteúdo central da seção */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Título e descrição da seção com animação de entrada */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-vibrant mb-4">
            Projetos
          </h2>
          <p className="text-lg text-white/90 dark:text-blue-50 max-w-2xl mx-auto">
            Alguns que desenvolvi com foco em usabilidade, desempenho e boas práticas:
          </p>
        </motion.div>

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
