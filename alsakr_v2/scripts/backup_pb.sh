#!/bin/bash

# Configuration
PROJECT_DIR="/home/ubuntu/alsakr-online/alsakr_v2"
DATA_DIR="$PROJECT_DIR/v2_infra/pb_data"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/pb_backup_$TIMESTAMP.tar.gz"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "========================================================"
echo "Starting Backup at $TIMESTAMP"
echo "Source: $DATA_DIR"
echo "Destination: $BACKUP_FILE"

# check if source exists
if [ ! -d "$DATA_DIR" ]; then
    echo "❌ Error: Source directory $DATA_DIR does not exist!"
    exit 1
fi

# Create tarball
# We use docker-compose stop to ensure consistency? 
# Or copy on the fly (SQLite/PB usually handles read access fine, but WAL mode might be tricky).
# Safest: Stop container, backup, start.
# Low Downtime: SQLite vacuum into backup?
# For now, let's do a hot backup (tar). PB uses SQLite WAL, so it *might* be inconsistent if heavy writes happen.
# Better approach: Use PocketBase's export API? Or just copy.
# Let's stop the backend explicitly to be 100% safe for now. It takes 2 seconds.

echo "Stopping backend container..."
docker stop alsakr-backend

echo "Compressing data..."
tar -czf "$BACKUP_FILE" -C "$PROJECT_DIR/v2_infra" pb_data

echo "Restarting backend container..."
docker start alsakr-backend

echo "✅ Backup created successfully."

# Cleanup old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "pb_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed."
echo "========================================================"
