import { z } from "zod"
import { jsonSchema, registerMutationTool } from "./shared.js"

const columnSortDirectionSchema = z.enum(["asc", "desc"])
const columnIndexNullsSchema = z.enum(["first", "last"])

const columnIndexInputSchema = z.object({
  direction: columnSortDirectionSchema,
  nulls: columnIndexNullsSchema,
})

const columnCreateInputSchema = z.object({
  workspaceId: z.string().min(1),
  collectionId: z.string().min(1),
  columnName: z.string().min(1),
  fieldId: z.string().min(1),
  type: z.string().min(1),
  help: z.string().optional(),
  fieldOptions: jsonSchema.optional(),
  validation: jsonSchema.optional(),
  enableDelete: z.boolean().optional(),
  enableSort: z.boolean().optional(),
  enableHide: z.boolean().optional(),
  enableFilter: z.boolean().optional(),
  sortBy: columnSortDirectionSchema.optional(),
  visibility: z.boolean().optional(),
  index: columnIndexInputSchema.optional(),
})

const columnUpdateInputSchema = z.object({
  columnName: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  help: z.string().optional(),
  fieldOptions: jsonSchema.optional(),
  validation: jsonSchema.optional(),
  enableDelete: z.boolean().optional(),
  enableSort: z.boolean().optional(),
  enableHide: z.boolean().optional(),
  enableFilter: z.boolean().optional(),
  sortBy: columnSortDirectionSchema.optional(),
  visibility: z.boolean().optional(),
  index: columnIndexInputSchema.optional(),
})

const COLUMN_SELECTION = `{
  id
  workspaceId
  collectionId
  columnName
  fieldId
  type
  help
  fieldOptions
  validation
  enableDelete
  enableSort
  enableHide
  enableFilter
  sortBy
  visibility
  index { direction nulls }
  updatedAt
}`

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {(config: object, input: object) => Promise<object>} requestGraphql
 */
export function registerColumnsMutationTools(server, config, requestGraphql) {
  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_create_column",
    title: "Create column",
    description:
      "Mutation createColumn. Requires update on cms:workspaces:collections:columns:<collectionId>. fieldId is create-only.",
    inputSchema: { input: columnCreateInputSchema },
    operationName: "McpCreateColumn",
    query: `mutation McpCreateColumn($input: columnCreateInput!) {
      createColumn(input: $input) ${COLUMN_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_column",
    title: "Update column",
    description:
      "Mutation updateColumn. Requires update on cms:workspaces:collections:columns:<collectionId>. Identifies row by numeric id.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
      input: columnUpdateInputSchema,
    },
    operationName: "McpUpdateColumn",
    query: `mutation McpUpdateColumn($id: ID!, $workspaceId: ID!, $collectionId: ID!, $input: columnUpdateInput!) {
      updateColumn(id: $id, workspaceId: $workspaceId, collectionId: $collectionId, input: $input) ${COLUMN_SELECTION}
    }`,
    variables: ({ id, workspaceId, collectionId, input }) => ({
      id,
      workspaceId,
      collectionId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_column",
    title: "Delete column",
    description:
      "Mutation deleteColumn. Requires update on cms:workspaces:collections:columns:<collectionId>. Identifies row by fieldId; returns fieldId.",
    inputSchema: {
      fieldId: z.string().min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
    },
    operationName: "McpDeleteColumn",
    query: `mutation McpDeleteColumn($fieldId: String!, $workspaceId: ID!, $collectionId: ID!) {
      deleteColumn(fieldId: $fieldId, workspaceId: $workspaceId, collectionId: $collectionId)
    }`,
    variables: ({ fieldId, workspaceId, collectionId }) => ({
      fieldId,
      workspaceId,
      collectionId,
    }),
  })
}
