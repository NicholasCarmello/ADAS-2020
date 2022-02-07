
var message = {};

/**
 * Updates the threshold values.
 * @param {DatabaseConnection} connection The MySQL datbase connection where the  weather data is stored.
 * @param {JSON} json The new values.
 * @callback {JSON} Dictionary of result information.
 */
function setThresholds(connection, json, callback){
    const UPDATE_QUERY = `UPDATE threshold
    SET stage1 = ${json.stage1}, stage2 = ${json.stage2}, stage3 = ${json.stage3}, stage4 = ${json.stage4} 
    WHERE thresholdID = 0;`;
    connection.query(UPDATE_QUERY, (err) => {
        if (err) {
            console.log(err);
            message = {status:500, text:"There was an issue with updating the thresholds."};
        } else { 
            //console.log("Thresholds successfully updated!");
            message = {status:200, text:"Thresholds were successfully updated."};
        }
        callback(message);
    });
}

/**
 * Gets the threshold values.
 * @param {DatabaseConnection} connection The MySQL datbase connection where the  weather data is stored.
 * @callback {JSON} Dictionary of result information.
 */
function getThresholds(connection, callback){
    const SELECT_QUERY = `SELECT stage1, stage2, stage3, stage4 FROM threshold;`;
    connection.query(SELECT_QUERY, (err, result) => {
        if (err) {
            message = {status:500, text:"There was a problem getting the thresholds."};
            console.log(err);
            callback(message);
        } else{
            //console.log("Thresholds sent to the front end.");
            
            message = {status:200, text:"The thresholds were successfully retrieved."};
            //resultObj = Object.assign(result[0], message);
            //callback(resultObj);
           
        }
    });
}

module.exports.setThresholds = setThresholds;
module.exports.getThresholds = getThresholds;