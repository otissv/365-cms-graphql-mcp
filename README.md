# 365 CMS GraphQL MCP server

Standalone MCP server (stdio) that HMAC-signs requests to 365 CMS GraphQL so agents can introspect the schema and run operations without holding the HMAC secret in the client.

This folder is outside the CMS pnpm workspace (`ignore-workspace=true`). It is not part of the production CMS process. The API key and HMAC secret stay in this process’s environment.

## Tools

| Tool | Purpose |
|---|---|
| `graphql_health` | `query { health }` connectivity check |
| `graphql_list_types` | Introspect root types and type names by kind |
| `graphql_describe_type` | Introspect one type (fields, args, inputs, enums) |
| `graphql_query` | Execute a GraphQL query or mutation |
| `graphql_create_form` / `graphql_update_form` / `graphql_delete_form` | Form CRUD |
| `graphql_*_form_section` / `graphql_*_form_field` | Form section/field create/update/delete/duplicate |
| `graphql_create_form_submission` / `graphql_delete_form_submission` | Form submissions |
| `graphql_create_workspace` / `graphql_update_workspace` / `graphql_delete_workspace` | Workspaces |
| `graphql_create_collection` / `graphql_update_collection` / `graphql_delete_collection` | Collections |
| `graphql_create_column` / `graphql_update_column` / `graphql_delete_column` | Columns (not for `sub-collection` type) |
| `graphql_add_document_sub_collection` / `graphql_add_page_sub_collection` / `graphql_remove_document_sub_collection` / `graphql_remove_page_sub_collection` | Sub-collections (orchestrated) |
| `graphql_create_document` / `graphql_update_document_data` / `graphql_replace_document_data` / `graphql_update_document_slug` / `graphql_delete_documents` / `graphql_duplicate_documents` | Documents |
| `graphql_publish_document` / `graphql_rollback_document` | Document versions |
| `graphql_create_page` / `graphql_update_page` / `graphql_delete_page` | Pages |
| `graphql_*_page_section` / `graphql_replace_page_section_data` | Page sections |
| `graphql_*_page_section_field` | Page section fields |
| `graphql_update_page_seo` | Page SEO |
| `graphql_*_page_redirect` | Page redirects |
| `graphql_publish_page` / `graphql_rollback_page` | Page versions |
| `graphql_update_organization` / `graphql_delete_organization` | Organization |
| `graphql_update_member_role` / `graphql_remove_member` | Members |
| `graphql_invite_members` / `graphql_cancel_invitation` | Invitations |
| `graphql_update_profile` / `graphql_change_password` | Profile (API key owner) |

Optional `stage` on each tool: `draft` or `published`. It only rewrites the last path segment when `UPSTREAM_GRAPHQL_URL` already ends with `/draft` or `/published`. Prefer **draft** for writes.

Mutations are **not** draft/published-versioned; stage only selects the endpoint and ACL key suffix. Versioned GraphQL endpoints remain read-only. Dedicated tools map 1:1 to CMS `Mutation` fields documented in `docs/graphql.md`. You can still run the same operations via `graphql_query`; dedicated tools are preferred for structured args.

## Setup

```bash
cd mcp
cp .env.example .env
# Set CMS_API_KEY, CMS_API_SECRET, and UPSTREAM_GRAPHQL_URL
# e.g. UPSTREAM_GRAPHQL_URL=http://localhost:3000/api/cms/graphql/draft
pnpm install
pnpm start
```

`src/server.js` does not load `.env` by itself unless you pass `--env-file` (the `start` script does).

## Required environment variables

- `CMS_API_KEY` — CMS API key (server-only in this process)
- `CMS_API_SECRET` — base64 HMAC secret for that key (server-only in this process)
- `UPSTREAM_GRAPHQL_URL` — CMS stage endpoint (default `http://localhost:3000/api/cms/graphql/published`)

Signing follows `docs/graphql.md` (`METHOD`, `PATH_WITH_QUERY`, body hash, nonce, timestamp). Requests are POST JSON only.

## Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "365-cms-graphql": {
      "command": "node",
      "args": [
        "--env-file=${workspaceFolder}/mcp/.env",
        "${workspaceFolder}/mcp/src/server.js"
      ]
    }
  }
}
```

Cursor runs MCP commands from the workspace root and does not honor a relative `cwd` for this server. Keep the `mcp/` prefix (or `${workspaceFolder}/mcp`) on both the env file and entrypoint.

Reload MCP after changing env or this server.

## Notes

- CMS GraphQL rejects browser `Origin` / CORS / cookies on the CMS origin. This server is a Node S2S client.
- `graphql_list_types` and `graphql_describe_type` need an API key with the stage `introspect` permission; otherwise complexity limits may reject introspection. Mutation tools do **not** require introspection.
- Mutation fields are omitted from the compiled schema when the key lacks the matching write ACL; tools will then return GraphQL validation errors.
- Keep HMAC secrets out of agent transcripts and client configs; put them only in `mcp/.env`.
