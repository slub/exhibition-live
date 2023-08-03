import {gndBaseIRI} from '../gnd/prefixes'

/**
 * {
 *                     url: "http://lobid.org/gnd/search",
 *                     dataType: "jsonp",
 *                     data: {
 *                         q: request.term,
 *                         filter: "type:Person",
 *                         size: 25,
 *                         format: "json:suggest"
 *                     }
 * @param searchString
 * @param typeName
 * @param limit
 */
const lobidSearchURL = 'https://lobid.org/gnd/search'
const lobidURL = 'https://lobid.org/gnd/'

const LobidTypemap: Record<string, string> ={
  'Organization': 'CorporateBody',
  'Person': 'DifferentiatedPerson',
  'Corporation': 'CorporateBody',
  'Exhibition': 'ConferenceOrEvent',
  'Place': 'CorporateBody',
  'Location': 'TerritorialCorporateBodyOrAdministrativeUnit',
  'Tag': 'SubjectHeading',
  'ExhibitionExponat': 'Work',
}

const mapTypeName = (typeName: string) => LobidTypemap[typeName] || typeName
const gndIRIToID = (iri: string) => iri.substring(gndBaseIRI.length)
export const findEntityWithinLobid = async (searchString: string, typeName: string, limit?: number) => {
  const res = await fetch(lobidSearchURL + '?' +( new URLSearchParams(
      {
      q: searchString,
      filter: `type:${mapTypeName(typeName)}`,
      size: (limit || 10).toString(),
      format: 'json'
    }
  )).toString() )
  return await  res.json()
}

export const findEntityWithinLobidByID = async (id: string) => {
  const res = await fetch(`${lobidURL}${id}.json` )
  return await  res.json()
}

export const findEntityWithinLobidByIRI = async (iri: string) => {
  return await findEntityWithinLobidByID(gndIRIToID(iri))
}
