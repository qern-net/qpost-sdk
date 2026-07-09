# QPost SDKs

Official client SDKs for the [QPost](https://qern.org) email gateway API — a Mailgun-compatible
gateway backed by Amazon SES.

| Language | Package | Location |
| --- | --- | --- |
| TypeScript / JavaScript | `@dyanet/qpost` | [`npm/`](./npm) |

Each language SDK lives in its own top-level folder; more may be added as siblings of `npm/`.

## TypeScript (`npm/`)

A typed client for the **native** QPost API (`/qp/v3`). Its generated types come from the repo-root
OpenAPI spec [`qpost-v3-openapi.yaml`](./qpost-v3-openapi.yaml) (synced from the QPost API repo), with
a hand-written ergonomic client on top. See [`npm/README.md`](./npm/README.md) for install, usage,
error handling, and type regeneration.

> If you're migrating an existing **Mailgun** or **SendGrid** integration, you don't need this SDK —
> keep using `mailgun.js` / `@sendgrid/mail` pointed at the gateway's compatible `/v3/**` endpoints.
> Reach for `@dyanet/qpost` when you want first-class QPost types and the native tenant/domain/SES
> surface.

## License

MIT — see [`LICENSE`](./LICENSE). The QPost service itself is proprietary and separately licensed.
