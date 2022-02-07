# ADAS
Asher Dam Alert System

# Meta
Assignment: Rhineback Asher Dam Capping Project 2019

Professor: Christopher Algozzine

Semester: Fall 2019


# public

**fonts**  
This file contains the bungee.ttf and keepcalm.ttf  
**images**   
This file contains images to be used for the front end of the website.  
**Javascript**  
*modal.js*  
&nbsp; -This file contains functions to create and edit the Modal window the user sees.  

Functions:  
openModal(btn)  
&nbsp; -Opens the appropriate modal depending on which button was clicked.  
closeModal()  
&nbsp; -Closes the currently open modal  
verifyThreshold()  
&nbsp; -Verifies input for the Threshold modal.  
verifyNotification()  
&nbsp; -Verifies input for the Email notification modal.  
isValidEmail()  
&nbsp; -Checks the validity of an email address.  
clearInput()  
&nbsp; -Clears input of the modal when it closes and removes any error messages from previous input.  
swapEmailForm()  
&nbsp; -Swaps between the displays for entering email addresses and removing them.  
swapThresholdForm()  
&nbsp; -Swaps between the displays for changing thresholds and viewing the current values.  
  
*utils.js*  
updateDischargeGraphics(obj)  
&nbsp; -Checks to see what range the amount of predicted rain falls into and displays graphics accordingly.  
load()  
&nbsp; -Sends an XmlHttpRequest to the server.  
getAndPopulateThresholdDate(url, method, body)  
&nbsp; -Gets the threshold and discharge values from the database and returns them to be parsed and evaluated for display.  
getForcast(apiName)  
&nbsp; -Returns the forecast for the API sent to the function  
populateThresholds(obj)  
&nbsp; -Populates the Threshold modal's table with the values.  
populateForecast(obj)  
&nbsp; -Populates the Forecast with its values  
populateLastUpdate(obj)  
&nbsp; -Populates the forecast update with the updated time  
populateValveTimes(obj)  
&nbsp; -Populates the two, three, and four valve fields  
populateDaysOfTheWeek()  
&nbsp; -Sets the current date to the next days in the week with the day3 and day4 values  
updateSourceAttribution(apiName)  
&nbsp; -Updates source name with API used to gather data  
removeEmail()  
&nbsp; -If an email is validated, function removes the email from the database.  
addEmail()  
&nbsp; -If an email and its corresponding data is validated, adds the email to the database.  
updateThreshold()  
&nbsp; -If all thresholds values are valid, updates the values in the database.  
parseISOString()  
&nbsp; -Parses date String  
handleServerMessage()  
&nbsp; -Receives the status message of the operation from the server and displays the appropriate graphics.  

**stylesheets**  
*style.css*  
&nbsp;This folder contains a css file to format the front end of the website.  

# routes  
  
*api.js*
This file contains the code used to interact with the API’s. The following API’s are used:  
&nbsp;-Weather.gov  
&nbsp;&nbsp;&nbsp; -Documentation(https://www.weather.gov/documentation/services-web-api)  
&nbsp;DarkSky  
&nbsp;&nbsp;&nbsp; -Documentation(https://darksky.net/dev/docs)  
&nbsp;Open Weather  
&nbsp;&nbsp;&nbsp; -Documentation(https://openweathermap.org/api)  
&nbsp;Weatherbit.io  
&nbsp;&nbsp;&nbsp; -Documentation(https://www.weatherbit.io/api)  
To access some of the documentation, you may need to login to your respective account.  
  
**IMPORTANT TO NOTE:**  
DarkSky will discontinue its API services by the end of 2021. However, Weatherbit.io is meant to replace DarkSky when it is discontinued. Implement Weatherbit.io once DarkSky is no longer available.  
  
Functions:  
buildApiRequestURLs()  
&nbsp; -Build the requests used by the update functions and store them.  
updateWeatherData(con, callback)  
&nbsp; -Update all of the weather sources and store them in the database.  
updateDB(rainArr, totalPrecip, api, callback)  
&nbsp; -Send the query to update the database with new weather data.  
updateWeatherGov(callback)  
&nbsp; -Update, average, and store data from weather.gov.  
getWeatherGovData(callback)  
&nbsp; -Total data from all requests to weather.gov.  
fetchGovData(url, callback)  
&nbsp; -Send the request to weather.gov to get json and format.  
formatGovData(precipData)  
&nbsp; -Parses rain data for the next four days.  
updateDarkSkyData(callback)  
&nbsp; -Update, average, and store data from darksky.net.  
getDarkSkyData(callback)  
&nbsp; -Total data from all requests to darksky.net.  
fetchDarkSkyData(url, callback)  
&nbsp; -Send the request to darksky.net to get json and format.  
updateOpenWeatherMapData(callback)  
&nbsp; -Update, average, and store data from openweathermap.org.  
getOpenWeatherMapData(callback)  
&nbsp; -Total data from all requests to openweathermap.org.  
fetchOpenWeatherData(url, callback)  
&nbsp; -Send the request to openweathermap.org to get json and format.  
formatOpenWeatherData(precipData)  
&nbsp; -Parses rain data for the next four days.  
updateWeatherbitData(callback)  
&nbsp; -Update, average, and store data from weatherbit.io  
getWeatherbitData(callback)  
&nbsp; -Total data from all requests to weatherbit.io  
fetchWeatherbitData(url, callback)  
&nbsp; -Send the request to weatherbit.io to get json and format.  
  
*email.js*  
This file contains the functionality to add, remove, and query emails to send responses to the entries in the database.  
  
Functions:  
insertEmail(req, connection, callback)  
&nbsp; -Inserts a new email into the database.  
removeEmail(req, connection, callback)  
&nbsp; -Removes an existing email from the database.  
  
*threshold.js*  
This file contains the functionality to set and get the thresholds  

Functions:  
setThresholds(connection, json, callback)  
&nbsp; -Updates the threshold values.  
getThresholds(connection, callback)  
&nbsp; -Gets the threshold values  

# util  
  
*database.js*  
This file contains the code to query the database  
  
Function:  
query(queryStr, callback)  
&nbsp; -Queries the database using a MySQL pool connection.  
  
  
*model.js*  
&nbsp; -This file contains the functions to calculate the math model calculations  
  
Functions:  
calculateExpected(expectedPrecip)  
&nbsp; -Calculate the expected total precipitation for the watershed.  
calculateDurations(volume)  
&nbsp; -Calculate the durations the valves should be open for a given volume.  
getRefreshRate(connection, callback)  
&nbsp; -Determine the active threshold stage based on model calculations.  
getAvgDischarge(connection, callback)  
&nbsp; -Get the average discharge of all external APIs.  
getThresholds(connection, callback)  
&nbsp; -Get the average discharge of all external APIs.  

