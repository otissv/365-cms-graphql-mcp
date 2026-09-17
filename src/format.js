const MAX_CHARS = 120_000

/**
 * @param {unknown} value
 * @returns {{ content: Array<{ type: "text", text: string }>, isError?: boolean }}
 */
export function toolResultText(value, isError = false) {
  const text =
    typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2)
  const clipped =
    text.length > MAX_CHARS
      ? `${text.slice(0, MAX_CHARS)}\n\n[truncated: ${text.length} chars]`
      : text
  return {
    content: [{ type: "text", text: clipped }],
    ...(isError ? { isError: true } : {}),
  }
}

/**
 * Render an introspection __Type ref as GraphQL notation.
 * @param {{ kind?: string, name?: string | null, ofType?: unknown } | null | undefined} type
 * @returns {string}
 */
export function formatTypeRef(type) {
  if (!type) return "Unknown"
  if (type.kind === "NON_NULL") return `${formatTypeRef(type.ofType)}!`
  if (type.kind === "LIST") return `[${formatTypeRef(type.ofType)}]`
  return type.name ?? "Unknown"
}

/**
 * @param {unknown} json
 * @param {number} status
 */
export function formatGraphqlHttpResult(json, status) {
  const err = json?.errors?.[0]
  const ext = err?.extensions
  if (ext?.code === "QUERY_TOO_COMPLEX") {
    return {
      status,
      error: err.message || "Query is too complex",
      complexity: ext.complexity,
      actual_cost: ext.actual_cost ?? ext.actualCost,
      max_cost: ext.max_cost ?? ext.maxCost,
      errors: json.errors,
      data: json.data ?? null,
    }
  }
  return { status, ...json }
}
