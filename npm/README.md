# @dyanet/qpost

Typed TypeScript client for the native QPost API (`/qp/v3`). The generated types
(`src/schema.gen.ts`) come from the repo-root OpenAPI spec
[`qpost-v3-openapi.yaml`](../qpost-v3-openapi.yaml) via
[`openapi-typescript`](https://openapi-ts.dev); the client surface on top is hand-written for
ergonomics ([`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/) under the hood).

This targets the **native QPost API**, not the Mailgun- or SendGrid-compatible surfaces. If you're
migrating an existing Mailgun or SendGrid integration, keep using `mailgun.js` / `@sendgrid/mail`
pointed at this gateway's `/v3/**` endpoints — no code changes needed there. Reach for this SDK when
you want first-class QPost types, the `metadata` (NVP) extension fields, and the tenant/domain/SES
alignment surface.

## Install

```sh
npm install @dyanet/qpost
```

## Usage

```ts
import { createQPostClient } from "@dyanet/qpost";

const qpost = createQPostClient({ apiKey: process.env.QPOST_API_KEY! });

const sent = await qpost.messages.send({
  from: "news@example.com",
  to: ["reader@example.com"],
  subject: "Hello",
  text: "Hi there",
  tags: ["newsletter"],
});
console.log(sent.id);

const domain = await qpost.domains.get("example.com");
console.log(domain.status, domain.sesAlignment);

const events = await qpost.events.list({ domain: "example.com", event: "bounced" });
```

## Auth

One tenant API key — the same key used for the Mailgun-compatible surface's HTTP Basic auth
(`api:<key>`) — presented as `Authorization: Bearer <key>`. `createQPostClient` sets this header for
every request; there is no separate native credential to provision.

## Error handling

Every non-2xx response throws `QPostApiError` (`status`, `code`, `message`):

```ts
import { QPostApiError } from "@dyanet/qpost";

try {
  await qpost.domains.get("not-mine.com");
} catch (err) {
  if (err instanceof QPostApiError) {
    console.error(err.status, err.code, err.message);
  }
}
```

## Regenerating types

`src/schema.gen.ts` is generated, not hand-written. The repo-root OpenAPI spec
`qpost-v3-openapi.yaml` is synced from the QPost API repo; after updating it, run:

```sh
npm run generate-types
```

## Status

The native QPost API this SDK targets is under active development — see the spec's own description
for what's implemented today vs. target-state (e.g. `sesAlignment` fields report
`"status": "not_provisioned"` until the QPost SES multi-tenant migration ships). Treat `0.x`
versions of this package as pre-1.0: minor versions may include breaking changes until the
underlying API's v3 surface stabilizes.

## License

MIT for this client library (see [`LICENSE`](../LICENSE)). The QPost service itself is proprietary
and separately licensed.
