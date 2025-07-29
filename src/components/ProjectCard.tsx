import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project; // Objeto contendo dados de um projeto (imagem, título, descrição, etc.)
  index: number;     // Índice usado para calcular o delay da animação
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <motion.div
      // Animação de entrada e efeito de hover
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ y: -10 }}
      className="glass-card group h-full flex flex-col"
    >
      {/* Imagem do projeto com efeito de zoom no hover */}
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Gradiente escuro visível no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Conteúdo textual do card */}
      <div className="flex-1 flex flex-col">
        {/* Título do projeto */}
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        {/* Descrição do projeto */}
        <p className="text-foreground/80 mb-4 flex-1 text-justify">
          {project.description}
        </p>

        {/* Lista de tecnologias utilizadas no projeto */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Botões de acesso ao código fonte e à demo */}
        <div className="flex gap-3">
          {/* Link para o repositório GitHub */}
          {project.githubUrl && (
            <motion.a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary/70 rounded-lg transition-colors text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-4 h-4" />
              Código
            </motion.a>
          )}

          {/* Link para a versão ao vivo (deploy) */}
          {project.liveUrl && (
            <motion.a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="w-4 h-4" />
              Demo
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
