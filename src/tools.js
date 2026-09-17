import { z } from "zod"
import { executeGraphQL } from "./client.js"
import {
  formatGraphqlHttpResult,
  formatTypeRef,
  toolResultText,
} from "./format.js"
import { registerFormsMutationTools } from "./forms-tools.js"
import {
  DESCRIBE_TYPE_QUERY,
  LIST_TYPES_QUERY,
  summarizeSchema,
} from "./introspection.js"

const stageSchema = z.enum(["draft", "published"]).optional()
const variablesSchema = z.record(z.unknown()).optional()

/**
 * @param {unknown} raw
 */
function parseGraphqlBody(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {{ query: string, variables?: Record<string, unknown>, operationName?: string, stage?: string }} input
 */
export async function requestGraphql(config, input) {
  let result
  try {
    result = await executeGraphQL({ ...config, ...input })
  } catch (error) {
    return toolResultText(
      {
        error: "Upstream GraphQL request failed",
        details: error instanceof Error ? error.message : String(error),
        upstream: config.upstreamUrl.toString(),
      },
      true
    )
  }

  const json = parseGraphqlBody(result.raw)
  if (!json) {
    return toolResultText(
      {
        status: result.status,
        url: result.url,
        error: "Upstream returned non-JSON",
        body: result.raw,
      },
      result.status >= 400
    )
  }

  const formatted = formatGraphqlHttpResult(json, result.status)
  const graphqlErrors = Array.isArray(json.errors) ? json.errors : []
  const failed = result.status >= 400 || graphqlErrors.length > 0
  return toolResultText({ url: result.url, ...formatted }, failed)
}

function formatDescribedType(type) {
  if (!type) return { error: "Type not found" }

  const fields = (type.fields ?? []).map((field) => ({
    name: field.name,
    type: formatTypeRef(field.type),
    description: field.description ?? undefined,
    args: (field.args ?? []).map((arg) => ({
      name: arg.name,
      type: formatTypeRef(arg.type),
      defaultValue: arg.defaultValue ?? undefined,
      description: arg.description ?? undefined,
    })),
  }))

  const inputFields = (type.inputFields ?? []).map((field) => ({
    name: field.name,
    type: formatTypeRef(field.type),
    defaultValue: field.defaultValue ?? undefined,
    description: field.description ?? undefined,
  }))

  return {
    kind: type.kind,
    name: type.name,
    description: type.description ?? undefined,
    fields: fields.length > 0 ? fields : undefined,
    inputFields: inputFields.length > 0 ? inputFields : undefined,
    enumValues: type.enumValues ?? undefined,
    possibleTypes: type.possibleTypes ?? undefined,
  }
}

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 */
export function registerGraphqlTools(server, config) {
  server.registerTool(
    "graphql_health",
    {
      title: "GraphQL health",
      description:
        "Ping CMS GraphQL with `query { health }`. Use to verify HMAC signing and connectivity.",
      inputSchema: { stage: stageSchema },
    },
    async ({ stage }) =>
      requestGraphql(config, { query: "query McpHealth { health }", stage })
  )

  server.registerTool(
    "graphql_list_types",
    {
      title: "List GraphQL types",
      description:
        "Introspect the CMS GraphQL schema. Returns root operation types and type names grouped by kind. Call graphql_describe_type next for field details.",
      inputSchema: { stage: stageSchema },
    },
    async ({ stage }) => {
      const result = await requestGraphql(config, {
        query: LIST_TYPES_QUERY,
        stage,
      })
      if (result.isError) return result
      const parsed = parseGraphqlBody(result.content[0].text)
      const schema = parsed?.data?.__schema
      if (!schema) return result
      return toolResultText({
        url: parsed.url,
        status: parsed.status,
        ...summarizeSchema(schema),
      })
    }
  )

  server.registerTool(
    "graphql_describe_type",
    {
      title: "Describe GraphQL type",
      description:
        "Introspect one GraphQL type by name (for example Query, Mutation, formCreateInput, or a connection type). Returns fields, args, and nested type refs. For form writes prefer the graphql_*_form* tools.",
      inputSchema: {
        name: z.string().min(1),
        stage: stageSchema,
      },
    },
    async ({ name, stage }) => {
      const result = await requestGraphql(config, {
        query: DESCRIBE_TYPE_QUERY,
        variables: { name },
        stage,
      })
      if (result.isError) return result
      const parsed = parseGraphqlBody(result.content[0].text)
      const type = parsed?.data?.__type
      if (type === undefined) return result
      return toolResultText({
        url: parsed.url,
        status: parsed.status,
        type: formatDescribedType(type),
        errors: parsed.errors,
      })
    }
  )

  server.registerTool(
    "graphql_query",
    {
      title: "Execute GraphQL",
      description:
        "Execute a GraphQL query or mutation against CMS GraphQL. The MCP process HMAC-signs the request. For forms, prefer dedicated tools (graphql_create_form, graphql_update_form, graphql_delete_form, graphql_*_form_section, graphql_*_form_field). Prefer graphql_list_types / graphql_describe_type before ad-hoc operations. Pass GraphQL variables as a JSON object, not inline strings when values are dynamic.",
      inputSchema: {
        query: z.string().min(1),
        variables: variablesSchema,
        operationName: z.string().min(1).optional(),
        stage: stageSchema,
      },
    },
    async ({ query, variables, operationName, stage }) =>
      requestGraphql(config, { query, variables, operationName, stage })
  )

  registerFormsMutationTools(server, config, requestGraphql)
}
