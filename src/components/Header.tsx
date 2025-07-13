import { motion } from 'framer-motion';
import { Moon, Sun, Github, Linkedin, Mail, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { personalInfo, socialLinks } from '@/data/projects';
import Navigation from './Navigation';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

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
      <Navigation />
      <motion.header
        id="header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 py-12 md:py-20 mt-16"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center relative">
            {/* Decorative elements */}
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

            {/* Avatar */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.3, type: "spring", stiffness: 100 }}
              className="mb-8 relative"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow"></div>
                <img
                  src="./profile.jpg"
                  alt={personalInfo.name}
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-full object-cover glass-intense border-4 border-white/40 shadow-3xl group-hover:scale-105 transition-transform duration-300"
                />
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
                
                {/* Sparkle effects */}
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

            {/* Nome e Título */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              className="mb-6"
            >
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
              <motion.p 
                className="text-2xl md:text-3xl text-blue-100 dark:text-blue-200 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                {personalInfo.title}
              </motion.p>
            </motion.div>

            {/* Bio */}
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

            {/* Redes Sociais e Toggle Theme */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
              className="flex items-center gap-6 flex-wrap justify-center"
            >
              {/* Redes Sociais */}
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
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    {getSocialIcon(social.icon)}
                  </motion.a>
                ))}
              </div>

              {/* Divisor */}
              <motion.div 
                className="w-px h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              />

              {/* Toggle Theme */}
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
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
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
