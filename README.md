# Vibe Message

A modern, full-stack unified monorepo powering scalable web push notifications and web applications.

## Architecture Structure (NX Monorepo)

This repository is managed using [NX](https://nx.dev/) and powered by NPM Workspaces.

```text
/apps
  /frontend         # React 18 frontend platform
  /server           # Express/Node JS backend platform
/libs
  /sdk              # Shared Vibe Message JavaScript SDK
```

## Quick Start (Development)

The entire workspace can be spun up simultaneously or independently using NX tools.

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   Ensure PostgreSQL is running and your `DATABASE_URL` is set inside `apps/server/.env`.
   ```bash
   npm run build:server:prod
   npx nx run vibe-message-server:db:setup
   ```

3. **Start All Services in Development Mode**
   ```bash
   npm run serve-all:dev
   ```
   This command starts the `vibe-message-frontend`, `vibe-message-server`, and any SDK watchers continuously in development mode.

### Running Individual Apps

You can run individual apps using the NX scripts configured in the root `package.json`:

- Start Frontend Only: `npm run serve:frontend:dev`
- Start Server Only: `npm run serve:server:dev`

## Production Build

To build the optimized production outputs for all applications in one go:
```bash
npm run build-all:prod
```
The output artifacts will follow standard Vite (frontend) and tsc (server) behaviors within their respective `apps/` folders.
