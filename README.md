# QPost SDKs

[![CI](https://github.com/qern-net/qpost-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/qern-net/qpost-sdk/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/qern-net/qpost-sdk/main/.github/badges/coverage.json)](https://github.com/qern-net/qpost-sdk/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@dyanet/qpost)](https://www.npmjs.com/package/@dyanet/qpost)
[![npm downloads](https://img.shields.io/npm/dm/@dyanet/qpost)](https://www.npmjs.com/package/@dyanet/qpost)

Official client SDKs for the [QPost](https://qern.org) email gateway API — a Mailgun-compatible
gateway backed by Amazon SES.

| Language | Package | Registry | Location |
| --- | --- | --- | --- |
| TypeScript / JavaScript | `@dyanet/qpost` | npm | [`npm/`](./npm) |

Each language SDK lives in its own top-level folder; more may be added as siblings of `npm/`.

## TypeScript (`npm/`)

A typed client for the **native** QPost API (`/qp/v3`), with a hand-written ergonomic client over
generated types. See [`npm/README.md`](./npm/README.md) for install, usage, error handling, and type
regeneration.

> If you're migrating an existing **Mailgun** or **SendGrid** integration, you don't need this SDK —
> keep using `mailgun.js` / `@sendgrid/mail` pointed at the gateway's compatible `/v3/**` endpoints.
> Reach for `@dyanet/qpost` when you want first-class QPost types and the native tenant/domain/SES
> surface.

## Generated types vs. hand-written client — how to edit safely

Every SDK in this repo is split into two layers, and the distinction matters when editing:

- **Generated types** are derived from the repo-root OpenAPI spec
  [`qpost-v3-openapi.yaml`](./qpost-v3-openapi.yaml) by each language's codegen — for TypeScript,
  `npm/src/schema.gen.ts`, produced by `openapi-typescript`.
  **Do not hand-edit generated files.** Regenerate them from the spec instead
  (`cd npm && npm run generate-types`). CI runs the generator and **fails the build if a generated
  file has drifted from the spec**, so hand edits would be reverted anyway.

- **The hand-written client** is the ergonomic surface developers actually call — for TypeScript,
  `npm/src/client.ts` and `errors.ts`. This is deliberately **not** generated: it's tailored for
  usability (typed resource methods, error mapping to `QPostApiError`, sensible defaults, one client
  per tenant key). This is the layer we invest in to make the SDK *nicer than raw generated code*.

**Rule of thumb:** to change the API *shape*, edit the OpenAPI spec and regenerate. To improve
*ergonomics*, edit (or add) hand-written client files. Never edit the generated schema directly.

The spec here is a synced copy of the source of truth in the QPost API repo — treat it as read-only
except when pulling in an updated version.

## License

MIT — see [`LICENSE`](./LICENSE). The QPost service itself is proprietary and separately licensed.
