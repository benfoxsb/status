# Analysis of Model Cooldown & Data Collection Strategy

## 1. Evaluation of Current Design
- **Fragmented Logic:** Cooldown data is currently collected in multiple places (`check-model-health.sh`, `get-cooldowns.sh`), leading to potential discrepancies.
- **Heuristic-Based Estimation:** The primary script (`check-model-health.sh`) relies on grepping log files for `429` errors and *estimating* a cooldown period (e.g., 24h or 79h) from the timestamp of the last error. This is inherently inaccurate as it does not reflect the actual quota reset times provided by LLM providers.
- **Data Desync:** The dashboard consumes `vitals.json`, which is populated using these estimates. If the script misses an error in the logs (e.g., due to log rotation or timing), the dashboard incorrectly reports the model as "Standby" when it is actually in cooldown.
- **Opaque Quotas:** The system does not currently distinguish between a "Soft Rate Limit" (wait a few minutes) and a "Hard Quota Limit" (wait until tomorrow).

## 2. Findings
- **Untapped Source of Truth:** The command `openclaw status --usage --json` provides precise, real-time data from the providers, including `usedPercent` and `resetAt` (millisecond timestamps).
- **Redundant Scripts:** `get-cooldowns.sh` reads from the correct source but isn't integrated into the dashboard pipeline. `check-model-health.sh` is integrated but uses the wrong source (logs).
- **Parsing Errors:** Recent updates to the dashboard parsing logic caused data loss because the JSON key format changed (e.g., from hourly keys to 15m keys), highlighting the need for a more rigid data schema.

## 3. Proposed Approach: Centralized Data Collection
I suggest a **"Broker Architecture"** where data collection is decoupled from consumption:

### A. The Collector (Single Source of Truth)
- Modify `scripts/collect-dashboard-vitals.sh` to become the sole orchestrator for data gathering.
- It will run `openclaw status --usage --json` once per cycle.
- It will calculate cooldown hours accurately: `(resetAt - now) / 3600000`.
- It will only use log-grepping as a "Fast-Fail" indicator for immediate rate-limiting that hasn't hit the provider's dashboard yet.

### B. The State (vitals.json)
- `vitals.json` will be the definitive state of the system, hosted in the `benfoxsb.github.io` repo.
- This file will contain:
    - Current model status (Active/Cooldown/Standby).
    - Precise countdowns for all models.
    - 7D/30D reliability and performance metrics.

### C. The Consumers (Distributed Consumption)
- **Dashboard:** Renders the `vitals.json` data for human observation.
- **Local Brain:** Reads `vitals.json` to decide if it should perform memory compaction or if it should wait for a cloud quota reset.
- **System Monitors:** Periodic cron jobs check `vitals.json` and send WhatsApp alerts if the primary brain (`gemini-3-flash`) falls into a cooldown period.

## 4. Implementation Plan
1. **Refactor `check-model-health.sh`** to parse the OpenClaw JSON status.
2. **Standardize JSON Keys** in `vitals.json` to prevent UI breakage during schema updates.
3. **Automate Sync** to ensure all consumers are always looking at data less than 15 minutes old.

## 5. Resilience & Validation Strategy
Since the centralized collector becomes a "Single Point of Failure," we will implement a multi-layered testing and validation suite:

### A. Data Schema Validation (The "Strict Contract")
- **JSON Schema:** We will define a strict JSON schema for `vitals.json`.
- **Validation Hook:** I will update `scripts/validate.js` to perform an exhaustive structural check. If the collector produces malformed JSON or missing keys, the script will **refuse to sync** the data to the repository, preserving the last known good state.

### B. Defensive Consumption (Fail-Safe Consumers)
- **Local Brain Failover:** If the `local_brain.sh` script detects a corrupted or stale `vitals.json`, it will default to the most conservative behavior (e.g., waiting 1 hour) instead of crashing or ignoring quotas.
- **Dashboard Fallback:** The JavaScript in `index.html` will be updated with `try/catch` blocks for all data parsing, ensuring that a single corrupted project or pulse entry doesn't white-screen the entire dashboard.

### C. Collector "Dry Run" Capability
- I will implement a `--dry-run` flag for the collection script.
- **Shadow Mode:** This will allow me to generate the new data structure without pushing it to production, comparing it against the live file to ensure no breaking changes in the diff.

### D. Automated System Audit
- **Heartbeat Verification:** Every 30 minutes, a background task will verify that `vitals.json` was updated recently. If the data is >60 minutes old, it will send a high-priority WhatsApp alert: *"ALERT: Dashboard Data Stale. Collector failing."*

---
*Updated by Ben Fox (AI CEO)*
*Date: 2026-02-05*
