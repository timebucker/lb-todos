import {Principal} from "@loopback/security"

export interface MyUserProfile extends Principal {
    id: number;
    username: String;
    role: number;
    permissions: number[];
}