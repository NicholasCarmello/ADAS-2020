/***** graphs.js [Graphs Made with Canvas.js Library]  *****/
//var connection = require("../../util/database");

//window.onload = populateGraphDateInput();
window.onload = getCurrentMonth();
//window.onload = ;

/*
* LEVELOGGER DATA GRAPHING
*/
var filepathLevelogger = "/data/levelogger";
var dataPointsLevelogger = [];
var xValuesLevelogger = [];
var yValuesLevelogger = [];
var dataArrLevelogger = [];
var barColorsLevelogger = "royalblue";

function getDataPointsFromJSONLevelogger() {
    for (var i = 0; i < dataArrLevelogger.length; i++) {
        //if(dataArrLevelogger[i]['date'] == getDateFromCalendar()) {
            //console.log(dataArrLevelogger[i]);
            //var temp1 = (dataArrLevelogger[i]['dateTime']).split(" ");
            
            xValuesLevelogger.push(dataArrLevelogger[i]['date'].split("T")[0]);
            yValuesLevelogger.push((dataArrLevelogger[i]['average']).toFixed(4));
        //}
        //console.log(dataPointsLevelogger);
    }
}

fetch(filepathLevelogger)
    .then(res => res.json())
    .then(data => dataArrLevelogger = data)
    .then(() => console.log(dataArrLevelogger)).then(() => createLeveloggerChart());

//Create Chart
function createLeveloggerChart() {
    getDataPointsFromJSONLevelogger();
    var leveloggerChart = new Chart("leveloggerChart", {
        type: "bar",
        data: {
            labels: xValuesLevelogger,
            datasets: [{
                label: "Water Level in Meters",
                fill: false,
                backgroundColor: barColorsLevelogger,
                borderColor: "rgba(255, 255, 255, 1.2)",
                data: yValuesLevelogger
            }]
        },
        options: {
            legend: {
                display: true,
                onClick: false,
                labels: {
                    fontColor: "white",
                    fontFamily: "keepcalm",
                    fontSize: 10
                }
            },
            labels: {
                fontColor: "white",
                fontSize: 18
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        display: true ,
                        color: "#FFFFFF"
                    },
                    ticks: {
                        fontColor: "white",
                        fontFamily: "bungee",
                        fontSize: 20,
                        stepSize: 5,
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: true,
                        color: "#FFFFFF"
                    },
                    ticks: {
                        fontColor: "white",
                        fontFamily: "bungee",
                        fontSize: 20,
                        stepSize: 5,
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    leveloggerChart.render();
}

/*
* RAINLOGGER DATA GRAPHING
*/
var filepathRainlogger = "/data/rainlogger";
var dataPointsRainlogger = [];
var xValuesRainlogger = [];
var yValuesRainlogger = [];
var dataArrRainlogger = [];
var barColorsRainlogger = "red";

function getDataPointsFromJSONRainlogger() {
    for (var i = 0; i < dataArrRainlogger.length; i++) {
        //if(dataArrRainlogger[i]['date'] == getDateFromCalendar()) {
            //console.log(dataArrRainlogger[i]);
            //var temp1 = (dataArrRainlogger[i]['dateTime']).split(" ");
            xValuesRainlogger.push(dataArrRainlogger[i]['date'].split("T")[0]);
            yValuesRainlogger.push(dataArrRainlogger[i]['total']);
        //}
    }
}

fetch(filepathRainlogger)
    .then(res => res.json())
    .then(data => dataArrRainlogger = data)
    .then(() => console.log(dataArrRainlogger)).then(() => createRainloggerChart());

//Create Chart
function createRainloggerChart() {
    getDataPointsFromJSONRainlogger();
    var rainloggerChart = new Chart("rainloggerChart", {
        type: "bar",
        data: {
            labels: xValuesRainlogger,
            datasets: [{
                label: "Rainfall in Millimeters",
                fill: false,
                backgroundColor: barColorsRainlogger,
                borderColor: "rgba(255, 255, 255, 1.2)",
                data: yValuesRainlogger
            }]
        },
        options: {
            legend: {
                display: true,
                onClick: false,
                labels: {
                    fontColor: "white",
                    fontFamily: "keepcalm",
                    fontSize: 10
                }
            },
            labels: {
                fontColor: "white",
                fontSize: 18
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        display: true ,
                        color: "#FFFFFF"
                    },
                    ticks: {
                        fontColor: "white",
                        fontFamily: "bungee",
                        fontSize: 20,
                        stepSize: 5,
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: true,
                        color: "#FFFFFF"
                    },
                    ticks: {
                        fontColor: "white",
                        fontFamily: "bungee",
                        fontSize: 20,
                        stepSize: 5,
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    rainloggerChart.render();
}

function clearCharts() {
    for(var i = 0; i < dataArrLevelogger.length; i++) {
        xValues1.pop();
        yValues1.pop();
    }
    for(var i = 0; i < dataArrRainlogger.length; i++) {
        xValues2.pop();
        yValues2.pop();
    }
}

/* Poplate Current Month on Graph (Temporary) */
function getCurrentMonth() {
    let today = new Date();
    let month = today.toLocaleString('default', { month: 'long' });

    document.getElementById('graph1Date').innerHTML = month;
    document.getElementById('graph2Date').innerHTML = month;
}

/*function populateGraphDateInput() {
    let date = new Date();
    let mm = String(date.getMonth() + 1).padStart(2, '0'); //+1 because January is 0
    let dd = String(date.getDate()).padStart(2, '0');
    let yyyy = String(date.getFullYear());
    
    var todaysDate = yyyy + "-" + mm + "-" + dd;
    document.getElementById('graphDateInput').value = todaysDate;
    //document.getElementById('graph1Date').innerHTML = document.getElementById('graphDateInput').value;
    //document.getElementById('graph2Date').innerHTML = document.getElementById('graphDateInput').value
}*/

/*function getDateFromCalendar() {
    //console.log(document.getElementById('graphDateInput').value);
    return document.getElementById('graphDateInput').value;
}*/

/**
 * Updates the drop-down menu to reflect which data frequency (hourly, monthly, daily) was selected.
 */
$(document).ready(function(){
    $(".dropdown-menu li a").click(function(){
        let selText = $(this).text();
        $(".dropdown-toggle").html(selText + " <span class='caret'></span>");



        /*getForecast(selText);
        updateSourceAttribution(selText);
        let url = '/api/getData/';
        if (selText === 'darksky.net') {
            getAndPopulateThresholdData(url + DARKSKY_STR, 'GET');
        } 
        else if (selText === 'openweathermap.org') {
            getAndPopulateThresholdData(url + OPENWEATHER_STR, 'GET');
        } */
    });
});

/**
* THIS SECTION POPULATES THE BOTTOM OF THE graphs.html PAGE
* The code is taken from the urils.js file and then edited to 
* include only the necessary functions to populate the bottom 
* of the graphs.html page
* Includes the Notifications button functions
* Includes the Last Update
* Includes the Threshold button functions
*/
const DARKSKY_STR = 'api.darksky.net';
window.onload = getAndPopulateThresholdData('/api/getData/' + DARKSKY_STR, "GET", "");
window.onload = getForecast('darksky.net');
/**
 * Sends an XmlHttpRequest to the server.
 * @param {string} url The URL to locate the resource.
 * @param {string} method The HTTP method to use when accessing data.
 * @param {string} body The data to send to the server.
 * @param {*} callback The name of the function to execute upon receiving data.
 */
function load(url, method, body, callback) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if(xhr.status){  
            if (xhr.status == 200 || xhr.status == 201){
                clearInput();
                closeModal();
            }
            if (xhr.response) callback(JSON.parse(xhr.response));
        }
    }

    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(body);
}

/**
 * Gets the threshold and discharge values from the database and returns them to be parsed and evaulated for display.
 * @param {string} url The URL to locate the resource.
 * @param {string} method The HTTP method to use when accessing data.
 * @param {string} body The data to send to the server.
 */
function getAndPopulateThresholdData(url, method, body) {
    load(url, method, body, response => {
        populateThresholds(response);
    });
}

function getForecast(apiName) {
    apiName = apiName.replace('.', '');
    let url = "/api/forecast/" + apiName;
    load(url, "GET", '', response => {
        populateLastUpdate(response);
    });
};

/**
 * Populates the Threshold modal's table with the values.
 * @param {xmlHttpRequest} xhttp The xmlHttpRequest response object.
 */
function populateThresholds(obj){
    const MAX_THRESHOLD = 5;
    for (let i = 1; i < MAX_THRESHOLD; i++){
        let threshold = "threshold" + i;
        let stage = "stage" + i;
        document.getElementById(threshold + "TD").innerHTML = obj[stage] 
            + "m<sup>3</sup>";
    }
}

function populateLastUpdate(obj) {
    //function tick() {
    let lastUpdateHour = obj['lastUpdate'];
    let lastUpdateSec = parseISOString(lastUpdateHour).getTime();
    let currentDateSec = new Date().getTime();
    const hourToMS = 3600000;
    const minuteToMS = 60000;
    lastUpdateSec = currentDateSec - lastUpdateSec;
    let hours = Math.floor(lastUpdateSec / hourToMS);
    let minutes = Math.round(lastUpdateSec / minuteToMS);

    document.getElementById('updateHours').innerHTML = hours;
    document.getElementById('updateMinutes').innerHTML = Math.abs((hours * 60) - minutes);
}
/*}
$(document).ready(function(){
    tick();
})*/


function parseISOString(str) {
    var b = str.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

//Handle Notifications and Threshold Updates at Bottom of Page
/**
 * If an email is validated, removes the email from the database.
 */
function removeEmail(){
    let body = `email_address=${document.getElementById("emailToRemove").value}`;
    if (isValidEmail(document.getElementById("emailToRemove").value)) {
        load("/api/email", "DELETE", body, handleServerMessage);
    } 
}

/**
 * If an email and its corresponding data is validated, adds the email to the database.
 */
function addEmail(){
    let body = `first_name=${document.getElementById("fName").value}&` +
        `last_name=${document.getElementById("lName").value}&` +
        `email_address=${document.getElementById("emailToAdd").value}&` +
        `phone_number=${document.getElementById("phone").value}`;
    if (verifyNotification()) {
        load("/api/email", "POST", body, handleServerMessage);
    }
}

/**
 * If all thresholds values are valid, updates the values in the database.
 */
function updateThreshold(){
    let body = `stage1=${document.getElementById("threshold1").value}&` +
        `stage2=${document.getElementById("threshold2").value}&` +
        `stage3=${document.getElementById("threshold3").value}&` +
        `stage4=${document.getElementById("threshold4").value}`;
    const URL = '/api/getData/';
    let currentSource = 'api.' + $(curSrcBtn).text();
    currentSource = currentSource.replace(/\s+/g, '');

    if (verifyThreshold()) {
        load("/api/threshold", "PUT", body, (response) => {
            handleServerMessage(response);
            getAndPopulateThresholdData(URL + currentSource, 'GET');
        });
    }
}
/**
 * 
 * @param {JSON} response Receives the status message of the operation from the server and displays the appropriate graphics.
 */
function handleServerMessage(response){
    let message = response;
    let modal = document.getElementById("serverMessageModal");
    if(parseFloat(modal.style.opacity) > 0) return;
    if (message.status == 201 || message.status == 200){
        modal.style.borderColor = "green";
        modal.style.backgroundColor = "lightgreen";
    } else {
        modal.style.borderColor = "red";
        modal.style.backgroundColor = "lightcoral";
    }
    modal.innerHTML = message.text;
    modal.classList.add("serverMessageFadeIn");
    modal.style.opacity = "1";
    setTimeout(() => {
        modal.classList.remove("serverMessageFadeIn");
        modal.classList.add("serverMessageFadeOut");
        modal.style.opacity = "0";
    }, 3000);
    setTimeout(() => {
        modal.classList.remove("serverMessageFadeOut");
    }, 3500);
}

// Helper functions
function buildRainloggerQuery() { 
    return "SELECT * FROM rainlogger;";
}

function buildLeveloggerQuery() { 
    return "SELECT * FROM levelogger;";
}