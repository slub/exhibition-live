import {useRDFDataSources} from '../state/useRDFDataSources'

export const useExhibitionData = () =>
    useRDFDataSources(
        ['aus.ttl', 'exhibition-info.owl2.ttl'].map(s => `http://localhost:4002/${s}`))
