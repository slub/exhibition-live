import { KnowledgeBaseDescription } from "../types";
import { Img } from "../../../basic";
import {
  CommonPropertyValues,
  getCommonPropsFromWikidata,
  getEntityFromWikidataByIRI,
  WikidataRESTResult,
} from "@slub/edb-ui-utils";
import { filterUndefOrNull } from "@slub/edb-core-utils";
import { ClassicResultListItem } from "@slub/edb-basic-components";
import { IconButton, Stack } from "@mui/material";
import { Check } from "@mui/icons-material";
import { WikidataAllPropTable } from "@slub/edb-advanced-components";
import { wikidataTypeMap } from "@slub/exhibition-schema";
import { use } from "chai";
import { useCallback } from "react";

const stripWikidataPrefixFromProps = (allProps: CommonPropertyValues) => {
  return Object.fromEntries(
    Object.entries(allProps).map(([key, value]) => {
      const strippedKey = key.replace("http://www.wikidata.org/entity/", "");
      return [strippedKey, value];
    }),
  ) as CommonPropertyValues;
};

export const Wikidata: KnowledgeBaseDescription = {
  id: "wikidata",
  label: "Wikidata",
  authorityIRI: "http://www.wikidata.org",
  description: "Wikidata",
  icon: (
    <Img
      alt={"wikidata logo"}
      width={24}
      height={24}
      src={"Icons/Wikidata-logo-en.svg"}
    />
  ),
  find: async (searchString, typeIRI, typeName, findOptions) => {
    const type = wikidataTypeMap[typeName];
    const reconciliationURL = new URL(
      "https://wikidata.reconci.link/en/suggest/entity",
    );
    reconciliationURL.search = new URLSearchParams({
      prefix: searchString,
      ...(type ? { type: Array.isArray(type) ? type.join(",") : type } : {}),
    }).toString();
    const response = await fetch(reconciliationURL.toString(), {
      method: "GET",
    });
    const data = await response.json();
    return data.result.map((item: any) => ({
      id: item.id,
      key: item.id,
      title: item.name,
      description: item.description,
      thumbnail: { url: "" }, // Assuming no thumbnail is provided
    }));
  },
  getEntity: async (id) =>
    await getEntityFromWikidataByIRI(id, { rank: "preferred" }),
  listItemRenderer: (entry, idx, typeIRI, selected, onSelect, onAccept) => {
    const data = entry as WikidataRESTResult["pages"][0];
    const wikidataEntityIRI = `http://www.wikidata.org/entity/${data.key}`;
    const handleAccept = () => {
      getEntityFromWikidataByIRI(wikidataEntityIRI, { rank: "preferred" }).then(
        (res) => {
          const allProps = res; // stripWikidataPrefixFromProps(allProps_);
          return onAccept(wikidataEntityIRI, { ...data, allProps });
        },
      );
    };
    return (
      <ClassicResultListItem
        key={data.key}
        id={wikidataEntityIRI}
        index={idx}
        onSelected={(id, index) => onSelect(id, index)}
        label={data.title}
        secondary={data.description}
        avatar={data.thumbnail?.url}
        altAvatar={String(idx + 1)}
        selected={selected}
        onEnter={handleAccept}
        listItemProps={{
          secondaryAction: (
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleAccept}>
                <Check />
              </IconButton>
            </Stack>
          ),
        }}
        popperChildren={<WikidataAllPropTable thingIRI={wikidataEntityIRI} />}
      />
    );
  },
};
