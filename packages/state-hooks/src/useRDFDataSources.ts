import { useQuery } from "@tanstack/react-query";
import { RDFMimetype } from "async-oxigraph";
import { useCallback, useEffect, useState } from "react";

import { useOxigraph } from "./useOxigraph";

/**
 * Load RDF data sources into local in memory Oxigraph store
 *
 * @param source URL to RDF data source
 * @param baseIRI Base IRI for the RDF data source
 */
export const useRDFDataSources = (source: string, baseIRI: string) => {
  const { oxigraph, bulkLoaded, setBulkLoaded } = useOxigraph();
  const [bulkLoading, setBulkLoading] = useState(false);
  const { data } = useQuery(["knowledge", source], () =>
    fetch(source).then((r) => r.text()),
  );

  const load = useCallback(
    async (ao: any) => {
      setBulkLoading(true);
      await ao.load(data, RDFMimetype.TURTLE, baseIRI);
      setBulkLoading(false);
      setBulkLoaded(true);
    },
    [setBulkLoading, setBulkLoaded, data, baseIRI],
  );

  useEffect(() => {
    if (!data || !oxigraph) return;
    load(oxigraph.ao);
  }, [oxigraph, data, load]);

  return {
    bulkLoading,
    bulkLoaded,
  };
};
