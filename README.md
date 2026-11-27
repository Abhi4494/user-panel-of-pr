# Procurement Resource: User Panel

[![CI](https://github.com/Ankush-Frntd-Dev13/demo-pr-user-panel/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Ankush-Frntd-Dev13/demo-pr-user-panel/actions/workflows/ci.yml)

Migration of the logged-in user panel of procurementresource.com to React + Node.js (login, registration, dashboard and report screens).

## Run it

```bash
npm install            # from the repo root (installs client + server)
npm run dev:client     # React app on http://localhost:5173
npm run dev:server     # API on http://localhost:4000
```

## Checks (the same ones CI runs on every push)

```bash
npm run typecheck      # TypeScript, client + server
npm run build          # production build of the client
```

## Branches

Work happens on `ankush`; after checking it, it is promoted to `main`, which Vercel deploys.
