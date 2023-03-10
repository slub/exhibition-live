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
const lobidURL = 'https://lobid.org/gnd/search'

const LobidTypemap: Record<string, string> ={
  'Organization': 'CorporateBody'
}

const mapTypeName = (typeName: string) => LobidTypemap[typeName] || typeName

const findEntityWithinLobid = async (searchString: string, typeName: string, limit?: number) => {
  const res = await fetch(lobidURL + '?' +( new URLSearchParams(
      {
      q: searchString,
      filter: `type:${mapTypeName(typeName)}`,
      size: (limit || 10).toString(),
      format: 'json'
    }
  )).toString() )
  return await  res.json()
}


export default findEntityWithinLobid
