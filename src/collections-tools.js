import { z } from "zod"
import { registerMutationTool } from "./shared.js"

const collectionTypeSchema = z.enum(["multiple", "single"])

const collectionCreateInputSchema = z.object({
  workspaceId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  internalName: z.string().min(1),
  type: collectionTypeSchema,
  description: z.string().optional(),
  visibility: z.string().optional(),
})

const collectionUpdateInputSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  internalName: z.string().min(1).optional(),
  description: z.string().optional(),
  visibility: z.string().optional(),
  columnOrder: z.array(z.string()).optional(),
})

const COLLECTION_SELECTION = `{
  id
  workspaceId
  parentCollectionId
  slug
  name
  internalName
  description
  type
  columnOrder
  updatedAt
}`

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {(config: object, input: object) => Promise<object>} requestGraphql
 */
export function registerCollectionsMutationTools(
  server,
  config,
  requestGraphql
) {
  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_create_collection",
    title: "Create collection",
    description:
      "Mutation createCollection. Requires create on cms:workspaces:collections. Prefer draft stage for writes.",
    inputSchema: { input: collectionCreateInputSchema },
    operationName: "McpCreateCollection",
    query: `mutation McpCreateCollection($input: collectionCreateInput!) {
      createCollection(input: $input) ${COLLECTION_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_collection",
    title: "Update collection",
    description:
      "Mutation updateCollection. Requires update on cms:workspaces:collections:<id>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      input: collectionUpdateInputSchema,
    },
    operationName: "McpUpdateCollection",
    query: `mutation McpUpdateCollection($id: ID!, $workspaceId: ID!, $input: collectionUpdateInput!) {
      updateCollection(id: $id, workspaceId: $workspaceId, input: $input) ${COLLECTION_SELECTION}
    }`,
    variables: ({ id, workspaceId, input }) => ({ id, workspaceId, input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_collection",
    title: "Delete collection",
    description:
      "Mutation deleteCollection. Requires delete on cms:workspaces:collections:<id>. Cascades to child collections, columns, and documents.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
    },
    operationName: "McpDeleteCollection",
    query: `mutation McpDeleteCollection($id: ID!, $workspaceId: ID!) {
      deleteCollection(id: $id, workspaceId: $workspaceId)
    }`,
    variables: ({ id, workspaceId }) => ({ id, workspaceId }),
  })
}
