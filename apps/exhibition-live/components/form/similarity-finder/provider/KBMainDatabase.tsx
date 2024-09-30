import { KnowledgeBaseDescription } from "../types";
import { Storage as KnowledgebaseIcon } from "@mui/icons-material";
import { applyToEachField, extractFieldIfString } from "@slub/edb-data-mapping";
import { PrimaryField, PrimaryFieldDeclaration } from "@slub/edb-core-types";
import { KBListItemRenderer } from "../KBListItemRenderer";
import { AbstractDatastore } from "@slub/edb-global-types";
import { typeIRItoTypeName } from "../../../config";

export const KBMainDatabase: (
  dataStore: AbstractDatastore,
  primaryFields: PrimaryFieldDeclaration,
) => KnowledgeBaseDescription = (dataStore, primaryFields) => ({
  id: "kb",
  label: "Lokale Datenbank",
  description: "Datenbank der Ausstellung",
  icon: <KnowledgebaseIcon />,
  find: async (searchString, typeIRI, typeName, findOptions) => {
    const res = await dataStore.findDocuments(
      typeName,
      { search: searchString },
      findOptions?.limit,
    );
    return res.map((doc) => {
      const { label, image, description } = applyToEachField(
        doc,
        primaryFields[typeName] as PrimaryField,
        extractFieldIfString,
      );
      return {
        label,
        id: doc["@id"],
        avatar: image,
        secondary: description,
      };
    });
  },
  getEntity(id, typeIRI) {
    return dataStore.loadDocument(typeIRItoTypeName(typeIRI), id);
  },
  listItemRenderer: (entry, idx, typeIRI, selected, onSelect, onAccept) => (
    <KBListItemRenderer
      data={entry}
      key={entry.id}
      idx={idx}
      typeIRI={typeIRI}
      selected={selected}
      onSelect={onSelect}
      onAccept={onAccept}
    />
  ),
});
