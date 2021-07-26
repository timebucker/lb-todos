import { Principal } from "@loopback/security"

export interface MyUserProfile extends Principal {
    id: number;
    username: String;
    roleId: number;
    permissions: number[];
}

export const enum DefinePermission {
    Default =0,
    ReadAll =1
}

export const enum DefineRole {
    User = 0,
    Admin = 1
}

export function rolePermissions(role: DefineRole): DefinePermission[] {
    switch (role) {
        case DefineRole.Admin:
        return [DefinePermission.ReadAll, DefinePermission.Default]

      case DefineRole.User:
        return [DefinePermission.Default]
        
      default:
        return []
    }
}