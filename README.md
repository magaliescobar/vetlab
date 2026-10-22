# VetLab

Consola operativa de una clínica veterinaria (staff de recepción): gestión de
dueños, mascotas y citas contra la agenda de cada veterinario. Construida como
lab de estrategias de renderizado de Next.js (ver `docs/SPEC.md`).

## Stack y versiones

- **Next.js 16.3.8** (App Router, `src/`) con **`cacheComponents: true`** —
  `"use cache"`/`cacheLife`/`cacheTag` en la capa de datos y `<Suspense>` alrededor
  de lo que lee runtime APIs (`searchParams`, `params`, `new Date()`)
- React 19.2.8 · TypeScript strict
- **MongoDB 7** con driver oficial `mongodb` 7.7 (sin ODM)
- **Auth.js** (`next-auth` v5 beta): login por Credentials + bcrypt, roles
  `admin`/`staff` en el JWT
- Fetching en cliente con `useFetch` (`src/hooks/useFetch.ts`), hook propio
  con cache por clave
- **@svar-ui/react-calendar 2.7.1** (edición open-source/MIT) para la agenda
- Zod 4, clsx, `server-only` · ESLint + Prettier

## Requisitos

- Node.js ≥ 20.9 (probado con 22)
- Docker + Docker Compose (para MongoDB local)

## Setup

```bash
npm install
cp .env.example .env.local      # valores por defecto ya funcionan en local
docker compose up -d            # levanta MongoDB en :27017
npm run seed                    # carga datos de demo (idempotente)
npm run dev                     # http://localhost:3000
```

Comandos Docker útiles:

```bash
docker compose up -d      # iniciar Mongo
docker compose down       # frenar (los datos persisten en el volumen)
docker compose logs -f    # logs de Mongo
```

`npm run seed` también crea los usuarios de demo (ver
[Autenticación](#autenticación-y-roles)) y dispara el hook `postseed`, que
invalida los tags de caché que quedaron stale llamando a `POST /api/revalidate`
(`scripts/revalidate.ts`; si el dev server no está corriendo, avisa y sale sin
error).

### Variables de entorno

Todas tienen default funcional en `.env.example`:

| Variable | Uso |
| -------- | --- |
| `MONGODB_URI` | Conexión a Mongo |
| `AUTH_SECRET` | Firma de JWTs de Auth.js (generar con `npx auth secret`) |
| `AUTH_TRUST_HOST` | Requerida en producción self-hosted para que Auth.js confíe en el host |
| `REVALIDATE_SECRET` | Header `x-revalidate-secret` de `POST /api/revalidate` |
| `APP_URL` | Base URL que usa `postseed` (default `http://localhost:3000`) |
| `SIMULATE_LATENCY_MS` | Latencia artificial (ms) para ver el streaming de `/duenos/[id]` |

## Scripts

| Comando            | Qué hace                                        |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo                          |
| `npm run build`    | Build de producción (necesita Mongo arriba para prerenderizar `/veterinarios`) |
| `npm start`        | Servidor de producción                          |
| `npm run seed`     | Seed idempotente (`tsx --env-file=.env.local`); dispara `postseed` → `scripts/revalidate.ts` |
| `npm run lint`     | ESLint (`eslint .`, con `no-explicit-any: error`) |
| `npm run typecheck`| `tsc --noEmit`                                  |
| `npm run format`   | Prettier                                        |

## Dependencias

### Runtime

| Paquete | Versión | Uso |
| ------- | ------- | --- |
| `next` | 16.3.8 | App Router + `cacheComponents` |
| `react` / `react-dom` | 19.2.8 | UI |
| `mongodb` | ^7.7.0 | Driver oficial; `MongoClient` singleton en `lib/db.ts` |
| `@svar-ui/react-calendar` | ^2.7.1 | Calendario de `/agenda` ([docs](https://svar.dev/react/calendar/)) |
| `@svar-ui/react-core` | ^2.6.1 | `<Willow>` (tema) y `<Locale>` de SVAR |
| `@svar-ui/core-locales` + `@svar-ui/calendar-locales` | ^2.6.1 / ^2.7.0 | Locale `es` (semana desde lunes, 24 h) |
| `next-auth` | ^5.0.0-beta.32 | Auth.js v5: Credentials, JWT con `role`, `/api/auth/*` |
| `bcryptjs` | ^3.0.3 | Hash de contraseñas (seed + login) |
| `zod` | ^4.6.5 | Validación de params y payloads |
| `clsx` | ^2.1.1 | Composición de clases |
| `use-debounce` | ^10.1.1 | Debounce del buscador de dueños |
| `server-only` | ^0.0.1 | Guarda de la capa de datos (`lib/data`, `lib/db`) |

### Dev

`typescript` ^5, `tsx` ^4.23 (seed), `eslint` ^9 + `eslint-config-next` +
`eslint-config-prettier`, `prettier` ^3.9, `@types/node|react|react-dom`.

### Calendario (SVAR)

La agenda usa **SVAR React Calendar** (edición MIT):
<https://svar.dev/react/calendar/>. Está envuelto en
`src/components/CalendarWidget/CalendarWidget.tsx`, donde:

- `<Willow>` provee el tema y `all.css` se importa solo ahí (excepción de
  estilos, §3.1); los overrides van contra `.wx-willow-theme`.
- `<Locale words={es}>` combina `core-locales` + `calendar-locales`.
- `readonly` + vistas `day`/`week`/`month` (timeline y el resto son PRO).
- El evento `request-data` del store marca el rango visible → `useFetch`
  fetchea `GET /api/citas?from=&to=` y sincroniza la fecha con `SlotPicker`.
- `onSelectEvent` abre el detalle de la cita; `eventCss` pinta por `estado`.
- Como la edición gratuita no soporta timezones, las horas se convierten
  UTC↔"wall clock" con `toWallClock`/`wallClockToUtc` (`lib/datetime.ts`).

## Mapa de rutas → estrategia

| Ruta | Estrategia | Req. |
| ---- | ---------- | ---- |
| `/veterinarios` | `◐` con datos cacheados: `"use cache"` + `cacheTag("vets")` + `cacheLife("hours")` (~1h o por `updateTag`); `AdminOnly` lee sesión por request | R04 |
| alta/edición de vet | `createVet`/`updateVet` (solo `admin`): `updateTag("vets")` + `revalidatePath` | R05 |
| `/veterinarios/[id]` | `◐`: `params` dentro de Suspense — perfil (foto/iniciales, bio), horarios y próximos 7 días streameados | — |
| `/servicios` | `◐` con datos cacheados: `getServicesCached` tag `services`; altas/ediciones con `createService`/`updateService` (solo `admin`) | — |
| `/login` | `◐`: `LoginForm` (Credentials) lee `callbackUrl` de `searchParams` en Suspense; con sesión activa el proxy redirige a `/dashboard` | — |
| `/dashboard` | `◐`: `searchParams` dentro de Suspense → fresh por request, filtros por URL | R06 |
| `/duenos` | `◐` por `searchParams` (`q`, `page`), URL como fuente de verdad | R07 |
| `/duenos/[id]` | **Streaming** `◐`: `params` dentro de Suspense + `PetsSection`/`HistorySection` async | R08 |
| `/agenda` | `◐`: catálogos `"use cache"` + `searchParams` en Suspense (evita congelar la fecha del build en el SSR del calendario) | R09 |
| `/agenda` slots | **`useFetch`** → `GET /api/disponibilidad` | R10 |
| agendar cita | **Server Action** `createAppointment` (validación + `canBook` server-side) | R11 |
| estado de cita | **Server Action** `updateAppointmentEstado` + `useOptimistic` con rollback | R12 |
| alta dueño+mascota | **Server Action** `registerOwnerWithPet` → `redirect` al perfil | R13 |
| alta mascota suelta | **Server Action** `registerNewPet` desde el perfil del dueño | — |
| edición de mascota | **Server Action** `updatePet` desde `PetCard` (`PetEditButton`/`PetEditForm`) | — |
| `GET /api/disponibilidad` | Route Handler dinámico (`ƒ`), Zod en params | R14 |
| `GET /api/citas` | Route Handler `ƒ`: feed de citas del calendario | — |
| `GET`/`POST /api/auth/*` | Route Handlers `ƒ` de Auth.js (`/api/auth/[...nextauth]`) | — |
| `POST /api/revalidate` | `ƒ`: `revalidateTag(tag, "max")` validando `x-revalidate-secret`; lo invoca `postseed` | — |
| `lib/data/*` | Capa server-only, `MongoClient` singleton, `cache()` + `"use cache"` | R15 |

Con `cacheComponents` el build distingue `◐` partial prerender (shell
estático + contenido streameado por request) de `ƒ` dinámico puro (los route
handlers y el proxy — no se cachean por defecto). Desde que el `AppShell`
muestra el `AuthButton` (lee `auth()` por request dentro de Suspense) ya no
queda ninguna página `○` full-estática: incluso `/`, `/servicios` y
`/veterinarios` salen `◐` — estas dos últimas conservan su shell con
revalidación (`1h`/`1d`) y solo streamean los huecos dinámicos.
La salida de `npm run build` quedó capturada en `docs/build-output.txt`.

## Autenticación y roles

Auth.js v5 (`next-auth@beta`) con provider **Credentials** y contraseñas en
bcrypt en la colección `users`. Piezas:

- `auth.ts` (raíz): `authorize()` valida el payload con Zod, busca el usuario
  en Mongo (`lib/data/users.ts`) y compara con `bcrypt.compare`.
- `auth.config.ts`: `pages.signIn = "/login"`, `trustHost` y los callbacks
  `authorized`/`jwt`/`session` (el `role` viaja en el JWT hasta
  `session.user.role`, tipado en `types/next-auth.d.ts`).
- `src/proxy.ts`: el *proxy* de Next 16 (antes `middleware.ts`) corre el
  callback `authorized` en cada request que matchea.
- `src/app/api/auth/[...nextauth]/route.ts`: expone los handlers GET/POST.
- `lib/actions.ts`: Server Actions `authenticate`/`logout` usadas por
  `LoginForm` y `AuthButton`.

Modelo de acceso del lab:

- **Todas las páginas son públicas**; `authorized` solo rebota `/login` →
  `/dashboard` cuando ya hay sesión. El login es voluntario (botón en el
  header), no un gate.
- Roles `admin`/`staff`: el rol se verifica **del lado servidor** en las
  actions de catálogo (`createVet`/`updateVet`/`createService`/`updateService`
  devuelven `NOT_ADMIN` si la sesión no es admin) y **del lado UI** con el
  Server Component `<AdminOnly>` (oculta los botones de alta). El resto de
  las mutaciones (citas, dueños, mascotas) no exige sesión — decisión del
  lab, no un modelo de seguridad real.

Usuarios de demo que crea el seed:

| Email | Password | Rol |
| ----- | -------- | --- |
| `admin@vetlab.uy` | `vetlab123` | `admin` |
| `user@vetlab.uy` | `vetlabuser` | `staff` |

## Supuestos y decisiones

Cosas que el spec no fija y se resolvieron con criterio (§1.1):

- **Zona horaria única `America/Montevideo`** (`lib/config.ts`). En DB todo es
  UTC; en UI se muestra hora local. Como el calendario gratuito de SVAR no
  soporta zonas horarias (es PRO), los instantes se convierten a `Date` "de
  pared" con `toWallClock`/`wallClockToUtc` (`lib/datetime.ts`) para que la
  clínica siempre vea hora de Montevideo sin importar la zona del navegador.
- **Intervalos semiabiertos** `[inicio, fin)`: dos turnos pegados (9:00–9:30 y
  9:30–10:00) no chocan. Solo `cancelada` libera el hueco; `completada` sigue
  ocupándolo.
- **`cacheComponents` como mecanismo SSR**: en lugar de `force-dynamic`, las
  páginas se prerenderizan parcialmente (`◐`): el shell queda estático y lo
  que lee runtime APIs va dentro de `<Suspense>` y se streamea por request:
  `/dashboard` y `/duenos` leen `searchParams`, `/duenos/[id]` y
  `/veterinarios/[id]` esperan `params`, y `/agenda` hace `await
  searchParams` sin usarlo solo para forzar render por request.
  `NavLink` va envuelto en Suspense con `NavLinkFallback` porque
  `usePathname` es runtime data; `AuthButton` y `AdminOnly` también van en
  Suspense porque leen `auth()` por request.
- **Contadores del dashboard** cubren todo el día, sin el filtro de `estado`
  (el filtro afecta solo la tabla).
- **Búsqueda de dueños con `$regex` escapado** (no `$text`): el índice de texto
  del spec se crea igual, pero `$text` solo matchea palabras completas ("mar"
  no encontraría "María"). Cada token de `q` debe coincidir con algún campo.
- **Paginación de 10** por página en `/duenos`.
- **`/api/disponibilidad` sin `serviceId`** asume slots de `DEFAULT_SLOT_MIN`
  (30 min, `lib/config.ts`).
- **Tolerancia de agenda en el pasado**: se permite hasta un paso de grilla
  (`SLOT_STEP_MIN`, 15 min) hacia atrás para registrar walk-ins recién
  comenzados.
- **Race consultar-e-insertar**: `createAppointment` revalida disponibilidad
  con `canBook` justo antes de insertar, pero *no es atómico*: Mongo
  standalone no tiene exclusion constraints ni transacciones; dos reservas
  simultáneas del mismo hueco podrían colarse.
- **Calendario en solo lectura**: reprogramar está fuera de alcance (§1.1), por
  eso `readonly` y sin `<Editor>` (el editor mutaría estado en memoria que
  nunca se persiste). Toda mutación real pasa por Server Actions.
- **Extensiones sobre el spec**: `GET /api/citas?from=&to=` (feed del
  calendario al navegar rangos), `actions/catalogo.ts` (`createVet`/`updateVet`
  para R05 y `createService`/`updateService` para el catálogo), `registerNewPet`
  y `updatePet` (alta/edición de mascotas), la sección `/servicios`, el
  detalle `/veterinarios/[id]` (perfil + horarios + agenda próxima) y todo el
  sistema de login/roles (Auth.js + colección `users`). El alta de
  vets/servicios/mascotas invalida por `updateTag` los datos cacheados sin
  convertir las páginas en dinámicas.
- **`useFetch` en vez de TanStack Query**: `src/hooks/useFetch.ts` es un
  fetcher CSR mínimo — cache por clave con `staleTime` (30 s), conserva la
  data previa mientras recarga (placeholder) y `refreshKey`/`refetch()` para
  invalidar. Lo usan `SlotPicker` (`/api/disponibilidad`) y `CalendarWidget`
  (`/api/citas`).
- **SVAR como excepción de estilos** (§3.1): es la única librería con estilos
  propios. Su CSS (`@svar-ui/react-calendar/all.css`) se importa únicamente en
  `CalendarWidget.tsx`; los overrides en `CalendarWidget.module.css` solo usan
  tokens y apuntan a `.wx-willow-theme` (donde Willow define sus `--wx-*`).
  Locale `es` vía `<Locale>` de `@svar-ui/react-core` +
  `@svar-ui/core-locales` + `@svar-ui/calendar-locales` (semana desde lunes,
  formato 24 h). Vistas: día/semana/mes (las demás son PRO).
- **Sincronización calendario↔UI**: el widget emite `request-data` al cambiar
  el rango visible; `CalendarWidget` lo usa como fuente para fetchear
  `/api/citas` y para sincronizar la fecha con el `SlotPicker`. `date`/`view`
  se pasan constantes (son reactivos por identidad; una `Date` nueva por
  render resetearía la vista del usuario).
- **`revalidateTag` en Next 16** exige segundo argumento: en el Route Handler
  se usa `revalidateTag(tag, "max")`; en la Server Action se usa `updateTag`
  (expira al instante, read-your-own-writes).
- **Literales en `@media`**: CSS no admite `var()` en media queries; el único
  literal tolerado es el breakpoint `900px` de `AgendaView.module.css`.
- **Emails de seed** `@example.com` (dueños) y `@vetlab.uy` (usuarios de
  login), teléfonos con formato uruguayo.
- **`notFound()` en rutas dinámicas**: Next 16 sirve el shell primero, así que
  el estado HTTP puede ser 200 con `noindex` aunque la UI sea la de "no
  encontrado" (comportamiento de streaming, no un bug del lab).

## Notas

- El data layer (`src/lib/data`, `src/lib/db.ts`) es `server-only`: importarlo
  desde un Client Component rompe el build a propósito.
- `scripts/seed.ts` crea su propio `MongoClient` (no puede importar `lib/db`).
- Las fotos de vets y mascotas viven en `public/vets` y `public/pets`; en DB
  se guarda solo el nombre de archivo y la URL se arma con
  `URL_VETS_IMAGES`/`URL_PETS_IMAGES` (`lib/config.ts`).
- `SIMULATE_LATENCY_MS` (ms) en `.env.local` agrega latencia artificial a las
  secciones streameadas de `/duenos/[id]` para *ver* el streaming.
