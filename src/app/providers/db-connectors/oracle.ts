
// const oracledb = (<any>window).require('oracledb');
// import * as async from 'async';

// import { DbCredentials } from '../../interfaces/db-credentials';

// const formatOutput = function (output) {
//   const columns = [];
//   for (const column in output.metaData) {
//     if (output.metaData.hasOwnProperty(column)) {
//       columns.push(output.metaData[column].name);
//     }
//   }
//   for (let i = 0; i < columns.length; i++) {
//     if (columns[i].trim().toLowerCase() === 'value') {
//       for (let j = 0; j < output.rows.length; j++) {
//         output.rows[j][i] = parseFloat(output.rows[j][i]);
//       }
//     }
//   }
//   return { rows: output.rows, columns: columns };
// };

// const executeQueries = function (credentials: DbCredentials, queries, options, cb) {
//   const config = {
//     user: credentials.user,
//     password: credentials.password,
//     connectString: credentials.host + '/' + credentials.db + ':' + credentials.port || 1521
//   };

//   oracledb.getConnection(config, function (err, connection) {
//     if (err) {
//       return cb(err);
//     }
//     const result = [];
//     async.eachSeries(queries, function (query, callback) {
//       connection.execute(query, [], function (error, queryResult) {
//         if (error) {
//           result.push(new Error(error));
//         } else {
//           result.push(formatOutput(queryResult));
//         }
//         return callback();
//       });
//     }, function () {
//       connection.close(function (error) {
//         if (error) {
//           return cb(error);
//         }
//         return cb(null, result);
//       });
//     });
//   });
// };

// const testConnection = function (credentials: DbCredentials, options, cb) {
//   const config = {
//     user: credentials.user,
//     password: credentials.password,
//     connectString: credentials.host + '/' + credentials.db + ':' + credentials.port || 1521
//   };

//   oracledb.getConnection(config, function (err, connection) {
//     if (err) {
//       return cb(err);
//     }
//     connection.close(function (error) {
//       if (error) {
//         return cb(error);
//       }
//       cb(null, 'Connection Established Successfully');
//     });
//   });
// };

// export {
//   testConnection,
//   executeQueries
// };
