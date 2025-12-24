#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
RETENTION_DAYS=7

# Ensure backup dir exists
mkdir -p "$BACKUP_DIR"

echo "🛑 Stopping services for consistent backup..."
cd /home/ubuntu/alsakr-online/infrastructure
docker compose stop backend pocketbase qdrant ollama n8n redis

echo "📦 Backing up volumes..."

# Function to backup a volume
backup_volume() {
    VOLUME_NAME=$1
    FILE_NAME="${BACKUP_DIR}/${VOLUME_NAME}_${DATE}.tar.gz"
    echo "   - Backing up $VOLUME_NAME to $FILE_NAME"
    docker run --rm -v "${VOLUME_NAME}:/data" -v "${BACKUP_DIR}:/backup" alpine tar czf "/backup/$(basename $FILE_NAME)" -C /data .
}

# Add volumes to backup list
backup_volume "infrastructure_backend_data"
backup_volume "infrastructure_pocketbase_data"
backup_volume "infrastructure_qdrant_data"
backup_volume "infrastructure_ollama_data"
backup_volume "infrastructure_n8n_data"
backup_volume "infrastructure_caddy_data"

echo "✅ Backup complete."

echo "🚀 Restarting services..."
docker compose start

echo "🧹 Cleaning up old backups (>${RETENTION_DAYS} days)..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "🎉 Backup process finished successfully!"
