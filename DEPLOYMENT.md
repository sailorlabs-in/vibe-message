# Vibe Message Deployment Guide

This guide explains how to deploy and update the Vibe Message application on a local development machine or dedicated testing server using Docker and Kubernetes (KIND).

---

## 🛑 Prerequisites

Before deploying, ensure the target machine has the following tools installed and running:
1. **Docker**: Running in the background (Docker Desktop or Docker Daemon).
2. **KIND (Kubernetes in Docker)**: Installed and available in your system's path.
3. **kubectl**: The Kubernetes command-line tool.
4. **PostgreSQL**: Running locally or accessible via the network.

---

## 🔑 Step 1: Configure Environment Variables

1. Navigate to `apps/server/` and copy `.env.example` to `.env`.
2. Open `apps/server/.env` and ensure the `DATABASE_URL` is configured correctly to point to your PostgreSQL instance. 
   - *Note: The deployment script will automatically detect your host IP and inject it into the Kubernetes secrets so the pods can reach your local database.*
3. Configure your VAPID keys inside `apps/server/.env`.

Similarly, configure `apps/frontend/.env` to point to the correct API URL if necessary.

---

## 🚀 Step 2: First-Time Fresh Deployment

To deploy the application for the very first time, run the primary deployment script from the root `vibe-message` directory. 

**Wait! Before running the deployment**, ensure your database schema is initialized. Run these commands from the root directory to create the tables:
```bash
npm run build:server:prod
npx nx run vibe-message-server:db:setup
```

This deployment script will automatically stand up a new Kubernetes cluster via KIND, configure the NGINX ingress controllers, bake the `backend-secret` from your `.env` file, build the Docker images for all apps, and apply the Kubernetes manifests.

```bash
./deploy-vibe.sh
```

**Wait for the process to complete**. Once the terminal indicates success, you can access the applications at:
- **Frontend App**: `http://localhost:3200`
- **Backend API**: `http://localhost:3200/api`
- **Demo Site**: `http://localhost:3200/demo-app`

### Default Admin Credentials
- **Email:** admin@fcmclone.com
- **Password:** SuperAdmin@123

---

## 🔄 Updating Specific Components

When a developer pushes an update to a specific application (e.g., just the frontend or just the backend), you **do not** need to tear down the cluster and run the full `./deploy-vibe.sh` script again.

Instead, use the targeted update script to rebuild and redeploy only the component that changed.

**To update the Frontend:**
```bash
./update-component.sh frontend
```

**To update the Backend (Server):**
*(This will also automatically refresh your Kubernetes Secrets and ConfigMaps if you changed the `.env` file!)*
```bash
./update-component.sh backend
```

**To update the Demo App:**
```bash
./update-component.sh demo
```
