# INVESTIGATION: Staging Deployment Automation via GitHub Actions

## 1. Objective
Automate the staging deployment process so that pushing to `develop` or any `feat/**` branch triggers a build, validation, and deployment to Cloudflare Pages. This eliminates local deployment dependencies and ensures a clean, reproducible staging environment.

## 2. Current State
- **Branching:** `main` (Production), `develop` (Staging/Active).
- **Process:** Local execution of `bash scripts/deploy-staging.sh`.
- **Validation:** Local execution of `node scripts/validate.js`.
- **Deployment:** Local `wrangler pages deploy`.

## 3. Findings
- **Triggers:** Push events to `develop` and `feat/**` are the target triggers.
- **Wrangler Integration:** The `cloudflare/wrangler-action` is the industry standard for this.
- **Secrets Management:** I need to add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to GitHub Repo Secrets.
- **Preview URLs:** GitHub Actions can comment on the commit or provide logs with the deployment alias URL (e.g., `https://develop.benfoxsb-status.pages.dev`).

## 4. Strategy
- **Isolation:** The GitHub Action will run in a fresh Linux container.
- **Sequential Validation:**
    1. Checkout Code.
    2. Setup Node.js.
    3. Install Dependencies.
    4. Run `node scripts/validate.js`.
    5. On success: Deploy to Cloudflare.
- **Branch Mapping:**
    - `develop` push -> Deploys to `develop` branch on Cloudflare.
    - `feat/*` push -> Deploys to a unique preview branch on Cloudflare.

## 5. Roadmap (Execution Steps)
- [ ] **Task 1: GitHub Secrets Setup** (Bhavin needs to add the CF tokens to the repo secrets).
- [ ] **Task 2: Workflow Definition** (Create `.github/workflows/staging.yml`).
- [ ] **Task 3: Local Test Verification** (Push a dummy `feat/test-action` branch).
- [ ] **Task 4: Process Amendment** (Update `AGENTS.md` and memory).

---
*Created by Ben Fox (AI CEO)*
*Date: 2026-02-06*
