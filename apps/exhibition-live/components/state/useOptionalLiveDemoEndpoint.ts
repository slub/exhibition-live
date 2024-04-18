import { useEffect } from "react";
import { SparqlEndpoint, useSettings } from "./useLocalSettings";

/**
 * This hook adds a demo endpoint to the list of endpoints if the app is not running on the test server.
 * It is used to provide an open database connection for the live demo.
 */
export const useOptionalLiveDemoEndpoint = () => {
  const { sparqlEndpoints, setSparqlEndpoints, lockedEndpoint } = useSettings();
  useEffect(() => {
    if (lockedEndpoint) return;
    const demoEndpointURI = "https://ausstellungsdatenbank.kuenste.live/query";
    if (
      window.location.hostname !== "sdv-ahn-adbtest.slub-dresden.de" &&
      sparqlEndpoints.find((ep) => ep.endpoint === demoEndpointURI) ===
        undefined
    ) {
      console.log("useOptionalLiveDemoEndpoint: add demo endpoint");
      const otherEndpoints = sparqlEndpoints.filter(
        (endpoint) =>
          endpoint.endpoint !== "https://sdv-ahn-adbtest.slub-dresden.de/query",
      );
      const liveDemoTestDatabase: SparqlEndpoint = {
        label: "Live Demo Testdatabase",
        endpoint: demoEndpointURI,
        active: !Boolean(otherEndpoints.find((ep) => ep.active)),
        provider: "oxigraph",
      };
      setSparqlEndpoints([liveDemoTestDatabase, ...otherEndpoints]);
    }
  }, [sparqlEndpoints, setSparqlEndpoints, lockedEndpoint]);
};
