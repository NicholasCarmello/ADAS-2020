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
var rainloggerData = [];
var leveloggerData = [];

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

/* Create inital readline for tests1/Rainlogger graph 
*  Makes it so the data appears populates the graphs 
*  when the page first loads*/
const fs = require("fs");
readline = require('readline');

var rd = readline.createInterface({
    input: fs.createReadStream('./test1.txt'),
    output: process.stdout,
    console: false
});
rd.on('line', function(line) {
    var line = line.split(' ');
    rainloggerData.push({"Time": line[0], "Inches": line[1]});
    //console.log(rainloggerData)
});

/* Create Route for first test file
*  /data/tests1
*/
app.get("/data/tests1", (req,res) => {
    const fs = require("fs");
    readline = require('readline');

    var rd = readline.createInterface({
        input: fs.createReadStream('./test1.txt'),
        output: process.stdout,
        console: false
    });
    rd.on('line', function(line) {
        var line = line.split(' ');
        rainloggerData.push({"Time": line[0], "Inches": line[1]});
        //console.log(rainloggerData)
    });
    res.json(rainloggerData);
    rainloggerData = [];
});

/* Create inital readline for tests2/Levelogger graph 
*  Makes it so the data appears populates the graphs 
*  when the page first loads*/
var rd = readline.createInterface({
    input: fs.createReadStream('./test2.txt'),
    output: process.stdout,
    console: false
});
rd.on('line', function(line) {
    var line = line.split(' ');
    leveloggerData.push({"Time": line[0], "Inches": line[1]});
    //console.log(leveloggerData)
});

/* Create Route for second test file 
*  /data/tests2
*/
app.get("/data/tests2", (req,res) => {
    const buffer = readFileSync("database.mdb");
    const reader = new MDBReader(buffer);

    reader.getTableNames(); // ['Cats', 'Dogs', 'Cars']

const table = reader.getTable("Cats");
table.getColumnNames();
    const fs = require("fs");
    readline = require('readline');

    var rd = readline.createInterface({
        input: fs.createReadStream('./test2.txt'),
        output: process.stdout,
        console: false
    });
    rd.on('line', function(line) {
        var line = line.split(' ');
        leveloggerData.push({"Time": line[0], "Inches": line[1]});
        //console.log(leveloggerData)
    });
    res.json(leveloggerData);
    leveloggerData = [];
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
/*var ADODB = require('node-adodb');
ADODB.debug = true;

// Connect to the MS Access DB
var connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=C:\\dbs\\my-access-db.accdb;Persist Security Info=False;');

// Query the DB
connection
    .query('SELECT * FROM [TestTable];')
    .on('done', function (data){
        console.log('Result:'.green.bold, data);
    })*/
/** Determines if the email notification should be sent. */
function requiresEmail() {
    if (updateInterval < 24) {
        return true;
    } else {
        return false;
    }
}