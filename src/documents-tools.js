import { z } from "zod"
import { jsonSchema, registerMutationTool } from "./shared.js"

const documentCreateInputSchema = z.object({
  workspaceId: z.string().min(1),
  collectionId: z.string().min(1),
  parentDocumentId: z.string().min(1).optional(),
  slug: z.string().optional(),
  data: jsonSchema.optional(),
  errors: jsonSchema.optional(),
  permission: z.string().optional(),
  description: z.string().optional(),
})

const documentDataUpdateInputSchema = z.object({
  data: jsonSchema,
  errors: jsonSchema.optional(),
})

const documentSlugUpdateInputSchema = z.object({
  slug: z.string().min(1),
  errors: jsonSchema.optional(),
})

const documentPublishInputSchema = z.object({
  note: z.string().optional(),
})

const DOCUMENT_SELECTION = `{
  id
  workspaceId
  collectionId
  parentDocumentId
  slug
  data
  errors
  permission
  description
  notes
  status
  publishedVersionId
  publishedAt
  updatedAt
}`

const DOCUMENT_VERSION_SELECTION = `{
  id
  documentId
  workspaceId
  collectionId
  collectionSchemaSnapshotId
  version
  note
  createdBy
  createdAt
}`

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {(config: object, input: object) => Promise<object>} requestGraphql
 */
export function registerDocumentsMutationTools(server, config, requestGraphql) {
  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_create_document",
    title: "Create document",
    description:
      "Mutation createDocument. Requires update on cms:workspaces:collections:documents:<collectionId>. Writes live draft table.",
    inputSchema: { input: documentCreateInputSchema },
    operationName: "McpCreateDocument",
    query: `mutation McpCreateDocument($input: documentCreateInput!) {
      createDocument(input: $input) ${DOCUMENT_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_document_data",
    title: "Update document data",
    description:
      "Mutation updateDocumentData. Merges JSON keys. Requires update on cms:workspaces:collections:documents:<collectionId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
      input: documentDataUpdateInputSchema,
    },
    operationName: "McpUpdateDocumentData",
    query: `mutation McpUpdateDocumentData($id: ID!, $workspaceId: ID!, $collectionId: ID!, $input: documentDataUpdateInput!) {
      updateDocumentData(id: $id, workspaceId: $workspaceId, collectionId: $collectionId, input: $input) ${DOCUMENT_SELECTION}
    }`,
    variables: ({ id, workspaceId, collectionId, input }) => ({
      id,
      workspaceId,
      collectionId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_replace_document_data",
    title: "Replace document data",
    description:
      "Mutation replaceDocumentData. Replaces the JSON payload. Requires update on cms:workspaces:collections:documents:<collectionId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
      input: documentDataUpdateInputSchema,
    },
    operationName: "McpReplaceDocumentData",
    query: `mutation McpReplaceDocumentData($id: ID!, $workspaceId: ID!, $collectionId: ID!, $input: documentDataUpdateInput!) {
      replaceDocumentData(id: $id, workspaceId: $workspaceId, collectionId: $collectionId, input: $input) ${DOCUMENT_SELECTION}
    }`,
    variables: ({ id, workspaceId, collectionId, input }) => ({
      id,
      workspaceId,
      collectionId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_document_slug",
    title: "Update document slug",
    description:
      "Mutation updateDocumentSlug. Requires update on cms:workspaces:collections:documents:<collectionId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
      input: documentSlugUpdateInputSchema,
    },
    operationName: "McpUpdateDocumentSlug",
    query: `mutation McpUpdateDocumentSlug($id: ID!, $workspaceId: ID!, $collectionId: ID!, $input: documentSlugUpdateInput!) {
      updateDocumentSlug(id: $id, workspaceId: $workspaceId, collectionId: $collectionId, input: $input) ${DOCUMENT_SELECTION}
    }`,
    variables: ({ id, workspaceId, collectionId, input }) => ({
      id,
      workspaceId,
      collectionId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_documents",
    title: "Delete documents",
    description:
      "Mutation deleteDocuments. Requires update on cms:workspaces:collections:documents:<collectionId>. Returns deleted ids.",
    inputSchema: {
      ids: z.array(z.string().min(1)).min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
    },
    operationName: "McpDeleteDocuments",
    query: `mutation McpDeleteDocuments($ids: [ID!]!, $workspaceId: ID!, $collectionId: ID!) {
      deleteDocuments(ids: $ids, workspaceId: $workspaceId, collectionId: $collectionId)
    }`,
    variables: ({ ids, workspaceId, collectionId }) => ({
      ids,
      workspaceId,
      collectionId,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_duplicate_documents",
    title: "Duplicate documents",
    description:
      "Mutation duplicateDocuments. Requires update on cms:workspaces:collections:documents:<collectionId>.",
    inputSchema: {
      ids: z.array(z.string().min(1)).min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
    },
    operationName: "McpDuplicateDocuments",
    query: `mutation McpDuplicateDocuments($ids: [ID!]!, $workspaceId: ID!, $collectionId: ID!) {
      duplicateDocuments(ids: $ids, workspaceId: $workspaceId, collectionId: $collectionId) ${DOCUMENT_SELECTION}
    }`,
    variables: ({ ids, workspaceId, collectionId }) => ({
      ids,
      workspaceId,
      collectionId,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_publish_document",
    title: "Publish document",
    description:
      "Mutation publishDocument. Requires update on cms:workspaces:collections:documents:document-versions:<collectionId>. Returns documentVersionRecord metadata.",
    inputSchema: {
      documentId: z.string().min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
      input: documentPublishInputSchema.optional(),
    },
    operationName: "McpPublishDocument",
    query: `mutation McpPublishDocument($documentId: ID!, $workspaceId: ID!, $collectionId: ID!, $input: documentPublishInput) {
      publishDocument(documentId: $documentId, workspaceId: $workspaceId, collectionId: $collectionId, input: $input) ${DOCUMENT_VERSION_SELECTION}
    }`,
    variables: ({ documentId, workspaceId, collectionId, input }) => ({
      documentId,
      workspaceId,
      collectionId,
      ...(input !== undefined ? { input } : {}),
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_rollback_document",
    title: "Rollback document",
    description:
      "Mutation rollbackDocument. Requires update on cms:workspaces:collections:documents:document-versions:<collectionId>. Creates a new version from the target.",
    inputSchema: {
      documentId: z.string().min(1),
      workspaceId: z.string().min(1),
      collectionId: z.string().min(1),
      version: z.number().int(),
    },
    operationName: "McpRollbackDocument",
    query: `mutation McpRollbackDocument($documentId: ID!, $workspaceId: ID!, $collectionId: ID!, $version: Int!) {
      rollbackDocument(documentId: $documentId, workspaceId: $workspaceId, collectionId: $collectionId, version: $version) ${DOCUMENT_VERSION_SELECTION}
    }`,
    variables: ({ documentId, workspaceId, collectionId, version }) => ({
      documentId,
      workspaceId,
      collectionId,
      version,
    }),
  })
}
