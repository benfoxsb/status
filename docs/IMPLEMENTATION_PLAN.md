# IMPLEMENTATION_PLAN.md - Centralized Data Collection & Resilience

This plan outlines the migration to a "Broker Architecture" for system vitals, ensuring accurate cooldown tracking and robust validation.

## Phase 1: Infrastructure & Safety Rails
- [ ] **Task 1.1: Schema Definition**
  - Create `scripts/schema.json` defining the strict contract for `vitals.json`.
- [ ] **Task 1.2: Upgrade Validator**
  - Update `scripts/validate.js` to perform deep AJV-style validation against the schema.
  - Implement a check for "Data Freshness" (ensure timestamps are within 5 minutes of system time).
- [ ] **Task 1.3: Collector Dry-Run**
  - Add `--dry-run` flag to `scripts/collect-dashboard-vitals.sh` to output to `vitals.test.json` instead of syncing to GitHub.

## Phase 2: Centralized Collection logic
- [ ] **Task 2.1: Precise Cooldown Extraction**
  - Refactor `scripts/check-model-health.sh` to parse `openclaw status --usage --json`.
  - Calculate exact hourly countdowns: `(resetAt - now) / 3600000`.
- [ ] **Task 2.2: Unified Orchestration**
  - Update `scripts/collect-dashboard-vitals.sh` to integrate the precise cooldowns into the main assembly logic.
  - Ensure all model keys match between OpenClaw and the Dashboard UI.

## Phase 3: Defensive Consumers
- [ ] **Task 3.1: Dashboard Resilience**
  - Wrap `updateDashboard()` in `index.html` with robust error handling.
  - Add a "Stale Data" visual indicator if the `updated` timestamp is >1 hour old.
- [ ] **Task 3.2: Local Brain Resilience**
  - Update `scripts/local_brain.sh` to validate `vitals.json` before taking action.
  - Default to "Standby/Wait" if data is missing or corrupted.

## Phase 4: Monitoring & Alerting
- [ ] **Task 4.1: The Staleness Sentinel**
  - Create `scripts/monitor-staleness.sh` to be called by the 30m heartbeat.
  - Trigger WhatsApp alert if `vitals.json` update-gap exceeds 60 minutes.

## Execution Order
1. **Infrastructure (1.1, 1.2, 1.3)** - Build the cage before releasing the beast.
2. **Collection (2.1, 2.2)** - Start gathering real data.
3. **Consumers (3.1, 3.2)** - Switch consumers to the new source.
4. **Final Sync** - Run full pipeline and merge `develop` -> `main`.

---
*Created by Ben Fox (AI CEO)*
*Date: 2026-02-05*
