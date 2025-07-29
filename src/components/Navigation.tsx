import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Navigation = () => {
  // Obtém o tema atual e a função para alternar o tema do contexto
  const { theme, toggleTheme } = useTheme();

  // Estado para controlar a visibilidade do menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Função para rolar suavemente até uma seção da página
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false); // Fecha o menu após a navegação
    }
  };

  // Itens do menu de navegação
  const navItems = [
    { name: 'Início', id: 'header' },
    { name: 'Sobre', id: 'about' },
    { name: 'Skills', id: 'skills' },
    { name: 'Projetos', id: 'projects' },
    { name: 'Contato', id: 'contact' },
  ];

  return (
    // Navbar com animação inicial de entrada
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-lg border-b border-white/20 dark:border-white/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo com efeito de escala no hover */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-xl font-bold text-gradient-vibrant cursor-pointer"
            onClick={() => scrollToSection('header')}
          >
            Ricardo Andreotti
          </motion.div>

          {/* Navegação para desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className="text-white/90 dark:text-blue-50 hover:text-white dark:hover:text-white transition-colors duration-300 relative group"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                {item.name}
                {/* Linha animada abaixo do item ao passar o mouse */}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}

            {/* Botão de alternância de tema (claro/escuro) */}
            <motion.button
              onClick={toggleTheme}
              className="glass-button p-2 relative overflow-hidden"
              whileHover={{ scale: 1.1, rotate: theme === 'light' ? 180 : -180 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 150 }}
            >
              {/* Efeito visual de fundo ao passar o mouse */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Ícones de tema e menu para dispositivos móveis */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Botão de tema no mobile */}
            <motion.button
              onClick={toggleTheme}
              className="glass-button p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </motion.button>

            {/* Botão de abrir/fechar o menu mobile */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="glass-button p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Conteúdo do menu mobile (visível quando aberto) */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden pb-4 pt-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col items-center space-y-3">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="text-white/90 dark:text-blue-50 hover:text-white dark:hover:text-white transition-colors duration-300 px-4 py-2 rounded-md glass-button w-full text-center"
                  whileHover={{ scale: 1.03 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;
