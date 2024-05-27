import { schema as exhibitionSchema } from "@slub/exhibition-schema";
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
  Exhibition: fullPermission,
  Tag: fullPermission,
  Person: fullPermission,
  Corporation: fullPermission,
  ExhibitionExponat: fullPermission,
  Genre: fullPermission,
  Place: fullPermission,
  Location: fullPermission,
  ExhibitionSeries: fullPermission,
  Resource: fullPermission,
};
