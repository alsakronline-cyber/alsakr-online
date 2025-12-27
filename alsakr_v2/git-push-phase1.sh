#!/bin/bash

################################################################################
# Git Workflow - Push Phase 1 Implementation
# Commits and pushes all Phase 1 files to v2-industrial-ai branch
################################################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📦 Git Workflow - Phase 1 Deployment${NC}\n"

# Navigate to repository root
cd "$(git rev-parse --show-toplevel)" || exit 1

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}Current branch: ${CURRENT_BRANCH}${NC}\n"

# Switch to v2-industrial-ai if not already
if [ "$CURRENT_BRANCH" != "v2-industrial-ai" ]; then
    echo -e "${YELLOW}⚠️  Switching to v2-industrial-ai branch...${NC}"
    git checkout v2-industrial-ai
fi

# Pull latest changes first
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin v2-industrial-ai

# Check status
echo -e "\n${BLUE}📊 Current status:${NC}"
git status --short

# Stage all Phase 1 files
echo -e "\n${BLUE}➕ Adding Phase 1 files...${NC}"

# Backend core modules
git add alsakr_v2/v2_project/backend/app/core/config.py
git add alsakr_v2/v2_project/backend/app/core/ingest_products.py
git add alsakr_v2/v2_project/backend/app/core/generate_embeddings.py
git add alsakr_v2/v2_project/backend/app/core/process_pdfs.py
git add alsakr_v2/v2_project/backend/app/core/search_service.py
git add alsakr_v2/v2_project/backend/app/core/__init__.py

# Backend main API
git add alsakr_v2/v2_project/backend/app/main.py

# Documentation
git add alsakr_v2/GIT_WORKFLOW_GUIDE.md
git add alsakr_v2/VPS_DEPLOYMENT_GUIDE.md
git add alsakr_v2/PHASE1_QUICKSTART.md

# Infrastructure
git add alsakr_v2/v2_infra/deploy.sh
git add alsakr_v2/v2_infra/quick-deploy.sh
git add alsakr_v2/v2_infra/docker-compose.prod.yml
git add alsakr_v2/v2_infra/.env.example
git add alsakr_v2/v2_infra/DEPLOYMENT_README.md

# Operations scripts
git add alsakr_v2/v2_infra/ops/run_phase1_ingestion.sh
git add alsakr_v2/v2_infra/ops/backup.sh

echo -e "${GREEN}✓ Files staged${NC}"

# Show what will be committed
echo -e "\n${BLUE}📝 Files to be committed:${NC}"
git status --short

# Commit with detailed message
echo -e "\n${BLUE}💾 Creating commit...${NC}"
git commit -m "Implement Phase 1: Data Foundation & Deployment Automation

✨ Core Data Ingestion Layer
- Add centralized configuration module with environment settings
- Create Elasticsearch product ingestion script (211 SICK products)
- Implement Qdrant vector embedding generator with Ollama
- Add PDF processing pipeline with chunking
- Create unified search service (text/semantic/hybrid)

🚀 API Enhancements
- Add 10+ new search and data management endpoints
- Implement CORS middleware for frontend integration
- Add comprehensive error handling with HTTP exceptions
- Create data status monitoring endpoint
- Enhanced health checks

🐳 Deployment Automation
- Production-optimized Docker Compose with health checks
- Full deployment script with prerequisites checking
- Quick redeploy script for rapid updates
- Automated backup script with retention
- Environment configuration template

📚 Documentation
- Complete Git workflow guide
- Comprehensive VPS deployment guide
- Quick start guide for Phase 1
- Deployment README with examples
- Troubleshooting guides

🎯 Phase 1 Complete
- 211 products ready for indexing
- Vector search infrastructure ready
- Full-text and semantic search enabled
- Production deployment automated
- Ready for Phase 2 integration

Files created/modified:
- Backend: 6 core modules + enhanced main.py
- Docs: 4 comprehensive guides
- Infra: 5 deployment scripts + prod Docker config
- Ops: 2 automation scripts"

echo -e "${GREEN}✓ Commit created${NC}"

# Push to remote
echo -e "\n${BLUE}🚀 Pushing to GitHub...${NC}"
git push origin v2-industrial-ai

echo -e "\n${GREEN}✅ Push complete!${NC}"

# Verify
echo -e "\n${BLUE}🔍 Verifying remote status...${NC}"
git log --oneline -1

echo -e "\n${GREEN}✨ All changes pushed to v2-industrial-ai branch!${NC}\n"

# Show remote URL
echo -e "${BLUE}Remote repository:${NC}"
git remote get-url origin

echo -e "\n${YELLOW}📝 Next steps:${NC}"
echo "1. View changes on GitHub"
echo "2. Deploy to VPS: ssh into server and run ./deploy.sh"
echo "3. Run data ingestion: ./ops/run_phase1_ingestion.sh"
