import Exhibition from '../../schema/exhibition-form-ui-schema-simple.json'
import Person from '../../schema/exhibition-person-ui-schema-simple.json'
import {BASE_IRI} from '../config'

const uischemaTypeIRIMap =  Object.fromEntries(
    Object.entries({
      Exhibition,
      Person
    }).map(([key, uischema]) => [`${BASE_IRI}${key}`, uischema])
)

export const uischemaForType = (typeIRI: string) => uischemaTypeIRIMap[typeIRI] || undefined
