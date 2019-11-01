export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    startWeekMonday: boolean;
    showLastValue: boolean;
    isExcel: boolean;
    isSql: boolean;
    breakdowns: Array<any>;
    breakdownsIDs: any;
    dimensions: Array<any>;
    dimensionsIDs: any;
    indicators: Array<any>;
    indicatorsIDs: any;
    dataSources: Array<any>;
    permissionGroups: Array<any>;
}

