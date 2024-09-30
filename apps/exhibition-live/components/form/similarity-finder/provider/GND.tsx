import { KnowledgeBaseDescription } from "../types";
import { Img } from "../../../basic";
import { findEntityWithinLobid } from "@slub/edb-authorities";
import { filterUndefOrNull } from "@slub/edb-core-utils";
import { gndEntryFromSuggestion } from "../../lobid/LobidSearchTable";
import { GNDListItemRenderer } from "../GNDListItemRenderer";
import { lobidTypemap } from "@slub/exhibition-schema";

export const GND: KnowledgeBaseDescription = {
  id: "gnd",
  authorityIRI: "http://d-nb.info/gnd",
  label: "GND",
  description: "Gemeinsame Normdatei",
  icon: (
    <Img alt={"gnd logo"} width={24} height={24} src={"Icons/gnd-logo.png"} />
  ),
  find: async (searchString, typeIRI, typeName, findOptions) => {
    return filterUndefOrNull(
      await findEntityWithinLobid(
        searchString,
        typeName,
        lobidTypemap,
        findOptions?.limit || 10,
        "json:suggest",
      ),
    )?.map((allProps: any) => gndEntryFromSuggestion(allProps));
  },
  getEntity: async (id, typeIRI) => {
    return await findEntityWithinLobid(id, typeIRI, lobidTypemap, 1, "json");
  },
  listItemRenderer: (data, idx, typeIRI, selected, onSelect, onAccept) => (
    <GNDListItemRenderer
      data={data}
      key={`${data.id}${idx}`}
      idx={idx}
      typeIRI={typeIRI}
      selected={selected}
      onSelect={onSelect}
      onAccept={onAccept}
    />
  ),
};
