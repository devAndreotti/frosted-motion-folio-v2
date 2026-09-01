import { motion } from 'framer-motion'; // Biblioteca de animações
import { socialLinks, personalInfo } from '@/data/personal';
import SocialIcon from './SocialIcon';
import { cardGlowPulse, fadeInUp } from '@/lib/motion';

const Footer = () => {
  return (
    <footer id="contact" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Cartão com efeito glass e animação de entrada */}
        <motion.div
          {...fadeInUp()}
          className="glass-card text-center relative overflow-hidden group"
        >
          {/* Gradiente animado de fundo do card */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-cyan-400/10"
            {...cardGlowPulse}
          />

          <div className="relative z-10">
            {/* Título e subtítulo convidando para contato */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gradient-vibrant mb-2">
                Vamos Conversar?
              </h3>
              <p className="text-white/90 dark:text-blue-50">
                Estou sempre aberto a novas oportunidades e projetos interessantes
              </p>
            </div>

            {/* Links para redes sociais com animações de hover */}
            <div className="flex justify-center gap-4 mb-8">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button"
                  whileHover={{ scale: 1.1, rotate: 5 }} // Efeito de zoom e rotação ao passar o mouse
                  whileTap={{ scale: 0.9 }} // Efeito de clique
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }} // Animação em cascata
                  viewport={{ once: true }}
                  title={social.name}
                >
                  <SocialIcon icon={social.icon} className="w-5 h-5" /> {/* Ícone da rede social */}
                </motion.a>
              ))}
            </div>

            {/* Texto de rodapé com copyright e nome do autor */}
            <div className="border-t border-white/20 pt-6">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-sm text-white/60 dark:text-blue-100/60 flex items-center justify-center gap-2"
              >
                © 2025 {personalInfo.name}. Feito com muito ☕
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
