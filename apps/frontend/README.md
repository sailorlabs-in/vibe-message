# Vibe Message UI & Dashboard 🚀

> The official frontend application for the Vibe Message platform.

This powerful React + Vite + TypeScript application serves as both the public-facing landing page and the comprehensive administrative dashboard for the Vibe Message platform.

## 🌟 Key Features

### 🏢 Public Interfaces

- **Landing Page**: High-conversion landing page outlining core features and CTAs.
- **Documentation Portal**: Deep integration guides and usage instructions for developers.
- **Secure Authentication**: Robust Sign Up, Login, and JWT-session management.

### 🛡️ Secure Dashboard

- **App Overview**: Manage and view complete analytics for your applications.
- **Credential Manager**: Effortlessly provision and revoke access credentials.
- **Approval Systems**: Pending workflow interface for new registrations.

### 👑 Super Admin Privileges

- **User Management**: Root-level controls for managing system users.

## 🛠️ Tech Stack & Architecture

Built with modern, production-ready technologies to ensure performance and maintainability:

- **Framework**: React 18, utilizing functional components and hooks
- **Build Tool**: Vite (Lightning fast HMR and compilation)
- **Language**: TypeScript (End-to-end type safety)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS (Utility-first framework)
- **Networking**: HTTP client via Axios

## 🚀 Getting Started

Follow these instructions to get the project up and running in a local environment.

### 1. Installation

Ensure you have Node.js installed, then install the dependencies:

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and update it with your configuration:

```bash
cp .env.example .env
```

_Required Environment Variables:_

- `VITE_API_URL`: The URL for the backend API server. Defaults to `http://localhost:3000`.

### 3. Development Server

Start the Vite development server:

```bash
npm run dev
```

### 4. Production Build

To build the application for production deployment:

```bash
npm run build
```

The resulting assets will be output to the `dist` directory, ready to be served by any static file server.

## 🗺️ Application Routes

### Public Routes

- `/` - Promotional Landing Page
- `/docs` - Developer Documentation and API references
- `/login` - Authenticated User Login
- `/signup` - New User Registration

### Authenticated Workspace

- `/dashboard` - High-level operational overview
- `/apps` - Application list and creation flow
- `/apps/:id` - Detailed application settings and API Keys
- `/pending` - Workflow for users pending approval

## 📄 License & Terms

Please refer to the `TERMS_OF_SERVICE.md` and `LICENSE.md` files for details on usage, liability, and restrictions.
