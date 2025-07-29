// Importa animações do Framer Motion
import { motion } from 'framer-motion';
// Importa ícones da biblioteca Lucide
import { Moon, Sun, Github, Linkedin, Mail, Sparkles } from 'lucide-react';
// Hook personalizado para alternar tema claro/escuro
import { useTheme } from '@/contexts/ThemeContext';
// Dados pessoais e links sociais
import { personalInfo, socialLinks } from '@/data/projects';
// Componente de navegação
import Navigation from './Navigation';

const Header = () => {
  // Acessa o tema atual e a função para alternar
  const { theme, toggleTheme } = useTheme();

  // Retorna o ícone correspondente ao nome da rede social
  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'github':
        return <Github className="w-6 h-6" />;
      case 'linkedin':
        return <Linkedin className="w-6 h-6" />;
      case 'mail':
        return <Mail className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Componente de navegação fixo no topo */}
      <Navigation />

      {/* Cabeçalho animado com entrada do topo */}
      <motion.header
        id="header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 py-12 md:py-20 mt-16"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center relative">
            
            {/* Círculo decorativo azul na esquerda */}
            <motion.div
              className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Círculo decorativo azul na direita */}
            <motion.div
              className="absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-15 blur-lg"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />

            {/* Avatar com animação e brilho */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.3, type: "spring", stiffness: 100 }}
              className="mb-8 relative"
            >
              <div className="relative group">
                {/* Fundo brilhante pulsante atrás do avatar */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow"></div>

                {/* Imagem do perfil */}
                <img
                  src="./profile.jpg"
                  alt={personalInfo.name}
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover glass-intense border-4 border-white/40 shadow-3xl group-hover:scale-105 transition-transform duration-300"
                />

                {/* Camada animada sobre o avatar */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400/30 to-cyan-400/30"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Ícone de brilho girando */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </motion.div>
              </div>
            </motion.div>

            {/* Nome e título animados */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              className="mb-6"
            >
              {/* Nome com efeito de brilho */}
              <motion.h1 
                className="text-5xl md:text-7xl font-bold text-gradient-vibrant mb-4 relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {personalInfo.name}
                <motion.div
                  className="absolute inset-0 shimmer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              </motion.h1>

              {/* Título profissional */}
              <motion.p 
                className="text-2xl md:text-3xl text-blue-100 dark:text-blue-200 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                {personalInfo.title}
              </motion.p>
            </motion.div>

            {/* Bio curta do desenvolvedor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1, ease: "easeOut" }}
              className="glass-card max-w-3xl mb-10"
            >
              <p className="text-lg md:text-xl leading-relaxed text-white/90 dark:text-blue-50">
                {personalInfo.bio}
              </p>
            </motion.div>

            {/* Área de links sociais e botão de tema */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
              className="flex items-center gap-6 flex-wrap justify-center"
            >
              {/* Links de redes sociais com animações */}
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button group relative overflow-hidden"
                    whileHover={{ 
                      scale: 1.15,
                      rotate: [0, -5, 5, 0],
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0, rotate: 180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 1.4 + index * 0.1,
                      type: "spring",
                      stiffness: 150
                    }}
                  >
                    {/* Gradiente animado de fundo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    {getSocialIcon(social.icon)}
                  </motion.a>
                ))}
              </div>

              {/* Divisor visual entre ícones sociais e toggle */}
              <motion.div 
                className="w-px h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              />

              {/* Botão para alternar tema claro/escuro */}
              <motion.button
                onClick={toggleTheme}
                className="glass-button group relative overflow-hidden"
                whileHover={{ 
                  scale: 1.15,
                  rotate: theme === 'light' ? 180 : -180,
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1.7,
                  type: "spring",
                  stiffness: 150
                }}
              >
                {/* Gradiente suave ao passar o mouse */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                
                {/* Ícone muda conforme o tema */}
                {theme === 'light' ? (
                  <Moon className="w-6 h-6" />
                ) : (
                  <Sun className="w-6 h-6" />
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;
