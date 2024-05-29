import { Permission, PermissionDeclaration } from "@slub/edb-core-types";

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

export const editorPermissions: Partial<PermissionDeclaration<string>> = {
  Authority: fullPermission,
  Corporation: fullPermission,
  Event: fullPermission,
  Location: fullPermission,
  Performance: fullPermission,
  Person: fullPermission,
  Series: fullPermission,
  Source: fullPermission,
  Subject: fullPermission,
  Work: fullPermission,
};
