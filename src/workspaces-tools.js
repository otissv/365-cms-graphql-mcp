import { z } from "zod"
import { jsonSchema, registerMutationTool } from "./shared.js"

const workspaceTypeSchema = z.enum(["collection", "site"])
const workspaceStatusSchema = z.enum(["active", "archived"])

const workspaceCreateInputSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  internalName: z.string().min(1),
  type: workspaceTypeSchema,
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  permission: z.string().optional(),
  settings: jsonSchema.optional(),
  metadata: jsonSchema.optional(),
  publishConfig: jsonSchema.optional(),
  defaultLocale: z.string().optional(),
  timezone: z.string().optional(),
  contentDefaults: jsonSchema.optional(),
})

const workspaceUpdateInputSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  status: workspaceStatusSchema.optional(),
  permission: z.string().optional(),
  settings: jsonSchema.optional(),
  metadata: jsonSchema.optional(),
  publishConfig: jsonSchema.optional(),
  defaultLocale: z.string().optional(),
  timezone: z.string().optional(),
  contentDefaults: jsonSchema.optional(),
})

const WORKSPACE_SELECTION = `{
  id
  slug
  name
  internalName
  description
  status
  type
  defaultLocale
  timezone
  updatedAt
}`

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {(config: object, input: object) => Promise<object>} requestGraphql
 */
export function registerWorkspacesMutationTools(server, config, requestGraphql) {
  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_create_workspace",
    title: "Create workspace",
    description:
      "Mutation createWorkspace. Requires create on cms:workspaces:sites or cms:workspaces:collections (from input.type). Prefer draft stage for writes.",
    inputSchema: { input: workspaceCreateInputSchema },
    operationName: "McpCreateWorkspace",
    query: `mutation McpCreateWorkspace($input: workspaceCreateInput!) {
      createWorkspace(input: $input) ${WORKSPACE_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_workspace",
    title: "Update workspace",
    description:
      "Mutation updateWorkspace. Requires update on cms:workspaces:sites:<id> or cms:workspaces:collections:<id> (from stored type).",
    inputSchema: {
      id: z.string().min(1),
      input: workspaceUpdateInputSchema,
    },
    operationName: "McpUpdateWorkspace",
    query: `mutation McpUpdateWorkspace($id: ID!, $input: workspaceUpdateInput!) {
      updateWorkspace(id: $id, input: $input) ${WORKSPACE_SELECTION}
    }`,
    variables: ({ id, input }) => ({ id, input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_workspace",
    title: "Delete workspace",
    description:
      "Mutation deleteWorkspace. Requires delete on cms:workspaces:sites:<id> or cms:workspaces:collections:<id>. Returns the deleted id.",
    inputSchema: { id: z.string().min(1) },
    operationName: "McpDeleteWorkspace",
    query: `mutation McpDeleteWorkspace($id: ID!) {
      deleteWorkspace(id: $id)
    }`,
    variables: ({ id }) => ({ id }),
  })
}
