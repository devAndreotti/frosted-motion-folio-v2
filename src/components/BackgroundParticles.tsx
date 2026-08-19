// Partículas e orbes gerados uma única vez em tempo de importação (não a cada render)
// e animados via CSS puro (@keyframes), muito mais barato que JS/Framer Motion
// para um efeito ambiente sem interatividade.
const PARTICLE_COUNT = 24; // Reduzido de 60: mesmo efeito visual, muito menos elementos animados
const ORB_COUNT = 6; // Reduzido de 8

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2, // Tamanho entre 2 e 8px
  x: Math.random() * 100, // Posição horizontal (%)
  y: Math.random() * 100, // Posição vertical (%)
  duration: Math.random() * 25 + 15, // Duração da animação entre 15s e 40s
  delay: Math.random() * 10, // Atraso aleatório na animação
  // Alterna entre quatro cores com transparência
  color: i % 4 === 0 ? 'bg-blue-400/30' :
         i % 4 === 1 ? 'bg-cyan-400/30' :
         i % 4 === 2 ? 'bg-blue-300/20' : 'bg-cyan-300/20',
}));

const orbs = Array.from({ length: ORB_COUNT }, (_, i) => ({
  id: i,
  size: Math.random() * 200 + 100, // Tamanho entre 100 e 300px
  x: Math.random() * 100, // Posição horizontal (%)
  y: Math.random() * 100, // Posição vertical (%)
  duration: Math.random() * 20 + 30, // Duração entre 30s e 50s
  delay: Math.random() * 5, // Atraso aleatório
}));

const BackgroundParticles = () => {
  return (
    <>
      {/* Orbes flutuantes animados com movimento suave e pulsação (CSS puro) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {orbs.map((orb) => (
          <div
            key={`orb-${orb.id}`}
            className="floating-orb animate-orb-drift"
            style={{
              width: orb.size,
              height: orb.size,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              animationDuration: `${orb.duration}s`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Partículas pequenas com movimento contínuo, simulando um efeito leve de "pó mágico" (CSS puro) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className={`absolute rounded-full ${particle.color} blur-sm animate-particle-drift`}
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Gradientes pulsantes estáticos adicionando profundidade e cor ao fundo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-blue-300/20 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>
    </>
  );
};

export default BackgroundParticles;
