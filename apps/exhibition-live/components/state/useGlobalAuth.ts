import { fullPermission, noPermission } from "@slub/edb-core-utils";
import { create } from "zustand";
import { Permission } from "@slub/edb-core-types";
import { editorPermissions } from "../config";

export enum RoleType {
  Admin = "admin",
  Editor = "editor",
}

type UseGlobalAuth = {
  role: RoleType;
  setRole: (role: RoleType) => void;
  getPermission: (typeName: string) => Permission;
};

export const useGlobalAuth = create<UseGlobalAuth>((set, get) => ({
  role: RoleType.Admin,
  setRole: (role) => set({ role }),
  getPermission: (typeName) => {
    const { role } = get();
    switch (role) {
      case RoleType.Admin:
        return fullPermission;
      case RoleType.Editor:
        return typeName in editorPermissions
          ? editorPermissions[typeName]
          : noPermission;
      default:
        return noPermission;
    }
  },
}));
