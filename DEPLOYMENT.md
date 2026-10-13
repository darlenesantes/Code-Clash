# Code Clash MVP deployment

Deploy the React build to Vercel and the existing Express/Socket.IO process to a
Render **Web Service**. Judge0 stays external and the problem catalog stays at
`server/data/problems.json`. No database or Python installation on Render is
required for this MVP.

## Repository and runtime

- Use the same committed Git branch for both services. The current development
  branch is `mvp/judge-flow`; explicitly select it, or merge into your chosen
  production branch before deploying.
- Keep the **repository root** as the root directory on both hosts, because the
  workspace manifests and `package-lock.json` are at that level.
- Use **Node 22.x**, as declared in the root `package.json`. Select 22.x in Vercel;
  Render honors the root engines range unless a dashboard setting overrides it.
- The root `npm start` is for local development. Do not use it on Render.
- Never commit private `.env` files. Enter production variables in the hosting
  dashboards. `.env.example` files are templates, not working credentials.

## Render backend settings

| Setting | Value |
| --- | --- |
| Service type | Web Service |
| Runtime | Node |
| Root directory | Repository root (leave the field empty) |
| Build command | `npm ci --include=dev` |
| Start command | `npm start --workspace=server` |
| Health check path | `/health` |
| Instances | Exactly one |

Set these environment variables in Render:

| Name | Value to supply |
| --- | --- |
| `NODE_ENV` | `production` |
| `CLIENT_ORIGIN` | Your stable HTTPS Vercel frontend origin, with no path |
| `GOOGLE_CLIENT_ID` | Your real Google web client ID |
| `JUDGE0_API_URL` | Your subscribed Judge0 `/submissions` endpoint; for Judge0 CE on RapidAPI: `https://judge0-ce.p.rapidapi.com/submissions` |
| `JUDGE0_API_HOST` | The endpoint hostname; for that endpoint: `judge0-ce.p.rapidapi.com` |
| `JUDGE0_API_KEY` | Your private RapidAPI key, entered only on the backend |

Render supplies `PORT` automatically. The server listens on that port on
`0.0.0.0`. Do not copy the local `PORT=3001` setting into Render. If Render has a
`NODE_VERSION` override, set it to `22.x` so it agrees with the repository.

Production startup validates the origin, Google ID format, and Judge0 settings
before opening the port. It does not read a local `.env` file in production.
`/health` reports configuration and liveness, **not successful external login or
code execution**.

Use one always-on instance for the interview. Rooms, seats, timers, and outcomes
are stored in memory. Scaling to multiple instances splits that state, and a
restart/redeployment loses active rooms. Transport reconnection recovery works
only while the original server process still exists. Avoid redeploying during
the demonstration. Render's free instance can sleep when idle and has a cold
start; a paid always-on instance reduces that risk but does not persist matches.

## Vercel frontend settings

The root `vercel.json` supplies the build configuration:

| Setting | Value |
| --- | --- |
| Framework preset | Other (`framework: null`) |
| Root directory | Repository root (`./`) |
| Install command | `npm ci --include=dev` |
| Build command | `npm run build --workspace=client` |
| Output directory | `client/build` |
| Node.js version | 22.x |

Set these public build variables in Vercel's **Production** environment before
building:

| Name | Value to supply |
| --- | --- |
| `REACT_APP_API_URL` | Your HTTPS Render origin, e.g. `https://your-service.onrender.com` |
| `REACT_APP_SOCKET_URL` | The same HTTPS Render origin |
| `REACT_APP_GOOGLE_CLIENT_ID` | The same real web client ID as on Render |

Do not append `/api`, `/socket.io`, query parameters, or credentials to those
origins. Socket.IO supplies its own path and uses secure WebSockets from the
HTTPS origin. The build validates these values before bundling; missing settings
must not silently deploy localhost URLs. Changing frontend variables requires a
new frontend build. Local `npm start --workspace=client` still supports the
localhost defaults; a production build needs production settings.

Do not put the Judge0 key or any other secret in `REACT_APP_*` variables. They are
publicly visible in the generated bundle. Keep the legacy `netlify.toml` and
Netlify functions separate from this deployment; Vercel/Render do not use them.
The CRA `proxy` setting is only for local development, not production routing.

## Google and RapidAPI manual setup

1. In Google Cloud, select your existing **Web application** OAuth client.
2. Add the exact stable frontend URL to **Authorized JavaScript origins** (scheme
   and hostname only). Keep the localhost origins if you still develop locally.
3. Ensure the Google ID in Vercel and Render is identical. This app uses the
   popup credential callback; it does not require a new backend redirect route.
4. Check your Google consent/audience settings permit the accounts used for the
   interview. If the client is restricted to test users, add those accounts.
5. In RapidAPI, confirm the key belongs to an application subscribed to the
   Judge0 product, the endpoint and host correspond to that subscription, and
   enough quota remains. Copy its values into Render only.

## Recommended deployment order

1. Review the changes and run local tests. Commit and push only when you decide
   to publish them; configure both hosts to build that exact branch.
2. Choose the stable Vercel production address. Use that address for Render's
   `CLIENT_ORIGIN` and the Google authorized origin.
3. Create the Render service with its required settings and variables. Record
   its HTTPS backend address after it starts.
4. Add that address and the Google client ID to Vercel's production variables,
   then build the frontend using the settings above.
5. If the final frontend address differs from the one chosen, update Render's
   `CLIENT_ORIGIN` and the Google origin before testing.
6. Open the backend's `/health` and `/api/game/options`. Check Render logs for
   startup errors; do not treat a health response as Judge0 execution verification.
7. Sign in from a fresh browser and an Incognito/private session. Create and join
   one room, confirm both players receive the same problem and deadline, and
   verify correct and incorrect JavaScript/Python submissions.
8. Check winner/defeat displays, refresh recovery within 30 seconds, deliberate
   leave, abandonment cancellation, and a second match. Check that the connection
   upgrades to WebSocket and there are no CORS/mixed-content errors.

Use the stable production URL for the demo. Arbitrary Vercel preview URLs are not
automatically authorized by either the current single-origin CORS setting or
Google; configure a specific preview origin separately if you need to test it.

## Local validation and limits

From the repository root:

```text
npm test --workspace=server
npm test --workspace=client -- --watchAll=false --runInBand
npm run build --workspace=client
```

The production build requires the public deployment variables listed above.
The server tests use synthetic settings and a local production server; they do
not need credentials. To verify your real RapidAPI subscription yourself, run
`npm run test:judge0 --workspace=server` with your existing local settings. This
live command reads your private local server environment and consumes Judge0
quota (16 submissions on a successful run). It was intentionally not run during
credential-free deployment preparation.

Remaining public-service hardening: Google login is not currently enforced as a
server session on match creation/socket membership, and there is no submission
rate limit. A publicly exposed backend can therefore consume Judge0 quota. These
are separate code changes, not problems solved by CORS or deployment settings;
they were left unchanged to preserve the requested configuration-only scope.

Non-blocking static asset issue: `client/public/index.html` references a favicon,
manifest, and logo images that are not present in `client/public`. Those requests
will return 404, but they do not prevent the frontend build or two-player match
flow. No replacement branding assets were added during this preparation.

References: [Render web services](https://render.com/docs/web-services),
[Render WebSockets](https://render.com/docs/websocket),
[Render free service limits](https://render.com/docs/free),
[Render Node versions](https://render.com/docs/node-version),
[Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json),
[Google web client setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid),
[CRA environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables/).
