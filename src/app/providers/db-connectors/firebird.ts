const firebird = (<any>window).require('node-firebird');
import * as async from 'async';

import { DbCredentials } from '../../interfaces/db-credentials';

const formatOutput = function (output) {
  const columns = [];
  const rows = [];

  for (let i = 0; i < output.length; i++) {
    rows[i] = [];
    for (let j = 0; j < Object.keys(output[i]).length; j++) {
      if (columns.indexOf(Object.keys(output[i])[j]) === -1) {
        columns.push(Object.keys(output[i])[j]);
      }
      rows[i][columns.indexOf(Object.keys(output[i])[j])] = output[i][Object.keys(output[i])[j]];

      if (typeof rows[i][columns.indexOf(Object.keys(output[i])[j])] === 'string') {
        rows[i][columns.indexOf(Object.keys(output[i])[j])] = rows[i][columns.indexOf(Object.keys(output[i])[j])].trim();
      }
    }
  }

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length !== columns.length) {
      rows[i][columns.length - 1] = null;
    }
  }

  for (let i = 0; i < columns.length; i++) {
    if (columns[i].trim().toLowerCase() === 'value') {
      for (let j = 0; j < rows.length; j++) {
        rows[j][i] = parseFloat(rows[j][i]);
      }
    }
  }

  return {
    columns: columns,
    rows: rows
  };
};

const executeQueries = function (credentials: DbCredentials, queries, options, cb) {

  const connectionData = {
    host: credentials.host,
    port: credentials.port || 3050,
    database: credentials.db,
    user: credentials.user,
    password: credentials.password
  };

  firebird.attach(connectionData, function (err, db) {

    if (err) {
      return cb(err);
    }

    const result = [];

    async.eachSeries(queries, function (query, callback) {
      db.query(query, function (error, rows) {

        if (error) {
          result.push(new Error(error));
        } else {
          result.push(formatOutput(rows));
        }
        return callback();
      });
    }, function () {
      db.detach(function () {
        return cb(null, result);
      });
    });
  });
};

const testConnection = function (credentials: DbCredentials, options, cb) {

  const connectionData = {
    host: credentials.host,
    port: credentials.port || 3050,
    database: credentials.db,
    user: credentials.user,
    password: credentials.password
  };

  firebird.attach(connectionData, function (err, db) {

    if (err) {
      return cb(err);
    }

    db.detach(function () {
      return cb(null, 'Connection Established Successfully');
    });
  });
};

export {
  executeQueries,
  testConnection
};

