export interface Datasource {
    _id: string;
    defaultLang?: string;
    langs?: Array<string>;
    name: string;
    owner: string;
    indicators: Array<any>;
    metrics: Array<any>;
    isPublic?: boolean;
    isGoogle?: boolean;
}

