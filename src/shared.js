import { z } from "zod"

export const stageSchema = z.enum(["draft", "published"]).optional()
export const jsonSchema = z.unknown()

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {(config: object, input: object) => Promise<object>} requestGraphql
 * @param {{
 *   name: string
 *   title: string
 *   description: string
 *   inputSchema: Record<string, unknown>
 *   operationName: string
 *   query: string | ((args: Record<string, unknown>) => string)
 *   variables?: (args: Record<string, unknown>) => Record<string, unknown>
 * }} def
 */
export function registerMutationTool(server, config, requestGraphql, def) {
  server.registerTool(
    def.name,
    {
      title: def.title,
      description: def.description,
      inputSchema: {
        ...def.inputSchema,
        stage: stageSchema,
      },
    },
    async (args) => {
      const { stage, ...rest } = args
      const query =
        typeof def.query === "function" ? def.query(rest) : def.query
      const variables = def.variables
        ? def.variables(rest)
        : Object.keys(rest).length > 0
          ? rest
          : undefined
      return requestGraphql(config, {
        query,
        variables,
        operationName: def.operationName,
        stage,
      })
    }
  )
}
