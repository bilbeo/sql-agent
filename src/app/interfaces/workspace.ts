import { Datasource } from "./datasource";

export interface Workspace {
    _id: string;
    name: string;
    owner: string;
    startWeekMonday: boolean;
    breakdowns: Array<any>;
    dimensions: Array<any>;
    indicators: Array<any>;
    dataSources: Array<Datasource>;
    permissionGroups: Array<any>;
}

