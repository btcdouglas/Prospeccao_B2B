#!/bin/bash

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

PROJECT_DIR="/Users/douglasbittencourt/Library/CloudStorage/GoogleDrive-btc.douglas@gmail.com/Meu Drive/98.PROJETOS.IA/7.Prospeccao_B2B"

clear
echo ""
echo -e "${BOLD}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}║          B2B f.AInder                ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}1)${NC} Ligar o sistema"
echo -e "  ${RED}2)${NC} Desligar o sistema"
echo -e "  ${BLUE}3)${NC} Ver status dos containers"
echo ""
read -rp "  Escolha [1/2/3]: " choice
echo ""

case "$choice" in

  1)
    echo -e "${GREEN}▶ Iniciando sistema...${NC}"
    echo ""

    # Abre Docker Desktop em segundo plano se não estiver rodando
    if ! docker info &>/dev/null 2>&1; then
      echo -e "${YELLOW}  → Abrindo Docker Desktop...${NC}"
      open -a Docker
      echo -n "  → Aguardando Docker iniciar (pode levar ~30s)"
      WAIT=0
      MAX=90
      sleep 5
      until docker info &>/dev/null 2>&1; do
        echo -n "."
        sleep 3
        WAIT=$((WAIT + 3))
        if [ $WAIT -ge $MAX ]; then
          echo ""
          echo -e "${RED}✗ Docker não iniciou após ${MAX}s. Abra o Docker Desktop manualmente e tente novamente.${NC}"
          echo ""
          read -rp "  Pressione Enter para fechar..." _
          exit 1
        fi
      done
      echo -e " ${GREEN}OK${NC}"
    else
      echo -e "${GREEN}  → Docker já está rodando${NC}"
    fi

    echo ""
    echo -e "${YELLOW}  → Limpando estado anterior...${NC}"
    cd "$PROJECT_DIR" && docker compose down 2>/dev/null || true

    echo -e "${YELLOW}  → Subindo containers (banco, redis, backend, celery, frontend)...${NC}"
    echo ""
    if cd "$PROJECT_DIR" && docker compose up -d 2>&1; then
      echo ""
      echo -e "${GREEN}✓ Sistema no ar!${NC}"
      echo ""
      echo -e "  Frontend  →  ${BLUE}http://localhost:3000${NC}"
      echo -e "  Backend   →  ${BLUE}http://localhost:8000${NC}"
      echo -e "  API Docs  →  ${BLUE}http://localhost:8000/docs${NC}"
      osascript -e 'tell application "System Events" to set visible of process "Docker Desktop" to false' 2>/dev/null || true
    else
      echo ""
      echo -e "${RED}✗ Erro ao subir containers. Veja os logs abaixo:${NC}"
      echo ""
      cd "$PROJECT_DIR" && docker compose logs --tail=30
    fi
    echo ""
    ;;

  2)
    echo -e "${RED}■ Desligando sistema...${NC}"
    echo ""
    echo -e "${YELLOW}  → Derrubando containers e volumes de rede...${NC}"
    cd "$PROJECT_DIR" && docker compose down
    echo ""

    read -rp "  Fechar o Docker Desktop também? [s/N]: " quit_docker
    if [[ "$quit_docker" =~ ^[Ss]$ ]]; then
      osascript -e 'quit app "Docker"'
      echo -e "${GREEN}  → Docker Desktop fechado${NC}"
    fi

    echo ""
    echo -e "${GREEN}✓ Sistema desligado com sucesso.${NC}"
    echo ""
    ;;

  3)
    echo -e "${BLUE}▶ Status dos containers:${NC}"
    echo ""
    cd "$PROJECT_DIR" && docker compose ps
    echo ""
    ;;

  *)
    echo -e "${RED}Opção inválida. Feche e tente novamente.${NC}"
    echo ""
    ;;

esac

read -rp "  Pressione Enter para fechar..." _
