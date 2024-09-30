import {
  Face as IconFaceId,
  FormatPaint as IconPaint,
  Theaters as IconDots,
  CorporateFare as IconCorporation,
} from "@mui/icons-material";
import { JSONSchema7 } from "json-schema";

import { TFunction } from "i18next";
import { Permission } from "@slub/edb-core-types";
import { MenuGroup, MenuItem } from "@slub/edb-advanced-components";

const icons = { IconFaceId, IconPaint, IconDots, IconCorporation };

const icon2Type = {
  Exhibition: "IconFaceId",
  Person: "IconPaint",
  Corporation: "IconCorporation",
};

const topLevel = ["Exhibition", "Person"];
const disabledTypes = [
  "InvolvedPerson",
  "InvolvedCorporation",
  "ExponatsAndPersons",
  "ExponatsAndCorporations",
  "Workplace",
];

const iconFromType = (type: string) => {
  return icon2Type[type] ? icons[icon2Type[type]] : null;
};

const withIcon = (type: string) => {
  const icon = iconFromType(type);
  return icon ? { icon } : {};
};

export const createMenuListFromSchema: (
  schema: JSONSchema7,
  getPermission: (typeName: string) => Permission,
  t: TFunction,
) => MenuGroup = (exhibitionSchema, getPermission, t) => ({
  id: "lists",
  type: "group",
  children: [
    ...topLevel.map(
      (key) =>
        ({
          id: `list_${key}`,
          title: t(key),
          type: "item",
          typeName: key,
          readOnly: !getPermission(key).edit,
          ...withIcon(key),
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
            ...withIcon(key),
          }) as MenuItem,
      ),
  ],
});
