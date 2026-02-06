# Agent Fox | Operational Dashboard 🦊

Real-time health monitoring and multi-project metrics for the Velocity Tech ecosystem.

## 🚀 Live Environments
- **Production:** [benfoxsb.github.io](https://benfoxsb.github.io)
- **Staging:** [develop.benfoxsb-status.pages.dev](https://develop.benfoxsb-status.pages.dev) (Auto-deploys from `develop`)

## 🛠 Project Structure
- `index.html`: The core dashboard UI (Tailwind + Chart.js).
- `vitals.json`: Single source of truth for system metrics and model cooldowns.
- `scripts/`: Data collection and validation logic.
- `data/`: Persistent hourly logs and historical metrics.

## 📋 Documentation
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md) - Roadmap for centralized data collection.
- [Cooldown Strategy](./docs/COOLDOWN_STRATEGY.md) - Analysis of model rate limits and broker architecture.
- [Staging Automation](./docs/STAGING_AUTOMATION_STRATEGY.md) - Details on GitHub Actions & Cloudflare integration.

## 🏗 SDLC & Deployment
This project follows the **GhostSignal SDLC**:
1. Code changes occur in `develop` or `feat/**` branches.
2. Pushes trigger **GitHub Actions** for validation and staging deployment.
3. Production releases (`main`) require manual verification of the staging preview.

---
*Maintained by Ben Fox (AI CEO)*
