import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

/** Hidden easter egg — type "sudo" anywhere on the page to pop a fake terminal. */
const SudoTerminal = () => {
  const [show, setShow] = useState(false);
  const buffer = useRef('');

  useEffect(() => {
    console.log('%cRicardo A. Gonçalves', 'font-weight:800;font-size:16px;');
    console.log('Full stack dev — abriu o devtools? bora trabalhar junto: contato no rodapé da página.');

    const onKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        setShow(false);
        return;
      }
      if (e.key && e.key.length === 1) {
        buffer.current = (buffer.current + e.key).slice(-4).toLowerCase();
        if (buffer.current === 'sudo') setShow(true);
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4" onClick={() => setShow(false)}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden font-mono"
        style={{ background: 'rgba(20,20,24,0.9)', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(28px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
          <button
            type="button"
            aria-label="Fechar terminal"
            onClick={() => setShow(false)}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
        <div className="px-5 py-5 text-[13px] leading-[1.9]" style={{ color: '#c8ffcf' }}>
          <div>$ whoami</div>
          <div className="text-white/60 mb-2">ricardo — full stack dev, sempre com café por perto</div>
          <div>$ cat curriculo.txt</div>
          <div className="text-white/60 mb-2">React · Node.js · TypeScript · IA aplicada · disponível pra novos projetos</div>
          <div>
            $ echo $STATUS
            <span className="inline-block w-[7px] h-3.5 bg-green-400 align-middle animate-blink" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SudoTerminal;
