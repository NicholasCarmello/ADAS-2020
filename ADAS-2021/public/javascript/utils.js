//const WEATHERGOV_STR = 'api.weather.gov';
const DARKSKY_STR = 'api.darksky.net';
const OPENWEATHER_STR = 'api.openweathermap.org';

window.onload = getAndPopulateThresholdData('/api/getData/' + DARKSKY_STR, "GET", "");
window.onload = getForecast('darksky.net');
window.onload = populateDaysOfWeek();
window.onload = updateSourceAttribution('darksky.net');

// /** 
//  * Parses a JSON for its values to be used elsewhere.
//  * @param {JSON} json The JSON returned from the database.
//  */
// function parseData(json){
//     let obj = JSON.parse(json);
//     return obj;
// }

/**
 * Checks to see what range the amount of predicted rain falls into and displays graphics accordingly.
 * @param {JSON} obj JSON containing the threshold and discharge data.
 */
function updateDischargeGraphics(obj){
    let discharge = obj["discharge"];
    let threshold1 = obj["stage1"];
    let threshold2 = obj["stage2"];
    let threshold3 = obj["stage3"];
    let threshold4 = obj["stage4"];

    const DISCHARGE_VAL = document.getElementById("dischargeAmount");
    const WARN_IMAGE = document.getElementById("warningImg");
    DISCHARGE_VAL.innerHTML = discharge;

    if (discharge >= 0 && discharge <= threshold1 - 1) {
        DISCHARGE_VAL.style.color = "#65FC5A";
        WARN_IMAGE.style.display = "none";
    } else if (discharge >= threshold1 && discharge <= threshold2 - 1) {
        DISCHARGE_VAL.style.color = "#FCE703";
        WARN_IMAGE.style.display = "none";
    } else if (discharge >= threshold2 && discharge <= threshold3 - 1) {
        DISCHARGE_VAL.style.color = "orange";
        WARN_IMAGE.style.display = "none";
    } else if (discharge >= threshold3 && discharge <= threshold4) {
        DISCHARGE_VAL.style.color = "#EA6E6E";
        WARN_IMAGE.src = "/images/warning.png";
        WARN_IMAGE.style.display = "initial";
        WARN_IMAGE.title = 'High amount of precipitation predicted.';
    } else {
        DISCHARGE_VAL.style.color = "red";
        WARN_IMAGE.src = "/images/danger.png";
        WARN_IMAGE.style.display = "initial";
        WARN_IMAGE.title = 'Potentially dangerous amount of precipitation predicted.';
    }
}

/**
 * Updates the drop-down menu to reflect which source was selected.
 */
$(document).ready(function(){
    $(".dropdown-menu li a").click(function(){
        let selText = $(this).text();
        $(".dropdown-toggle").html(selText + " <span class='caret'></span>");

        getForecast(selText);
        updateSourceAttribution(selText);
        let url = '/api/getData/';
        if (selText === 'darksky.net') {
            getAndPopulateThresholdData(url + DARKSKY_STR, 'GET');
        } 
        else if (selText === 'openweathermap.org') {
            getAndPopulateThresholdData(url + OPENWEATHER_STR, 'GET');
        } 
    });
});

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
        updateDischargeGraphics(response);
        populateThresholds(response);
    });
}

function getForecast(apiName) {
    apiName = apiName.replace('.', '');
    let url = "/api/forecast/" + apiName;
    load(url, "GET", '', response => {
        populateForecast(response);
        populateLastUpdate(response);
        populateValveTimes(response);
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

function populateForecast(obj) {
    const MAX_FORECAST = 4;
    for (let i = 1; i <= MAX_FORECAST; i++) {
        let amount = "amount" + i;
        let dayField = 'day' + i;
        let value = 0;
        cmToInch = 2.54;
        if (parseFloat(obj[dayField]) != 0) value = obj[dayField].toFixed(2);
        document.getElementById(amount).innerHTML = (value / cmToInch).toFixed(2);
    }
    document.getElementById('dischargeAmount').innerHTML = obj['discharge'];
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

function populateValveTimes(obj) {
    let twoValvesField = 'twoValves';
    let threeValvesField = 'threeValves';
    let fourValvesField = 'fourValves';

    document.getElementById('hour' + 1).innerHTML = obj[twoValvesField];
    document.getElementById('hour' + 2).innerHTML = obj[threeValvesField];
    document.getElementById('hour' + 3).innerHTML = obj[fourValvesField];
}

function populateDaysOfWeek(){
    let currentDate = new Date();
    let day3Date = new Date();
    let day4Date = new Date();

    day3Date.setDate(currentDate.getDate() + 2);
    day4Date.setDate(currentDate.getDate() + 3);

    var options = { weekday: 'long'};
    let day3String = new Intl.DateTimeFormat('en-US', options).format(day3Date);
    let day4String = new Intl.DateTimeFormat('en-US', options).format(day4Date);
    
    document.getElementById('day3').innerHTML = day3String;
    document.getElementById('day4').innerHTML = day4String;
}

function updateSourceAttribution(apiName) {
    let content = document.getElementById('attribution');
    if (apiName == 'darksky.net') {
        content.innerHTML = "<a href='https://darksky.net/poweredby/' target='_blank'>Powered by Dark Sky</a>";
    } else if (apiName == 'openweathermap.org') {
        content.innerHTML = "<a href='https://openweathermap.org/city/5133742' target='_blank'>Powered by Open Weather Map</a>";
    }
}

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

function parseISOString(str) {
    var b = str.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
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