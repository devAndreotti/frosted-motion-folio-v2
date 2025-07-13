import { motion } from 'framer-motion';
import { Code2, Palette, Zap, Heart } from 'lucide-react';
import { personalInfo } from '@/data/projects';

const About = () => {
  const highlights = [
    { icon: Code2, text: "Clean Code", color: "from-blue-400 to-cyan-400" },
    { icon: Palette, text: "UI/UX Design", color: "from-cyan-400 to-blue-500" },
    { icon: Zap, text: "Performance", color: "from-blue-500 to-blue-400" },
    { icon: Heart, text: "User Experience", color: "from-cyan-500 to-blue-400" },
  ];

  return (
    <section id="about" className="py-20 md:py-32 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-l from-cyan-400/20 to-blue-500/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <motion.div 
            className="glass-card text-center relative overflow-hidden group"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-cyan-400/10"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative z-10">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-gradient-vibrant mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Sobre Mim
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="text-lg md:text-xl leading-relaxed text-white/90 dark:text-blue-50 space-y-4">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      Sou Ricardo, desenvolvedor full-stack e estudante de Ciência da Computação. Minha 
                      jornada começou com curiosidade e evoluiu para projetos que unem design, eficiência e inovação.
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Tenho experiência em React, Node.js, TypeScript e React Native, com projetos 
                      práticos no front e no back-end. Também gosto de explorar dados com Power BI e automatizar 
                      tarefas com Python.
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      Nos momentos livres, escrevo, crio com IA, jogo RPG e xadrez. Gosto de 
                      aprender, compartilhar conhecimento e colaborar com ideias fora do comum.
                    </motion.p>
                  </div>
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  {highlights.map((highlight, index) => (
                    <motion.div
                      key={highlight.text}
                      className="glass p-6 rounded-2xl text-center group hover:scale-105 transition-all duration-300 relative overflow-hidden"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.7 + index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                      />
                      <motion.div
                        className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${highlight.color} rounded-xl flex items-center justify-center relative z-10`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <highlight.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <span className="text-sm font-semibold text-white/90 dark:text-blue-50 relative z-10">
                        {highlight.text}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
