import namespace from '@rdfjs/namespace'


export const sladb = namespace('http://ontologies.slub-dresden.de/exhibition#')
export const slent = namespace('http://ontologies.slub-dresden.de/exhibition/entity#')
export const defaultPrefix = sladb[''].value
export const defaultJsonldContext = {
    '@vocab': defaultPrefix,
    'xs': 'http://www.w3.org/2001/XMLSchema#',
    'date': {
        '@type': sladb.date.value
    },
    'birthDate': {
        '@type': 'xs:date'
    },
    'deathDate': {
        '@type': 'xs:date'
    }
}

export const defaultQueryBuilderOptions = {prefixes: {['']: sladb, 'slent': slent}}
