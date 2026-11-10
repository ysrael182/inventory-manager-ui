# AGENTS.md - Library Manager UI

This file provides instructions for AI agents working on the **Library Manager UI** project.

## Project Overview

**Library Manager UI** is a Vue 3 + TypeScript single-page application for managing library inventory and sales. Built with:
- **Vue 3** (Composition API with `<script setup>`)
- **TypeScript** (strict mode)
- **Vite** (build tool, dev server on port 4000)
- **Vuetify 4** (UI component library with Material Design)
- **Pinia** (state management)
- **Vue Router 4** (client-side routing with auth guards)
- **Axios** (HTTP client, base URL: `http://localhost:3000`)
- **Chart.js + vue-chartjs** (reporting/visualization)
- **PrimeVue + PrimeIcons** (additional UI components)

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4000)
npm run dev

# Type-check (run before committing)
npm run type-check

# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.ts                 # App entry point, Vuetify/Pinia/Router setup
├── App.vue                 # Root layout: app bar, sidebar, toast, router-view
├── router/
│   ├── index.ts            # Route definitions + auth guard
│   └── authGuard.ts        # Checks localStorage 'token' for auth
├── store/
│   ├── inventory.ts        # Pinia store for products/inventory
│   └── toast.ts            # Pinia store for toast notifications
├── services/
│   ├── api.ts              # Axios instance (baseURL: localhost:3000)
│   ├── products.ts         # Product API calls
│   └── admin-users.ts      # Admin user API calls
├── components/
│   ├── Sidebar.vue         # Navigation drawer
│   ├── Toast.vue           # Global toast notifications
│   ├── NewProductForm.vue  # Product creation form
│   └── NewSaleForm.vue     # Sale creation form
├── views/
│   ├── Dashboard.vue       # Overview stats/charts
│   ├── Login.vue           # Authentication page
│   ├── ProductTable.vue    # Product listing with CRUD
│   ├── AddProductForm.vue  # Add new product page
│   ├── SalesTable.vue      # Sales listing
│   └── ReportPage.vue      # Charts/reports
└── utils/
    └── formatPrice.ts      # Price formatting utility
```

## Key Conventions

### Code Style
- **TypeScript strict mode** - all code must pass `npm run type-check`
- **Composition API** with `<script setup lang="ts">`
- **Path aliases**: `@/` maps to `src/`
- **Vuetify components** preferred for UI (e.g., `v-btn`, `v-table`, `v-dialog`)
- **Pinia stores** for shared state (define with `defineStore`)

### Authentication
- Token stored in `localStorage` under key `'token'`
- Auth guard (`src/router/authGuard.ts`) protects routes with `meta: { requiresAuth: true }`
- Login page at `/login` (no auth required)

### API Layer
- Single Axios instance in `src/services/api.ts`
- Base URL: `http://localhost:3000` (configure for production)
- Service modules export typed functions (e.g., `products.ts`, `admin-users.ts`)

### State Management
- **inventory.ts**: Products, categories, stock levels
- **toast.ts**: Global notification system (success/error/info)

### Routing
| Path | Component | Auth |
|------|-----------|------|
| `/` | Dashboard | ✅ |
| `/products` | ProductTable | ✅ |
| `/add-product` | AddProductForm | ✅ |
| `/sales` | SalesTable | ✅ |
| `/reports` | ReportPage | ✅ |
| `/login` | Login | ❌ |

## Common Tasks

### Adding a New View
1. Create `src/views/NewView.vue`
2. Add route in `src/router/index.ts`
3. Add navigation link in `src/components/Sidebar.vue`

### Adding API Calls
1. Add function to appropriate service in `src/services/`
2. Use the shared `api` instance from `src/services/api.ts`
3. Handle errors with try/catch, show toasts via `useToastStore()`

### Adding Pinia State
1. Create/modify store in `src/store/`
2. Use `defineStore` with TypeScript types
3. Import and use in components with `useStoreName()`

## Testing & Quality

- **Type checking**: `npm run type-check` (runs `vue-tsc --noEmit`)
- No test framework configured yet - consider adding Vitest

## Environment Variables

Create `.env` files for configuration:
- `.env` - loaded in all environments
- `.env.development` - dev only
- `.env.production` - production only

Example:
```
VITE_API_BASE_URL=http://localhost:3000
```

Then update `src/services/api.ts` to use `import.meta.env.VITE_API_BASE_URL`.

## Deployment

```bash
npm run build
# Output in dist/ - deploy to any static hosting
```

## Notes for AI Agents

- **Always run `npm run type-check`** after making changes
- Prefer **Vuetify components** over raw HTML/CSS
- Use **Pinia stores** for any shared state
- Follow **existing patterns** in the codebase (check similar files first)
- **Don't commit** without type-checking passing
- The backend API runs separately on `localhost:3000` - coordinate with backend team for API changes