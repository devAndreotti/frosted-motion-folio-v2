import { motion } from 'framer-motion';
import { Heart, Github, Linkedin, Mail } from 'lucide-react';
import { socialLinks, personalInfo } from '@/data/projects';

const Footer = () => {
  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'mail':
        return <Mail className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <footer id="contact" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-card text-center relative overflow-hidden group"
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
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gradient-vibrant mb-2">
                Vamos Conversar?
              </h3>
              <p className="text-white/90 dark:text-blue-50">
                Estou sempre aberto a novas oportunidades e projetos interessantes
              </p>
            </div>

            {/* Redes Sociais */}
            <div className="flex justify-center gap-4 mb-8">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  title={social.name}
                >
                  {getSocialIcon(social.icon)}
                </motion.a>
              ))}
            </div>

            {/* Copyright */}
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
