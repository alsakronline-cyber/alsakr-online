# V2 Deployment Guide: From Clean Slate to Launch

Follow these steps exactly to migrate from the old version to the new **Industrial AI Command Center**.

## Step 0: Git Versioning (Local)
Always work in a separate branch to keep your `main` branch stable.

1.  **Create and switch to the V2 branch**:
    ```bash
    git checkout -b v2-industrial-ai
    ```
2.  **Add and Commit your new infra**:
    ```bash
    git add v2_infra/
    git commit -m "feat: infrastructure for 10-agent industrial system"
    ```
3.  **Push to your remote (GitHub/GitLab)**:
    ```bash
    git push origin v2-industrial-ai
    ```

---

## Step 1: Prepare the "Clean Slate" (VPS)
Before starting V2, we must reclaim space and clear old containers from the Oracle VPS.

1.  **SSH into your VPS**.
2.  **Pull the new branch**:
    ```bash
    git fetch origin
    git checkout v2-industrial-ai
    git pull origin v2-industrial-ai
    ```
3.  **Make scripts executable**:
    ```bash
    chmod +x ./v2_infra/ops/cleanup_vps.sh
    chmod +x ./v2_infra/ops/setup_project.sh
    ```
4.  **Run the Cleanup**:
    ```bash
    ./v2_infra/ops/cleanup_vps.sh
    ```
    *This will stop all containers and wipe old Docker volumes. It ensures your 24GB RAM and disk space are fully available.*

---

## Step 2: Scaffold the V2 Project
Now we build the new directory structure that supports the 10-Agent architecture.

1.  **Run the Setup Script**:
    ```bash
    ./ops/setup_project.sh
    ```
2.  **Result**: You will now have a folder named `v2_project` containing:
    *   `backend/app/agents/` (The Brains)
    *   `frontend/app/command-center/` (The UI)
    *   `data/` (Where you will put your CSVs/PDFs)

---

## Step 3: Launch the Infrastructure
We will boot the core services (Elasticsearch, Ollama, PocketBase).

1.  **Navigate to project**:
    ```bash
    cd v2_project
    ```
2.  **Start Services**:
    ```bash
    docker-compose up -d
    ```
3.  **Check Health**:
    *   **PocketBase**: `http://<your-vps-ip>:8090/_/` (CRM)
    *   **Elasticsearch**: `http://<your-vps-ip>:9200` (Search)
    *   **n8n**: `http://<your-vps-ip>:5678` (Automation)

---

## Step 4: Loading the "Fuel" (Data Ingestion)
1.  **Products**: Place your `products.csv` in `v2_project/data/scraped/`.
2.  **Manuals**: Place your PDFs in `v2_project/data/manuals/`.
3.  **Verification**: I will provide ingestion scripts in the next phase to index these into Elasticsearch.

---

## Next Steps for the Developer (Antigravity):
Once you confirm these services are running, I will:
1.  Build the **Base Agent Class** in `backend/app/agents/base.py`.
2.  Refactor the **Visual Agent** with the Anti-Counterfeit logic.
3.  Configure the **WhatsApp n8n Workflows**.

**Proceed with Step 1 and Step 2 now?**
