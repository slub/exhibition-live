export type WikidataSearchOptions = {
  srsearch: {
    searchString: string
    haswbstatement?: string[][]
  }
  prop?: string[]
  srprop?: string[]
  srlimit?: number

}

export type WikidataFlatSearchParams = {
  action: 'query'
  srsearch: string
  origin: string
  utf8?: ''
  format: string
  srprop?: string
  srlimit?: string
  list: 'search'
  prop?: string
}

const buildHaswbstatement = (statementAND_OR: string[][]) =>
    statementAND_OR.map(sAND => `haswbstatement:${sAND.join('|')}`).join(' ')

export const wikidataSearchOptionsToParams: (options: WikidataSearchOptions) => WikidataFlatSearchParams
    = ({srsearch, srprop, prop, srlimit}) => ({
  action: 'query',
  list: 'search',
  origin: '*',
  utf8: '',
  format: 'json',
  srsearch: srsearch.searchString + (srsearch.haswbstatement ? ' ' + buildHaswbstatement(srsearch.haswbstatement) : ''),
  ...(srprop ? {srprop: srprop.join('|')} : {}),
  ...(prop ? {prop: prop.join('|')} : {}),
  ...(srlimit ? {srlimit: Math.floor(srlimit).toString()} :{})
})


const wikidataApiURL = 'https://www.wikidata.org/w/api.php'

export const buildWikidataFulltextSearchParams: (searchString: string, haswbstatement: string[][], limit?: number) => URLSearchParams
    = (searchString, haswbstatement, srlimit) =>
    new URLSearchParams(wikidataSearchOptionsToParams({
      srprop: [ 'size','wordcount','timestamp','sectiontitle','snippet','titlesnippet'],
      srsearch: {
        haswbstatement: haswbstatement,
        searchString
      },
      srlimit
    }))

export type WikidataSearchResult = {
  search: { snippet: string; wordcount: number; titlesnippet: string; size: number; ns: number; title: string; pageid: number; timestamp: string }[]
  searchinfo: { totalhits: number }
}

const findPersonWithinWikidata = async (searchString: string, limit?: number) => {
  const result = await fetch(`${wikidataApiURL}?${buildWikidataFulltextSearchParams(searchString, [['P31=Q5']], limit)}`)
      .then(res => res.json())

  return result.query as WikidataSearchResult
}

export default findPersonWithinWikidata
