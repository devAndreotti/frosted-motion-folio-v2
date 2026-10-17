# Linha de base do Lighthouse

Primeira rodada do workflow `.github/workflows/lighthouse.yml` no CI (PR #93, commit `8c7f56b`, 2026-10-16).
Mediana de 3 execuções por página e formato, no runner do GitHub, contra o build de VPS (`npm run build:vps`)
servido localmente. Não é o site publicado: a rodada semanal (segunda, 09:17 UTC, contra https://devandreotti.com)
gera a linha de base do site real e será anotada aqui depois da primeira execução.

| Página | Formato | Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | desktop | 98 | 100 | 96 | 100 | 0,8 s | 0,01 | 66 ms |
| `/` | mobile | 73 ⚠️ | 100 | 96 | 100 | 4,1 s ⚠️ | 0,02 | 451 ms ⚠️ |
| `/blog/` | desktop | 100 | 100 | 96 | 100 | 0,7 s | 0,00 | 0 ms |
| `/blog/` | mobile | 95 | 100 | 96 | 100 | 2,6 s ⚠️ | 0,01 | 18 ms |
| `/lhci-404/` | desktop | 100 | 100 | 96 | 100 | 0,6 s | 0,03 | 0 ms |
| `/lhci-404/` | mobile | 95 | 100 | 96 | 100 | 2,5 s ⚠️ | 0,00 | 5 ms |
| `/privacidade/` | desktop | 100 | 100 | 100 | 100 | 0,5 s | 0,01 | 0 ms |
| `/privacidade/` | mobile | 95 | 100 | 100 | 100 | 2,5 s | 0,00 | 3 ms |

⚠️ = abaixo do orçamento do roadmap (desempenho ≥ 90, acessibilidade ≥ 95, LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms).
O orçamento é só aviso: o CI não falha por ele ainda.

## Como ler

- `/lhci-404/` e `/privacidade/` são medidos com uma cópia do `index.html` (o servidor estático não tem o fallback do SPA).
  A página 404 do site é a mesma tela do app, então os números são os dela.
- Boas práticas em 96 nas páginas que não são de privacidade: a nota é a mesma nas quatro páginas, o que indica um
  item do sítio e não de conteúdo. Vale olhar o relatório HTML (artefato `lighthouse-pr`, pasta `lighthouse-runs/`).
- O mobile é o número que pesa: LCP e TBT da home estão fora do orçamento (4,1 s e 451 ms). Os Web Vitals reais
  (LCP, INP, CLS) dos visitantes já vão ao Umami (`src/lib/vitals.ts`) e servem para comparar com este laboratório.

## Pendências

- Linha de base do site publicado (rodada semanal ou `workflow_dispatch` do workflow Lighthouse).
- Decidir quando o orçamento vira falha (depois de algumas semanas de números estáveis).
