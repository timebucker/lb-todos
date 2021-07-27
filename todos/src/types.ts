import { UserProfile } from "@loopback/security"

export interface MyUserProfile extends UserProfile {
    id: number;
    username: String;
    projectId: number;
    roleId: number;
    permissions: number[];
}