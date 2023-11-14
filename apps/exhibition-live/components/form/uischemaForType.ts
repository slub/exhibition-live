import { UISchemaElement } from "@jsonforms/core";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { BASE_IRI } from "../config";
import ExhibitionUISchema from "./uischema/Exhibition.uischema.json";
import ExhibitionExponatUISchema from "./uischema/ExhibitionExponat.uischema.json";
import ExhibtionSeriesUISchema from "./uischema/ExhibitionSeries.uischema.json";
import InvolvedPersonUISchema from "./uischema/InvolvedPerson.uischema.json";
import LocationUISchema from "./uischema/Location.uischema.json";
import PersonUISchema from "./uischema/Person.uischema.json";
import PlaceUISchema from "./uischema/Place.uischema.json";
import TagUISchema from "./uischema/Tag.uischema.json";
import SeriesTypeUISchema from "./uischema/SeriesType.uischema.json";
import WorkPlaceUISchema from "./uischema/WorkPlace.uischema.json";
import PersonRoleUISchema from "./uischema/PersonRole.uischema.json";
import CorporationRoleUISchema from "./uischema/CorporationRole.uischema.json";
import EventTypeUISchema from "./uischema/EventType.uischema.json";
import CorporationUISchema from "./uischema/Corporation.uischema.json";
import InvolvedCoporationUISchema from "./uischema/InvolvedCorporation.uischema.json";

export const uischemata = {
  Exhibition: ExhibitionUISchema,
  ExhibitionExponat: ExhibitionExponatUISchema,
  InvolvedPerson: InvolvedPersonUISchema,
  InvolvedCorporation: InvolvedCoporationUISchema,
  Location: LocationUISchema,
  Person: PersonUISchema,
  Place: PlaceUISchema,
  Tag: TagUISchema,
  SeriesType: SeriesTypeUISchema,
  WorkPlace: WorkPlaceUISchema,
  ExhibitionSeries: ExhibtionSeriesUISchema,
  PersonRole: PersonRoleUISchema,
  CorporationRole: CorporationRoleUISchema,
  EventType: EventTypeUISchema,
  Corporation: CorporationUISchema,
};
export const useUISchemaForType = (
  typeIRI: string,
  enableLoadFromExternal?: boolean,
) => {
  const typeName = useMemo(
    () => typeIRI.substring(BASE_IRI.length, typeIRI.length),
    [typeIRI],
  );
  const uischemaFixed = uischemata[typeName] as UISchemaElement | undefined;
  const { data: uiSchemaFromServer } = useQuery(
    ["uischema", typeIRI],
    async () => {
      const url = `./uischema/${typeName}.uischema.json`;
      const exists = await fetch(url, { method: "HEAD" }).then((res) => res.ok);
      if (exists) {
        return await fetch(url)
          .then(async (res) => await res.json())
          .catch(() => null);
      }
      return null;
    },
    {
      enabled: Boolean(enableLoadFromExternal),
      retry: false,
      refetchOnWindowFocus: false,
      retryOnMount: false,
      onError: (err) => {},
    },
  );
  return useMemo<UISchemaElement | null>(
    () => uiSchemaFromServer || uischemaFixed || null,
    [uiSchemaFromServer, uischemaFixed],
  );
};
