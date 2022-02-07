var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var apiService = require('./routes/api');
var emailService = require('./routes/email');
var thresholdService = require('./routes/threshold');
var modelService = require('./util/model');
var connection = require("./util/database");
var config = require('./config.json');
var message = {status:"error", text:"Default error message"};

var app = express();
//const WEATHERGOV_STR = config.externalAPIs.weathergov.url;
const DARKSKY_STR = config.externalAPIs.darksky.url;
const OPENWEATHER_STR = config.externalAPIs.openweathermap.url;

// Ensure express sees the whole public folder
app.use(express.static(path.join(__dirname, 'public')));

// Allow Express/Node to handle POST requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// in hours
/** @type {number} The interval (in hours) that the weather data will update at */
var updateInterval = 24;
const msToHour = 3600000;
/** The timer object used to keep track of current timeout */
let timerId;

// start listening on port 8080
app.listen(config.server.port, () => {
    console.log("Server is running on port", config.server.port);
    // get initial weather data when server starts
    apiService.updateWeatherData(connection, success => {
        if (success) {
            console.log(new Date().toLocaleString(), " Successful updates everywhere.");
            modelService.getRefreshRate(connection, refreshRate => {
                updateInterval = refreshRate;
                console.log("Interval: ", updateInterval);
                timerId = setTimeout(checkInterval, updateInterval * msToHour);
                if (requiresEmail()) {
                    console.log("Sending emails");
                    emailService.sendEmail(connection);
                }
            });
        } else {
            console.error("An api update failed");
        }
    });
});

/**
 * Updates the weather data using external APIs, determines a new update interval, 
 * and sets a new timeout using the data
 */
function checkInterval() {
    console.log("\n\n===========================================================");
    // fill the URL array
    apiService.updateWeatherData(connection, success => {
        if (success) {
            console.log(new Date().toLocaleString(), " Successful updates everywhere.");
            modelService.getRefreshRate(connection, refreshRate => {
                updateInterval = refreshRate;
                console.log("Interval: ", updateInterval);
                timerId = setTimeout(checkInterval, updateInterval * msToHour);
                if (requiresEmail()) {
                    console.log("Sending emails");
                    emailService.sendEmail(connection);
                }
            });
        } else {
            console.log("Update of External API data failed. Update interval set to 12.");
            updateInterval = 12;
        }
    });
}

// when the server is requested, this is shown
app.get('/', (err, request, response) => {
    // console.log('Landing page requested');
    // console.log('Sending path: ' + path.join(__dirname, '../public', 'index.html'));
    response.sendFile(path.join(__dirname, '/public', 'index.html'));
});

/** Gets and returns the weather data from darksky.ney from the database. */
app.get('/api/forecast/darkskynet', (req, res) => {
    connection.query(buildForecastQuery(DARKSKY_STR), (err, result) => {
        if (err) {
            res.status(500).send(null);
            throw err;
        } else {
            res.status(200).send(JSON.stringify(result[0]));
        }
    });
});

/** Gets and returns the weather data from openweathermap.org from the database. */
app.get('/api/forecast/openweathermaporg', (req, res) => {
    connection.query(buildForecastQuery(OPENWEATHER_STR), (err, result) => {
        if (err) {
            res.status(500).send(null);
            throw err;
        } else {
            res.status(200).send(JSON.stringify(result[0]));
        }
    });
});


//Email Routes
/**
 * Inserts a new email into the database.
 * @param {XMLHttpRequest} req The POST request containing an email to insert into the database.
 * @param {DatabaseConnection} con The MySQL datbase connection where the emails are stored.
 */
app.post("/api/email", (req, res) => {
    emailService.insertEmail(req, connection, result => {
        res.status(result.status).send(result);
    });
});


/**
 * Removes an existing email from the database.
 * @param {XMLHttpRequest} req The POST request containing an email to remove from the database.
 * @param {DatabaseConnection} con The MySQL datbase connection where the emails are stored.
 */
app.delete("/api/email", (req, res) => {
    emailService.removeEmail(req, connection, result => {
        res.status(result.status).send(result);
    });
});


//Threshold Routes
/** Gets and returns the weather data from weather.gov from the database. */
app.put("/api/threshold", (req, res) => {
    let body = req.body;
    thresholdService.setThresholds(connection, body, setResult => {
        if (setResult.status == 200) {
            thresholdService.getThresholds(connection, getResult => {
                getResult.text = setResult.text;
                res.status(getResult.status).send(getResult);
            });
        } else {
            res.status(500).send(setResult);
        }
    });
});

/** Gets and returns threshold and weather data */
app.get("/api/getData/:api", (req, res) => {
    thresholdService.getThresholds(connection, getResult => {
        if (getResult.status == 200) {
            connection.query(buildForecastQuery(req.params.api), (err, weatherResult) => {
                if (err) {
                    res.status(500).send(null);
                    console.log(err);
                } else {
                    let resultObj = Object.assign(getResult, weatherResult[0]);
                    res.status(200).send(JSON.stringify(resultObj));
                }
            });
        } else {
            console.log("Error getting thresholds.");
            res.status(500).send(null);
        }
    });
});

/* Create Route for first test file
*  /data/tests1
*/
app.get("/data/rainlogger", (req,res) => {
    //Connect to MySQL DB and get all data in rainlogger table
    connection.query(buildRainloggerQuery(), (err, result) => {
        if (err) {
            res.status(500).send(null);
            throw err;
        } else {
            res.status(200).send(JSON.stringify(result));
        }
    });
});

/* Create Route for second test file 
*  /data/test2
*/
app.get("/data/levelogger", (req,res) => {
    //Connect to MySQL DB and get all data in levelogger table
    connection.query(buildLeveloggerQuery(), (err, result) => {
        if (err) {
            res.status(500).send(null);
            throw err;
        } else {
            res.status(200).send(JSON.stringify(result));
        }
    });
});

// Helper functions
/**
 * Constructs the query to get forecast data from the database.
 * 
 * @param {string} api The name of the API to query.
 */
function buildForecastQuery(api) {
    return "SELECT * FROM weatherData WHERE sourceURL = '" + api + "';";
}

function buildRainloggerQuery() {
    return "SELECT DATE_FORMAT(CONVERT(dateTime, date), '%D') as date, SUM(rainFallInMilliMeters) as total from rainlogger WHERE (YEAR(dateTime) = YEAR(CURDATE())) AND (MONTH(dateTime) = MONTH(CURDATE())) GROUP BY date;";
}

function buildLeveloggerQuery() {
    return "SELECT DATE_FORMAT(CONVERT(dateTime, date), '%D') as date, AVG(levelInMeters) as average from levelogger WHERE (YEAR(dateTime) = YEAR(CURDATE())) AND (MONTH(dateTime) = MONTH(CURDATE())) GROUP BY date;";
}

/** Determines if the email notification should be sent. */
function requiresEmail() {
    if (updateInterval < 24) {
        return true;
    } else {
        return false;
    }
}