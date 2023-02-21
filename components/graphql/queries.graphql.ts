import gql from 'graphql-tag'

export const allExhibitions = gql`
    query allExhibitions {
        getExhibitions {
            id
            title
            description
            fromDate
            toDate
            places {
                title
                location {
                    id
                    title
                }
            }
            locations {
                id
                title
            }
            weblink
        }
    }
`

export const searchExhibitions = gql`
    query searchExhibitions($searchString: String) {
        getExhibitions(filters: { title: { iContains: $searchString } }) {
            id
            title
            description
            fromDate
            toDate
            places {
                title
                location {
                    id
                    title
                }
            }
            locations {
                id
                title
            }
            weblink
        }
    }
`

export const searchPersons = gql`
query allPersons {
    getPersons {
        id
        nameVariants
        name
        description
        gender
        normdata
    }
}
`
