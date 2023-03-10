import datasetFactory from '@rdfjs/dataset'
import Parser from '@rdfjs/parser-jsonld'
import {Dataset} from '@rdfjs/types'
import {JSONSchema7} from 'json-schema'
import {JsonLdContext} from 'jsonld-context-parser'
import dsExt from 'rdf-dataset-ext'
import {useCallback, useState} from 'react'
import stringToStream from 'string-to-stream'

import {jsonSchemaGraphInfuser, WalkerOptions} from '../utils/graph/jsonSchemaGraphInfuser'

type UseJsonLdParserOptions =  {
    onJsonldData?: (data: any) => void
    onFormDataChange?: (data: any) => void
    walkerOptions?: Partial<WalkerOptions>
    defaultPrefix: string
}
export const useJsonldParser = (data: any, jsonldContext: JsonLdContext, schema: JSONSchema7,
                         { onFormDataChange, onJsonldData, walkerOptions = {}, defaultPrefix }: UseJsonLdParserOptions) => {
    const [entityIRI, setEntityIRI] = useState<string | undefined>()
    const parseJSONLD = useCallback(
        async (_data: any) => {
            // @ts-ignore
            const _entityIri = (_data['@id'])
            if (_entityIri !== entityIRI) setEntityIRI(_entityIri)

          //iterate through object and filter out every key, whose value is an empty object or an empty array
            const jsonldDoc = Object.keys(_data).reduce((acc, key) => {
                if (Array.isArray(_data[key]) && _data[key].length === 0) return acc
                if (typeof _data[key] === 'object' && Object.keys(_data[key]).length === 0) return acc
                return {
                    ...acc,
                    [key]: _data[key]
                }
            }, {
              '@context': jsonldContext
            })


            onJsonldData && onJsonldData(jsonldDoc)

            try {
                const jsonldStream = stringToStream(JSON.stringify(jsonldDoc))
                const parser = new Parser()
                const ds = await dsExt.fromStream(datasetFactory.dataset(), parser.import(jsonldStream))
                if (_entityIri) {
                    const resultJSON = jsonSchemaGraphInfuser(defaultPrefix, _entityIri, ds as Dataset, schema, walkerOptions)
                    onFormDataChange && onFormDataChange(resultJSON)
                }
            } catch (e) {
                console.error('Cannot convert JSONLD to dataset', e)
            }
        },
        [onFormDataChange, onJsonldData, setEntityIRI, entityIRI],
    )

    return {
        entityIRI,
        parseJSONLD
    }
}
