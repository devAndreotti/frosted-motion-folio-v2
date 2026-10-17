import type { UsesCategory } from './types';

export const AI: UsesCategory = {
  id: 'ai',
  label: { pt: 'IA', en: 'AI' },
  items: [
    {
      name: 'Claude Code',
      why: {
        pt: 'Agente de programação no terminal, usado no dia a dia dos projetos.',
        en: 'A coding agent in the terminal, used day to day on my projects.',
      },
    },
    {
      name: 'Codex CLI',
      why: {
        pt: 'Agente de programação da OpenAI, no terminal.',
        en: 'OpenAI’s coding agent, in the terminal.',
      },
    },
    {
      name: 'OpenCode',
      why: {
        pt: 'Agente de programação no terminal.',
        en: 'A coding agent in the terminal.',
      },
    },
    {
      name: 'Agy',
      why: {
        pt: 'Ferramenta de IA que uso no dia a dia.',
        en: 'An AI tool I use day to day.',
      },
    },
    {
      name: '9Router',
      why: {
        pt: 'Gateway que roteia as ferramentas de IA para os modelos e contas configurados.',
        en: 'A gateway that routes the AI tools to the configured models and accounts.',
      },
    },
    {
      name: 'Hermes Agent',
      why: {
        pt: 'Agente de IA que uso nas minhas tarefas.',
        en: 'An AI agent I use for my own tasks.',
      },
    },
    {
      name: 'Ollama com Gemma',
      detail: { pt: 'Gemma em 2B, 4B e 9B, e variações para código e SQL', en: 'Gemma at 2B, 4B and 9B, plus variants for code and SQL' },
      why: {
        pt: 'Modelos abertos rodando local na GPU, sem mandar o texto para fora.',
        en: 'Open models running locally on the GPU, without sending the text anywhere.',
      },
    },
    {
      name: 'Promptfoo',
      why: {
        pt: 'Testes de prompts e modelos, com casos e métricas.',
        en: 'Tests for prompts and models, with cases and metrics.',
      },
    },
    {
      name: 'Whisper',
      why: {
        pt: 'Transcrição de áudio e geração de legendas, rodando local.',
        en: 'Audio transcription and subtitles, running locally.',
      },
    },
  ],
};
