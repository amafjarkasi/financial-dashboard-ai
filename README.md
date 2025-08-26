# Financial Analytics Dashboard + AI Analyst (Template)

Rich, glassy, dark‑mode first analytics workspace built with **React + TypeScript + Vite + TailwindCSS + Recharts + Zustand** and an extensible AI Analyst sidebar. Synthetic data lets you fork & extend instantly.

# Financial Analytics Dashboard + AI Analyst (Template)

Modern financial + operational analytics workspace with a glassy dark UI, live simulated metrics, and an extensible AI analyst sidebar.

## Features
* Revenue Intelligence: area/bar toggle, rolling average, anomaly dots, smoothing toggle, mini forecast
* Live Churn Watch: fading trail, pause/resume, persistent markers
* Operational Pulse: uptime, latency, security incidents, support backlog, replica lag, health score (auto updates)
* Billing & Invoices: filters, aging distribution, collections efficiency, risk concentration, action queue
* Settings: theme toggle, AI panel sizing, experimental flags placeholder
* AI Sidebar: resizable, heuristic streaming stub ready for real LLM integration

## Tech Stack
React + TypeScript + Vite + TailwindCSS + Recharts + Zustand

## Structure
```text
src/
	modules/
		state/store.ts            # Zustand store + simulation logic
		dashboard/
			components/             # PageHeader, OperationalPulse, ChurnWatch, etc
			pages/                  # RevenuePage, BillingPage, SettingsPage
			ai/AISidebar.tsx        # AI panel (stub)
```

## Getting Started
```bash
npm install
npm run dev
```
Open http://localhost:5173

Production build / preview:
```bash
npm run build
npm run preview
```

## Simulation
`simulateTick()` (in store) updates: revenue series, uptime (99.5–100%), p95 latency (240–480ms), rare security incidents (~1%), support backlog, replica lag, health score. `OperationalPulse` triggers updates every 30s.

## Add Real AI
1. Create `.env` with `OPENAI_API_KEY` (see `.env.example`).
2. Expand `server.ts` for proxying requests.
3. Replace stub logic in `AISidebar.tsx` with real fetch / SSE / WebSocket.
4. Optionally integrate Model Context Protocol (`@copilotkit/*`).

Suggested message interface:
```ts
interface AIMessage { id: string; role: 'user'|'assistant'; content: string; createdAt: number; }
```

## Roadmap Ideas
* Persistent storage (IndexedDB/API)
* WebSocket push vs interval
* Advanced anomaly detection (STL / z‑score / ESD)
* ML forecasting (Prophet / ARIMA)
* Cohort heatmaps & segmentation tree
* Multi-tenant / RBAC
* Experiment impact statistics

## Theming
Dark first. Light mode via `useTheme` hook (baseline styling).

## Environment
```env
OPENAI_API_KEY=sk-...
```
Never commit secrets.

## License
MIT

## Attribution
Recharts, Lucide, modern SaaS RevOps & observability patterns.

---
If this helped, drop a ⭐.
			components/ChurnWatch.tsx
			pages/RevenuePage.tsx
			pages/BillingPage.tsx
			pages/SettingsPage.tsx
			ai/AISidebar.tsx        # AI panel (stub logic)
```

## 🚀 Getting Started

Install & run dev server:
```bash
git clone <your-fork-url>
cd financial-dashboard-ai
npm install
npm run dev
```
Open: http://localhost:5173

Production build:
```bash
npm run build
```
Preview production build:
```bash
npm run preview
```

## 🤖 Add a Real AI Backend
1. Create `.env` (see `.env.example`) with provider key.
2. Expand `server.ts` to proxy chat/analysis requests (Express included).
3. Replace fake streaming in `AISidebar.tsx` with real fetch / SSE / WebSocket.
4. (Optional) Integrate Model Context Protocol via `@copilotkit/*` dependencies.

Suggested message shape:
```ts
interface AIMessage { id: string; role: 'user'|'assistant'; content: string; createdAt: number; }
```

## 🔄 Operational Simulation
`simulateTick()` updates:
* Revenue series (bounded random walk)
* Uptime drift (99.5–100%)
* p95 latency variance (240–480ms)
* Rare security incident (~1% tick chance)
* Support backlog & replica lag bounded random walks
* Health score (6.5–9.5 band)

`OperationalPulse` triggers a 30s interval to call `simulateTick()` for a living dashboard feel.

## 🧪 Extension Ideas
* Persist metrics (IndexedDB / API)
* WebSocket push vs interval poll
* Advanced anomaly detection (STL / z‑score / ESD)
* ML forecast service (Prophet / ARIMA)
* Cohort retention heatmaps & segmentation explorer
* Access control + multi-tenant contexts
* Experiment impact statistical engine

## 🛠 Tooling
* ESLint + TypeScript strict build (`npm run build` → `tsc -b` then Vite)
* Tailwind JIT
* Lucide icon set

## 🧩 Theming
`useTheme` hook toggles dark/light (design optimized for dark).

## 🔐 Environment Variables
Create `.env`:
```env
OPENAI_API_KEY=sk-...
```
Never commit real secrets.

## 📝 License
MIT — use freely, attribution appreciated.

## 🙌 Attribution / Inspiration
* Recharts (charts)
* Lucide (icons)
* Modern SaaS RevOps / observability patterns

---
If you build something cool on this template, drop a star ⭐ and share it.
