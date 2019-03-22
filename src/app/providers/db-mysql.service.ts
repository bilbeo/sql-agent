import { Injectable, NgZone } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { DbCredentials } from '../interfaces/db-credentials';
const mysql = (<any>window).require('mysql');

@Injectable()
export class DBMySqlService {
    db: any;
    constructor(private ngZone: NgZone) { }

    connect(dbData: DbCredentials, callback) {
        this.db = mysql.createConnection({
            host: dbData.host,
            port: dbData.port,
            user: dbData.user,
            password: dbData.password,
            database: dbData.db
        });

        this.db.connect((err) => {
            if (err) {
                return callback(err);
            }
            console.log('Connection tested');

            return callback();
        });
    }

    queryDB(queryString) {
        return new Observable((observer) => {

            if (!this.db) {
                observer.error('No connected database found');
            }
            this.db.query(queryString, (error, results, fields) => {
                if (error) {
                    observer.error(error);
                }

                this.ngZone.run(() => {
                    observer.next(results);
                });
            });
        });
    }
}

