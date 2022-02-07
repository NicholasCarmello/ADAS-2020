var mysql = require('mysql2');
var config = require('../config.json');

/** MySQL connection pool */
var pool = mysql.createPool({
    host    : config.database.host,
    user    : config.database.user,
    password: config.database.password,
    database: config.database.database
});

/**
 * Callback to return the result of the database update.
 * 
 * @callback queryCallback
 * @param {MysqlError} err The error (if any).
 * @param {Object} result The result object from the database.
 */

/**
 * Queries the database using a MySQL pool connection.
 * @param {string} queryStr The string query to send.
 * @param {Array} sql_args MySql arguements.
 * @param {queryCallback} callback
 */
function query(queryStr, callback) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        connection.query(queryStr, function(err, results) {
            connection.release(); // always put connection back in pool after last query
            if (err){
                    console.log(err);
                    return callback(err);
                }
            callback(null, results);
        });
    });
}

module.exports.query = query;