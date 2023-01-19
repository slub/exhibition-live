import {JSONSchema6, JSONSchema6Definition} from 'json-schema'

const isJSONSchema = (json: JSONSchema6Definition): json is JSONSchema6 => typeof json !== 'boolean'
const isJSONSchemaDefinition = (json: JSONSchema6Definition | JSONSchema6Definition[] | undefined): json is JSONSchema6Definition =>
    Boolean(json && !Array.isArray(json))

const randomString = (length: number) => Math.random().toString(36).substring(length)

const jsonSchema2construct = (subjectURI: string, schema: JSONSchema6) => {
  let construct = '', where = ''
  const s = `<${subjectURI}>`
  const propertiesToSPARQLPatterns = (sP: string, subSchema: JSONSchema6) => {
    Object.entries(subSchema.properties || {}).map(([k,schema]) => {
      if(isJSONSchema(schema)) {
        const required = subSchema.required?.includes(k)
        const o = `?${k}_${randomString(5)}`
        if(!required) { where += 'OPTIONAL {' }
        construct += `${sP} ${k} ${o} .\n`
        where += `${sP} ${k} ${o} .\n`
        if(schema.properties) {
          propertiesToSPARQLPatterns(o, schema)
        }
        if(isJSONSchemaDefinition(schema.items) && isJSONSchema(schema.items) && schema.items.properties) {
          propertiesToSPARQLPatterns(o, schema.items)
        }
        if(!required) { where += '}\n' }
      }
    })
  }
  propertiesToSPARQLPatterns(s, schema)
  if(isJSONSchemaDefinition(schema.items) && isJSONSchema(schema.items) && schema.items.properties) {
    propertiesToSPARQLPatterns(s, schema.items)
  }
  return { construct, where }
}


export const buildConstructQuery = (subjectURI: string,schema: JSONSchema6) => {
  const {
    construct, where
  } = jsonSchema2construct(subjectURI, schema)
  return `CONSTRUCT { ${construct} } WHERE { ${where} } `
}
