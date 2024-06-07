import {
  Face as IconFaceId,
  FormatPaint as IconPaint,
  Theaters as IconDots,
} from "@mui/icons-material";
import { JSONSchema7 } from "json-schema";

import { TFunction } from "i18next";
import { Permission } from "@slub/edb-core-types";
import { MenuGroup, MenuItem } from "./menu";

const icons = { IconFaceId, IconPaint, IconDots };

const topLevel = ["Exhibition", "Person"];
const disabledTypes = [
  "InvolvedPerson",
  "InvolvedCorporation",
  "ExponatsAndPersons",
  "ExponatsAndCorporations",
];

export const createMenuListFromSchema: (
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
    ...topLevel.map(
      (key) =>
        ({
          id: `list_${key}`,
          title: t(key),
          type: "item",
          typeName: key,
          readOnly: !getPermission(key).edit,
        }) as MenuItem,
    ),
    ...Object.entries(
      exhibitionSchema.definitions || exhibitionSchema["$defs"] || {},
    )
      .filter(
        ([key]) => !topLevel.includes(key) && disabledTypes.indexOf(key) === -1,
      )
      .map(
        ([key, value]) =>
          ({
            id: `list_${key}`,
            title: t(key),
            type: "item",
            typeName: key,
            readOnly: !getPermission(key).edit,
          }) as MenuItem,
      ),
  ],
});
