import { motion } from 'framer-motion';
import { Code, Globe, Wrench, Database, Bot, Blocks } from 'lucide-react';

// Lista categorizada de habilidades e tecnologias com ícones
const skillsCategories = [
  {
    title: "Linguagens de Programação",
    icon: Code,
    skills: ["JavaScript", "TypeScript", "Python", "Java", "C#", "HTML", "CSS", "SQL", "Solidity"]
  },
  {
    title: "Desenvolvimento Web",
    icon: Globe,
    skills: ["React", "Node.js", "HTML5", "Bootstrap", "CSS3", "Tailwind CSS", "ASP.NET Core", "json-server", "anime.js"]
  },
  {
    title: "Ferramentas & Tecnologias",
    icon: Wrench,
    skills: ["Git e GitKraken", "Power BI", "Arduino", "n8n", "Excel", "Vite", "Jupyter Notebook"]
  },
  {
    title: "Banco de Dados",
    icon: Database,
    skills: ["SQL", "Supabase", "Database Design", "Data Analysis"]
  },
  {
    title: "Inteligência Artificial",
    icon: Bot,
    skills: ["Machine Learning", "Python ML", "KNN", "Random Forest", "AI Design"]
  },
  {
    title: "Blockchain & Web3",
    icon: Blocks,
    skills: ["Solidity", "Smart Contracts", "MetaMask", "NFTs", "ERC-20 Tokens", "OpenZeppelin", "Truffle", "Ganache"]
  }
];

const Skills = () => {
  return (
    <section id="skills" className="py-20 md:py-32 relative">
      {/* Fundo animado com gradientes para estética visual */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-r from-blue-400/15 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-80 h-80 bg-gradient-to-l from-cyan-400/15 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Título da seção com animação de entrada */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-vibrant mb-4">
            Skills & Tecnologias
          </h2>
          <p className="text-lg text-white/90 dark:text-blue-50 max-w-2xl mx-auto">
            Ferramentas e tecnologias que uso para criar soluções completas:
          </p>
        </motion.div>

        {/* Grid com categorias de habilidades */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {skillsCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: categoryIndex * 0.1,
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                }}
                className="glass-card group relative overflow-hidden"
              >
                {/* Efeito de fundo ao passar o mouse */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                <div className="relative z-10">
                  {/* Cabeçalho da categoria */}
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <category.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white/90 dark:text-blue-50 group-hover:text-white transition-colors">
                      {category.title}
                    </h3>
                  </div>

                  {/* Lista das skills individuais */}
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: categoryIndex * 0.1 + skillIndex * 0.05,
                        }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 bg-white/20 text-white/90 dark:text-blue-50 rounded-full text-sm font-medium hover:bg-white/30 transition-all duration-300 cursor-default"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mensagem final de aprendizado com animações */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="glass-card inline-flex items-center gap-4 px-8 py-6 max-w-md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Ícone animado */}
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <span className="text-xl">🚀</span>
              </motion.div>
              
              {/* Texto de incentivo */}
              <div className="text-left">
                <p className="text-lg font-semibold text-white/90 dark:text-blue-50 mb-2">
                  Sempre aprendendo e evoluindo
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3].map((dot) => (
                    <motion.div
                      key={dot}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: dot * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
