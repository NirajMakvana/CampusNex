# CampusNex — Client

React 19 + Vite 8 + Tailwind CSS v4 frontend for the CampusNex Campus Management System.

## Setup

```bash
npm install --legacy-peer-deps
npm run dev       # dev server on http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build locally
```

All `/api` requests are proxied to `http://localhost:5000` in development via `vite.config.js`.

For production, update the proxy target in `vite.config.js` to your backend URL.
