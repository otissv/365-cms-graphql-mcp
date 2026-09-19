import { z } from "zod"
import { jsonSchema, registerMutationTool } from "./shared.js"

const formSubmissionCreateInputSchema = z.object({
  source: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  utm: jsonSchema.optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  data: jsonSchema.optional(),
  notes: z.string().optional(),
})

const SUBMISSION_SELECTION = `{
  id
  formId
  formType
  formName
  source
  email
  name
  phone
  pageUrl
  referrer
  utm
  data
  status
  notes
  createdAt
  updatedAt
}`

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {(config: object, input: object) => Promise<object>} requestGraphql
 */
export function registerFormSubmissionMutationTools(
  server,
  config,
  requestGraphql
) {
  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_create_form_submission",
    title: "Create form submission",
    description:
      "Mutation createFormSubmission. Requires update on cms:forms:<formId>:<stage>. formType/formName are set server-side from the form.",
    inputSchema: {
      formId: z.string().min(1),
      input: formSubmissionCreateInputSchema,
    },
    operationName: "McpCreateFormSubmission",
    query: `mutation McpCreateFormSubmission($formId: ID!, $input: formSubmissionCreateInput!) {
      createFormSubmission(formId: $formId, input: $input) ${SUBMISSION_SELECTION}
    }`,
    variables: ({ formId, input }) => ({ formId, input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_form_submission",
    title: "Delete form submission",
    description:
      "Mutation deleteFormSubmission. Requires update on cms:forms:<formId>:<stage>. Returns the deleted id.",
    inputSchema: {
      id: z.string().min(1),
      formId: z.string().min(1),
    },
    operationName: "McpDeleteFormSubmission",
    query: `mutation McpDeleteFormSubmission($id: ID!, $formId: ID!) {
      deleteFormSubmission(id: $id, formId: $formId)
    }`,
    variables: ({ id, formId }) => ({ id, formId }),
  })
}
