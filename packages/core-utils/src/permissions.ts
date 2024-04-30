import { Permission } from "@slub/edb-core-types";

export const fullPermission: Permission = {
  view: true,
  edit: true,
};

export const viewerPermission: Permission = {
  view: true,
  edit: false,
};

export const noPermission: Permission = {
  view: false,
  edit: false,
};

export const defaultPermission = viewerPermission;
