#!/bin/sh

echo "Iniciando entrypoint..."

# Copia os arquivos secretos para o local esperado no app
mkdir -p /app/config/prod

if [ -f /etc/secrets/mep-logic.prod.json ]; then
  cp /etc/secrets/mep-logic.prod.json /app/config/prod/mep-logic.prod.json
  echo "Copiado mep-logic.prod.json"
  echo "Preview de mep-logic.prod.json:"
  head -n 5 /app/config/prod/mep-logic.prod.json || cat /app/config/prod/mep-logic.prod.json | jq 'keys' || echo "Não foi possível ler o JSON."
fi

if [ -f /etc/secrets/service-account.prod.json ]; then
  cp /etc/secrets/service-account.prod.json /app/config/prod/service-account.prod.json
  echo "Copiado service-account.prod.json"
  echo "Preview de service-account.prod.json:"
  head -n 5 /app/config/prod/service-account.prod.json || cat /app/config/prod/service-account.prod.json | jq 'keys' || echo "Não foi possível ler o JSON."
fi

# Inicia a aplicação NestJS
node dist/src/main
