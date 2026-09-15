# Self-Hosting Guide for Vibe Message

Vibe Message supports unmetered self-hosted deployments for enterprise users and developers who wish to host the push notification platform on their own infrastructure.

Self-hosting requires an **Enterprise License Key**, which you can obtain from your profile settings on the main vibe-message platform.

---

## Prerequisites

1. **Docker & Docker Compose** installed on your host server.
2. **Enterprise License Key** (e.g. `vibe_ent_...`) generated from the settings panel.
3. **VAPID Keys** (Public & Private) for configuring client and server push credentials.

---

## Quick Start (All-in-One Compose)

By default, Vibe Message is configured to run alongside containerized Postgres and Redis instances.

### 1. Create a `.env` File

Create a `.env` file in the same directory as `docker-compose.yml` and populate it with your credentials:

```bash
# Vibe Message Server Port
PORT=5000

# Enterprise Verification (Required)
ENTERPRISE_KEY=your_vibe_ent_license_key_here
VIBE_MAIN_SERVER_URL=https://vibe-message.sailorlabs.in/api

# Security
JWT_SECRET=use-a-strong-random-jwt-secret-string

# VAPID Configuration (Get from Vibe Message UI or generate using `npx web-push generate-vapid-keys`)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Initial Super Admin (Automatically created on first database sync)
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=SelectAStrongAdminPassword123!
SUPER_ADMIN_NAME=Super Admin
```

### 2. Start the Stack

Run the following command to download, build, and start all containers:

```bash
docker compose up -d
```

Access the API documentation at `http://localhost:5000` (or whichever port you specified).

---

## Using External Postgres & Redis

If you already host Postgres and Redis on your infrastructure, you can bypass the containerized instances:

### 1. Update the `.env` File

Add your external database connections directly to the environment:

```bash
# External Database Connection String
DATABASE_URL=postgresql://your_db_user:your_db_password@your_db_host:5432/your_database_name

# External Redis Cache host
REDIS_HOST=your_redis_host
REDIS_PORT=6379
```

### 2. Launch Only the Backend Container

To start the Vibe Message server without spinning up containerized Postgres/Redis instances, instruct Docker Compose to target only the backend service:

```bash
docker compose up -d vibe-message-server
```

---

## License Key Verification Flow

When the self-hosted container boots up:
1. It reads the `ENTERPRISE_KEY` variable.
2. It sends an HTTPS request to the main platform server (`VIBE_MAIN_SERVER_URL`).
3. If the license check is successful, the container boots and binds to its port.
4. If the check fails (e.g. invalid key, key revoked, or cannot reach verification server), the server prints an error and terminates with exit code `1`.

> [!TIP]
> If you rotate/shuffle your Enterprise License Key from the main dashboard, your current key becomes invalid. You must update the `ENTERPRISE_KEY` in your `.env` file and run `docker compose restart vibe-message-server` to apply the rotation.
