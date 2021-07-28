import { User } from "../../models"
import { MyUserProfile } from "../../types"

export const enum DefinePermission {
    Default = 0,
    ReadAll = 1,
    WriteAll = 2,
}

export const enum DefineRole {
    User = 0,
    Admin = 1
}

export const enum DefineAuthorizeAction {
    Read = 0,
    Write = 1
}

export class AuthorizeService {
    getPermissions(roleId: number): DefinePermission[] {
        switch (roleId) {
            case DefineRole.Admin:
                return [DefinePermission.ReadAll, DefinePermission.WriteAll, DefinePermission.Default]

            case DefineRole.User:
                return [DefinePermission.Default]

            default:
                return []
        }
    }

    async shouldAllow(currentUser: MyUserProfile, ownerUser: User, action: DefineAuthorizeAction): Promise<Boolean> {
        if (currentUser.projectId != ownerUser.projectId) {
            return false
        }

        let currPermission = this.getPermissions(currentUser.roleId)
        if (action == DefineAuthorizeAction.Write && currPermission.includes(DefinePermission.WriteAll)) {
            return true
        }

        if (action == DefineAuthorizeAction.Read && currPermission.includes(DefinePermission.ReadAll)) {
            return true
        }

        return (currentUser.id == ownerUser.id)
    }
}