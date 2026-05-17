# Gestión de personajes — Rick & Morty

App para explorar personajes de [Rick and Morty](https://rickandmortyapi.com/) y gestionar favoritos con persistencia local. El frontend está en Next.js (`apps/web`); la API de favoritos corre en JSON Server (`packages/json-server`).

**Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Redux Toolkit y Redux Saga.

### De dónde salen los datos

| Recurso | Origen | Motivo |
|---------|--------|--------|
| **Personajes** (listado, búsqueda, paginación) | [Rick and Morty API](https://rickandmortyapi.com/api) | Catálogo oficial, paginado y estable; sin réplica local del catálogo. |
| **Favoritos** | JSON Server (`packages/json-server`, puerto 3001) | CRUD sobre `favorites` en `db.json`. |

Los favoritos se consumen desde el navegador vía proxy **`/api/json-server`** (Next reescribe a `http://127.0.0.1:3001`), así evitas CORS y problemas al abrir la app por IP de red. JSON Server **no** almacena personajes: solo favoritos (referencia al `characterId` y metadatos mínimos).

---

## Prerrequisitos

| Herramienta | Versión mínima | Uso en el proyecto |
|-------------|----------------|-----------------|
| **Node.js** | 20 LTS | Next.js y el servidor de favoritos |
| **pnpm** | 10.x | Monorepo con workspaces (ver `packageManager` en `package.json`) |
| **Git** | cualquiera reciente | Clonar el repo |

Comprueba que todo esté instalado:

```bash
node -v    # v20.x o superior
pnpm -v    # 10.x
git --version
```

### Instalar Node.js y pnpm

#### macOS

Con [Homebrew](https://brew.sh/):

```bash
brew install node@20
brew install pnpm
```

O descarga el instalador LTS desde [nodejs.org](https://nodejs.org/) y luego:

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

#### Windows

1. Instala **Node.js 20 LTS** desde [nodejs.org](https://nodejs.org/) (incluye npm).
2. En PowerShell o CMD:

```powershell
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

Alternativa: `npm install -g pnpm` si prefieres no usar Corepack.

#### Linux (Debian/Ubuntu)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

En Fedora o Arch puedes usar el gestor de paquetes de tu distro (`dnf install nodejs`, etc.) y después activar pnpm con Corepack igual que arriba.

---

## Estructura del proyecto

```
gestion-personajes-rickmorty/
├── apps/web/                 # Frontend Next.js (puerto 3000)
├── packages/json-server/     # API de favoritos (puerto 3001)
├── package.json
└── pnpm-workspace.yaml
```

---

## Puesta en marcha

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/JorgeDircio/gestion-personajes-rickmorty.git
cd gestion-personajes-rickmorty
pnpm install
```

### 2. Variables de entorno (opcional pero recomendado)

Por defecto la web llama a favoritos por **`/api/json-server`** (proxy interno). Solo necesitas `pnpm run dev:api` en otra terminal. Si prefieres URL directa al puerto 3001, copia `.env.example` a `.env.local` y descomenta la variable.

**macOS / Linux:**

```bash
cp apps/web/.env.example apps/web/.env.local
```

**Windows (CMD):**

```cmd
copy apps\web\.env.example apps\web\.env.local
```

**Windows (PowerShell):**

```powershell
Copy-Item apps\web\.env.example apps\web\.env.local
```

Por defecto **no hace falta** `.env.local`: el proxy `/api/json-server` ya apunta al puerto 3001. Solo crea el archivo si quieres llamar al JSON Server directamente (descomenta la variable en `.env.example`).

### 3. Levantar la aplicación

Necesitas **dos terminales** en la raíz del repo.

#### Terminal 1 — API de favoritos

```bash
pnpm run dev:api
```

Salida esperada: `JSON Server listening on http://127.0.0.1:3001`

#### Terminal 2 — Frontend

```bash
pnpm run dev:web
```

Abre [http://localhost:3000](http://localhost:3000).

#### Atajo (macOS / Linux)

```bash
pnpm run dev
```

Arranca web y API en paralelo. Recomiendo dos terminales si necesitas inspeccionar logs por separado.

#### Windows

`pnpm run dev` también funciona en PowerShell. Si el operador `&` da problemas, usa siempre las dos terminales.

### Puerto 3001 ocupado

**macOS / Linux:**

```bash
lsof -ti :3001 | xargs kill
```

**Windows (PowerShell):**

```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

O cambia de puerto:

**macOS / Linux:**

```bash
PORT=3002 pnpm run dev:api
```

**Windows (PowerShell):**

```powershell
$env:PORT=3002; pnpm run dev:api
```

Actualiza `NEXT_PUBLIC_JSON_SERVER_URL` en `.env.local` y reinicia `dev:web`.

### Base de datos de favoritos

`packages/json-server/db.json` no se genera solo: debe existir con al menos `"favorites": []`. JSON Server lo actualiza cuando agregas o quitas favoritos. Para resetear, deja el array vacío y reinicia la API.

---

## Build

```bash
pnpm run build
pnpm run start
```

`start` solo levanta la web. La API de favoritos hay que ejecutarla aparte (`pnpm run dev:api` o desplegarla en otro host y apuntar la variable de entorno).

---

## Tests y calidad

### Tests unitarios

Desde la raíz:

```bash
pnpm test
```

Watch:

```bash
cd apps/web && pnpm test:watch
```

### Cobertura

```bash
pnpm run test:coverage
```

Reporte HTML: `apps/web/coverage/lcov-report/index.html`.

**Resumen global (última ejecución de `pnpm run test:coverage`):**

| Métrica | Valor |
|---------|-------|
| Tests | **104** pasando (14 suites) |
| Líneas (`src/`) | **~81 %** |
| Ramas | **~71 %** |
| Funciones | **~80 %** |

**Por capa:**

| Área | Líneas (aprox.) | Notas |
|------|-----------------|-------|
| `favoritesSlice`, `favoritesApi`, `favoritesSaga` | 88–100 % | CRUD y reducers cubiertos |
| `rickmortyApi`, `parseJsonResponse`, `lib/` | 94–100 % | Fetch y utilidades con mocks |
| Hooks (`useCharacterGrid`, `useCharacterSelection`, `useFavoriteActions`, `useCharacterScene`) | 92–100 % | Escena, carrusel, scroll y favoritos |
| `useCharactersQuery` | ~85 % | Ramas de `initialData` y paginación parcialmente sin cubrir |
| Componentes aislados (`SearchBar`, `CharacterGridCard`, `FavsTab`, `StatusBadge`) | 100 % | Interacción básica |
| Composición de escena (`HomeScene`, `CharacterBrowsePanel`, `page.tsx`, store bootstrap) | 0–17 % | Sin tests de montaje; lógica delegada a hooks |

Prioridad de tests: capa de dominio y hooks antes que árboles de UI completos. El siguiente salto de cobertura vendría de tests de integración ligeros sobre `HomeScene` o E2E con Playwright.

### Lint

```bash
pnpm run lint
```

---

## Decisiones técnicas y roadmap

**Aspectos destacados del diseño:**

- Layout responsive alineado al frame de referencia (variables CSS y proporciones del canvas, no solo píxeles fijos).
- Componentes con CSS Module propio y hooks acotados en lugar de un contenedor monolítico.
- Personajes desde API pública; favoritos locales con Saga (add/remove sin recargar toda la lista).
- Feedback inmediato en favoritos (`useOptimistic`) y búsqueda no bloqueante (`useTransition`).
- Experiencia dual: grid con scroll en desktop y carrusel en móvil sobre la misma fuente de datos.

**Próximos pasos** (si hubiera más tiempo):

- **Dockerizar el monorepo:** `docker compose` con servicios `web`, `json-server` y variables de entorno enlazadas, para levantar todo con un solo comando en cualquier máquina (hoy el setup es `pnpm install` + dos terminales).
- **Backend real en lugar de JSON Server:** un servicio en Node (NestJS o Fastify) con PostgreSQL, migraciones y un contrato OpenAPI compartido con el frontend. JSON Server fue útil para iterar rápido, pero no da validación de negocio, auth ni concurrencia real.
- **Capa de datos unificada:** llevar personajes y favoritos a React Query o RTK Query con caché, reintentos y estados de error consistentes, en lugar de mezclar hooks locales para personajes y Saga solo para favoritos.
- **Pruebas de punta a punta:** Playwright cubriendo búsqueda, paginación, favoritos y responsive; complementarían los unitarios actuales en slice, saga y componentes aislados.
- **CI en el repo:** pipeline con `lint`, `test` y `build` en cada push; opcionalmente despliegue preview de la web (Vercel) y de la API en un contenedor.
- **Observabilidad y DX:** health checks en la API, logs estructurados y variables de entorno validadas al arranque (por ejemplo con Zod en `lib/env.ts`).
- **Accesibilidad y rendimiento:** auditoría con axe, revisión de Core Web Vitals en móvil y tests de integración sobre la escena principal (`loading="lazy"` ya aplicado en el grid).
- **Diseño system mínimo:** tokens de color y tipografía centralizados más allá de CSS Modules por pantalla, para escalar si el producto crece.
