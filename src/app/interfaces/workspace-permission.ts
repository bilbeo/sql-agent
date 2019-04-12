export interface WorkspacePermission {
    _id: string;
    isAdmin: boolean;
    workspaceId: string;
    indicatorPermission: string;
    dimensionPermission: string;
    canUpdate: boolean;
    name?: string;
}

