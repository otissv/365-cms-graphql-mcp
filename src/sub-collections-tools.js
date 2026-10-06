import { z } from "zod"
import { jsonSchema, registerMutationTool } from "./shared.js"

const collectionTypeSchema = z.enum(["multiple", "single"])
const sortDirectionSchema = z.enum(["asc", "desc"])
const indexNullsSchema = z.enum(["first", "last"])

const indexInputSchema = z.object({
  direction: sortDirectionSchema,
  nulls: indexNullsSchema,
})

const documentSubCollectionColumnSchema = z.object({
  collectionId: z.string().min(1),
  columnName: z.string().min(1),
  fieldId: z.string().min(1),
  type: z.literal("sub-collection"),
  help: z.string().optional(),
  fieldOptions: jsonSchema.optional(),
  enableDelete: z.boolean().optional(),
  enableSort: z.boolean().optional(),
  enableHide: z.boolean().optional(),
  enableFilter: z.boolean().optional(),
  sortBy: sortDirectionSchema.optional(),
  visibility: z.boolean().optional(),
  index: indexInputSchema.optional(),
})

const pageSubCollectionFieldSchema = z.object({
  pageId: z.string().min(1),
  sectionId: z.string().min(1),
  columnName: z.string().min(1),
  fieldId: z.string().min(1),
  type: z.literal("sub-collection"),
  help: z.string().optional(),
  fieldOptions: jsonSchema.optional(),
  enableDelete: z.boolean().optional(),
  enableSort: z.boolean().optional(),
  enableHide: z.boolean().optional(),
  enableFilter: z.boolean().optional(),
  sortBy: sortDirectionSchema.optional(),
  visibility: z.boolean().optional(),
  index: indexInputSchema.optional(),
})

const subCollectionCreateSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  internalName: z.string().min(1),
  type: collectionTypeSchema,
  description: z.string().optional(),
  permission: z.string().optional(),
  documentId: z.string().min(1).optional(),
  pageId: z.string().min(1).optional(),
  sectionId: z.string().min(1).optional(),
})

const DOCUMENT_SUB_COLLECTION_SELECTION = `{
  parentDocuments { id collectionId workspaceId slug status parentDocumentId }
  parentDocumentColumns { id fieldId type subCollectionId columnName }
  subCollection { id name internalName slug parentCollectionId parentPageId type }
  subCollectionColumns { id fieldId type columnName }
}`

const PAGE_SUB_COLLECTION_SELECTION = `{
  parentPageSection { id pageId workspaceId name data }
  parentPageSectionField { id fieldId type columnName sectionId pageId }
  subCollection { id name internalName slug parentCollectionId parentPageId type }
  subCollectionColumns { id fieldId type columnName }
}`

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {(config: object, input: object) => Promise<object>} requestGraphql
 */
export function registerSubCollectionsMutationTools(
  server,
  config,
  requestGraphql
) {
  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_add_document_sub_collection",
    title: "Add document sub-collection",
    description:
      "Mutation addDocumentSubCollection. Orchestrated create (child collection + parent column + document data pointers). Do not use createColumn/createCollection for sub-collections. Requires collection create + parent column update.",
    inputSchema: {
      input: z.object({
        workspaceId: z.string().min(1),
        column: documentSubCollectionColumnSchema,
        collection: subCollectionCreateSchema.extend({
          documentId: z.string().min(1),
        }),
      }),
    },
    operationName: "McpAddDocumentSubCollection",
    query: `mutation McpAddDocumentSubCollection($input: documentSubCollectionCreateInput!) {
      addDocumentSubCollection(input: $input) ${DOCUMENT_SUB_COLLECTION_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_add_page_sub_collection",
    title: "Add page sub-collection",
    description:
      "Mutation addPageSubCollection. Orchestrated create (child collection + section field + section data pointer). Do not use createPageSectionField/createCollection for sub-collections. Requires collection create + page-section-field update.",
    inputSchema: {
      input: z.object({
        workspaceId: z.string().min(1),
        field: pageSubCollectionFieldSchema,
        collection: subCollectionCreateSchema.extend({
          pageId: z.string().min(1),
          sectionId: z.string().min(1),
        }),
      }),
    },
    operationName: "McpAddPageSubCollection",
    query: `mutation McpAddPageSubCollection($input: pageSubCollectionCreateInput!) {
      addPageSubCollection(input: $input) ${PAGE_SUB_COLLECTION_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_remove_document_sub_collection",
    title: "Remove document sub-collection",
    description:
      "Mutation removeDocumentSubCollection. Deletes the parent sub-collection column (DB trigger removes the child collection tree). Do not use deleteColumn for sub-collection fields.",
    inputSchema: {
      fieldId: z.string().min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
    },
    operationName: "McpRemoveDocumentSubCollection",
    query: `mutation McpRemoveDocumentSubCollection($fieldId: String!, $workspaceId: ID!, $collectionId: ID!) {
      removeDocumentSubCollection(fieldId: $fieldId, workspaceId: $workspaceId, collectionId: $collectionId)
    }`,
    variables: ({ fieldId, workspaceId, collectionId }) => ({
      fieldId,
      workspaceId,
      collectionId,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_remove_page_sub_collection",
    title: "Remove page sub-collection",
    description:
      "Mutation removePageSubCollection. Deletes the section field and child collection tree. Do not use deletePageSectionField for sub-collection fields.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
      sectionId: z.string().min(1),
    },
    operationName: "McpRemovePageSubCollection",
    query: `mutation McpRemovePageSubCollection($id: ID!, $workspaceId: ID!, $pageId: ID!, $sectionId: ID!) {
      removePageSubCollection(id: $id, workspaceId: $workspaceId, pageId: $pageId, sectionId: $sectionId)
    }`,
    variables: ({ id, workspaceId, pageId, sectionId }) => ({
      id,
      workspaceId,
      pageId,
      sectionId,
    }),
  })
}
