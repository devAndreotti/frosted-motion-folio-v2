import * as React from "react";

// Define o breakpoint de mobile (em pixels)
const MOBILE_BREAKPOINT = 768;

// Hook personalizado que detecta se a tela é considerada "mobile"
export function useIsMobile() {
  // Estado que indica se a tela é mobile (true/false)
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Cria um MediaQueryList para observar a mudança de largura
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Função que atualiza o estado com base no tamanho atual da janela
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Adiciona o ouvinte de mudança no tamanho da tela
    mql.addEventListener("change", onChange);

    // Define o valor inicial
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Limpa o ouvinte ao desmontar
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Garante que o hook sempre retorne um booleano
  return !!isMobile;
}
