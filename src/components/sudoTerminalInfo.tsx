import type { ReactNode } from "react";
import { CASES } from "@/data/cases";

type Lang = "pt" | "en";

const CONTACT_EMAIL = "devandreotti@gmail.com";
const MAIN_STACK = "React · TypeScript · Node.js · Supabase";

// The commands added to the terminal: short, public facts only (no hosts, paths or accounts).
const COMMANDS: Record<string, { pt: string; en: string }> = {
  projetos: { pt: "lista os projetos", en: "lists the projects" },
  sobre: { pt: "uma frase da minha bio", en: "one line from my bio" },
  stack: { pt: "a stack principal", en: "the main stack" },
  contato: { pt: "e-mail para contato", en: "contact email" },
  ajuda: { pt: "lista os comandos", en: "lists the commands" },
};

/** One row of the help list; the help command and the `help` grid both use it. */
export const terminalInfoHelp = (lang: Lang): ReactNode =>
  Object.entries(COMMANDS).map(([name, desc]) => (
    <div key={name}>
      <span className="text-[var(--accent)] font-semibold">{name}</span> — {desc[lang]}
    </div>
  ));

/** Output for the info commands, or null when `cmd` is not one of them. */
export const terminalInfoOutput = (cmd: string, lang: Lang, bio: string): ReactNode | null => {
  switch (cmd) {
    case "projetos": {
      const names = Array.from(new Set(CASES.map((c) => c.title)));
      return (
        <div className="text-white/80">
          {lang === "pt" ? `${names.length} projetos com página: ` : `${names.length} projects with a page: `}
          {names.join(" · ")}
        </div>
      );
    }
    case "sobre":
      return <div className="text-white/80">{bio.split(/(?<=\.)\s+/)[0]}</div>;
    case "stack":
      return <div className="text-white/80">{lang === "pt" ? "Stack principal: " : "Main stack: "}{MAIN_STACK}</div>;
    case "contato":
      return (
        <div className="text-white/80">
          {lang === "pt" ? "E-mail: " : "Email: "}
          <span className="text-white font-mono">{CONTACT_EMAIL}</span>
        </div>
      );
    case "ajuda":
      return <div className="text-white/70 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">{terminalInfoHelp(lang)}</div>;
    default:
      return null;
  }
};
