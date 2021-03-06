import { DbCredentials } from '../../interfaces/db-credentials';
import * as async from 'async';
const Connection = (<any>window).require('tedious').Connection;
const Request = (<any>window).require('tedious').Request;

const executeQueries = function (dbData: DbCredentials, queries, options, cb) {

  const config = {
    server: dbData.host,
    authentication: {
      type: 'default',
      options: {
        userName: dbData.user,
        password: dbData.password
      }
    },
    options: {
      port: dbData.port || 1433,
      database: dbData.db,
      readOnlyIntent: true,
      useColumnNames: true,
      encrypt: true,
      requestTimeout: 90000,
      connectTimeout: 90000
    }
  };

  const connection = new Connection(config);
  connection.on('connect', function (err) {
    if (err) {
      return cb(err);
    }
    const result = [];
    async.eachSeries(queries, function (query, callback) {
      const queryResult = {
        columns: [],
        rows: []
      };

      const request = new Request(query, function (error) {
        if (error) {
          result.push(new Error(error));
        } else {
          result.push(queryResult);
        }
        return callback();
      });

      request.on('columnMetadata', function (columns) {
        queryResult.columns = Object.keys(columns);
      });

      request.on('row', function (columns) {
        const row = [];
        for (const column in columns) {
          if (columns.hasOwnProperty(column)) {
            row.push(columns[column].value);
          }
        }
        queryResult.rows.push(row);
      });

      connection.execSql(request);
    }, function () {
      connection.close();
      return cb(null, result);
    });
  });
  connection.on('error', function (err) {
    return cb(err);
  });
};

const testConnection = function (dbData: DbCredentials, options, cb) {
  const config = {
    server: dbData.host,
    authentication: {
      type: 'default',
      options: {
        userName: dbData.user,
        password: dbData.password
      }
    },
    options: {
      port: dbData.port || 1433,
      database: dbData.db,
      rowCollectionOnDone: true,
      rowCollectionOnRequestCompletion: true,
      encrypt: true
    }
  };
  const connection = new Connection(config);
  connection.on('connect', function (err) {
    if (err) {
      return cb(err);
    }
    connection.close();
    cb(null, 'Connection Established Successfully');
  });
};

export {
  testConnection,
  executeQueries
};
