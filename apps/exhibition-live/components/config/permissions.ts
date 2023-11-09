import exhibitionSchema from "../../public/schema/Exhibition.schema.json";

export type Permission = {
  view: boolean;
  edit: boolean;
};

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

type ExhibitionPermissionDeclaration = {
  [typeName in keyof typeof exhibitionSchema.$defs]: Permission;
};

export const editorPermissions: Partial<ExhibitionPermissionDeclaration> = {
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
  OtherDate: fullPermission,
};
