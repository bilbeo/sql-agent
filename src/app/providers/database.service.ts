import { Injectable, NgZone } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { DbCredentials } from '../interfaces/db-credentials';
const mysql = (<any>window).require('mysql');
declare var moment: any;

@Injectable()
export class DatabaseService {

    constructor(private ngZone: NgZone) {

    }

    private dbList = {
        // sqlServer: {
        //     name: 'Microsoft SQL Server',
        //     order: 2,
        //     script: require('./db/sqlServer'),
        //     defaultPort: 1433
        // },
        // azureSql: {
        //     name: 'Azure SQL',
        //     order: 3,
        //     script: require('./db/azureSql'),
        //     defaultPort: 1433
        // },
        // oracle: {
        //     name: 'Oracle',
        //     order: 4,
        //     script: require('./db/oracle'),
        //     defaultPort: 1521
        // },
        mysql: {
            name: 'MySQL',
            order: 1,
            script: require('./db-connectors/mysql'),
            defaultPort: 3306
        },
        // postgreSql: {
        //     name: 'PostgreSQL',
        //     order: 5,
        //     script: require('./db/postgreSql'),
        //     defaultPort: 5432
        // },
        // db2: {
        //     name: 'IBM DB2',
        //     order: 8,
        //     script: require('./db/db2'),
        //     defaultPort: 50001
        // },
        // mariadb: {
        //     name: 'MariaDB',
        //     order: 7,
        //     script: require('./db/mariadb'),
        //     defaultPort: 3306
        // },
        // mongodb: {
        //     name: 'MongoDB',
        //     order: 10,
        //     script: require('./db/mongodb'),
        //     defaultPort: 27017
        // },
        // sybase: {
        //     name: 'SAP ASE / Sybase',
        //     order: 6,
        //     script: require('./db/sybase'),
        //     defaultPort: 5000
        // },
        // firebird: {
        //     name: 'Firebird',
        //     order: 9,
        //     script: require('./db/firebird'),
        //     defaultPort: 3050
        // }
    };

    executeQueries(type, credentials: DbCredentials, queries, options) {
        return new Observable((observer) => {
            if (Object.keys(this.dbList).indexOf(type) === -1) {
                observer.error('Unknown Database type');
            }
            if (!credentials.host || !credentials.db || !queries) {
                observer.error('Insufficient parameters');
            }
            let queriesRun = [];
            let singleQuery;

            if (typeof queries === 'string') {
                singleQuery = true;
                queriesRun = [queries];
            }
            if (typeof queries === 'object') {
                if (Array.isArray(queries)) {
                    if (typeof queries[0] === 'object') {
                        for (let i = 0; i < queries.length; i++) {
                            queriesRun.push(queries[i].query);
                        }
                    } else {
                        queriesRun = queries;
                    }
                } else {
                    singleQuery = true;
                    queriesRun = [queries.query];
                    queries = [queries];

                }
            }

            this.dbList[type].script.executeQueries(credentials, queriesRun, options, (err, data) => {
                if (err) {
                    observer.error(err);
                }

                if (options && options.withFormatting && options.indicators) {
                    for (let i = 0; i < data.length; i++) {
                        if (!(data[i] instanceof Error)) {
                            const indicatorId = queries[i].indicatorId;


                            const numberOfRows = data[i].rows.length ? data[i].rows.length : 0;
                            const formatted = this.format(data[i], options.indicators, indicatorId);
                            const numberOfInvalidRows = numberOfRows - data[i].rows.length;

                            data[i] = formatted instanceof Error ? formatted : {
                                raw: data[i],
                                formatted: formatted,
                                numberOfRows: numberOfRows,
                                numberOfInvalidRows: numberOfInvalidRows
                            };
                        }
                    }
                }

                if (singleQuery) {
                    data = data[0];
                }

                if (data instanceof Error) {
                    return observer.error(data);
                }
                this.ngZone.run(() => {
                    observer.next(data);
                });
            });
        });
    }

    testConnection(credentials: DbCredentials, type, options) {

        return new Observable((observer) => {

            if (Object.keys(this.dbList).indexOf(type) === -1) {
                observer.error('Unknown Database type');
            }
            if (!credentials.host || !credentials.db) {
                observer.error('Insufficient parameters');
            }

            this.dbList[type].script.testConnection(credentials, options, (err, data) => {
                if (err) {
                    observer.error(err.message);
                }

                this.ngZone.run(() => {
                    observer.next('Connection Established');
                });
            });

        });
    }

    private format(data, indicators, indicatorId) {
        if (!data.rows) {
            return [];
        }
        if (!data.rows.length) {
            return [];
        }

        const cols = data.columns;
        const rows = data.rows;

        indicators = this.pivotIndicators(indicators);
        if (!indicators[indicatorId]) {
            return [];
        }


        data = this.findColumnsAndSanitize(data);


        if (typeof data.parsedColumns.valueColumn === 'undefined' || typeof data.parsedColumns.dateColumn === 'undefined') {
            return new Error(`'value' and 'date' columns are mandatory`);
        }

        data = this.orderbyIdAndSanitize(data, indicators, indicatorId);
        data = this.pivotData(data);

        return data;
    }

    // find value, date indexes, dimension, breakdown values, remove other columns. Return those in data.parsedColumns ({valueColumn: 0, dateColumn: 2, dimensions: ['one', 'two'], breakdowns: ['three', 'four']})
    private findColumnsAndSanitize(data) {
        const cols = {};

        for (let i = 0; i < data.columns.length; i++) {
            // if(data.columns[i].trim().toLowerCase()==='id') cols.idColumn = i;
            if (data.columns[i].trim().toLowerCase() === 'value') {
                cols['valueColumn'] = i;
            }
            if (data.columns[i].trim().toLowerCase() === 'date') {
                cols['dateColumn'] = i;
            }
        }

        cols['dimensions'] = [];
        cols['breakdowns'] = [];

        let toSanitize = [];

        for (let i = 0; i < data.columns.length; i++) {
            if (i === cols['idColumn'] || i === cols['valueColumn'] || i === cols['dateColumn']) {
                continue;
            }

            if (data.columns[i].substr(0, 10).toLowerCase() === 'dimension_') {
                cols['dimensions'].push(data.columns[i].substr(10, data.columns[i].length - 1));
                continue;
            }

            if (data.columns[i].substr(0, 10).toLowerCase() === 'breakdown_') {
                cols['breakdowns'].push(data.columns[i].substr(10, data.columns[i].length - 1));
                continue;
            }

            toSanitize.push(i);
        }

        console.log('removing ' + toSanitize.length + ' invalid columns');

        // remove unwanted columns
        toSanitize = toSanitize.reverse();
        for (let i = 0; i < toSanitize.length; i++) {
            data.columns.splice(toSanitize[i], 1);
            if (cols['valueColumn'] > toSanitize[i]) {
                cols['valueColumn']--;
            }
            if (cols['dateColumn'] > toSanitize[i]) {
                cols['dateColumn']--;
            }

            for (let j = 0; j < data.rows.length; j++) {
                data.rows[j].splice(toSanitize[i], 1);
            }
        }

        data.parsedColumns = cols;
        return data;
    }

    private orderbyIdAndSanitize(data, indicators, indicatorId) {
        let toSanitize = [];
        const parsedIds = {};
        const idColumn = data.parsedColumns.idColumn;
        const dateColumn = data.parsedColumns.dateColumn;
        const valueColumn = data.parsedColumns.valueColumn;

        for (let i = 0; i < data.rows.length; i++) {

            // detects invalid rows
            if (
                !(
                    this.isValidDate(new Date(data.rows[i][dateColumn])) &&
                    typeof data.rows[i][valueColumn] === 'number' &&
                    !isNaN(data.rows[i][valueColumn])
                )
            ) {
                toSanitize.push(i);
                continue;
            }

            // extract dimensions
            const dimensions = {};
            for (let j = 0; j < data.parsedColumns.dimensions.length; j++) {
                if (data.rows[i][data.columns.indexOf('dimension_' + data.parsedColumns.dimensions[j])]) {
                    dimensions[data.parsedColumns.dimensions[j]] = data.rows[i][data.columns.indexOf('dimension_' + data.parsedColumns.dimensions[j])];
                }
            }

            // extract breakdowns
            const breakdowns = {};
            for (let j = 0; j < data.parsedColumns.breakdowns.length; j++) {
                if (data.rows[i][data.columns.indexOf('breakdown_' + data.parsedColumns.breakdowns[j])]) {
                    breakdowns[data.parsedColumns.breakdowns[j]] = data.rows[i][data.columns.indexOf('breakdown_' + data.parsedColumns.breakdowns[j])];
                }
            }

            // if a metric with the same dimensions and breakdowns exist
            // push the data
            const key = data.rows[i][idColumn] + 'dimensions_' + JSON.stringify(dimensions) + 'breakdowns_' + JSON.stringify(breakdowns);

            if (parsedIds[key]) {
                parsedIds[key].Data.push({
                    date: data.rows[i][dateColumn],
                    value: data.rows[i][valueColumn]
                });
                if (data.rows[i][dateColumn] < parsedIds[key].minDate) {
                    parsedIds[key].minDate = data.rows[i][dateColumn];
                }
                if (data.rows[i][dateColumn] > parsedIds[key].maxDate) {
                    parsedIds[key].maxDate = data.rows[i][dateColumn];
                }
                continue;
            }



            // prepares the update object keeping extra columns for data post processing
            parsedIds[key] = {
                HierarchySpec: dimensions,
                Breakdown: breakdowns,
                ID: indicators[indicatorId].publicID,
                TemporalSpec: {
                    Step: 1,
                    Granularity: indicators[indicatorId].aggregation
                },
                Data: [{
                    date: data.rows[i][data.parsedColumns.dateColumn],
                    value: data.rows[i][data.parsedColumns.valueColumn]
                }],
                minDate: data.rows[i][data.parsedColumns.dateColumn],
                maxDate: data.rows[i][data.parsedColumns.dateColumn],
                aggregation: indicators[indicatorId].aggregation,
                sum: indicators[indicatorId].sum
            };

        }
        console.log('removing ' + toSanitize.length + ' invalid rows');
        toSanitize = toSanitize.reverse();
        for (let i = 0; i < toSanitize.length; i++) {
            data.rows.splice(toSanitize[i], 1);
        }

        return parsedIds;
    }

    private pivotData(data) {


        const finalStrangeFormat = [];
        for (const item in data) {
            if (data.hasOwnProperty(item)) {
                // init data array with number of days nulls
                let numberOfValues = data[item].aggregation === 'Day' ? this.getDiffDays(data[item].minDate, data[item].maxDate) : this.getDiffMonths(data[item].minDate, data[item].maxDate);

                numberOfValues += 1;
                const dataArray = new Array(numberOfValues);
                const dataDenArray = new Array(numberOfValues);
                for (let i = 0; i < numberOfValues;) {
                    dataArray[i++] = null;
                }
                for (let i = 0; i < numberOfValues;) {
                    dataDenArray[i++] = null;
                }
                // filling the data array with arrayed values in order to aggregate
                for (let i = 0; i < data[item].Data.length; i++) {
                    const position = data[item].aggregation === 'Day' ? this.getDiffDays(data[item].minDate, data[item].Data[i].date) : this.getDiffMonths(data[item].minDate, data[item].Data[i].date);

                    if (dataArray[position]) {
                        dataArray[position].push(data[item].Data[i].value);
                    } else {
                        dataArray[position] = [data[item].Data[i].value];
                    }

                }
                // aggregating values
                const isSum = data[item].sum;
                for (let i = 0; i < dataArray.length; i++) {

                    if (dataArray[i]) {
                        const sum = dataArray[i].reduce(function (a, b) { return a + b; });
                        dataDenArray[i] = dataArray[i].length;
                        dataArray[i] = sum;
                    }
                }

                // clean up the object
                if (isSum) {
                    data[item].Data = dataArray;
                } else {
                    data[item].DataNum = dataArray;
                    data[item].DataDen = dataDenArray;
                    delete data[item].Data;
                }
                data[item].TemporalSpec.StartTime = this.convertDate(data[item].minDate);
                data[item].TemporalSpec.EndTime = this.convertDate(data[item].maxDate);
                delete data[item].minDate;
                delete data[item].maxDate;
                delete data[item].aggregation;
                delete data[item].sum;
                finalStrangeFormat.push(data[item]);
            }


        }

        return (finalStrangeFormat);
    }

    private convertDate(date) {
        const momentDate = moment.utc(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[momentDate.month()] + ' ' + momentDate.date() + ', ' + momentDate.year();
    }

    private pivotIndicators(indicators) {
        const pivotedIndicators = {};
        for (let i = 0; i < indicators.length; i++) {

            pivotedIndicators[indicators[i]._id] = {
                publicID: indicators[i].publicID,
                sum: indicators[i].aggregation === 'sum' ? true : false,
                aggregation: indicators[i].displayGranularity
            };
        }
        return pivotedIndicators;
    }

    private isValidDate(d) {
        if (Object.prototype.toString.call(d) !== '[object Date]') {
            return false;
        }

        return !isNaN(d.getTime());
    }

    private getConnectionTypes(cb) {
        const types = [];
        for (const key in this.dbList) {
            if (this.dbList.hasOwnProperty(key)) {
                types.push({
                    key: key,
                    name: this.dbList[key].name,
                    order: this.dbList[key].order,
                    port: this.dbList[key].defaultPort
                });
            }

        }
        return cb(null, types);

    }

    // stackoverflow.com/q/2536379
    private getDiffMonths = function (d1, d2) {
        let months;

        if (d1 > d2) {
            const dTemp = d1;
            d1 = d2;
            d2 = dTemp;
        }

        const date1 = new Date(d1);
        const date2 = new Date(d2);
        months = (date2.getFullYear() - date1.getFullYear()) * 12;
        months -= date1.getMonth();
        months += date2.getMonth();
        return months <= 0 ? 0 : months;
    };

    // stackoverflow.com/q/3224834
    // the more recent date should be sent in the second parameter
    // in order for the response to be right
    private getDiffDays = function (d1, d2) {
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        date1.setHours(12, 0, 0, 0);
        date2.setHours(12, 0, 0, 0);
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        return (Math.round(timeDiff / (1000 * 3600 * 24)));
    };



}
