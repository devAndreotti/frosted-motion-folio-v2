import { LazyMotion, domAnimation, m } from 'framer-motion';
import { projects } from '@/data/projects';
import ProjectCard from './ProjectCard';

const Projects = () => {
  return (
    <section id="projects" className="py-20 md:py-32 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <LazyMotion features={domAnimation}>
          <m.div
            className="absolute top-1/3 right-0 w-72 h-72 bg-gradient-to-l from-purple-400/10 to-transparent rounded-full blur-3xl"
            animate={{ x: [0, -50, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <m.div
            className="absolute bottom-1/4 left-0 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-transparent rounded-full blur-3xl"
            animate={{ x: [0, 80, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </LazyMotion>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <LazyMotion features={domAnimation}>
          <m.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Projetos</h2>
          </m.div>
        </LazyMotion>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;