
import { motion } from 'framer-motion';

const BackgroundParticles = () => {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 25 + 15,
    delay: Math.random() * 10,
    color: i % 4 === 0 ? 'bg-blue-400/30' : 
           i % 4 === 1 ? 'bg-cyan-400/30' : 
           i % 4 === 2 ? 'bg-blue-300/20' : 'bg-cyan-300/20',
  }));

  const orbs = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 200 + 100,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 30,
    delay: Math.random() * 5,
  }));

  return (
    <>
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {orbs.map((orb) => (
          <motion.div
            key={`orb-${orb.id}`}
            className="floating-orb"
            style={{
              width: orb.size,
              height: orb.size,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
            }}
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -100, 100, 0],
              opacity: [0.05, 0.15, 0.05],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: orb.duration,
              delay: orb.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Particle system */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className={`absolute rounded-full ${particle.color} blur-sm`}
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-blue-300/20 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>
    </>
  );
};

export default BackgroundParticles;
