import { EdbSparnatural } from "@slub/edb-sparnatural";
import { useAdbContext, useGlobalCRUDOptions } from "@slub/edb-state-hooks";
import { useCallback, useState } from "react";
import df from "@rdfjs/data-model";
import { fixSparqlOrder, withDefaultPrefix } from "@slub/sparql-schema";
import { SELECT } from "@tpluscode/sparql-builder";
import { filterUndefOrNull, isValidUrl } from "@slub/edb-core-utils";
import {
  GenericListItem,
  GenericVirtualizedList,
} from "@slub/edb-virtualized-components";
import { IRIToStringFn, PrimaryFieldDeclaration } from "@slub/edb-core-types";
import get from "lodash/get";
import debounce from "lodash/debounce";
import isString from "lodash/isString";
import * as React from "react";
import { ParentSize } from "@visx/responsive";
import NiceModal from "@ebay/nice-modal-react";
import { Box, Skeleton } from "@mui/material";

const itemToListItem = (
  item: any,
  typeIRI: string,
  typeIRIToTypeName: IRIToStringFn,
  primaryFields: PrimaryFieldDeclaration,
): GenericListItem | null => {
  const typeName = typeIRIToTypeName(typeIRI);
  if (isString(item.entity?.value)) {
    const primaryField = primaryFields[typeName];
    const primary = primaryField
      ? get(item, primaryField.label)?.value
      : JSON.stringify(item);
    const description = primaryField
      ? get(item, primaryField.description)?.value
      : null;
    const image = primaryField ? get(item, primaryField.image)?.value : null;
    return {
      id: item.entity.value,
      entry: item,
      primary: primary || typeName,
      description,
      avatar: image,
    };
  }
  return null;
};

type QuerySparnaturalProps = {
  lang: "en" | "de" | "fr";
};
export const QuerySparnatural = ({ lang }: QuerySparnaturalProps) => {
  const { crudOptions } = useGlobalCRUDOptions();
  const {
    typeNameToTypeIRI,
    typeIRIToTypeName,
    jsonLDConfig: { defaultPrefix },
    queryBuildOptions: { primaryFields },
    components: { EntityDetailModal },
  } = useAdbContext();
  const { selectFetch } = crudOptions || {};
  const [data, setData] = useState<GenericListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFromEntries = useCallback(
    async (entries: { entityIRI: string; typeIRI: string }[]) => {
      if (!selectFetch) return [];
      const optionalProperties = [
        "title",
        "name",
        "label",
        "description",
        "image",
      ];
      if (!entries.length) return [];
      const sample = (propName: string) =>
        ` (SAMPLE(?${propName}List) AS ?${propName}) `;
      const makeOptional = (propName: string) =>
        `OPTIONAL { ?entity :${propName} ?${propName}List . }`;
      const wherePartOptionals = optionalProperties
        .map(makeOptional)
        .join("\n");
      const selectPartOptionals = optionalProperties.map(sample).join(" ");
      const entityV = df.variable("entity");
      const query = fixSparqlOrder(
        withDefaultPrefix(
          defaultPrefix,
          SELECT.DISTINCT`${entityV} ?type ${selectPartOptionals} `.WHERE`
    ${entityV} a ?type .
    VALUES ${entityV} { ${entries.map((entry) => `<${entry.entityIRI}>`).join(" ")} } .
    FILTER(isIRI(${entityV}))
    ${wherePartOptionals}
    `.GROUP().BY`${entityV} ?type`
            .ORDER()
            .BY(entityV)
            .build(),
        ),
      );
      const rawResults = await selectFetch(query);
      const result = filterUndefOrNull(
        rawResults?.map((item) =>
          itemToListItem(
            item,
            item.type.value,
            typeIRIToTypeName,
            primaryFields,
          ),
        ) || ([] as GenericListItem[]),
      );
      return result;
    },
    [typeIRIToTypeName, selectFetch, defaultPrefix, primaryFields],
  );

  const doQuery = useCallback(
    async (queryString: string) => {
      const response = await selectFetch(queryString);
      console.log({ response });
      const entries = response.flatMap((item: any) => {
        return filterUndefOrNull(
          Object.entries(item).map(([key, value]: [string, any]) => {
            if (value.type !== "uri") return null;
            const typeName = key.split("_")[0];
            const entityIRI = value.value;
            if (!isValidUrl(entityIRI)) return null;
            return { typeIRI: typeNameToTypeIRI(typeName), entityIRI };
          }),
        );
      });
      const result = await fetchFromEntries(entries);
      setData(result);
      setLoading(false);
    },
    [selectFetch, typeNameToTypeIRI, setData, setLoading],
  );

  const handleQueryUpdate = React.useRef(debounce(doQuery, 500)).current;
  const showEntry = useCallback(
    (entityIRI: string) => {
      NiceModal.show(EntityDetailModal, {
        entityIRI,
        disableInlineEditing: true,
      });
    },
    [EntityDetailModal],
  );
  return (
    <>
      <EdbSparnatural
        src="./schema/Exhibition.schema_shape_multilingual.ttl"
        lang={lang}
        endpoint="https://ausstellungsdatenbank.kuenste.live/query"
        distinct="true"
        limit="100"
        prefix="sladb:http://ontologies.slub-dresden.de/exhibition#"
        debug="true"
        onQueryUpdated={(event) => {
          setLoading(true);
          handleQueryUpdate(event.detail.queryString);
        }}
      />
      <Box sx={{ height: "100vh" }}>
        {loading ? (
          <Skeleton height={400} width="100%" />
        ) : (
          <ParentSize>
            {({ width, height }) => (
              <GenericVirtualizedList
                key={"list"}
                items={data}
                width={width}
                height={height}
                onItemSelect={showEntry}
              />
            )}
          </ParentSize>
        )}
      </Box>
    </>
  );
};
