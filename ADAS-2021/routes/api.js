var fetch = require('node-fetch');
var xmlParser = require('xml2js');
var modelService = require('../util/model');
var config = require('../config.json');

/** @type {Array.<Array.<string>>} */
var apiRequests = [[],[],[]];
const WEATHERGOV_INDEX = 0; 
const DARKSKY_INDEX = 1;
const OPENWEATHER_INDEX = 2;
const WEATHERGOV_STR = config.externalAPIs.weathergov.url;
const DARKSKY_STR = config.externalAPIs.darksky.url;
const OPENWEATHER_STR = config.externalAPIs.openweathermap.url;

/** @type {string} */
const DARK_KEY = config.externalAPIs.darksky.key;
/** @type {string} */
const OPEN_KEY = config.externalAPIs.openweathermap.key;

const numDays = 4;
const inToCm = 2.54;
const hoursPerDay = 24;
const secPerDay = 86400;
const mmToCm = 10;

/** @type {Object} The MySQL datbase connection where the weather data is stored. */
var connection;

// weather.gov issues information for areas of 2.5km^2
// and the model calls for 27.2km^2, so 11 calls is an
// overestimate to be safe (by .3km^2)
// the other weather services will use these to average rainfall
const numRequests = config.externalAPIs.numRequests;
/**
 * Collection of Lat,Lon pairs around Landsman Kill watershed
 * @type {Array.<coordinates>}
 * @typedef {{lat: string, lon: string}} coordinates
 */
const weatherCoords = [
    {lat: "41.923353",lon: "-73.910896"},
    {lat: "41.920382", lon: "-73.892215"},
    {lat: "41.936087", lon: "-73.871999"},
    {lat: "41.957276", lon: "-73.831832"}, 
    {lat: "41.974786", lon: "-73.829070"}, 
    {lat: "41.920789", lon: "-73.856883"},
    {lat: "41.955634", lon: "-73.815172"},
    {lat: "41.932398", lon: "-73.809176"},
    {lat: "41.968015", lon: "-73.810358"},
    {lat: "41.937129", lon: "-73.835948"},
    {lat: "41.941213", lon: "-73.871472"}
];

/** Build the requests used by the update functions and store them. */
function buildApiRequestURLs() {
    let day0 = new Date();
    let day0s = Math.round(day0.getTime() / 1000);
    
    // empty the arrays to make room for the new values
    apiRequests[WEATHERGOV_INDEX].length = 0;
    apiRequests[DARKSKY_INDEX].length = 0;
    apiRequests[OPENWEATHER_INDEX].length = 0;

    for (let i = 0; i < numRequests; i++) {
        // create requests for weather.gov
        apiRequests[WEATHERGOV_INDEX].push('https://' + WEATHERGOV_STR + 
            '/gridpoints/ALY/' +  weatherGovPoints[i]);
        // create requests for darksky.net (need 4 requests per point since we need 4 days)
        // date is in seconds from UNIX epoch time
        for (let i = 0; i < numDays; i++) {
            apiRequests[DARKSKY_INDEX].push('https://' + DARKSKY_STR + '/forecast/' + DARK_KEY +
                '/' + weatherCoords[i].lat + ',' + weatherCoords[i].lon + ',' + 
                (day0s + (secPerDay * i)) + '?exclude=hourly,minutely');
        }
        // create requests for openweathermap.org
        apiRequests[OPENWEATHER_INDEX].push('https://' + OPENWEATHER_STR + 
            '/data/2.5/forecast?lat=' + weatherCoords[i].lat + '&lon=' + 
            weatherCoords[i].lon + '&mode=xml' + '&appid=' + OPEN_KEY);
    }
    /* apiRequests[WEATHERGOV_INDEX].forEach(url => {console.log("w: ", url)})
    apiRequests[DARKSKY_INDEX].forEach(url => {console.log("d: ", url)})
    apiRequests[OPENWEATHER_INDEX].forEach(url => {console.log("o: ", url)})
    console.log("\n") */
}

/** 
 * Update all of the weather sources and store them in the database.
 * 
 * @param {DatabaseConnection} con The MySQL datbase connection where the emails are stored.
 * @param {function} callback The success status of the external API updates.
 */
function updateWeatherData(con, callback) {
    connection = con;
    // fill the URL array
    buildApiRequestURLs();
    updateWeatherGov(weatherGovSuccess => {
        updateDarkSkyData(darkSkySuccess => {
            updateOpenWeatherMapData(openWeatherSuccess => {
                let success = weatherGovSuccess && 
                              darkSkySuccess && 
                              openWeatherSuccess;
                callback(success);
            });
        });
    });
}

/**
 * Send the query to update the database with new weather data.
 * 
 * @param {number[]} rainArr Averaged rain data for the week.
 * @param {number} totalPrecip The total precipitation expected from the api.
 * @param {string} api The base api string.
 * @param {function} callback The success status of the database update.
 * 
 * @example 
 * updateDB([0.0, 0.0, 0.0, 0.0], 100.0, api.weather.gov, {})
 */
function updateDB(rainArr, totalPrecip, api, callback) {
    // total rain in watershed for 4 days
    totalPrecip = modelService.calculateExpected(totalPrecip);
    // console.log("Total expected precipitation in watershed is ", totalPrecip, 'cm of water');
    let valves = modelService.calculateDurations(totalPrecip);
    let success = false;
    // update the db
    connection.query("SELECT * FROM weatherData WHERE sourceURL = '" + api + "';", 
    (err, row) => {
        if (err) {
            console.error("There was an error: ", err);
            callback(success);
        } else {
            if (row && row.length) {
                console.log(api + " row found! Updating table...");
                sql = "UPDATE weatherData SET day1 = " + rainArr[0] +
                ", day2 = " + rainArr[1] + 
                ", day3 = " + rainArr[2] + 
                ", day4 = " + rainArr[3] +
                ", discharge = " + totalPrecip +
                ", twoValves = " + valves[0] + 
                ", threeValves = " + valves[1] + 
                ", fourValves = " + valves[2] + 
                ", lastUpdate = NOW()" +
                " WHERE sourceURL = '" + api + "';";
                connection.query(sql, err => {
                    if (err) {
                        console.error("There was an error: ", err);
                    } else {
                        console.log("Table updated.\n");
                        success = true;
                    }
                    callback(success);
                });
            } else {
                console.log("Row not found :(");
                callback(success);
            }
        }   
    });
}

// Weather.gov functions

/* these values are found by hitting the weather.gov api at a 
points/lat,lon/forecast url which is translated to a gridpoint 
for more information */
/** @type {string[]} */
var weatherGovPoints = [
    "58,24",
    "59,24",
    "59,25",
    "59,25",
    "60,24",
    "60,25",
    "60,26",
    "60,27",
    "61,25",
    "61,26",
    "61,27"
]

/**
 * Update, average, and store data from weather.gov.
 * 
 * @param {function} callback The success status of the external API updates.
 */
function updateWeatherGov(callback) {
    console.log('Updating Weather.gov forecast...');
    let rainArr = [0, 0, 0, 0];
    let totalPrecip = 0;
    
    // get the forecast data from weather.gov and total
    getWeatherGovData(rain => {
        rain.forEach((total, index) => {
            // average the total rain fall across the watershed
            rainArr[index] = total / numRequests;
            totalPrecip += rainArr[index];
        });
        console.log("Average Weather.gov data rain: ", rainArr);
        updateDB(rainArr, totalPrecip, WEATHERGOV_STR, success => {
            callback(success);
        });
    });
}

/**
 * Total data from all requests to weather.gov.
 * 
 * @param {function} callback The total precipitation expected per day.
 */
function getWeatherGovData(callback) {
    let totalRain = [0, 0, 0, 0];
    let urlsProcessed = 0;
    apiRequests[WEATHERGOV_INDEX].forEach(url => {
        fetchGovData(url, rain => {
            urlsProcessed++;
            // take the total rain from each location and total them by day
            totalRain[0] += rain[0];
            totalRain[1] += rain[1];
            totalRain[2] += rain[2];
            totalRain[3] += rain[3];
            if (urlsProcessed == numRequests) {
                // console.log('Weather.gov total rain: ', totalRain);
                callback(totalRain);
            }
        });
    });
}

/**
 * Send the request to weather.gov to get json and format.
 * 
 * @param {string} url The url to fetch data from.
 * @param {function} callback The total precipitation expected per day.
 */
function fetchGovData(url, callback) {
    //console.log("Fetching Weather.gov data..");
    let totalRain = [];
    // issue the request and use the response inside once the promises return
    fetch(url).then(response => response.json())
    .then(json => {
        // console.log("Parsed JSON: ", json.properties['quantitativePrecipitation']);
        // sends quantity of predicted rainfall part of json
        totalRain = formatGovData(json.properties['quantitativePrecipitation'].values);
        callback(totalRain);
    })
    .catch(error => {
        console.log(error);
        callback(totalRain);
    });
}

/**
 * Parses rain data for the next four days.
 * 
 * @param {JSON} precipData The quantity of precipitation.
 * 
 * @returns {number[]} Next four days of predicted rainfall (in mm).
 */
function formatGovData(precipData) {
    // only storing 4 days of rainfall data including today
    let rainPerDay = [0, 0, 0, 0];
    let currentDay = new Date().getDate();

    /*  the data is returned as an array of key value pairs
        need to iterate through each pair and extract the data
        based on the relation to today */
    precipData.forEach(pair => {
        // validTime is the name of the key for the date
        let key = pair.validTime;
        let matchDay = /\d\dT/;
        let day = key.match(matchDay)[0].split("T")[0];

        //based on what day is currently open, accumulate CM for that day
        let index = day - currentDay;
        if (index < numDays) {
            rainPerDay[index] += pair.value / 10;
        }
    });
    return rainPerDay;
}

// DarkSky.net functions

/**
 * Update, average, and store data from darksky.net.
 * 
 * @param {function} callback The success status of the external API updates.
 */
function updateDarkSkyData(callback) {
    console.log('Updating DarkSky.net forecast...');
    let rainArr = [0, 0, 0, 0];
    let totalPrecip = 0;

    getDarkSkyData(rain => {
        rain.forEach((total, index) => {
            // average the total rain fall across the watershed
            rainArr[index] = total / numRequests;
            totalPrecip += rainArr[index];
        });
        console.log("Average DarkSky data rain: ", rainArr);
        updateDB(rainArr, totalPrecip, DARKSKY_STR, success => {
            callback(success);
        });
    });
}

/**
 * Total data from all requests to darksky.net.
 * 
 * @param {function} callback The total precipitation expected per day.
 */
function getDarkSkyData(callback) {
    let totalRain = [0, 0, 0, 0];
    let urlsProcessed = 0;
    let time_index = 0;
    let rain_index = 1;
    apiRequests[DARKSKY_INDEX].forEach(url => {
        fetchDarkSkyData(url, rain => {
            urlsProcessed++;
            let dayNum = rain[time_index];
            totalRain[dayNum] += rain[rain_index];
            //console.log("day", dayNum, "rain: ", rain[rain_index]);
            if (urlsProcessed == (numRequests * numDays)) {
                console.log('DarkSky total rain: ', totalRain);
                callback(totalRain);
            }
        });
    });
}

/**
 *  Send the request to darksky.net to get json and format.
 * 
 * @param {string} url The url to fetch data from.
 * @param {function} callback The total precipitation expected per day.
 */
function fetchDarkSkyData(url, callback) {
    console.log("Fetching DarkSky data..");
    let totalRain = 0;
    let respArr = [0, 0];
    let time_index = 0;
    let rain_index = 1;
    let currentDate = new Date();
    // craft request info
    let reqInit = { method: 'GET',
                    mode: 'no-cors' };
    // issue request
    fetch(url, reqInit).then(response => response.json())
    .then(json =>{
        let millisecondsPerDay = 86400000;
        let day = 0;
        // get the maximum precipitation in mm per hour for estimations
        rain = json.daily.data[0].precipIntensity;
        
        // convert precip from in/hour to cm/day
        totalRain = rain * inToCm * hoursPerDay;
        let jsonDate = new Date(json.daily.data[0].time * 1000);
        if (jsonDate.getMonth() != currentDate.getMonth()) {
            day = Math.floor((jsonDate.valueOf() - currentDate.valueOf()) / millisecondsPerDay);
        } else { 
            day = jsonDate.getDate() - currentDate.getDate();
        }
        // console.log("Day", day, "precip:", json.daily.data[0].precipIntensity);

        respArr[time_index] = day;
        respArr[rain_index] = totalRain;
        callback(respArr);
    })
    .catch(error => {
        console.log(error);
        callback(totalRain);
    });
}

// OpenWeatherMap.org functions

/**
 * Update, average, and store data from openweathermap.org.
 * 
 * @param {function} callback The success status of the external API updates.
 */
function updateOpenWeatherMapData(callback) {
    console.log('Updating OpenWeatherMap.org forecast...');
    let rainArr = [0, 0, 0, 0];
    let totalPrecip = 0;

    getOpenWeatherMapData(rain => {
        rain.forEach((total, index) => {
            // average the total rain fall across the watershed
            rainArr[index] = total / numRequests;
            totalPrecip += rainArr[index];
        });
        console.log("Average OpenWeatherMap data rain: ", rainArr);
        updateDB(rainArr, totalPrecip, OPENWEATHER_STR, success => {
            callback(success);
        });
    });
}

/**
 * Total data from all requests to openweathermap.org.
 * 
 * @param {function} callback The total precipitation expected per day.
 */
function getOpenWeatherMapData(callback) {
    let totalRain = [0, 0, 0, 0];
    let urlsProcessed = 0;
    apiRequests[OPENWEATHER_INDEX].forEach(url => {
        fetchOpenWeatherData(url, rain => {
            urlsProcessed++;
            // take the total rain from each location and total them by day
            totalRain[0] += rain[0];
            totalRain[1] += rain[1];
            totalRain[2] += rain[2];
            totalRain[3] += rain[3];
            if (urlsProcessed == numRequests) {
                // console.log('openweathermaps.org total rain: ', totalRain);
                callback(totalRain);
            }
        });
    });
}

/**
 *  Send the request to openweathermap.org to get json and format.
 * 
 * @param {string} url The url to fetch data from.
 * @param {function} callback The total precipitation expected per day.
 */
function fetchOpenWeatherData(url, callback) {
    // console.log("Fetching openweather data..");
    let totalRain = 0;
    // craft request info
    let reqInit = { method: 'GET',
                   mode: 'no-cors' };
    // issue request
    fetch(url, reqInit).then(response => response.text())
    .then(text => {
        // the response is in xml format
        xmlParser.parseString(text, (err, json) => {
            // console.log("URL: ", url, "\nparsed time: ", json.weatherdata.forecast[0].time, "parsed precip: \n", json.weatherdata.forecast[0].time);
            precipData = json.weatherdata.forecast[0].time;
            totalRain = formatOpenWeatherData(precipData);
            callback(totalRain);
        });
    })
    .catch(error => {
        console.log(error);
        callback(totalRain);
    });
}

/**
 * Parses rain data for the next four days.
 * 
 * @param {JSON} precipData The quantity of precipitation.
 * 
 * @returns {number[]} Next four days of predicted rainfall (in mm).
 */
function formatOpenWeatherData(precipData) {
    // only storing 4 days of rainfall data including today
    let rainPerDay = [0, 0, 0, 0];
    let currentDay = new Date().getDate();

    /*  the data is returned as an array of key value pairs
        need to iterate through each pair and extract the data
        based on the relation to today */
    precipData.forEach(pair => {
        // $ is the name of the key for the 'from' and 'to' dates
        let key = pair.$.from;
        let matchDay = /\d\dT/;
        let day = key.match(matchDay)[0].split("T")[0];
        let precipitation = pair.precipitation;
        // based on what day is currently open, accumulate CM for that day
        let index = day - currentDay;
        // to handle the roll over into the next month
        if (index < 0) {
            index = 0;
        }
        // when there is no rain, the precip is an empty string
        if (!isNaN(precipitation[0].$.value)) {
            // ignore past the 4th day
            if (index < numDays){
                //console.log('day',index,':',precipitation[0].$.value);
                rainPerDay[index] += precipitation[0].$.value / mmToCm;
            }
        } else {
            if (index < numDays){
                rainPerDay[index] += 0;
            }
        }
    });
    return rainPerDay;
}

// Exports
module.exports.updateWeatherData = updateWeatherData;
module.exports.buildApiRequestURLs = buildApiRequestURLs;
