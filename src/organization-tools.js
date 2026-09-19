import { z } from "zod"
import { registerMutationTool } from "./shared.js"

const organizationUpdateInputSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
})

const memberRoleUpdateInputSchema = z.object({
  role: z.string().min(1),
})

const invitationInviteInputSchema = z.object({
  email: z.string().min(1),
  role: z.string().min(1),
})

const profileUpdateInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
})

const changePasswordInputSchema = z.object({
  password: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
})

const ORGANIZATION_SELECTION = `{
  id
  slug
  name
  logo
  description
  tenantId
  updatedAt
}`

const MEMBER_SELECTION = `{
  id
  organizationId
  userId
  role
  name
  email
  image
  createdAt
  updatedAt
}`

const INVITATION_SELECTION = `{
  id
  organizationId
  organization
  email
  role
  status
  invitedById
  invitedBy
  expiresAt
  createdAt
  updatedAt
}`

const PROFILE_SELECTION = `{
  id
  name
  email
  image
  updatedAt
}`

/**
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {{ upstreamUrl: URL, apiKey: string, secretB64: string }} config
 * @param {(config: object, input: object) => Promise<object>} requestGraphql
 */
export function registerOrganizationMutationTools(
  server,
  config,
  requestGraphql
) {
  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_organization",
    title: "Update organization",
    description:
      "Mutation updateOrganization. Requires update on cms:organization. Org id comes from the API key binding.",
    inputSchema: { input: organizationUpdateInputSchema },
    operationName: "McpUpdateOrganization",
    query: `mutation McpUpdateOrganization($input: organizationUpdateInput!) {
      updateOrganization(input: $input) ${ORGANIZATION_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_delete_organization",
    title: "Delete organization",
    description:
      "Mutation deleteOrganization. Requires delete on cms:organization. Org id comes from the API key binding.",
    inputSchema: {},
    operationName: "McpDeleteOrganization",
    query: `mutation McpDeleteOrganization {
      deleteOrganization
    }`,
    variables: () => ({}),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_member_role",
    title: "Update member role",
    description:
      "Mutation updateMemberRole. Requires update on cms:organization:members:<memberId>. Role is a free-form string (owner|admin|member|viewer or custom).",
    inputSchema: {
      id: z.string().min(1),
      input: memberRoleUpdateInputSchema,
    },
    operationName: "McpUpdateMemberRole",
    query: `mutation McpUpdateMemberRole($id: ID!, $input: memberRoleUpdateInput!) {
      updateMemberRole(id: $id, input: $input) ${MEMBER_SELECTION}
    }`,
    variables: ({ id, input }) => ({ id, input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_remove_member",
    title: "Remove member",
    description:
      "Mutation removeMember. Requires delete on cms:organization:members:<memberId>.",
    inputSchema: { id: z.string().min(1) },
    operationName: "McpRemoveMember",
    query: `mutation McpRemoveMember($id: ID!) {
      removeMember(id: $id)
    }`,
    variables: ({ id }) => ({ id }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_invite_members",
    title: "Invite members",
    description:
      "Mutation inviteMembers. Requires create on cms:organization:members:invitations.",
    inputSchema: {
      input: z.array(invitationInviteInputSchema).min(1),
    },
    operationName: "McpInviteMembers",
    query: `mutation McpInviteMembers($input: [invitationInviteInput!]!) {
      inviteMembers(input: $input) ${INVITATION_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_cancel_invitation",
    title: "Cancel invitation",
    description:
      "Mutation cancelInvitation. Requires delete on cms:organization:members:invitations:<invitationId>.",
    inputSchema: { id: z.string().min(1) },
    operationName: "McpCancelInvitation",
    query: `mutation McpCancelInvitation($id: ID!) {
      cancelInvitation(id: $id) ${INVITATION_SELECTION}
    }`,
    variables: ({ id }) => ({ id }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_update_profile",
    title: "Update profile",
    description:
      "Mutation updateProfile. Updates the API key owner's profile. Requires update on cms:profile.",
    inputSchema: { input: profileUpdateInputSchema },
    operationName: "McpUpdateProfile",
    query: `mutation McpUpdateProfile($input: profileUpdateInput!) {
      updateProfile(input: $input) ${PROFILE_SELECTION}
    }`,
    variables: ({ input }) => ({ input }),
  })

  registerMutationTool(server, config, requestGraphql, {
    name: "graphql_change_password",
    title: "Change password",
    description:
      "Mutation changePassword. Changes the API key owner's password. Requires update on cms:profile.",
    inputSchema: { input: changePasswordInputSchema },
    operationName: "McpChangePassword",
    query: `mutation McpChangePassword($input: changePasswordInput!) {
      changePassword(input: $input)
    }`,
    variables: ({ input }) => ({ input }),
  })
}
