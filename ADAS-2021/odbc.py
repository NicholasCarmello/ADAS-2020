#Before you can install pyodbc, install microsoft c++ tools. They can be found at https://docs.microsoft.com/en-US/cpp/windows/latest-supported-vc-redist?view=msvc-170
#Before you can pip install pyodbc, do "pip install wheel"
#'pip install pyodbc' in the terminal
#'pip install sqlalchemy' in the terminal
#this file creates a connection to a microsoft access file, reads it and puts it in the MySQL database.
from datetime import date, datetime
import pyodbc
import time
from sqlalchemy import Column, Float,Integer, DateTime
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import declarative_base
import sqlalchemy
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql.expression import asc, desc, select
from sqlalchemy import select
from sqlalchemy import desc


Base = declarative_base()
engine = create_engine("mysql://accessdb_python:5Dc9R3ik2A5UT@148.100.44.10/solinst")
Session = sessionmaker(bind=engine)

#conn gets the connectivity to the access file
#Change the file path and the file name after "DBQ=". My filename is Loggers change that at the end of the string.
conn = pyodbc.connect(r'Driver={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=C:/Users/jointstudy/AppData/Local/VirtualStore/Program Files (x86)/Solinst/STS_Gold/db/sts_gold.mdb;')
cursor = ""

#SQLAlchemy classes. Each class is exactly like the tables in the MySQL databases
class LevelLogger(Base):
    __tablename__ = 'levelogger'
    id = Column(Integer,primary_key=True)
    dateTime = Column(DateTime)
    levelInMeters = Column(Float)

class RainLogger(Base):
    __tablename__ = 'rainlogger'
    id = Column(Integer,primary_key=True)
    dateTime = Column(DateTime, primary_key=True)
    rainFallInMilliMeters = Column(Float)


#The level and rain loggers data will be put in the database
#not yet implemented. Need connection details for database.
def populateSqlDatabase(row, tableName):
    print(row[0], row[1],row[2])
    #creates a LevelLogger object using the fields from the microsoft access rows
    if tableName == 'levelogger':
        logger = LevelLogger(id = row[0],dateTime = row[1], levelInMeters = row[2])
    #creates a RainLogger object using the fields from the microsoft access rows
    if tableName == 'rainlogger':
        logger = RainLogger(id= row[0],dateTime = row[1], rainFallInMilliMeters = row[2])

    #creates a session object used to add insert statements into the database
    session = Session()
    session.add(logger)
    session.commit()
    session.close()
    
#This function reads data from the access file and calls populateSqlDatabase function
def readAccessTables():

    cursor = conn.cursor()
    #Selects the data from the levelLogger table and calls the populateSqlDatbase function
    session = Session()
    statement = select(LevelLogger).order_by(desc(LevelLogger.id))
    result = session.execute(statement).scalars().all()
    if not result: 
        cursor.execute('select id,Date_time,ch2_data_P from logger_data')
    else:
        cursor.execute('select id,Date_time,ch2_data_P from logger_data where id > ?',(result[0].id))
    for row in cursor.fetchall():
        
        populateSqlDatabase(row, "levelogger")

    if not result:
        cursor.execute('select id,Date_time,ch1_data_P from logger_data')
    else:
        cursor.execute('select id,Date_time,ch1_data_P from logger_data where id > ?',(result[0].id))
    for row in cursor.fetchall():
        populateSqlDatabase(row, "rainlogger")

    print('success')

    cursor.close()
    session.close()

#calls the readAccessTables function in a forever loop
#loop will sleep for an hour and then call the function again
while True:
    readAccessTables()
    time.sleep(3600)
    