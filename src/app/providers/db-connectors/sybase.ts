const Sybase = (<any>window).require('sybase');
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
  const db = new Sybase(credentials.host, credentials.port, credentials.db, credentials.user, credentials.password);

  db.connect(function (err) {
    if (err) {
      return cb(err);
    }

    const result = [];

    async.eachSeries(queries, function (query, callback) {
      db.query(query, function (error, data) {

        if (error) {
          result.push(new Error(error));
        } else {
          result.push(formatOutput(data));
        }
        return callback();
      });

    }, function () {
      db.disconnect();
      return cb(null, result);
    });
  });
};

const testConnection = function (credentials: DbCredentials, options, cb) {
  const db = new Sybase(credentials.host, credentials.port, credentials.db, credentials.user, credentials.password);

  db.connect(function (err) {
    if (err) {
      return cb(err);
    }
    db.disconnect();
    cb(null, 'Connection Established Successfully');
  });
};

export {
  executeQueries,
  testConnection
};
