const { Client } = (<any>window).require('pg');
import * as async from 'async';
import { DbCredentials } from '../../interfaces/db-credentials';

const formatOutput = function (output) {
  const columns = [];
  for (let i = 0; i < output.fields.length; i++) {
    columns.push(output.fields[i].name);
  }
  const rows = [];

  for (let i = 0; i < output.rows.length; i++) {
    const row = [];
    for (const value in output.rows[i]) {
      if (output.rows[i].hasOwnProperty(value)) {
        row.push(output.rows[i][value]);
      }

    }
    rows.push(row);
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
  const connectionString = 'postgres://' + credentials.user + ':' + encodeURIComponent(credentials.password) + '@' + credentials.host + ':' + (credentials.port || 5432) + '/' + credentials.db;
  const client = new Client({
    connectionString: connectionString,
  });

  client.connect(function (err) {
    if (err) {
      return cb(err);
    }

    const result = [];
    async.eachSeries(queries, function (query, callback) {
      client.query(query, function (error, queryResult) {
        if (error) {
          result.push(new Error(error));
        } else {
          result.push(formatOutput(queryResult));
        }
        return callback();
      });
    }, function () {
      client.end();
      return cb(null, result);
    });
  });
};

const testConnection = function (credentials: DbCredentials, options, cb) {
  const connectionString = 'postgres://' + credentials.user + ':' + encodeURIComponent(credentials.password) + '@' + credentials.host + ':' + (credentials.port || 5432) + '/' + credentials.db;
  const client = new Client({
    connectionString: connectionString,
  });
  client.connect(function (err) {
    if (err) {
      return cb(err);
    }
    client.end();
    cb(null, 'Connection Established Successfully');
  });
};

export {
  testConnection,
  executeQueries
};
