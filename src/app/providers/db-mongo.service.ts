import { Injectable, NgZone } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { DbCredentials } from '../interfaces/db-credentials';
const MongoClient = (<any>window).require('mongodb').MongoClient;

@Injectable()
export class DBMongoService {
    db: any;
    constructor(private ngZone: NgZone) { }

    connect(dbData: DbCredentials, callback) {

        const url = 'mongodb://' + ((dbData.user && dbData.password) ? (dbData.user + ':' + dbData.password + '@') : '') + dbData.host + ':' + (dbData.port || 27017) + '/' + dbData.db;

        MongoClient.connect(url, (err, client) => {

            if (err) {
                return callback(err);
            }

            console.log('Connected correctly to Database');
            this.db = client.db(dbData);
            // [Sat] don't forget to close the connection
            return callback();
        });
    }

    queryDB(query) {
        return new Observable((observer) => {

            if (!this.db) {
                observer.error('No connected database found');
            }

            const methodCheck = '.aggregate(';

            if (query.indexOf(methodCheck) === -1) {
                observer.error('Only aggregates are supported. Send a query in this form: myCollection.aggregate([ ...aggregation stages... ])');
            }

            const collection = query.substr(0, query.indexOf(methodCheck));

            if (!collection) {
                observer.error('No collection has been sent');
            }

            const queryString = query.substr((query.indexOf(methodCheck) + methodCheck.length), (query.length - (query.indexOf(methodCheck) + methodCheck.length) - 1));

            try {
                JSON.parse(queryString);
            } catch (e) {
                this.ngZone.run(() => {
                    observer.error(e);
                });
            }

            const queryObject = JSON.parse(queryString);

            this.db.collection(collection)
                .aggregate(queryObject)
                .toArray((err, output) => {

                    if (err) {
                        this.ngZone.run(() => {
                            observer.error(err);
                        });
                    } else {
                        this.ngZone.run(() => {
                            observer.next(output);
                        });
                    }

                });
        });
    }

}
