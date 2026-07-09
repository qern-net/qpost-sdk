import createClient from "openapi-fetch";
import type { FetchResponse } from "openapi-fetch";
import type { components, paths } from "./schema.gen.js";
import { QPostApiError } from "./errors.js";

export type QPostSchemas = components["schemas"];

export interface QPostClientOptions {
  /** Tenant API key — the same key used as the Mailgun-compatible surface's Basic-auth password. */
  apiKey: string;
  /** Defaults to the production QPost API. */
  baseUrl?: string;
  /** Override for testing; defaults to the global fetch. */
  fetch?: typeof fetch;
}

const DEFAULT_BASE_URL = "https://qpost.qern.net/qp/v3";

/** Unwraps an openapi-fetch result, throwing {@link QPostApiError} on any error response. */
async function unwrap<T>(
  result: Promise<FetchResponse<any, any, any>> | FetchResponse<any, any, any>
): Promise<T> {
  const { data, error, response } = await result;
  if (error) {
    const err = error as Partial<QPostSchemas["Error"]>;
    throw new QPostApiError(
      response.status,
      err.error ?? "unknown_error",
      err.message ?? response.statusText ?? "Request failed"
    );
  }
  return data as T;
}

/**
 * Creates a typed QPost API client. One instance per tenant API key.
 *
 * @example
 * ```ts
 * const qpost = createQPostClient({ apiKey: process.env.QPOST_API_KEY! });
 * const { id } = await qpost.messages.send({
 *   from: "news@example.com",
 *   to: ["reader@example.com"],
 *   subject: "Hello",
 *   text: "Hi there",
 * });
 * ```
 */
export function createQPostClient(options: QPostClientOptions) {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const client = createClient<paths>({
    baseUrl,
    fetch: options.fetch,
    headers: { Authorization: `Bearer ${options.apiKey}` },
  });

  return {
    tenant: {
      /** GET /tenant — the authenticated tenant, including SES alignment status. */
      get: () => unwrap<QPostSchemas["Tenant"]>(client.GET("/tenant", {})),
    },

    domains: {
      /** GET /domains */
      list: (query?: paths["/domains"]["get"]["parameters"]["query"]) =>
        unwrap<QPostSchemas["DomainList"]>(client.GET("/domains", { params: { query } })),
      /** POST /domains */
      create: (body: QPostSchemas["CreateDomainRequest"]) =>
        unwrap<QPostSchemas["Domain"]>(client.POST("/domains", { body })),
      /** GET /domains/{domain} */
      get: (domain: string) =>
        unwrap<QPostSchemas["Domain"]>(client.GET("/domains/{domain}", { params: { path: { domain } } })),
      /** DELETE /domains/{domain} */
      remove: (domain: string) =>
        unwrap<void>(client.DELETE("/domains/{domain}", { params: { path: { domain } } })),
      /** GET /domains/{domain}/dns-records */
      dnsRecords: (domain: string) =>
        unwrap<QPostSchemas["DnsRecordSet"]>(
          client.GET("/domains/{domain}/dns-records", { params: { path: { domain } } })
        ),
      /** GET /domains/{domain}/tracking */
      getTracking: (domain: string) =>
        unwrap<QPostSchemas["TrackingSettings"]>(
          client.GET("/domains/{domain}/tracking", { params: { path: { domain } } })
        ),
      /** PUT /domains/{domain}/tracking */
      updateTracking: (domain: string, body: QPostSchemas["TrackingSettings"]) =>
        unwrap<QPostSchemas["TrackingSettings"]>(
          client.PUT("/domains/{domain}/tracking", { params: { path: { domain } }, body })
        ),
      /** POST /domains/{domain}/delegation */
      migrateDelegation: (domain: string) =>
        unwrap<QPostSchemas["Domain"]>(
          client.POST("/domains/{domain}/delegation", { params: { path: { domain } } })
        ),
      /** GET /domains/{domain}/stats — all-time event counts (see DomainStats). */
      stats: (domain: string) =>
        unwrap<QPostSchemas["DomainStats"]>(
          client.GET("/domains/{domain}/stats", { params: { path: { domain } } })
        ),
      /** GET /domains/{domain}/ghost-config */
      ghostConfig: (domain: string) =>
        unwrap<QPostSchemas["GhostConfig"]>(
          client.GET("/domains/{domain}/ghost-config", { params: { path: { domain } } })
        ),
    },

    messages: {
      /** POST /messages */
      send: (body: QPostSchemas["SendMessageRequest"]) =>
        unwrap<QPostSchemas["SendMessageResponse"]>(client.POST("/messages", { body })),
    },

    events: {
      /** GET /events */
      list: (query: paths["/events"]["get"]["parameters"]["query"]) =>
        unwrap<QPostSchemas["EventList"]>(client.GET("/events", { params: { query } })),
    },

    suppressions: {
      /** GET /suppressions/{listType}?domain=... */
      list: (
        listType: "bounces" | "complaints" | "unsubscribes",
        query: { domain: string; page?: number; limit?: number }
      ) =>
        unwrap<QPostSchemas["SuppressionList"]>(
          client.GET("/suppressions/{listType}", { params: { path: { listType }, query } })
        ),
      /** POST /suppressions/{listType}?domain=... */
      add: (
        listType: "bounces" | "complaints" | "unsubscribes",
        domain: string,
        body: QPostSchemas["CreateSuppressionRequest"]
      ) =>
        unwrap<QPostSchemas["Suppression"]>(
          client.POST("/suppressions/{listType}", { params: { path: { listType }, query: { domain } }, body })
        ),
      /** POST /suppressions/{listType}/import?domain=... */
      import: (
        listType: "bounces" | "complaints" | "unsubscribes",
        domain: string,
        entries: QPostSchemas["CreateSuppressionRequest"][]
      ) =>
        unwrap<{ imported?: number }>(
          client.POST("/suppressions/{listType}/import", {
            params: { path: { listType }, query: { domain } },
            body: entries,
          })
        ),
      /** DELETE /suppressions/{listType}/{address}?domain=... */
      remove: (listType: "bounces" | "complaints" | "unsubscribes", address: string, domain: string) =>
        unwrap<void>(
          client.DELETE("/suppressions/{listType}/{address}", {
            params: { path: { listType, address }, query: { domain } },
          })
        ),
    },

    ipPools: {
      /** GET /ip-pools */
      list: () => unwrap<QPostSchemas["IpPool"][]>(client.GET("/ip-pools", {})),
      /** POST /ip-pools */
      create: (name: string) =>
        unwrap<QPostSchemas["IpPool"]>(client.POST("/ip-pools", { body: { name } })),
      /** DELETE /ip-pools/{name} */
      remove: (name: string) =>
        unwrap<void>(client.DELETE("/ip-pools/{name}", { params: { path: { name } } })),
      /** POST /ip-pools/{name}/ips */
      addIp: (name: string, ip: string) =>
        unwrap<QPostSchemas["IpPool"]>(
          client.POST("/ip-pools/{name}/ips", { params: { path: { name } }, body: { ip } })
        ),
      /** GET /ips */
      listIps: () => unwrap<{ ip?: string; pool?: string }[]>(client.GET("/ips", {})),
    },

    account: {
      /** GET /account */
      get: () => unwrap<QPostSchemas["AccountStatus"]>(client.GET("/account", {})),
    },
  };
}

export type QPostClient = ReturnType<typeof createQPostClient>;
