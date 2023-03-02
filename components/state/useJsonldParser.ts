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
        async (_data: object) => {
            // @ts-ignore
            const _entityIri = (_data['@id'])
            if (_entityIri !== entityIRI) setEntityIRI(_entityIri)
            const jsonldDoc = {
                '@context': jsonldContext,
                ...JSON.parse(JSON.stringify(_data))
            }
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
