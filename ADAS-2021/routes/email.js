var nodemailer = require('nodemailer');
var modelService = require('../util/model');
var config = require('../config.json');
var message = {};

var mailOptions = {
    from: config.email.address,
    to: '',
    subject: 'ADAS Alert',
    html: ""
}

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.email.address,
        pass: config.email.password
    }
});

/**
 * Queries the database for emails and sends responses to all of the entries discovered.
 * @param {DatabaseConnection} con The MySQL datbase connection where the emails are stored.
 */
exports.sendEmail = function(con){
    con.query("SELECT * FROM employee;", (err, emailResult) => {
        if (err) {
            throw err;
        } else if (emailResult.length <= 0) {
            console.log("There are currently no emails to contact.");
        } else {
            console.log("Amount of emails to contact: " + emailResult.length);
            con.query(`SELECT discharge, twoValves, threeValves, fourValves 
                FROM weatherData 
                WHERE sourceURL = "api.weather.gov";`, (err, weatherResult) => {
                if (err) {
                    throw err;
                } else{
                    modelService.getRefreshRate(con, refreshRate => {
                        mailOptions.html = `<div style="font-family:'Times New Roman'">This message is an ADAS Alert.<br><br>` +
                        `<b>Heavy rain predicted in the next 4 days.*</b><br>` +  
                        `Calculated Discharge: ${weatherResult[0].discharge}m³<br><br>` + 
                        `Flood Prevention Strategies:<br>` + 
                        `  - Open 2 valves for ${weatherResult[0].twoValves} hours<br>` + 
                        `  - Open 3 valves for ${weatherResult[0].threeValves} hours<br>` + 
                        `  - Open 4 valves for ${weatherResult[0].fourValves} hours<br><br>` + 
                        `Check back to <a href="http://10.10.9.160">website</a> in ${refreshRate} hours for updates.<br><br>` +
                        `*<i>based on data solely from weather.gov</i><br><br>` + 
                        `This email was automatically generated. ` + 
                        `Do not reply as this inbox is unmonitored.</div>`;
                        
                        for (let i = 0; i < emailResult.length; i++){
                            mailOptions.to = emailResult[i].email;
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log("Email sent! " + info.response);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

/**
 * Inserts a new email into the database.
 * @param {XMLHttpRequest} req The POST request containing an email to insert into the database.
 * @param {DatabaseConnection} con The MySQL datbase connection where the emails are stored.
 */
function insertEmail(req, connection, callback){
    const emailAddress = (req.body.email_address + "").replace(/[\s]+/, "");
    connection.query(`SELECT email FROM employee WHERE email = "${emailAddress}";`, 
    (err, result) => {
        if(err) {
            console.log("There was a problem with the database.");
            message = {status:500, text:"There was a problem with removing the requested email."};
            callback(message);
        } else if(result.length > 0) {
            console.log(`The email address '${emailAddress}' already exists!`);
            message = {status:400, text:emailAddress + " is already signed up for notifications."};
            callback(message);
        } else{
            const firstName = (req.body.first_name + "").replace(/[\s]+/, "");
            const lastName = (req.body.last_name + "").replace(/[\s]+/, "");
            const emailAddress = (req.body.email_address + "").replace(/[\s]+/, "");
            const phoneNumber = (req.body.phone_number + "").replace(/[\s]+/, "");

            const INSERT_QUERY = `INSERT INTO employee ` + 
                `(firstName, lastName, email, phoneNum) ` +
                `VALUES ("${firstName}", "${lastName}", ` +
                `"${emailAddress}", "${phoneNumber}");`;
            connection.query(INSERT_QUERY, (err) => {
                if(err) {
                    console.log("There was a problem with the database.");
                    message = {status:500, text:"There was a problem with removing the requested email."};
                    callback(message);
                } else {
                    console.log("Email successfully added to Database!");
                    message = {status:201, text:emailAddress +" was successfully added to the notification registry!"};
                    callback(message);
                }
            });
        }
    });
}

/**
 * Removes an existing email from the database.
 * @param {XMLHttpRequest} req The POST request containing an email to remove from the database.
 * @param {DatabaseConnection} con The MySQL datbase connection where the emails are stored.
 */
function removeEmail(req, connection, callback){
    const emailAddress = (req.body.email_address + "").replace(/[\s]+/, "");

    const SELECT_QUERY = `SELECT email FROM employee WHERE email = '${emailAddress}'`;
    connection.query(SELECT_QUERY, (err, result) => {
        if(err) {
            console.log("There was a problem with the database.");
            message = {status:500, text:"There was a problem with removing the requested email."};
            callback(message);
        } else if(result.length <= 0){
            console.log("That email address was not found.");
            message = {status:400, text:emailAddress + " was not found."};
            callback(message);
        } else{
            console.log(result);
            const DELETE_QUERY = `DELETE FROM employee 
                WHERE email = '${emailAddress}';`;
            connection.query(DELETE_QUERY, (err) => {
                if(err) {
                    console.log("There was a problem with the database.");
                    message = {status:500, text:"There was a problem with removing the requested email."};
                    callback(message);
                } else {
                    console.log(`The email address '${emailAddress}' was successfully removed!`);
                    message = {status:200, text:emailAddress + " was successfully removed from the notification registry!"};
                    callback(message);
                }
            });
        }
    });
}

module.exports.insertEmail = insertEmail;
module.exports.removeEmail = removeEmail; 