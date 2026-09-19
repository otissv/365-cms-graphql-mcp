import { z } from "zod"
import { jsonSchema, registerMutationTool } from "./shared.js"

const pageCreateInputSchema = z.object({
  workspaceId: z.string().min(1),
  parentId: z.string().min(1).optional(),
  slug: z.string().min(1),
  internalName: z.string().min(1),
  title: z.string().min(1),
  headerImageId: z.string().min(1).optional(),
  headerImageUrl: z.string().optional(),
  headerImageAlt: z.string().optional(),
  summary: z.string().optional(),
  pageType: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  navLabel: z.string().optional(),
  menuHidden: z.boolean().optional(),
  sitemapHidden: z.boolean().optional(),
  permission: z.string().optional(),
  errors: jsonSchema.optional(),
})

const pageUpdateInputSchema = z.object({
  parentId: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  internalName: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  headerImageId: z.string().min(1).optional(),
  headerImageUrl: z.string().optional(),
  headerImageAlt: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  navLabel: z.string().optional(),
  menuHidden: z.boolean().optional(),
  sitemapHidden: z.boolean().optional(),
  sectionOrder: z.array(z.string()).optional(),
  errors: jsonSchema.optional(),
})

const pageSectionCreateInputSchema = z.object({
  workspaceId: z.string().min(1),
  pageId: z.string().min(1),
  name: z.string().min(1),
  anchorId: z.string().optional(),
})

const pageSectionUpdateInputSchema = z.object({
  name: z.string().min(1).optional(),
  anchorId: z.string().optional(),
  data: jsonSchema.optional(),
  errors: jsonSchema.optional(),
  fieldOrder: z.array(z.number().int()).optional(),
})

const pageSectionDataReplaceInputSchema = z.object({
  data: jsonSchema,
  errors: jsonSchema.optional(),
})

const pageSectionDuplicateInputSchema = z.object({
  insertAfterId: z.string().min(1),
  name: z.string().min(1),
  anchorId: z.string().optional(),
})

const pageSectionFieldSortDirectionSchema = z.enum(["asc", "desc"])
const pageSectionFieldIndexNullsSchema = z.enum(["first", "last"])

const pageSectionFieldIndexInputSchema = z.object({
  direction: pageSectionFieldSortDirectionSchema,
  nulls: pageSectionFieldIndexNullsSchema,
})

const pageSectionFieldCreateInputSchema = z.object({
  workspaceId: z.string().min(1),
  pageId: z.string().min(1),
  sectionId: z.string().min(1),
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
  sortBy: pageSectionFieldSortDirectionSchema.optional(),
  visibility: z.boolean().optional(),
  index: pageSectionFieldIndexInputSchema.optional(),
})

const pageSectionFieldUpdateInputSchema = z.object({
  columnName: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  help: z.string().optional(),
  fieldOptions: jsonSchema.optional(),
  validation: jsonSchema.optional(),
  enableDelete: z.boolean().optional(),
  enableSort: z.boolean().optional(),
  enableHide: z.boolean().optional(),
  enableFilter: z.boolean().optional(),
  sortBy: pageSectionFieldSortDirectionSchema.optional(),
  visibility: z.boolean().optional(),
  index: pageSectionFieldIndexInputSchema.optional(),
})

const pageSeoUpdateInputSchema = z.object({
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  robotsIndex: z.boolean().optional(),
  robotsFollow: z.boolean().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImageId: z.string().min(1).optional(),
  ogImageUrl: z.string().optional(),
  ogImageAlt: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImageId: z.string().min(1).optional(),
  twitterImageUrl: z.string().optional(),
  twitterCard: z.string().optional(),
  schemaType: z.string().optional(),
  schemaJson: jsonSchema.optional(),
})

const pageRedirectTypeSchema = z.enum([
  "HTTP_301",
  "HTTP_302",
  "HTTP_307",
  "HTTP_308",
])

const pageRedirectCreateInputSchema = z.object({
  workspaceId: z.string().min(1),
  pageId: z.string().min(1),
  fromPath: z.string().min(1),
  redirectType: pageRedirectTypeSchema.optional(),
  isActive: z.boolean().optional(),
  note: z.string().optional(),
})

const pageRedirectUpdateInputSchema = z.object({
  fromPath: z.string().min(1).optional(),
  redirectType: pageRedirectTypeSchema.optional(),
  isActive: z.boolean().optional(),
  note: z.string().optional(),
})

const pagePublishInputSchema = z.object({
  note: z.string().optional(),
})

const PAGE_SELECTION = `{
  id
  workspaceId
  parentId
  slug
  internalName
  title
  summary
  pageType
  description
  navLabel
  menuHidden
  sitemapHidden
  sectionOrder
  status
  publishedVersionId
  publishedAt
  updatedAt
}`

const PAGE_SECTION_SELECTION = `{
  id
  pageId
  workspaceId
  sectionType
  name
  anchorId
  data
  errors
  fieldOrder
}`

const PAGE_SECTION_FIELD_SELECTION = `{
  id
  workspaceId
  pageId
  sectionId
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

const PAGE_SEO_SELECTION = `{
  pageId
  seoTitle
  metaDescription
  canonicalUrl
  robotsIndex
  robotsFollow
  ogTitle
  ogDescription
  ogImageId
  ogImageUrl
  ogImageAlt
  twitterTitle
  twitterDescription
  twitterImageId
  twitterImageUrl
  twitterCard
  schemaType
  schemaJson
}`

const PAGE_REDIRECT_SELECTION = `{
  id
  pageId
  workspaceId
  fromPath
  redirectType
  isActive
  note
  updatedAt
}`

const PAGE_VERSION_SELECTION = `{
  id
  pageId
  workspaceId
  pageSchemaSnapshotId
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
export function registerPagesMutationTools(server, config, requestGraphql) {
  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_create_page",
    title: "Create page",
    description:
      "Mutation createPage. Requires create on cms:workspaces:sites:pages. Prefer draft stage for writes.",
    inputSchema: { input: pageCreateInputSchema },
    operationName: "McpCreatePage",
    query: `mutation McpCreatePage($input: pageCreateInput!) {
      createPage(input: $input) ${PAGE_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_page",
    title: "Update page",
    description:
      "Mutation updatePage. Requires update on cms:workspaces:sites:pages:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      input: pageUpdateInputSchema,
    },
    operationName: "McpUpdatePage",
    query: `mutation McpUpdatePage($id: ID!, $workspaceId: ID!, $input: pageUpdateInput!) {
      updatePage(id: $id, workspaceId: $workspaceId, input: $input) ${PAGE_SELECTION}
    }`,
    variables: ({ id, workspaceId, input }) => ({ id, workspaceId, input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_page",
    title: "Delete page",
    description:
      "Mutation deletePage. Requires delete on cms:workspaces:sites:pages:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
    },
    operationName: "McpDeletePage",
    query: `mutation McpDeletePage($id: ID!, $workspaceId: ID!) {
      deletePage(id: $id, workspaceId: $workspaceId)
    }`,
    variables: ({ id, workspaceId }) => ({ id, workspaceId }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_create_page_section",
    title: "Create page section",
    description:
      "Mutation createPageSection. Requires update on cms:workspaces:sites:pages:sections:<workspaceId>.",
    inputSchema: { input: pageSectionCreateInputSchema },
    operationName: "McpCreatePageSection",
    query: `mutation McpCreatePageSection($input: pageSectionCreateInput!) {
      createPageSection(input: $input) ${PAGE_SECTION_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_page_section",
    title: "Update page section",
    description:
      "Mutation updatePageSection. Merges section data. Requires update on cms:workspaces:sites:pages:sections:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
      input: pageSectionUpdateInputSchema,
    },
    operationName: "McpUpdatePageSection",
    query: `mutation McpUpdatePageSection($id: ID!, $workspaceId: ID!, $pageId: ID!, $input: pageSectionUpdateInput!) {
      updatePageSection(id: $id, workspaceId: $workspaceId, pageId: $pageId, input: $input) ${PAGE_SECTION_SELECTION}
    }`,
    variables: ({ id, workspaceId, pageId, input }) => ({
      id,
      workspaceId,
      pageId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_replace_page_section_data",
    title: "Replace page section data",
    description:
      "Mutation replacePageSectionData. Replaces section data. Requires update on cms:workspaces:sites:pages:sections:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
      input: pageSectionDataReplaceInputSchema,
    },
    operationName: "McpReplacePageSectionData",
    query: `mutation McpReplacePageSectionData($id: ID!, $workspaceId: ID!, $pageId: ID!, $input: pageSectionDataReplaceInput!) {
      replacePageSectionData(id: $id, workspaceId: $workspaceId, pageId: $pageId, input: $input) ${PAGE_SECTION_SELECTION}
    }`,
    variables: ({ id, workspaceId, pageId, input }) => ({
      id,
      workspaceId,
      pageId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_page_section",
    title: "Delete page section",
    description:
      "Mutation deletePageSection. Requires update on cms:workspaces:sites:pages:sections:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
    },
    operationName: "McpDeletePageSection",
    query: `mutation McpDeletePageSection($id: ID!, $workspaceId: ID!, $pageId: ID!) {
      deletePageSection(id: $id, workspaceId: $workspaceId, pageId: $pageId)
    }`,
    variables: ({ id, workspaceId, pageId }) => ({ id, workspaceId, pageId }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_duplicate_page_section",
    title: "Duplicate page section",
    description:
      "Mutation duplicatePageSection. Requires update on cms:workspaces:sites:pages:sections:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
      input: pageSectionDuplicateInputSchema,
    },
    operationName: "McpDuplicatePageSection",
    query: `mutation McpDuplicatePageSection($id: ID!, $workspaceId: ID!, $pageId: ID!, $input: pageSectionDuplicateInput!) {
      duplicatePageSection(id: $id, workspaceId: $workspaceId, pageId: $pageId, input: $input) ${PAGE_SECTION_SELECTION}
    }`,
    variables: ({ id, workspaceId, pageId, input }) => ({
      id,
      workspaceId,
      pageId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_create_page_section_field",
    title: "Create page section field",
    description:
      "Mutation createPageSectionField. Requires update on cms:workspaces:sites:pages:sections:fields:<workspaceId>. fieldId is create-only.",
    inputSchema: { input: pageSectionFieldCreateInputSchema },
    operationName: "McpCreatePageSectionField",
    query: `mutation McpCreatePageSectionField($input: pageSectionFieldCreateInput!) {
      createPageSectionField(input: $input) ${PAGE_SECTION_FIELD_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_page_section_field",
    title: "Update page section field",
    description:
      "Mutation updatePageSectionField. Requires update on cms:workspaces:sites:pages:sections:fields:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
      sectionId: z.string().min(1),
      input: pageSectionFieldUpdateInputSchema,
    },
    operationName: "McpUpdatePageSectionField",
    query: `mutation McpUpdatePageSectionField($id: ID!, $workspaceId: ID!, $pageId: ID!, $sectionId: ID!, $input: pageSectionFieldUpdateInput!) {
      updatePageSectionField(id: $id, workspaceId: $workspaceId, pageId: $pageId, sectionId: $sectionId, input: $input) ${PAGE_SECTION_FIELD_SELECTION}
    }`,
    variables: ({ id, workspaceId, pageId, sectionId, input }) => ({
      id,
      workspaceId,
      pageId,
      sectionId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_page_section_field",
    title: "Delete page section field",
    description:
      "Mutation deletePageSectionField. Requires update on cms:workspaces:sites:pages:sections:fields:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
      sectionId: z.string().min(1),
    },
    operationName: "McpDeletePageSectionField",
    query: `mutation McpDeletePageSectionField($id: ID!, $workspaceId: ID!, $pageId: ID!, $sectionId: ID!) {
      deletePageSectionField(id: $id, workspaceId: $workspaceId, pageId: $pageId, sectionId: $sectionId)
    }`,
    variables: ({ id, workspaceId, pageId, sectionId }) => ({
      id,
      workspaceId,
      pageId,
      sectionId,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_page_seo",
    title: "Update page SEO",
    description:
      "Mutation updatePageSeo. Upserts SEO. Requires update on cms:workspaces:sites:pages:seo:<workspaceId>.",
    inputSchema: {
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
      input: pageSeoUpdateInputSchema,
    },
    operationName: "McpUpdatePageSeo",
    query: `mutation McpUpdatePageSeo($workspaceId: ID!, $pageId: ID!, $input: pageSeoUpdateInput!) {
      updatePageSeo(workspaceId: $workspaceId, pageId: $pageId, input: $input) ${PAGE_SEO_SELECTION}
    }`,
    variables: ({ workspaceId, pageId, input }) => ({
      workspaceId,
      pageId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_create_page_redirect",
    title: "Create page redirect",
    description:
      "Mutation createPageRedirect. Requires create on cms:workspaces:sites:pages:redirects. redirectType is HTTP_301|HTTP_302|HTTP_307|HTTP_308.",
    inputSchema: { input: pageRedirectCreateInputSchema },
    operationName: "McpCreatePageRedirect",
    query: `mutation McpCreatePageRedirect($input: pageRedirectCreateInput!) {
      createPageRedirect(input: $input) ${PAGE_REDIRECT_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_page_redirect",
    title: "Update page redirect",
    description:
      "Mutation updatePageRedirect. Requires update on cms:workspaces:sites:pages:redirects:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
      input: pageRedirectUpdateInputSchema,
    },
    operationName: "McpUpdatePageRedirect",
    query: `mutation McpUpdatePageRedirect($id: ID!, $workspaceId: ID!, $pageId: ID!, $input: pageRedirectUpdateInput!) {
      updatePageRedirect(id: $id, workspaceId: $workspaceId, pageId: $pageId, input: $input) ${PAGE_REDIRECT_SELECTION}
    }`,
    variables: ({ id, workspaceId, pageId, input }) => ({
      id,
      workspaceId,
      pageId,
      input,
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_page_redirect",
    title: "Delete page redirect",
    description:
      "Mutation deletePageRedirect. Requires delete on cms:workspaces:sites:pages:redirects:<workspaceId>.",
    inputSchema: {
      id: z.string().min(1),
      workspaceId: z.string().min(1),
      pageId: z.string().min(1),
    },
    operationName: "McpDeletePageRedirect",
    query: `mutation McpDeletePageRedirect($id: ID!, $workspaceId: ID!, $pageId: ID!) {
      deletePageRedirect(id: $id, workspaceId: $workspaceId, pageId: $pageId)
    }`,
    variables: ({ id, workspaceId, pageId }) => ({ id, workspaceId, pageId }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_publish_page",
    title: "Publish page",
    description:
      "Mutation publishPage. Requires update on cms:workspaces:sites:pages:page-versions:<workspaceId>. Returns pageVersionRecord metadata.",
    inputSchema: {
      pageId: z.string().min(1),
      workspaceId: z.string().min(1),
      input: pagePublishInputSchema.optional(),
    },
    operationName: "McpPublishPage",
    query: `mutation McpPublishPage($pageId: ID!, $workspaceId: ID!, $input: pagePublishInput) {
      publishPage(pageId: $pageId, workspaceId: $workspaceId, input: $input) ${PAGE_VERSION_SELECTION}
    }`,
    variables: ({ pageId, workspaceId, input }) => ({
      pageId,
      workspaceId,
      ...(input !== undefined ? { input } : {}),
    }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_rollback_page",
    title: "Rollback page",
    description:
      "Mutation rollbackPage. Requires update on cms:workspaces:sites:pages:page-versions:<workspaceId>. Creates a new version from the target.",
    inputSchema: {
      pageId: z.string().min(1),
      workspaceId: z.string().min(1),
      version: z.number().int(),
    },
    operationName: "McpRollbackPage",
    query: `mutation McpRollbackPage($pageId: ID!, $workspaceId: ID!, $version: Int!) {
      rollbackPage(pageId: $pageId, workspaceId: $workspaceId, version: $version) ${PAGE_VERSION_SELECTION}
    }`,
    variables: ({ pageId, workspaceId, version }) => ({
      pageId,
      workspaceId,
      version,
    }),
  })
}
