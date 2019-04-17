// TODO: TO BE TESTED!!!!!
const ibmdb = (<any>window).require('ibm_db');
import * as async from 'async';

import { DbCredentials } from '../../interfaces/db-credentials';

const formatOutput = function (output) {
  const columns = [];
  const rows = [];

  for (let i = 0; i < output.length; i++) {
    rows[i] = [];
    for (let j = 0; j < Object.keys(output[i]).length; j++) {
      if (columns.indexOf(Object.keys(output[i])[j]) ===  -1) {
        columns.push(Object.keys(output[i])[j]);
      }
      rows[i][columns.indexOf(Object.keys(output[i])[j])] = output[i][Object.keys(output[i])[j]];
    }
  }

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length !== columns.length) {
      rows[i][columns.length - 1] = null;
    }
  }

  for (let i = 0; i < columns.length; i++) {
    if (columns[i].trim().toLowerCase() ===  'value') {
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

  const connectionString = 'DATABASE=' + credentials.db + ';HOSTNAME=' + credentials.host + ';UID=' + credentials.user + ';PWD=' + credentials.password + ';PORT=' + (credentials.port || 50001) + ';PROTOCOL=TCPIP';

  ibmdb.open(connectionString, function (err, db) {
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
      db.close(function () {
        return cb(null, result);
      });
    });
  });
};

const testConnection = function (credentials: DbCredentials, options, cb) {
  const connectionString = 'DATABASE=' + credentials.db + ';HOSTNAME=' + credentials.host + ';UID=' + credentials.user + ';PWD=' + credentials.password + ';PORT=' + (credentials.port || 50001) + ';PROTOCOL=TCPIP';

  ibmdb.open(connectionString, function (err, db) {
    if (err) {
      return cb(err);
    }
    db.close(function () {
      return cb(null, 'Connection Established Successfully');
    });
  });
};

export {
  executeQueries,
  testConnection
};
