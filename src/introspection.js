export const LIST_TYPES_QUERY = `query McpListTypes {
  __schema {
    queryType { name }
    mutationType { name }
    subscriptionType { name }
    types { kind name }
  }
}`

export const DESCRIBE_TYPE_QUERY = `query McpDescribeType($name: String!) {
  __type(name: $name) {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        name
        description
        defaultValue
        type { ...TypeRef }
      }
      type { ...TypeRef }
    }
    inputFields {
      name
      description
      defaultValue
      type { ...TypeRef }
    }
    enumValues(includeDeprecated: true) {
      name
      description
    }
    possibleTypes { kind name }
  }
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType { kind name }
          }
        }
      }
    }
  }
}`

/**
 * @param {{ kind?: string, name?: string }[]} types
 */
export function summarizeSchema(schema) {
  const types = (schema?.types ?? []).filter(
    (type) => type?.name && !type.name.startsWith("__")
  )
  const byKind = {}
  for (const type of types) {
    const kind = type.kind ?? "UNKNOWN"
    if (!byKind[kind]) byKind[kind] = []
    byKind[kind].push(type.name)
  }
  for (const names of Object.values(byKind)) {
    names.sort((a, b) => a.localeCompare(b))
  }
  return {
    queryType: schema?.queryType?.name ?? null,
    mutationType: schema?.mutationType?.name ?? null,
    subscriptionType: schema?.subscriptionType?.name ?? null,
    types: byKind,
  }
}
