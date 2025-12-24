#!/usr/bin/env python3
"""
Database migration script to add 'role' column to users table.
Run this on the VPS to update the existing database schema.
"""

import sqlite3
import sys

def migrate_database(db_path="app.db"):
    """Add role column to users table if it doesn't exist"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if role column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'role' not in columns:
            print("Adding 'role' column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'buyer'")
            conn.commit()
            print("✅ Successfully added 'role' column with default value 'buyer'")
        else:
            print("ℹ️  'role' column already exists")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"\nCurrent users table columns: {', '.join(columns)}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        return False

if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else "app.db"
    print(f"Migrating database: {db_path}")
    success = migrate_database(db_path)
    sys.exit(0 if success else 1)
