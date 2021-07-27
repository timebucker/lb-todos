
export const enum DefinePermission {
    Default = 0,
    ReadAll = 1,
    WriteAll = 2,
}

export const enum DefineRole {
    User = 0,
    Admin = 1
}

export class AuthorizeService {
    async getPermissions(roleId: number): Promise<DefinePermission[]> {
        return Promise.resolve(rolePermissions(roleId))
    }
}

function rolePermissions(role: DefineRole): DefinePermission[] {
    switch (role) {
        case DefineRole.Admin:
        return [DefinePermission.ReadAll, DefinePermission.WriteAll, DefinePermission.Default]

      case DefineRole.User:
        return [DefinePermission.Default]
        
      default:
        return []
    }
}