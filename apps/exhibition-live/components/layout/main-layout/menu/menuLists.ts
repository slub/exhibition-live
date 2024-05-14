import {
  Face as IconFaceId,
  FoodBank,
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
      title: "Festmahl",
      type: "item",
      icon: FoodBank as any,
      typeName: "Festmahl",
      readOnly: !getPermission("Festmahl").edit,
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
