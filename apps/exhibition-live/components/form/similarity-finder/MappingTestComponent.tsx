import { useSimilarityFinderState } from "@slub/edb-state-hooks";
import { SimilarityFinder } from "./SimilarityFinder";
import { useKnowledgeBases } from "./useKnowledgeBases";
import React, { useCallback, useMemo, useState } from "react";
import { useDeclarativeMapper } from "./useDeclarativeMapper";
import { Grid, Paper } from "@mui/material";
import { exhibitionConfig } from "../../config/exhibitionAppConfig";
import { set } from "lodash";
import { JsonView } from "react-json-view-lite";

type MappingTestComponentProps = {
  typeName:
    | "Location"
    | "Place"
    | "Person"
    | "Organization"
    | "Event"
    | "Performance"
    | "Occupation"
    | "Exhibition"
    | "ExhibitionSeries";
};

export const MappingTestComponent: React.FC<MappingTestComponentProps> = ({
  typeName,
}) => {
  const knowledgeBases = useKnowledgeBases();
  const typeIRI = useMemo(
    () => exhibitionConfig.typeNameToTypeIRI(typeName),
    [typeName],
  );
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [selectedAuthorityIRI, setSelectedAuthorityIRI] = useState<
    string | null
  >(null);
  const [mappedData, setMappedData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { mapData } = useDeclarativeMapper();

  const handleEntitySelected = useCallback(
    async (id: string, authorityIRI: string) => {
      setLoading(true);
      setSelectedID(id);
      setSelectedAuthorityIRI(authorityIRI);
      const knowledgeBase = knowledgeBases.find(
        (kb) => kb.authorityIRI === authorityIRI,
      );
      if (!knowledgeBase?.getEntity) {
        console.error(`No getEntity method found for ${authorityIRI}`);
        console.log({ knowledgeBase });
        return;
      }
      if (id.startsWith("https://d-nb.info")) {
        id = id.replace("https://d-nb.info/gnd/", "");
      }
      const entryData = await knowledgeBase.getEntity(id, typeName);
      setOriginalData(entryData);
      const mappedData = await mapData(
        id,
        typeIRI,
        { allProps: entryData },
        authorityIRI,
      );
      console.log({ mappedData, entryData });
      setMappedData(mappedData);
      setLoading(false);
    },
    [knowledgeBases, setMappedData, setOriginalData, typeIRI, typeName],
  );

  return (
    <Grid container spacing={2} sx={{ height: "100vh" }}>
      <Grid item xs={4} sx={{ height: "100%" }}>
        <SimilarityFinder
          finderId="finder-1"
          data={{}}
          classIRI={typeIRI}
          onEntityIRIChange={(iri) => console.log(`Entity IRI Changed: ${iri}`)}
          onExistingEntityAccepted={(iri, data) =>
            console.log(`Existing Entity Accepted: ${iri}, Data: ${data}`)
          }
          onMappedDataAccepted={(data) =>
            console.log(`Mapped Data Accepted: ${data}`)
          }
          search="Dresden"
          jsonSchema={{}}
          hideFooter={false}
          knowledgeSources={["wikidata"]}
          onSelectedEntityChange={handleEntitySelected}
        />
      </Grid>
      <Grid item xs={4} sx={{ height: "100%" }}>
        <Paper sx={{ height: "100%", overflow: "auto", p: 2 }}>
          {/* Content for the second column */}
          <h2>Original Data</h2>
          <JsonView
            data={originalData}
            shouldInitiallyExpand={(lvl) => lvl < 3}
          />
        </Paper>
      </Grid>
      <Grid item xs={4} sx={{ height: "100%" }}>
        <Paper sx={{ height: "100%", overflow: "auto", p: 2 }}>
          {/* Content for the third column */}
          <h2>Mapped Data</h2>
          <JsonView
            data={mappedData}
            shouldInitiallyExpand={(lvl) => lvl < 3}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};
