#!/bin/bash

# Script de deploy automatizado
set -e

echo "🚀 Iniciando deploy..."

# Verificar se estamos na branch main
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Deploy deve ser feito a partir da branch main"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Há mudanças não commitadas. Commit antes de fazer deploy."
    exit 1
fi

# Build das imagens
echo "📦 Building images..."
docker-compose build --no-cache

# Executar testes
echo "🧪 Running tests..."
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Tag das imagens
echo "🏷️ Tagging images..."
docker tag korean-app_backend:latest korean-app_backend:$(git rev-parse --short HEAD)
docker tag korean-app_frontend:latest korean-app_frontend:$(git rev-parse --short HEAD)

# Push para registry (se configurado)
if [ -n "$DOCKER_REGISTRY" ]; then
    echo "📤 Pushing to registry..."
    docker push $DOCKER_REGISTRY/korean-app_backend:latest
    docker push $DOCKER_REGISTRY/korean-app_frontend:latest
fi

# Deploy em produção
echo "🚀 Deploying to production..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "✅ Deploy concluído com sucesso!"
