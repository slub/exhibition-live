import {Elysia} from "elysia";
import {JSONSchema7} from "json-schema";
import {defs} from "@slub/json-schema-utils";
import {getGraphQLWriter, getJsonSchemaReader, makeConverter} from 'typeconv'
import {cors} from "@elysiajs/cors";
import {yoga} from "@elysiajs/graphql-yoga";
import {FieldNode, SelectionSetNode} from "graphql";
import {IExecutableSchemaDefinition} from "@graphql-tools/schema";
import {IFieldResolver} from "@graphql-tools/utils";
import {findEntities, loadEntity, typeNameToTypeIRI} from "./loader";
import loadedSchema from "@slub/exhibition-schema/schemas/jsonschema/Exhibition2.schema.json";

const exhibitionSchema = loadedSchema as JSONSchema7

const reader = getJsonSchemaReader();
const writer = getGraphQLWriter();

const converter = makeConverter(reader, writer);

const {data: graphqlTypeDefsUnfiltered} = await converter.convert({data: JSON.stringify(exhibitionSchema, null, 2)})

const graphqlTypeDefs =  graphqlTypeDefsUnfiltered.split("\n").filter(line => !(new RegExp('_').test(line))).join("\n")

const getTypeDefs = (schema: JSONSchema7) => {
    const definitions = defs(schema)
    const allDefinitions = Object.keys(definitions).map((typeName) => {
        return `
      get${typeName}(id: ID!): ${typeName}
      list${typeName}: [${typeName}]
    `
    }).join("\n")
    return `
    type Query {
      ${allDefinitions}
    }
    `
}

const getFieldResolvers = (schema: JSONSchema7) => {
    const definitions = defs(schema)
    const allResolver = Object.keys(definitions).flatMap((typeName) => {
        const resolver: [string, IFieldResolver<any, any>][] = [
            [`get${typeName}`, async (parent, args, context, info) => {
                const {id} = args
                const typeIRI = typeNameToTypeIRI(typeName)
                const entity = await loadEntity(typeName, typeIRI, id, schema)
                return entity
            }],
            [`list${typeName}`, async (parent, args, context, info) => {
                return await findEntities(typeName, 10, schema)
            }
            ]]
        return resolver
    })
    return Object.fromEntries(allResolver)
}


const additionalTypeDefs = getTypeDefs(exhibitionSchema)
const queryResolvers = getFieldResolvers(exhibitionSchema)

const recurseSelectionSet: (selectionSet: SelectionSetNode) => {
    [p: string]: { [p: string]: any } | null
} = (selectionSet: SelectionSetNode) => {
    return Object.fromEntries(selectionSet.selections.map((selection) => {
        const fnode = selection as FieldNode
        return [fnode?.name?.value, fnode.selectionSet ? recurseSelectionSet(fnode.selectionSet) : null]
    }))
}
const gqlSchema: IExecutableSchemaDefinition<any> = {
    typeDefs: [graphqlTypeDefs, additionalTypeDefs].join("\n"),
    resolvers: {
        Query: queryResolvers
    }
}

const graphqlAPI = yoga({
    typeDefs: gqlSchema.typeDefs,
    context: {
        name: 'Mobius'
    },
    // If context is a function on this doesn't present
    // for some reason it won't infer context type
    useContext(_) {
    },
    resolvers: gqlSchema.resolvers
} as any)

const app = new Elysia()
    .use(cors())
    .use(graphqlAPI)
    .get("/", () => "Welcome to SLUb EDB")
    .listen(3001)

console.log(
    `🦊 Elysia powerered SLUB EDB is running at ${app.server?.hostname}:${app.server?.port}`
);
