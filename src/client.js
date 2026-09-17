import { signRequest } from "./sign.js"

const ALLOWED_STAGES = new Set(["draft", "published"])

/**
 * @param {URL} upstreamUrl
 * @param {string | undefined} stage
 * @returns {URL}
 */
export function resolveUpstream(upstreamUrl, stage) {
  if (!stage) return new URL(upstreamUrl.href)
  if (!ALLOWED_STAGES.has(stage)) {
    throw new Error('stage must be "draft" or "published"')
  }

  const url = new URL(upstreamUrl.href)
  const segments = url.pathname.split("/").filter(Boolean)
  const last = segments.at(-1)
  if (last === "draft" || last === "published") {
    segments[segments.length - 1] = stage
    url.pathname = `/${segments.join("/")}`
  }
  return url
}

/**
 * POST a signed GraphQL operation to CMS.
 *
 * @param {{
 *   upstreamUrl: URL
 *   apiKey: string
 *   secretB64: string
 *   query: string
 *   variables?: Record<string, unknown>
 *   operationName?: string
 *   stage?: string
 * }} input
 */
export async function executeGraphQL(input) {
  const url = resolveUpstream(input.upstreamUrl, input.stage)
  const payload = {
    query: input.query,
  }
  if (input.variables && Object.keys(input.variables).length > 0) {
    payload.variables = input.variables
  }
  if (input.operationName) {
    payload.operationName = input.operationName
  }

  const body = JSON.stringify(payload)
  const pathWithQuery = `${url.pathname}${url.search}`
  const signedHeaders = signRequest({
    method: "POST",
    pathWithQuery,
    body,
    apiKey: input.apiKey,
    secretB64: input.secretB64,
  })

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...signedHeaders,
      accept: "application/json",
      "content-type": "application/json",
    },
    body,
  })

  const raw = await response.text()
  return {
    status: response.status,
    url: url.toString(),
    raw,
  }
}
