# Aviconncorp-new-migrated-frontend — Developer README

This README explains how to set up, run, and understand the repository while migrating to modern Angular standalone components. It documents installation and run steps (PowerShell on Windows), developer toggles (mock fixtures), where key pieces of code live, and quick troubleshooting notes.

## Quick start (Windows PowerShell)

1. Install dependencies

```powershell
npm install
```

2. Run the dev server

```powershell
npm start
# opens on http://localhost:4200 by default
```

3. Build (production)

```powershell
npm run build
# outputs to dist/Aviconncorp-new-migrated-frontend
```

4. Run unit tests (Karma/Jasmine)

```powershell
npm test
```

5. Lint

```powershell
npm run lint
# auto-fix where safe
npm run lint:fix
```

## Enabling mock / offline mode

The project includes a lightweight fixture-based mocking system that intercepts requests to the configured `apiUrl` and serves JSON/Blob fixtures from `src/assets/mocks/`.

- Enable for the current browser session:

```javascript
localStorage.setItem('USE_MOCK_API','true');
location.reload();
```

- Or append `?useMock=1` to the app URL.

Mock responses are controlled by `src/app/interceptors/mock-api.interceptor.ts` and fixtures are under `src/assets/mocks/`.

## Environment & exact versions

This project was prepared and tested with the following runtime and package versions (exact installed versions from `npm ls --depth=0` on this machine):

- Node: v20.17.0
- npm: 10.8.2
- Angular CLI: 19.2.19

Key Angular packages:

- @angular/core: 19.2.15
- @angular/common: 19.2.15
- @angular/compiler: 19.2.15
- @angular/platform-browser: 19.2.15
- @angular/platform-browser-dynamic: 19.2.15
- @angular/forms: 19.2.15
- @angular/router: 19.2.15
- @angular/animations: 19.2.15
- @angular/compiler-cli: 19.2.15
- @angular/language-service: 19.2.15
- @angular/material: 19.2.19
- @angular/cdk: 19.2.19

Runtime / 3rd-party libraries (top-level):

- bootstrap: 4.6.2
- font-awesome: 4.7.0
- hammerjs: 2.0.8
- highcharts: 12.3.0
- highcharts-angular: 5.2.0
- rxjs: 6.6.7
- tslib: 2.8.1
- zone.js: 0.15.1

Dev / tooling (top-level):

- typescript: 5.5.4
- eslint: 9.39.1
- @typescript-eslint/parser: 8.46.4
- @typescript-eslint/eslint-plugin: 8.46.4
- @angular-eslint/eslint-plugin: 20.6.0
- @angular-eslint/eslint-plugin-template: 20.6.0
- @angular-eslint/template-parser: 20.6.0
- karma: 6.4.4
- jasmine-core: 3.99.1

If you need reproducible installs, consider using the exact Node version above (nvm or nvm-windows) before running `npm ci`.


## Repo layout & important files

- `src/main.ts`
	- App is bootstrapped with Angular's `bootstrapApplication(...)` (standalone components).

- `src/app/app.component.ts` / `app.component.html`
	- Root component. Includes developer helpers: mock banner and dev toggle components.

- `src/app/shared/material-imports.ts`
	- Centralized Angular Material modules shared across standalone components.

- `src/app/highcharts/highcharts-standalone.component.ts`
	- A self-contained wrapper around Highcharts ESM masters. Use this component (`<app-highcharts>`) instead of `highcharts-angular` where the project has been migrated.
	- Accepts `options`, `modules`, `constructorType` and `updateFlag` inputs.

- `src/app/interceptors/mock-api.interceptor.ts`
	- Intercepts requests to `environment.apiUrl` and serves fixtures from `/assets/mocks/` when mock mode is enabled.
	- Emits a `CustomEvent('mockApi:served', { detail: { url, fixture } })` for dev tooling.

- `src/assets/mocks/`
	- JSON and blob fixtures used by the mock interceptor.

- `src/app/services/`
	- `data.service.ts` / `user.service.ts` / `dashboard-data.service.ts` — HTTP wrappers for backend endpoints. Note: `getAuthHeaders()` omits `Authorization` header if no token is present to avoid `Token null` being sent.

- `src/environments/environment.ts` (dev) and `src/environments/environment.prod.ts` (prod)
	- Configure `apiUrl` here. During local dev the code imports `src/environments/environment` (not `.prod`) so ng serve picks up the dev config.

## Typical code flow

1. App bootstrap (`src/main.ts`) mounts `AppComponent`.
2. `AppComponent` updates state and developer UI (mock toggle, banners).
3. Components request data via injected services (for example `UserService`, `DataService`).
4. Services call backend endpoints at `environment.apiUrl`. Requests automatically include `Authorization: Token <token>` only when the token exists in `localStorage`.
5. `MockApiInterceptor` intercepts HTTP calls: when mock mode is enabled it returns fixture content (JSON/Blob) and dispatches diagnostic events; otherwise requests go to the real backend host (e.g., `https://asem.aviconncorp.com/api/`).
6. Charts are rendered using `HighchartsStandaloneComponent` which loads Highcharts ESM masters and lazily initializes optional modules (boost, highcharts-more, no-data-to-display) at runtime.

## Highcharts notes and gotchas

- The project uses the ESM master entrypoints under `highcharts/es-modules/masters/*` to avoid CommonJS warnings and enable Angular optimizations.
- Use the `HighchartsStandaloneComponent` where possible. Pass `modules` (array of module initializer functions) if you need boost/solid-gauge/etc.
- The wrapper skips heavy module initialization when running under Karma tests (the test runner stubs Highcharts internals).

## Development tips

- If a page fails to render, open DevTools and check Console & Network. If you see `Authorization: Token null` in request headers, ensure `localStorage.setItem('token', '<token>')` or log in via the app.
- To force offline/mocked behavior while developing UI, enable the mock mode as shown above. Mock fixture names and mappings are in `mock-api.interceptor.ts` and `src/assets/mocks/`.
- Standalone components must be added to the parent component's `imports` array (e.g., `DashboardComponent` imports `SuperAdminComponent`, `WhMeteringComponent`). If a template tag shows "component is not a known element", check the parent `imports`.

## CI / Lint / Tests

- Linting is handled by ESLint (flat config). Run `npm run lint` and `npm run lint:fix`.
- CI workflow (GitHub Actions) runs lint, build and tests on PRs and push (see `.github/workflows/ci.yml`).

## Troubleshooting

- Wrong environment used in dev: ensure code imports `src/environments/environment` (dev) not `environment.prod`.
- Backend hostname: code uses `environment.apiUrl` (recently standardized to `https://asem.aviconncorp.com/api/`). If your dev machine needs to target a local proxy or another host, change `environment.ts` accordingly or enable mock mode.
- Highcharts errors: check the console for initialization errors; the wrapper logs errors and skips module initialization in tests.

## Where to look when adding features

- New backend endpoints: add to `src/app/services/*` and expand `MockApiInterceptor` + `src/assets/mocks/` fixtures to support offline development.
- New charts: create `options` in the parent component and render with `<app-highcharts [options]="chartOptions" [modules]="hcModules"></app-highcharts>`.
- New standalone component used in a template: remember to export it in the parent's `imports` array.

## Contact / Notes

- Backend host used by default: `https://asem.aviconncorp.com/api/` (do not change unless requested).
- If you want, I can add a short CONTRIBUTING.md describing the migration checkpoints and branch strategy used (`checkpoint/prune-keep-lean`).

---

If you'd like, I can also:
- Add a small CONTRIBUTING.md describing the staged migration process and how to create checkpoint branches.
- Add example fixtures for the Super‑Admin / WH‑metering pages if you'd prefer mock mode by default in development.


