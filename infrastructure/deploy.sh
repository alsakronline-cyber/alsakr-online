#!/bin/bash
#
# Alsakr Online - Complete Deployment Script
# Deploys backend, frontend, and all infrastructure services
#
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Alsakr Online Deployment Script       ║${NC}"
echo -e "${BLUE}║   Environment: ${ENVIRONMENT}                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warnings
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running on VPS
if [ ! -f "/etc/os-release" ]; then
    print_error "This script should be run on the VPS server"
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT"

# ============================================
# Step 1: Backup Current State
# ============================================
print_section "Backing up current state..."

BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup database (if exists)
if [ -f "$PROJECT_ROOT/backend/alsakr.db" ]; then
    cp "$PROJECT_ROOT/backend/alsakr.db" "$BACKUP_DIR/alsakr.db"
    print_success "Database backed up"
fi

# Backup environment files
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    cp "$PROJECT_ROOT/backend/.env" "$BACKUP_DIR/backend.env"
    print_success "Backend .env backed up"
fi

if [ -f "$PROJECT_ROOT/frontend/.env.local" ]; then
    cp "$PROJECT_ROOT/frontend/.env.local" "$BACKUP_DIR/frontend.env.local"
    print_success "Frontend .env backed up"
fi

# ============================================
# Step 2: Pull Latest Code
# ============================================
print_section "Pulling latest code from repository..."

git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
git pull origin main

if [ $? -eq 0 ]; then
    NEW_COMMIT=$(git rev-parse HEAD)
    if [ "$CURRENT_COMMIT" != "$NEW_COMMIT" ]; then
        print_success "Code updated to commit: ${NEW_COMMIT:0:8}"
    else
        print_warning "Already on latest commit"
    fi
else
    print_error "Failed to pull latest code"
    exit 1
fi

# ============================================
# Step 3: Check Environment Variables
# ============================================
print_section "Checking environment variables..."

if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    print_warning "Backend .env not found. Creating from example..."
    if [ -f "$PROJECT_ROOT/backend/.env.example" ]; then
        cp "$PROJECT_ROOT/backend/.env.example" "$PROJECT_ROOT/backend/.env"
        print_error "Please configure backend/.env before continuing"
        exit 1
    fi
fi

if [ ! -f "$PROJECT_ROOT/infrastructure/.env" ]; then
    print_warning "Infrastructure .env not found"
    print_error "Please create infrastructure/.env with required variables"
    exit 1
fi

print_success "Environment files found"

# ============================================
# Step 4: Stop Running Containers
# ============================================
print_section "Stopping running containers..."

cd "$PROJECT_ROOT/infrastructure"
docker compose down

print_success "Containers stopped"

# ============================================
# Step 5: Build Docker Images
# ============================================
print_section "Building Docker images..."

# Build backend
echo "Building backend..."
docker compose build --no-cache backend
if [ $? -eq 0 ]; then
    print_success "Backend built successfully"
else
    print_error "Backend build failed"
    exit 1
fi

# Build frontend
echo "Building frontend..."
docker compose build --no-cache frontend
if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# ============================================
# Step 6: Database Migration
# ============================================
print_section "Running database migrations..."

# Start database temporarily
docker compose up -d db redis qdrant

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
docker compose run --rm backend alembic upgrade head

if [ $? -eq 0 ]; then
    print_success "Database migrations completed"
else
    print_warning "Database migration failed or no migrations to run"
fi

# ============================================
# Step 7: Start All Services
# ============================================
print_section "Starting all services..."

docker compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 15

# ============================================
# Step 8: Verify Services
# ============================================
print_section "Verifying services..."

# Check if containers are running
CONTAINERS=(
    "alsakr-backend"
    "alsakr-frontend"
    "alsakr-db"
    "alsakr-redis"
    "alsakr-qdrant"
    "alsakr-caddy"
    "alsakr-n8n"
)

ALL_RUNNING=true
for container in "${CONTAINERS[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        print_success "$container is running"
    else
        print_error "$container is NOT running"
        ALL_RUNNING=false
    fi
done

# ============================================
# Step 9: Health Checks
# ============================================
print_section "Running health checks..."

# Wait a bit for services to fully start
sleep 5

# Check backend health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_success "Backend API is healthy"
else
    print_warning "Backend API health check failed"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend health check failed"
fi

# Check Redis
if docker exec alsakr-redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is healthy"
else
    print_warning "Redis health check failed"
fi

# ============================================
# Step 10: Display Service URLs
# ============================================
print_section "Service URLs:"

echo ""
echo "📱 Frontend:     https://app.alsakronline.com"
echo "🔌 Backend API:  https://api.app.alsakronline.com"
echo "📊 API Docs:     https://api.app.alsakronline.com/docs"
echo "🤖 n8n:          https://n8n.app.alsakronline.com"
echo "🔍 Qdrant:       http://localhost:6333/dashboard"
echo ""

# ============================================
# Step 11: Show Container Status
# ============================================
print_section "Container Status:"
echo ""
docker compose ps

# ============================================
# Step 12: Display Logs
# ============================================
echo ""
print_section "Recent logs (last 20 lines):"
echo ""
docker compose logs --tail=20

# ============================================
# Step 13: Post-Deployment Tasks
# ============================================
print_section "Post-deployment tasks..."

# Create required directories
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/uploads"
mkdir -p "$PROJECT_ROOT/backups"

print_success "Required directories created"

# ============================================
# Deployment Summary
# ============================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Completed Successfully!    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

if [ "$ALL_RUNNING" = true ]; then
    echo -e "${GREEN}✓ All services are running${NC}"
else
    echo -e "${YELLOW}⚠ Some services failed to start. Check logs above.${NC}"
fi

echo ""
echo "To view logs: docker compose -f infrastructure/docker-compose.yml logs -f [service]"
echo "To restart:   docker compose -f infrastructure/docker-compose.yml restart [service]"
echo "To stop all:  docker compose -f infrastructure/docker-compose.yml down"
echo ""
echo "Backup created at: $BACKUP_DIR"
echo ""

# ============================================
# Optional: Run Tests
# ============================================
if [ "$2" = "--test" ]; then
    print_section "Running tests..."
    
    # Backend tests
    docker compose exec backend pytest tests/ -v
    
    # Load test info
    print_warning "To run load tests: locust -f backend/tests/load/locustfile.py"
fi

print_success "Deployment script completed!"
exit 0
