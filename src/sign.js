import { createHash, createHmac, randomBytes } from "node:crypto"

/**
 * Build HMAC headers for a CMS GraphQL request.
 * Payload: METHOD\nPATH_WITH_QUERY\nBODY_HASH\nNONCE\nTIMESTAMP
 *
 * @param {{ method: string, pathWithQuery: string, body: string, apiKey: string, secretB64: string }} input
 * @returns {Record<string, string>}
 */
export function signRequest({ method, pathWithQuery, body, apiKey, secretB64 }) {
  const nonce = randomBytes(16).toString("hex")
  const timestamp = Date.now().toString()
  const bodyHash = createHash("sha256").update(body).digest("hex")
  const payload = [
    method.toUpperCase(),
    pathWithQuery,
    bodyHash,
    nonce,
    timestamp,
  ].join("\n")
  const signature = createHmac("sha256", Buffer.from(secretB64, "base64"))
    .update(payload)
    .digest("hex")

  return {
    "x-api-key": apiKey,
    "x-nonce": nonce,
    "x-timestamp": timestamp,
    "x-signature": signature,
  }
}
