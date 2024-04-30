import {
  Face as IconFaceId,
  FormatPaint as IconPaint,
  Theaters as IconDots,
} from "@mui/icons-material";
import { JSONSchema7 } from "json-schema";

import { MenuGroup } from "./types";
import { TFunction } from "i18next";
import { Permission } from "@slub/edb-core-types";

const icons = { IconFaceId, IconPaint, IconDots };

const topLevel = ["Exhibition", "Person"];

const lists: (
  schema: JSONSchema7,
  getPermission: (typeName: string) => Permission,
  t: TFunction,
) => MenuGroup = (exhibitionSchema, getPermission, t) => ({
  id: "lists",
  // title: "Explorieren",
  type: "group",
  /*children: Object.entries(
    exhibitionSchema.definitions || exhibitionSchema["$defs"] || {},
  )
    .map(([key, value]) => ({
      id: `list_${key}`,
      title: (value as any).title || key,
      type: "item",
      url: `/list/${key}`,
      typeName: key,
  })),*/
  children: [
    {
      id: "list_default",
      title: "Ausstellungen",
      type: "item",
      icon: IconPaint as any,
      typeName: "Exhibition",
      readOnly: !getPermission("Exhibition").edit,
    },
    {
      id: "list_person",
      title: "Personen",
      type: "item",
      icon: IconFaceId as any,
      typeName: "Person",
      readOnly: !getPermission("Person").edit,
    },
    {
      id: "list_other",
      title: "Entitäten",
      type: "collapse",
      //@ts-ignore
      icon: icons.IconDots,
      children: Object.entries(
        exhibitionSchema.definitions || exhibitionSchema["$defs"] || {},
      )
        .filter(([key]) => !topLevel.includes(key))
        .map(([key, value]) => ({
          id: `list_${key}`,
          title: t(key),
          type: "item",
          typeName: key,
          readOnly: !getPermission(key).edit,
        })),
    },
  ],
});

export default lists;
