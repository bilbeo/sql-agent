// mysql module supports mariadb https://github.com/mysqljs/mysql/issues/1685
// const client = (<any>window).require('mariasql');

const client = (<any>window).require('mysql');
import * as async from 'async';

import { DbCredentials } from '../../interfaces/db-credentials';

const formatOutput = function (output) {
  if (!output.length) {
    return { columns: [], rows: [] };
  }

  const columns = Object.keys(output[0]);
  const rows = [];
  for (let i = 0; i < output.length; i++) {
    const row = [];
    for (const value in output[i]) {
      if (output[i].hasOwnProperty(value)) {
        row.push(output[i][value]);
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
  const pool = client.createPool({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    database: credentials.db,
    port: credentials.port || 3306,
    connectTimeout: 90000
  });

  const result = [];
  async.eachSeries(queries, function (query, callback) {
    const qu = { sql: query, timeout: 90000 };

    pool.query(qu, function (err, rows, fields) {
      console.log(err);
      if (err) {
        result.push(new Error(err));
      } else {
        result.push(formatOutput(rows));
      }

      return callback();
    });
  }, function () {
    try {
      pool.end();
      return cb(null, result);
    } catch (err) {
      return cb(err);
    }
  });
};

const testConnection = function (credentials: DbCredentials, options, cb) {
  const db = client.createConnection({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    database: credentials.db
  });

  db.connect((err) => {
    if (err) {
      cb(err.message);
    }
    db.end();
    cb(null, 'Connection Established Successfully');
  });
};

export {
  executeQueries,
  testConnection
};

