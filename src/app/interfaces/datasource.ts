export interface Datasource {
    _id: string;
    type: string;
    isExcel?: boolean;
    isDb?: boolean;
    isGoogleAnalytics?: boolean;
    queries?: Array<any>;
    credentials?: any;
}

