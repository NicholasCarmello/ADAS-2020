USE damdb;

CREATE TABLE employee (
    employeeID INT NOT NULL AUTO_INCREMENT,
    firstName LONGTEXT NOT NULL,
    lastName LONGTEXT NOT NULL,
    email LONGTEXT NOT NULL,
    phoneNum LONGTEXT NOT NULL,
    PRIMARY KEY (employeeID)
);
CREATE TABLE threshold (
    thresholdID INT NOT NULL,
    stage1 INT NOT NULL,
    stage2 INT NOT NULL,
    stage3 INT NOT NULL,
    stage4 INT NOT NULL,
    PRIMARY KEY (thresholdID)
);
CREATE TABLE weatherData (
    sourceURL VARCHAR(255) NOT NULL,
    day1 FLOAT NOT NULL,
    day2 FLOAT NOT NULL,
    day3 FLOAT NOT NULL,
    day4 FLOAT NOT NULL,
    discharge INT NOT NULL,
    twoValves INT NOT NULL,
    threeValves INT NOT NULL,
    fourValves INT NOT NULL,
    lastUpdate DATETIME NOT NULL,
    PRIMARY KEY (sourceURL)
);

create table rainlogger(
    id int not null,
    dateTime datetime not null,
    rainFallInMilliMeters float not null,
    primary key(id)
);

create table levelogger(
    id int not null,
    dateTime datetime not null,
    levelInMeters float not null,
    primary key(id)
);

INSERT INTO weatherData (sourceURL, day1, day2, day3, day4, discharge, twoValves, threeValves, fourValves, lastUpdate) VALUES ("api.weather.gov", 0, 0, 0, 0, 0, 0, 0, 0, '0001-01-01 00:00:00');
INSERT INTO weatherData (sourceURL, day1, day2, day3, day4, discharge, twoValves, threeValves, fourValves, lastUpdate) VALUES ("api.darksky.net", 0, 0, 0, 0, 0, 0, 0, 0, '0001-01-01 00:00:00');
INSERT INTO weatherData (sourceURL, day1, day2, day3, day4, discharge, twoValves, threeValves, fourValves, lastUpdate) VALUES  ("api.openweathermap.org", 0, 0, 0, 0, 0, 0, 0, 0, '0001-01-01 00:00:00');
INSERT INTO threshold (thresholdID, stage1, stage2, stage3, stage4) VALUES (0, 10000, 20000, 35000, 55000);
