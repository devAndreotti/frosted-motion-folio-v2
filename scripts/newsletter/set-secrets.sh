#!/usr/bin/env bash
# Grava no Worker (devandreotti-portfolio) as duas credenciais SMTP que enviam o e-mail de confirmação.
# Lê ~/.config/newsletter/smtp.env (criado uma vez, permissão 600) e NÃO imprime os valores.
# Precisa de um wrangler autenticado: `npx wrangler login` ou CLOUDFLARE_API_TOKEN com "Workers Scripts: Edit".
#   bash scripts/newsletter/set-secrets.sh
set -euo pipefail
ENV_FILE="${SMTP_ENV_FILE:-$HOME/.config/newsletter/smtp.env}"
[ -r "$ENV_FILE" ] || { echo "não achei $ENV_FILE" >&2; exit 1; }
get() { grep -m1 "^$1=" "$ENV_FILE" | cut -d= -f2-; }
for name in SMTP_USER SMTP_PASS; do
  value="$(get "$name")"
  [ -n "$value" ] || { echo "$name vazio em $ENV_FILE" >&2; exit 1; }
  printf '%s' "$value" | npx --yes wrangler@4.148.0 secret put "$name"
done
echo "ok: SMTP_USER e SMTP_PASS gravados. O formulário aparece no site assim que o Worker responder /api/newsletter/status."
