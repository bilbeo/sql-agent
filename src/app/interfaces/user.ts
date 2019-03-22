import { WorkspacePermission } from "./workspace-permission";

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    mail: string;
    language: string;
    photoURL?: string;
    workspacePermission: Array<WorkspacePermission>;
    logoURL?: string;
    webURL?: string,
    isOEM?: boolean;
    APIKey: string;
    ownerId?: string,
    custom?: any;
}

