# Deploying Phase 1 Database Schema (Cart, Orders, Payments)

This guide details how to apply the new database schema changes (Cart, Payments, Updated Orders) on the Oracle Cloud VPS.

**Prerequisites:**
*   You have synced the latest code to the VPS (e.g., via `git pull`).
*   The backend container is running, OR you interpret these commands for the `alsakr-backend` container.

## Option 1: Using Docker Exec (Recommended)
This runs the commands inside the running backend container, where Python and dependencies are already installed.

1.  **SSH into your VPS:**
    ```bash
    ssh -i ~/.ssh/oracle_vps_key ubuntu@144.24.208.96
    ```

2.  **Navigate to infrastructure directory:**
    ```bash
    cd alsakr-online/infrastructure
    ```

3.  **Pull latest changes (from root, so go back up or pull before entering):**
    ```bash
    cd ..
    git pull origin main
    cd infrastructure
    ```

4.  **Rebuild Backend Container (CRITICAL):**
    *   Since we added new files (`alembic.ini`, models), we must rebuild the container to copy them in.
    ```bash
    docker compose up -d --build backend
    ```

5.  **Install Alembic inside the container (if not in requirements.txt yet):**
    ```bash
    docker compose exec backend pip install alembic
    ```

5.  **Generate the Migration Revision:**
    *   This compares the code (SQLAlchemy models) with the current database schema and generates a new Python script in `backend/alembic/versions`.
    ```bash
    docker compose exec backend alembic revision --autogenerate -m "add_cart_payment_order_updates"
    ```
    *   *Note: If you see "INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.", it is working.*

6.  **Apply the Migration:**
    *   This executes the generated script against the PostgreSQL database.
    ```bash
    docker compose exec backend alembic upgrade head
    ```

7.  **Restart Backend (Optional but recommended to clear any cached metadata):**
    ```bash
    docker compose restart backend
    ```

## Option 2: Running Manually (If Docker Exec fails)
If you need to run this outside docker or debug:

1.  **Enter Backend Directory:**
    ```bash
    cd backend
    ```

2.  **Create/Activate Virtual Env:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    pip install alembic
    ```

4.  **Run Alembic:**
    ```bash
    export DATABASE_URL="postgresql://user:password@localhost/dbname" # Set your actual DB URL
    alembic revision --autogenerate -m "add_cart_payment_order_updates"
    alembic upgrade head
    ```

## Verification
To verify the tables were created:

1.  **Connect to Database via Docker:**
    ```bash
    docker compose exec backend python3
    ```

2.  **Run Verification Script:**
    ```python
    from sqlalchemy import create_engine, inspect
    from app.config import settings
    
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)
    print("Tables:", inspector.get_table_names())
    # Should see: 'carts', 'cart_items', 'payments', 'order_items' + existing tables
    ```

## Troubleshooting

### Error: "Can't locate revision identified by ..."
If you see this error, it means the database (`nexus.db`) thinks it has a migration applied, but the migration file is missing (likely lost during container rebuild).
**Fix:** Delete the database file and start fresh (Safe for Dev/Staging).

1.  **Delete the database file inside the container:**
    ```bash
    docker compose exec backend rm data/nexus.db
    # Or if that fails: docker compose exec backend rm /app/data/nexus.db
    ```

2.  **Regenerate Migrations:**
    ```bash
    docker compose exec backend alembic revision --autogenerate -m "initial_schema_reset"
    ```

3.  **Apply Migrations:**
    ```bash
    docker compose exec backend alembic upgrade head
    ```
