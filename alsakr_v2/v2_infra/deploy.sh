#!/bin/bash

################################################################################
# Alsakr V2 - Production Deployment Script
# Automates deployment to VPS with Docker Compose
################################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
# Attempt to auto-detect the repository root relative to this script
# This script is located in alsakr_v2/v2_infra/deploy.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Verify if it's a git repo, otherwise fall back to home directory
if ! git -C "$APP_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    APP_DIR="$HOME/alsakr-online"
fi

REPO_URL="https://github.com/alsakronline-cyber/alsakr-online.git"
BRANCH="v2-industrial-ai"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        return 1
    fi
    print_success "$1 is installed"
    return 0
}

################################################################################
# Main Deployment Steps
################################################################################

main() {
    print_header "🚀 ALSAKR V2 - VPS DEPLOYMENT"
    
    # Step 1: Prerequisites Check
    print_header "[1/8] Checking Prerequisites"
    
    check_command "git" || exit 1
    check_command "docker" || exit 1
    check_command "docker-compose" || exit 1
    
    # Step 2: Clone or Update Repository
    print_header "[2/8] Repository Setup"
    
    if [ -d "$APP_DIR" ]; then
        print_info "Directory exists. Pulling latest changes..."
        cd "$APP_DIR"
        git pull origin $BRANCH
        print_success "Repository updated"
    else
        print_info "Cloning repository..."
        git clone -b $BRANCH $REPO_URL $APP_DIR
        cd "$APP_DIR"
        print_success "Repository cloned"
    fi
    
    # Navigate to infrastructure directory
    cd "$APP_DIR/alsakr_v2/v2_infra"
    
    # Step 3: Environment Configuration
    print_header "[3/8] Environment Configuration"
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        cat > .env << 'EOF'
# Production Environment Variables
ES_HOST=elasticsearch
OLLAMA_HOST=http://ollama:11434
PB_URL=http://pocketbase:8090
QDRANT_HOST=qdrant
REDIS_HOST=redis

# Security (CHANGE THESE!)
JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING
ADMIN_EMAIL=admin@alsakronline.com
ADMIN_PASSWORD=#Anas231#Bkar3110

# Optional
NODE_ENV=production
EOF
        chmod 600 .env
        print_warning "⚠️  IMPORTANT: Edit .env and change security values!"
        print_info "Run: nano .env"
        read -p "Press Enter after editing .env file..."
    else
        print_success ".env file exists"
    fi
    
    # Step 4: System Optimization
    print_header "[4/8] System Optimization"
    
    # Increase vm.max_map_count for Elasticsearch
    print_info "Setting vm.max_map_count for Elasticsearch..."
    sudo sysctl -w vm.max_map_count=262144
    
    # Make permanent
    if ! grep -q "vm.max_map_count" /etc/sysctl.conf; then
        echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
        print_success "vm.max_map_count configured permanently"
    fi
    
    # Step 5: Stop Existing Services
    print_header "[5/8] Stopping Existing Services"
    
    # Check if docker-compose.prod.yml exists
    COMPOSE_FILE="docker-compose.yml"
    if [ -f "docker-compose.prod.yml" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
        print_info "Using production compose file: $COMPOSE_FILE"
    fi

    # Check for 'docker compose' vs 'docker-compose'
    DOCKER_COMPOSE_CMD="docker-compose"
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
    fi
    
    if $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE ps | grep -q "Up"; then
        print_info "Stopping running containers..."
        $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE down --remove-orphans
        print_success "Containers stopped"
    else
        print_info "No running containers found. Performing deep cleanup..."
        # Explicitly remove any orphaned containers with our names to prevent conflicts
        docker rm -f alsakr-pb alsakr-ollama alsakr-es alsakr-qdrant alsakr-n8n alsakr-frontend alsakr-backend alsakr-proxy 2>/dev/null || true
        print_success "Cleanup complete"
    fi
    
    # Step 6: Build and Start Services
    print_header "[6/8] Building and Starting Services"
    
    print_info "Building containers..."
    $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE build --no-cache
    
    print_info "Starting services..."
    $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE up -d
    
    print_success "All services started"
    
    # Step 7: Wait for Services
    print_header "[7/8] Waiting for Services to be Ready"
    
    print_info "Waiting for Elasticsearch..."
    timeout=120
    counter=0
    until docker exec alsakr-es curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; do
        counter=$((counter + 1))
        if [ $counter -gt $timeout ]; then
            print_error "Elasticsearch failed to start"
            exit 1
        fi
        sleep 2
        echo -n "."
    done
    print_success "Elasticsearch ready"
    
    print_info "Waiting for Qdrant..."
    counter=0
    until docker exec alsakr-qdrant wget --no-verbose --tries=1 --spider http://localhost:6333/collections > /dev/null 2>&1 || [ "$(docker inspect -f '{{.State.Running}}' alsakr-qdrant)" == "true" ]; do
        counter=$((counter + 1))
        if [ $counter -gt $timeout ]; then
            print_error "Qdrant failed to start"
            exit 1
        fi
        sleep 2
        echo -n "."
        # If we can't wget but container is running, it might just be the missing tool again
        if [ $counter -gt 10 ] && [ "$(docker inspect -f '{{.State.Running}}' alsakr-qdrant)" == "true" ]; then
             print_warning "Qdrant container is running, proceeding..."
             break
        fi
    done
    print_success "Qdrant ready"
    
    print_info "Waiting for Backend..."
    counter=0
    until docker exec alsakr-backend curl -s http://localhost:8000/api/health > /dev/null 2>&1; do
        counter=$((counter + 1))
        if [ $counter -gt $timeout ]; then
            print_error "Backend failed to start"
            exit 1
        fi
        sleep 2
        echo -n "."
    done
    print_success "Backend ready"
    
    # Step 8: Pull AI Models
    print_header "[8/8] Pulling AI Models"
    
    print_info "Checking Ollama models..."
    
    # Pull embedding model
    if ! docker exec alsakr-ollama ollama list | grep -q "nomic-embed-text"; then
        print_info "Pulling nomic-embed-text model..."
        docker exec alsakr-ollama ollama pull nomic-embed-text
        print_success "Embedding model pulled"
    else
        print_info "Embedding model already exists"
    fi
    
    # Pull chat model
    if ! docker exec alsakr-ollama ollama list | grep -q "llama3.2"; then
        print_info "Pulling llama3.2 model..."
        docker exec alsakr-ollama ollama pull llama3.2
        print_success "Chat model pulled"
    else
        print_info "Chat model already exists"
    fi

    # Pull vision model (Phase 3)
    if ! docker exec alsakr-ollama ollama list | grep -q "llava"; then
        print_info "Pulling llava vision model..."
        docker exec alsakr-ollama ollama pull llava
        print_success "Vision model pulled"
    else
        print_info "Vision model already exists"
    fi
    
    # Final Summary
    print_header "✨ DEPLOYMENT COMPLETE!"
    
    echo -e "${GREEN}Services Status:${NC}"
    docker-compose ps
    
    echo -e "\n${GREEN}Next Steps:${NC}"
    echo "1. Run data ingestion: bash ops/run_phase1_ingestion.sh"
    echo "2. Check API health: curl http://localhost:8000/api/health"
    echo "3. View logs: docker-compose logs -f"
    echo "4. Access frontend: https://app.alsakronline.com"
    
    echo -e "\n${YELLOW}Important:${NC}"
    echo "- Update DNS to point to this server"
    echo "- Configure Caddyfile with your domain"
    echo "- Change default passwords in .env"
    echo "- Set up firewall (UFW)"
    
    print_success "Deployment successful! 🎉"
}

################################################################################
# Run Main Function
################################################################################

main "$@"
