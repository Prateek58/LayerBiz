---
title: "How to Separate Frontend and Backend Secrets in GitHub Actions Monorepos"
slug: "github-actions-monorepo-secrets-environments"
category: "DevOps"
date: "Aug 27, 2026"
readTime: "7 min read"
tags: ["GitHub Actions", "DevOps", "CI/CD", "Security", "Next.js", "Strapi"]
excerpt: "How to manage separate environment variables and secrets for frontend and backend apps within the same GitHub repository using GitHub Environments and path-filtered workflows."
metaTitle: "Separate Frontend & Backend Secrets in GitHub Actions | LayerBiz"
metaDescription: "Learn how to isolate frontend and backend secrets in a monorepo using GitHub Actions Environments, variable scoping, and path-triggered deployment workflows."
keywords: ["GitHub Actions Monorepo Secrets", "Separate Frontend Backend Secrets", "GitHub Environments CI/CD", "Next.js Strapi Monorepo", "DevOps Secret Management"]
---

# How to Separate Frontend and Backend Secrets in GitHub Actions Monorepos

When building full-stack applications with decoupled architectures (such as a Next.js frontend paired with a Strapi headless CMS in a single Git repository), teams quickly run into a continuous integration challenge: **How do you manage separate secrets and environment variables for the frontend and backend without collisions or security leaks?**

By default, repository secrets in GitHub Actions are shared globally across the entire repository. If your backend requires database credentials and JWT signing keys, while your frontend requires public analytics IDs and CMS API tokens, dumping everything into a single repository secrets bucket creates confusion and increases security risks.

Here is the architectural guide on how to cleanly isolate, organize, and automate frontend and backend secrets using **GitHub Environments** and **path-filtered CI/CD workflows**.

---

## 1. The Core Challenge: Monorepos with Shared Secret Buckets

In a monorepo containing both `/frontend` and `/backend`:

| Application Layer | Credential Type | Sensitivity Level | Examples |
| :--- | :--- | :--- | :--- |
| **Frontend (Next.js)** | Public client IDs & read-only API tokens | Low to Moderate | `NEXT_PUBLIC_GA_ID`, `STRAPI_API_TOKEN` |
| **Backend (Strapi/Node)** | Database passwords, encryption salts, admin keys | High (Critical) | `DATABASE_PASSWORD`, `JWT_SECRET`, `APP_KEYS` |
| **Shared Infrastructure** | Server deployment & access keys | High (Infrastructure) | `SSH_HOST`, `SSH_KEY`, `SSH_PORT` |

Without proper credential boundaries:
1. Frontend workflows have access to backend database credentials.
2. Naming collisions occur when both applications require similarly named keys (e.g. `API_TOKEN` or `PORT`).
3. Deploying a minor frontend styling fix could accidentally re-evaluate backend deployment variables.

---

## 2. Solution: GitHub Environments

The most robust architectural solution is leveraging **GitHub Environments**. Environments allow you to create distinct configuration contexts with their own secrets, variables, and deployment protection rules within a single repository.

### Setting Up Environments in GitHub:

1. Navigate to your repository on **GitHub.com**.
2. Click **Settings** (top tab) > **Environments** (in the left sidebar).
3. Click **New environment** and create:
   * `frontend-production`
   * `backend-production`
4. Inside each environment, define only the secrets and variables specific to that project.

---

## 3. Scoping Secrets Across Layers

### 1. Shared Infrastructure Secrets (Repository Level)
Place connection credentials used by all deployment jobs under **Settings > Secrets and variables > Actions > Repository secrets**:
* `SSH_HOST`
* `SSH_KEY`
* `SSH_PORT`

### 2. Frontend Environment (`frontend-production`)
Add variables required exclusively by the Next.js build:
* `NEXT_PUBLIC_GA_ID` (e.g. `G-XRBZD4CLET`)
* `NEXT_PUBLIC_SITE_URL` (e.g. `https://layerbiz.com`)
* `STRAPI_API_TOKEN` (Read-only token for static generation)
* `REVALIDATE_SECRET` (For on-demand cache purges)

### 3. Backend Environment (`backend-production`)
Add variables required exclusively by Strapi:
* `DATABASE_PASSWORD`
* `APP_KEYS`
* `JWT_SECRET`
* `ADMIN_JWT_SECRET`

---

## 4. Path-Filtered CI/CD Workflows

To ensure frontend changes do not trigger backend rebuilds (and vice-versa), configure path filters in your workflow files.

### Frontend Workflow: `.github/workflows/deploy-frontend.yml`

```yaml
name: Deploy Frontend

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**' # ONLY triggers when frontend code changes

jobs:
  deploy-frontend:
    name: Deploy Next.js Frontend
    runs-on: ubuntu-latest
    environment: frontend-production # Loads only frontend secrets

    steps:
      - name: Deploy Frontend via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: layerbiz
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            cd /home/layerbiz/htdocs/layerbiz.com
            git fetch --all
            git reset --hard origin/main
            
            cd frontend
            npm install
            npm run build
            
            # Map standalone assets and restart
            mkdir -p .next/standalone/.next
            cp -r .next/static .next/standalone/.next/
            cp -r public .next/standalone/ || true
            
            pm2 delete layerbiz-frontend || true
            PORT=3000 pm2 start .next/standalone/server.js --name "layerbiz-frontend"
            pm2 save
```

### Backend Workflow: `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**' # ONLY triggers when backend code changes

jobs:
  deploy-backend:
    name: Deploy Strapi Backend
    runs-on: ubuntu-latest
    environment: backend-production # Loads only backend secrets

    steps:
      - name: Deploy Backend via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: layerbiz-admin
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            cd /home/layerbiz-admin/htdocs/admin.layerbiz.com
            git fetch --all
            git reset --hard origin/main
            
            cd backend
            npm install
            npm run build
            
            pm2 delete layerbiz-backend || true
            pm2 start npm --name "layerbiz-backend" -- start
            pm2 save
```

---

## 5. Alternative: Prefix-Based Naming Conventions

For teams that prefer using global repository secrets without configuring multiple GitHub Environments, use explicit naming prefixes:

```bash
# Shared Infrastructure
SSH_HOST
SSH_KEY

# Frontend
FRONTEND_NEXT_PUBLIC_GA_ID
FRONTEND_STRAPI_TOKEN

# Backend
BACKEND_DATABASE_PASSWORD
BACKEND_JWT_SECRET
```

This prevents accidental variable collision across deployment scripts.

---

## 6. Security Best Practices

1. **Principle of Least Privilege**: The frontend deployment workflow should never have read access to root database credentials or payment provider secret keys.
2. **Client-Side vs Server-Side Scoping**: In Next.js, only variables prefixed with `NEXT_PUBLIC_` are exposed to the client browser. Never prefix private API keys or database strings with `NEXT_PUBLIC_`.
3. **Zero Secrets in Git**: Maintain `.env*` patterns in your `.gitignore` across all workspace directories. Inject credentials solely via GitHub Environments or secure server `.env.production` files.

---

## Conclusion

Managing full-stack monorepos does not require separate Git repositories to maintain strict security boundaries. By pairing GitHub Environments with path-filtered workflow triggers, engineering teams achieve isolated credential management, faster pipeline runs, and zero-leakage deployments.
