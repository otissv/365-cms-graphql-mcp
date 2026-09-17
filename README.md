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
| `graphql_create_form` | Mutation `createForm` |
| `graphql_update_form` | Mutation `updateForm` |
| `graphql_delete_form` | Mutation `deleteForm` |
| `graphql_create_form_section` | Mutation `createFormSection` |
| `graphql_update_form_section` | Mutation `updateFormSection` |
| `graphql_delete_form_section` | Mutation `deleteFormSection` |
| `graphql_duplicate_form_section` | Mutation `duplicateFormSection` |
| `graphql_create_form_field` | Mutation `createFormField` |
| `graphql_update_form_field` | Mutation `updateFormField` |
| `graphql_delete_form_field` | Mutation `deleteFormField` |
| `graphql_duplicate_form_field` | Mutation `duplicateFormField` |

Optional `stage` on each tool: `draft` or `published`. It only rewrites the last path segment when `UPSTREAM_GRAPHQL_URL` already ends with `/draft` or `/published`. Prefer **draft** for form writes.

## Form mutations

Forms are not draft/published-versioned; stage only selects the endpoint and ACL key suffix. The API key needs stage `access` plus:

| Tool | Resource action |
|---|---|
| `graphql_create_form` | `create` on `cms:forms` |
| `graphql_update_form` | `update` on `cms:forms:<formId>` |
| `graphql_delete_form` | `delete` on `cms:forms:<formId>` |
| section / field tools | `update` on `cms:forms:<formId>` |

Example (create):

```json
{
  "input": {
    "slug": "contact-us",
    "name": "Contact Us",
    "description": "Site contact form"
  },
  "stage": "draft"
}
```

Example (add field):

```json
{
  "formSlug": "contact-us",
  "input": {
    "formId": "<form-id>",
    "formSectionId": "<section-id>",
    "name": "email",
    "label": "Email",
    "type": "text",
    "required": true
  },
  "stage": "draft"
}
```

Field `type` values: `text`, `paragraph`, `number`, `multiSelect`, `select`, `file`, `date`, `time`.

You can still run the same operations via `graphql_query` with a `mutation { … }` document; the dedicated tools are preferred for structured args.

## Setup

```bash
cd mcp
cp .env.example .env
# Set CMS_GRAPHQL_API_KEY, CMS_GRAPHQL_API_SECRET_B64, and UPSTREAM_GRAPHQL_URL
# e.g. UPSTREAM_GRAPHQL_URL=http://localhost:3000/api/cms/graphql/draft
pnpm install
pnpm start
```

`src/server.js` does not load `.env` by itself unless you pass `--env-file` (the `start` script does).

## Required environment variables

- `CMS_GRAPHQL_API_KEY` — CMS API key (server-only in this process)
- `CMS_GRAPHQL_API_SECRET_B64` — base64 HMAC secret for that key (server-only in this process)
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
- `graphql_list_types` and `graphql_describe_type` need an API key with the stage `introspect` permission; otherwise complexity limits may reject introspection. Form mutation tools do **not** require introspection.
- Mutation fields are omitted from the compiled schema when the key has no form write ACL; tools will then return GraphQL validation errors.
- Keep HMAC secrets out of agent transcripts and client configs; put them only in `mcp/.env`.
