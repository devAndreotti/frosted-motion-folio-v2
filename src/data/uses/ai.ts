import type { UsesCategory } from './types';

export const AI: UsesCategory = {
  id: 'ai',
  label: { pt: 'IA', en: 'AI' },
  items: [
    {
      name: 'Claude Code',
      main: true,
      detail: { pt: 'Anthropic · Agente CLI no terminal', en: 'Anthropic · Terminal CLI agent' },
      why: {
        pt: 'Agente de engenharia no terminal para fluxos de desenvolvimento e arquitetura.',
        en: 'Anthropic terminal agent for engineering and development workflows.',
      },
    },
    {
      name: 'Hermes Agent',
      detail: { pt: 'Nous Research · Runtime autônomo', en: 'Nous Research · Autonomous runtime' },
      why: {
        pt: 'Runtime de agentes autônomos, delegação paralela e automações locais e na VPS.',
        en: 'Autonomous agent runtime, parallel delegation, and local/VPS automations.',
      },
    },
    {
      name: '9Router',
      detail: { pt: 'Gateway de proxy e roteamento local', en: 'Local proxy and routing gateway' },
      why: {
        pt: 'Gateway de proxy e roteamento local de LLMs com failover automático.',
        en: 'Local LLM proxy and routing gateway with automated failover.',
      },
    },
    {
      name: 'ai-memory',
      detail: { pt: 'Servidor MCP em Rust', en: 'Rust MCP server' },
      why: {
        pt: 'Servidor MCP em Rust para persistência durável de memória e contexto técnico.',
        en: 'Rust MCP server for durable memory persistence and technical context.',
      },
    },
    {
      name: 'Gemini CLI',
      detail: { pt: 'Google · Terminal e fluxos de engenharia', en: 'Google · Terminal and engineering workflows' },
      why: {
        pt: 'Modelos Gemini no terminal integrados aos fluxos diários de engenharia.',
        en: 'Gemini models in the terminal integrated into daily engineering workflows.',
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
