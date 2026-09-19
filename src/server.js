#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { registerGraphqlTools } from "./tools.js"

const apiKey = process.env.CMS_GRAPHQL_API_KEY
const secretB64 = process.env.CMS_GRAPHQL_API_SECRET_B64
const upstreamRaw =
  process.env.UPSTREAM_GRAPHQL_URL ||
  "http://localhost:3000/api/cms/graphql/published"

if (!apiKey || !secretB64) {
  console.error(
    "Missing required env vars: CMS_GRAPHQL_API_KEY and CMS_GRAPHQL_API_SECRET_B64"
  )
  process.exit(1)
}

let upstreamUrl
try {
  upstreamUrl = new URL(upstreamRaw)
} catch {
  console.error(`Invalid UPSTREAM_GRAPHQL_URL: ${upstreamRaw}`)
  process.exit(1)
}

const server = new McpServer({
  name: "365-cms-graphql",
  version: "0.3.0",
  instructions: [
    "This MCP server HMAC-signs requests to 365 CMS GraphQL.",
    `Default upstream: ${upstreamUrl.toString()}`,
    "Workflow: graphql_health, then graphql_list_types, then graphql_describe_type on Query or Mutation, then dedicated graphql_* mutation tools or graphql_query for ad-hoc ops.",
    "Dedicated mutation tools cover forms (+ submissions), workspaces, collections, columns, documents (+ publish/rollback), pages (+ sections/fields/seo/redirects/publish/rollback), organization, members, invitations, and profile.",
    "Mutations are not stage-versioned; stage only selects the endpoint and ACL key suffix. Prefer draft for writes. Stage access plus the matching resource action is required.",
    'Optional stage is "draft" or "published" and only rewrites the last path segment when the upstream URL already ends with those names.',
    "Do not send Origin, Cookie, or Fetch Metadata headers; this process signs server-to-server.",
  ].join(" "),
})

registerGraphqlTools(server, {
  upstreamUrl,
  apiKey,
  secretB64,
})

const transport = new StdioServerTransport()
await server.connect(transport)
