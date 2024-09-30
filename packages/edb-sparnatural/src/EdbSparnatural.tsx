import React, { useCallback, useEffect, useRef } from "react";
import "select2/src/scss/core.scss";
import "sparnatural/src/assets/stylesheets/sparnatural.scss";
import "leaflet/dist/leaflet.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
export interface SparnaturalEvent extends Event {
  detail?: {
    queryString: string;
    queryJson: string;
    querySparqlJs: string;
  };
}
export type EdbSparnaturalProps = {
  src: string;
  lang: string;
  endpoint: string;
  distinct: string;
  limit: string;
  prefix: string;
  debug: string;
  onQueryUpdated?: (event: SparnaturalEvent) => void;
};

export const EdbSparnatural: React.FC<EdbSparnaturalProps> = ({
  src,
  lang,
  endpoint,
  distinct,
  limit,
  prefix,
  debug,
  onQueryUpdated,
}) => {
  const sparnaturalRef = useRef<HTMLElement>(null);

  const handleQueryUpdated = useCallback(
    (event: SparnaturalEvent) => {
      try {
        onQueryUpdated?.(event);
      } catch (e) {}
    },
    [onQueryUpdated],
  );

  useEffect(() => {
    import("sparnatural").then(() => {
      sparnaturalRef.current?.addEventListener(
        "queryUpdated",
        handleQueryUpdated,
      );

      return () => {
        sparnaturalRef.current?.removeEventListener(
          "queryUpdated",
          handleQueryUpdated,
        );
      };
    });
  }, [handleQueryUpdated]);

  return (
    <div id="ui-search" style={{ width: "auto" }}>
      <spar-natural
        ref={sparnaturalRef}
        src={src}
        lang={lang}
        endpoint={endpoint}
        distinct={distinct}
        limit={limit}
        prefix={prefix}
        debug={debug}
      />
    </div>
  );
};
