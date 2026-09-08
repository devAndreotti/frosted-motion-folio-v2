import { useEffect, useRef, useState } from "react";
import { X, Terminal as TerminalIcon } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useTheme, type Hue } from "@/contexts/ThemeContext";

interface CommandLog {
  id: string;
  command: string;
  output: React.ReactNode;
}

const VALID_HUES: Hue[] = ["blue", "purple", "green", "orange", "rose", "cyan", "black"];

export const SudoTerminal = () => {
  const [show, setShow] = useState(false);
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: "initial-1",
      command: "welcome",
      output: (
        <div className="text-white/70 space-y-1">
          <div>Terminal Interativo v2.0 — digite <span className="text-[var(--accent)] font-bold">help</span> para comandos.</div>
          <div>Dica: existem segredos escondidos pela linha do tempo...</div>
        </div>
      ),
    },
  ]);
  const [divergenceEffect, setDivergenceEffect] = useState(false);

  const { setHue, toggleTheme, theme } = useTheme();
  const buffer = useRef("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === "Escape") return;
      if (e.key && e.key.length === 1) {
        buffer.current = (buffer.current + e.key).slice(-16).toLowerCase();
        if (buffer.current.endsWith("sudo")) {
          setShow(true);
        } else if (buffer.current.endsWith("el psy kongroo") || buffer.current.endsWith("el psy congroo")) {
          setShow(true);
          triggerSteinsGate();
        }
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  useScrollLock(show);
  useFocusTrap(show, dialogRef, () => setShow(false));

  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (typeof bottomRef.current?.scrollIntoView === "function") {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [show, logs]);

  const triggerSteinsGate = () => {
    setDivergenceEffect(true);
    setTimeout(() => setDivergenceEffect(false), 2500);
    setLogs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        command: "el psy kongroo",
        output: (
          <div className="p-3 my-1 rounded-lg border border-amber-500/40 bg-amber-950/30 text-amber-300 font-mono space-y-1">
            <div className="text-sm font-extrabold tracking-wider text-amber-400">
              [DIVERGENCE METER: 1.048596%]
            </div>
            <div>Operation Skuld has commenced. The Organization is watching.</div>
            <div className="text-xs text-amber-500/80 italic">El. Psy. Kongroo.</div>
          </div>
        ),
      },
    ]);
  };

  const handleCommand = (rawCmd: string) => {
    const cleanCmd = rawCmd.trim();
    if (!cleanCmd) return;

    const [mainCmd, ...args] = cleanCmd.toLowerCase().split(/\s+/);
    const arg = args[0];

    let output: React.ReactNode;

    switch (mainCmd) {
      case "help":
        output = (
          <div className="text-white/70 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div><span className="text-[var(--accent)] font-semibold">whoami</span> — Perfil de Ricardo</div>
            <div><span className="text-[var(--accent)] font-semibold">skills</span> — Stack principal</div>
            <div><span className="text-[var(--accent)] font-semibold">theme &lt;cor&gt;</span> — Muda tom de cor</div>
            <div><span className="text-[var(--accent)] font-semibold">mode</span> — Alterna dark/light</div>
            <div><span className="text-[var(--accent)] font-semibold">contact</span> — Links e e-mail</div>
            <div><span className="text-[var(--accent)] font-semibold">clear</span> — Limpa a tela</div>
            <div><span className="text-[var(--accent)] font-semibold">exit</span> — Fecha terminal</div>
          </div>
        );
        break;

      case "whoami":
        output = (
          <div className="text-white/80">
            Ricardo A. Gonçalves — Desenvolvedor Full Stack apaixonado por React, Node.js, automação e inteligência artificial aplicada.
          </div>
        );
        break;

      case "skills":
        output = (
          <div className="text-white/80">
            React · Next.js · TypeScript · Node.js · Tailwind CSS · Supabase · Python · Docker · Vite
          </div>
        );
        break;

      case "contact":
        output = (
          <div className="text-white/80 space-y-1">
            <div>GitHub: <a href="https://github.com/devAndreotti" target="_blank" rel="noreferrer" className="underline text-[var(--accent)]">github.com/devAndreotti</a></div>
            <div>LinkedIn: <a href="https://www.linkedin.com/in/ricardo-andreotti-gon%C3%A7alves-0b5785283/" target="_blank" rel="noreferrer" className="underline text-[var(--accent)]">linkedin.com/in/ricardo-andreotti</a></div>
            <div>Email: <span className="text-white font-mono">devandreotti@gmail.com</span></div>
          </div>
        );
        break;

      case "mode":
        toggleTheme();
        output = <div className="text-white/80">Modo alterado para <span className="text-[var(--accent)] font-bold">{theme === "dark" ? "light" : "dark"}</span>.</div>;
        break;

      case "theme":
        if (arg && VALID_HUES.includes(arg as Hue)) {
          setHue(arg as Hue);
          output = <div className="text-white/80">Tema de cor alterado para <span className="text-[var(--accent)] font-bold">{arg}</span>!</div>;
        } else {
          output = <div className="text-red-400">Cor inválida. Opções: {VALID_HUES.join(", ")}</div>;
        }
        break;

      case "clear":
        setLogs([]);
        return;

      case "exit":
      case "quit":
        setShow(false);
        return;

      case "el":
        if (cleanCmd.toLowerCase() === "el psy kongroo" || cleanCmd.toLowerCase() === "el psy congroo") {
          triggerSteinsGate();
          return;
        }
        output = <div className="text-white/50">Comando desconhecido: {cleanCmd}. Digite <span className="text-[var(--accent)]">help</span>.</div>;
        break;

      case "tuturu":
        output = <div className="text-pink-400 font-bold">♪ Tutturu~~ Mayushii desu! ☆</div>;
        break;

      default:
        if (cleanCmd.toLowerCase().includes("el psy")) {
          triggerSteinsGate();
          return;
        }
        output = <div className="text-white/50">Comando desconhecido: {cleanCmd}. Digite <span className="text-[var(--accent)]">help</span>.</div>;
        break;
    }

    setLogs((prev) => [...prev, { id: String(Date.now()), command: cleanCmd, output }]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput("");
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 transition-all"
      onClick={() => setShow(false)}
    >
      <div
        ref={dialogRef}
        className={`w-full max-w-xl rounded-2xl overflow-hidden font-mono shadow-2xl transition-all ${
          divergenceEffect ? "ring-2 ring-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.5)]" : ""
        }`}
        style={{
          background: "rgba(15, 17, 23, 0.95)",
          border: "1px solid var(--border-2)",
          backdropFilter: "blur(24px)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
      >
        <div
          className="flex items-center justify-between px-4 py-2.5 bg-white/5 select-none"
          style={{ borderBottom: "1px solid var(--border-1)" }}
        >
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-semibold text-white/80">ricardo@portfolio: ~</span>
          </div>
          <button
            type="button"
            aria-label="Fechar terminal"
            onClick={() => setShow(false)}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[380px] overflow-y-auto space-y-3 text-xs md:text-sm custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="space-y-1">
              <div className="flex items-center gap-2 text-[var(--accent)] font-semibold">
                <span>$</span>
                <span>{log.command}</span>
              </div>
              <div className="pl-4">{log.output}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 px-4 py-3 bg-black/40 border-t border-[var(--border-1)]"
        >
          <span className="text-[var(--accent)] font-bold text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="digite um comando (help, theme, whoami...)"
            className="flex-1 bg-transparent border-none outline-none text-white text-xs md:text-sm placeholder:text-white/30"
          />
        </form>
      </div>
    </div>
  );
};

export default SudoTerminal;
