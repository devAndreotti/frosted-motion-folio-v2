#!/usr/bin/env bash
# Grava no Worker (devandreotti-portfolio) os segredos da newsletter, sem imprimir os valores:
#   SMTP_USER, SMTP_PASS  -> credencial que só envia e-mail (Oracle Email Delivery), de ~/.config/newsletter/smtp.env
#   TURNSTILE_SECRET      -> segredo do widget anti-robô; opcional, lido de TURNSTILE_SECRET= no mesmo arquivo
#                            (copie do painel: Cloudflare > Turnstile > "devandreotti.com newsletter" > Secret key)
#   TOWER_ADMIN_TOKEN     -> token do painel Tower (worker/admin.js); opcional, lido de TOWER_ADMIN_TOKEN= no mesmo arquivo
#                            (sem ele, as rotas /api/admin/ respondem 404)
# Precisa de um wrangler autenticado: `npx wrangler login` ou CLOUDFLARE_API_TOKEN com "Workers Scripts: Edit".
#   bash scripts/newsletter/set-secrets.sh
set -euo pipefail
ENV_FILE="${SMTP_ENV_FILE:-$HOME/.config/newsletter/smtp.env}"
[ -r "$ENV_FILE" ] || { echo "não achei $ENV_FILE" >&2; exit 1; }
get() { grep -m1 "^$1=" "$ENV_FILE" | cut -d= -f2- || true; }
put() { printf '%s' "$2" | npx --yes wrangler@4.148.0 secret put "$1"; }

for name in SMTP_USER SMTP_PASS; do
  value="$(get "$name")"
  [ -n "$value" ] || { echo "$name vazio em $ENV_FILE" >&2; exit 1; }
  put "$name" "$value"
done

turnstile="$(get TURNSTILE_SECRET)"
if [ -n "$turnstile" ]; then
  put TURNSTILE_SECRET "$turnstile"
  echo "ok: SMTP_USER, SMTP_PASS e TURNSTILE_SECRET gravados."
else
  echo "ok: SMTP_USER e SMTP_PASS gravados. Sem TURNSTILE_SECRET, o formulário funciona sem o anti-robô."
  echo "Para ligar o anti-robô: acrescente TURNSTILE_SECRET=... em $ENV_FILE e rode de novo."
fi

tower="$(get TOWER_ADMIN_TOKEN)"
if [ -n "$tower" ]; then
  put TOWER_ADMIN_TOKEN "$tower"
  echo "ok: TOWER_ADMIN_TOKEN gravado."
fi
