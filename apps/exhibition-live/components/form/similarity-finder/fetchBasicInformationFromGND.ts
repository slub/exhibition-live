import { BasicThingInformation } from "@slub/edb-core-types";
import { findEntityWithinLobidByIRI } from "@slub/edb-authorities";
import { gndEntryWithMainInfo } from "../lobid/LobidSearchTable";

export const fetchBasicInformationFromGND: (
  id: string,
  initialData: BasicThingInformation,
) => Promise<BasicThingInformation> = async (
  id: string,
  initialData: BasicThingInformation,
) => {
  const rawEntry = await findEntityWithinLobidByIRI(id);
  const { category, secondary, avatar } = initialData;
  const entry = gndEntryWithMainInfo(rawEntry);
  return {
    category,
    avatar,
    ...entry,
    secondary: initialData.secondary,
  };
};
