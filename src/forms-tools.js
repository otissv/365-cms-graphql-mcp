import { z } from "zod"

const stageSchema = z.enum(["draft", "published"]).optional()

const formStatusSchema = z.enum(["active", "archived"])
const formFieldTypeSchema = z.enum([
  "text",
  "paragraph",
  "number",
  "multiSelect",
  "select",
  "file",
  "date",
  "time",
])

const formCreateInputSchema = z.object({
  internalName: z.string().min(1),
  notes: z.string().optional(),
  description: z.string().optional(),
  sectionOrder: z.array(z.string()).optional(),
})

const formUpdateInputSchema = z.object({
  internalName: z.string().min(1).optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
  status: formStatusSchema.optional(),
  sectionOrder: z.array(z.string()).optional(),
})

const formSectionCreateInputSchema = z.object({
  formId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  fieldOrder: z.array(z.string()).optional(),
})

const formSectionUpdateInputSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  fieldOrder: z.array(z.string()).optional(),
})

const formFieldCreateInputSchema = z.object({
  formId: z.string().min(1),
  formSectionId: z.string().min(1),
  name: z.string().min(1),
  label: z.string().min(1),
  type: formFieldTypeSchema,
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  items: z.unknown().optional(),
  fieldOptions: z.unknown().optional(),
})

const formFieldUpdateInputSchema = z.object({
  formSectionId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  type: formFieldTypeSchema.optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  items: z.unknown().optional(),
  fieldOptions: z.unknown().optional(),
})

const FORM_SELECTION = `{
  id
  organizationId
  internalName
  description
  notes
  status
  sectionOrder
}`

const SECTION_SELECTION = `{
  id
  formId
  name
  description
  fieldOrder
}`

const FIELD_SELECTION = `{
  id
  formId
  formSectionId
  name
  label
  type
  description
  placeholder
  required
  items
  fieldOptions
}`

/**
 * Register CMS form Mutation tools (create/update/delete + sections/fields).
 *
 * Requires API key stage `access` plus form write ACL (`create` / `update` /
 * `delete` on `cms:forms…`). Forms are not stage-versioned; stage only picks
 * the endpoint + ACL key suffix.
 *
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {(config: object, input: object) => Promise<object>} requestGraphql
 */
export function registerFormsMutationTools(server, config, requestGraphql) {
  server.registerTool(
    "graphql_create_form",
    {
      title: "Create form",
      description:
        "Mutation createForm. Requires cms:forms:<stage> create. Seeds a default section + text field. Prefer draft stage for writes.",
      inputSchema: {
        input: formCreateInputSchema,
        stage: stageSchema,
      },
    },
    async ({ input, stage }) =>
      requestGraphql(config, {
        query: `mutation McpCreateForm($input: formCreateInput!) {
          createForm(input: $input) ${FORM_SELECTION}
        }`,
        variables: { input },
        operationName: "McpCreateForm",
        stage,
      })
  )

  server.registerTool(
    "graphql_update_form",
    {
      title: "Update form",
      description:
        "Mutation updateForm. Requires cms:forms:<formId>:<stage> update. status is formStatus (active|archived).",
      inputSchema: {
        id: z.string().min(1),
        input: formUpdateInputSchema,
        stage: stageSchema,
      },
    },
    async ({ id, input, stage }) =>
      requestGraphql(config, {
        query: `mutation McpUpdateForm($id: ID!, $input: formUpdateInput!) {
          updateForm(id: $id, input: $input) ${FORM_SELECTION}
        }`,
        variables: { id, input },
        operationName: "McpUpdateForm",
        stage,
      })
  )

  server.registerTool(
    "graphql_delete_form",
    {
      title: "Delete form",
      description:
        "Mutation deleteForm. Requires cms:forms:<formId>:<stage> delete. Returns the deleted id.",
      inputSchema: {
        id: z.string().min(1),
        stage: stageSchema,
      },
    },
    async ({ id, stage }) =>
      requestGraphql(config, {
        query: `mutation McpDeleteForm($id: ID!) {
          deleteForm(id: $id)
        }`,
        variables: { id },
        operationName: "McpDeleteForm",
        stage,
      })
  )

  server.registerTool(
    "graphql_create_form_section",
    {
      title: "Create form section",
      description:
        "Mutation createFormSection. Requires update on cms:forms:<formId>:<stage>. Pass formInternalName and input.formId.",
      inputSchema: {
        formInternalName: z.string().min(1),
        input: formSectionCreateInputSchema,
        stage: stageSchema,
      },
    },
    async ({ formInternalName, input, stage }) =>
      requestGraphql(config, {
        query: `mutation McpCreateFormSection($formInternalName: String!, $input: formSectionCreateInput!) {
          createFormSection(formInternalName: $formInternalName, input: $input) ${SECTION_SELECTION}
        }`,
        variables: { formInternalName, input },
        operationName: "McpCreateFormSection",
        stage,
      })
  )

  server.registerTool(
    "graphql_update_form_section",
    {
      title: "Update form section",
      description:
        "Mutation updateFormSection. Requires update on cms:forms:<formId>:<stage>.",
      inputSchema: {
        id: z.string().min(1),
        formInternalName: z.string().min(1),
        formId: z.string().min(1),
        input: formSectionUpdateInputSchema,
        stage: stageSchema,
      },
    },
    async ({ id, formInternalName, formId, input, stage }) =>
      requestGraphql(config, {
        query: `mutation McpUpdateFormSection($id: ID!, $formInternalName: String!, $formId: ID!, $input: formSectionUpdateInput!) {
          updateFormSection(id: $id, formInternalName: $formInternalName, formId: $formId, input: $input) ${SECTION_SELECTION}
        }`,
        variables: { id, formInternalName, formId, input },
        operationName: "McpUpdateFormSection",
        stage,
      })
  )

  server.registerTool(
    "graphql_delete_form_section",
    {
      title: "Delete form section",
      description:
        "Mutation deleteFormSection. Requires update on cms:forms:<formId>:<stage>.",
      inputSchema: {
        id: z.string().min(1),
        formInternalName: z.string().min(1),
        formId: z.string().min(1),
        stage: stageSchema,
      },
    },
    async ({ id, formInternalName, formId, stage }) =>
      requestGraphql(config, {
        query: `mutation McpDeleteFormSection($id: ID!, $formInternalName: String!, $formId: ID!) {
          deleteFormSection(id: $id, formInternalName: $formInternalName, formId: $formId)
        }`,
        variables: { id, formInternalName, formId },
        operationName: "McpDeleteFormSection",
        stage,
      })
  )

  server.registerTool(
    "graphql_duplicate_form_section",
    {
      title: "Duplicate form section",
      description:
        "Mutation duplicateFormSection. Requires update on cms:forms:<formId>:<stage>.",
      inputSchema: {
        id: z.string().min(1),
        formInternalName: z.string().min(1),
        formId: z.string().min(1),
        name: z.string().min(1),
        stage: stageSchema,
      },
    },
    async ({ id, formInternalName, formId, name, stage }) =>
      requestGraphql(config, {
        query: `mutation McpDuplicateFormSection($id: ID!, $formInternalName: String!, $formId: ID!, $name: String!) {
          duplicateFormSection(id: $id, formInternalName: $formInternalName, formId: $formId, name: $name) ${SECTION_SELECTION}
        }`,
        variables: { id, formInternalName, formId, name },
        operationName: "McpDuplicateFormSection",
        stage,
      })
  )

  server.registerTool(
    "graphql_create_form_field",
    {
      title: "Create form field",
      description:
        "Mutation createFormField. Requires update on cms:forms:<formId>:<stage>. type is formFieldType (text|paragraph|number|multiSelect|select|file|date|time). Returns fieldOptions.",
      inputSchema: {
        formInternalName: z.string().min(1),
        input: formFieldCreateInputSchema,
        stage: stageSchema,
      },
    },
    async ({ formInternalName, input, stage }) =>
      requestGraphql(config, {
        query: `mutation McpCreateFormField($formInternalName: String!, $input: formFieldCreateInput!) {
          createFormField(formInternalName: $formInternalName, input: $input) ${FIELD_SELECTION}
        }`,
        variables: { formInternalName, input },
        operationName: "McpCreateFormField",
        stage,
      })
  )

  server.registerTool(
    "graphql_update_form_field",
    {
      title: "Update form field",
      description:
        "Mutation updateFormField. Requires update on cms:forms:<formId>:<stage>. Optional formSectionId reparents within the form; type is formFieldType.",
      inputSchema: {
        id: z.string().min(1),
        formInternalName: z.string().min(1),
        formId: z.string().min(1),
        input: formFieldUpdateInputSchema,
        stage: stageSchema,
      },
    },
    async ({ id, formInternalName, formId, input, stage }) =>
      requestGraphql(config, {
        query: `mutation McpUpdateFormField($id: ID!, $formInternalName: String!, $formId: ID!, $input: formFieldUpdateInput!) {
          updateFormField(id: $id, formInternalName: $formInternalName, formId: $formId, input: $input) ${FIELD_SELECTION}
        }`,
        variables: { id, formInternalName, formId, input },
        operationName: "McpUpdateFormField",
        stage,
      })
  )

  server.registerTool(
    "graphql_delete_form_field",
    {
      title: "Delete form field",
      description:
        "Mutation deleteFormField. Requires update on cms:forms:<formId>:<stage>.",
      inputSchema: {
        id: z.string().min(1),
        formInternalName: z.string().min(1),
        formId: z.string().min(1),
        stage: stageSchema,
      },
    },
    async ({ id, formInternalName, formId, stage }) =>
      requestGraphql(config, {
        query: `mutation McpDeleteFormField($id: ID!, $formInternalName: String!, $formId: ID!) {
          deleteFormField(id: $id, formInternalName: $formInternalName, formId: $formId)
        }`,
        variables: { id, formInternalName, formId },
        operationName: "McpDeleteFormField",
        stage,
      })
  )

  server.registerTool(
    "graphql_duplicate_form_field",
    {
      title: "Duplicate form field",
      description:
        "Mutation duplicateFormField. Requires update on cms:forms:<formId>:<stage>.",
      inputSchema: {
        id: z.string().min(1),
        formInternalName: z.string().min(1),
        formId: z.string().min(1),
        name: z.string().min(1),
        stage: stageSchema,
      },
    },
    async ({ id, formInternalName, formId, name, stage }) =>
      requestGraphql(config, {
        query: `mutation McpDuplicateFormField($id: ID!, $formInternalName: String!, $formId: ID!, $name: String!) {
          duplicateFormField(id: $id, formInternalName: $formInternalName, formId: $formId, name: $name) ${FIELD_SELECTION}
        }`,
        variables: { id, formInternalName, formId, name },
        operationName: "McpDuplicateFormField",
        stage,
      })
  )
}
