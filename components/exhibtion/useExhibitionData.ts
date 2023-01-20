import {useRDFDataSources} from '../state/useRDFDataSources'

export const useExhibitionData = () =>
    useRDFDataSources(
        ['aus.ttl', 'kue.ttl'].map(s => `http://localhost:4002/${s}`))
