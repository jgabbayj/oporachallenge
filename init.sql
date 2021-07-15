SET CLIENT_ENCODING TO 'utf8';
DROP TABLE IF EXISTS circuits CASCADE;
CREATE TABLE circuits (
	circuit_id serial PRIMARY KEY,
	circuit_ref VARCHAR(30) NOT NULL,
	name VARCHAR(80) NOT NULL,
	location VARCHAR(40) NOT NULL,
	country VARCHAR(30) NOT NULL,
	lat FLOAT NOT NULL,
	lng FLOAT NOT NULL,
	alt FLOAT NOT NULL,
	url VARCHAR(127)
);
COPY circuits FROM '/var/lib/csv/circuits.csv' CSV HEADER; 

DROP TABLE IF EXISTS constructors CASCADE;
CREATE TABLE constructors (
	constructor_id serial PRIMARY KEY,
	constructor_ref VARCHAR(30) NOT NULL,
	name VARCHAR(30) NOT NULL,
	nationality VARCHAR(30) NOT NULL,
	url VARCHAR(127)
);
COPY constructors FROM '/var/lib/csv/constructors.csv' CSV HEADER; 

DROP TABLE IF EXISTS drivers CASCADE;
CREATE TABLE drivers (
	driver_id serial PRIMARY KEY,
	driver_ref VARCHAR(30) NOT NULL,
	number INT,
	code VARCHAR(3),
	forename VARCHAR(30) NOT NULL,
	surname VARCHAR(30) NOT NULL,
	dob date NOT NULL,
	nationality VARCHAR(30) NOT NULL,
	url VARCHAR(127)
);
COPY drivers FROM '/var/lib/csv/drivers.csv' CSV HEADER null '\N'; 

DROP TABLE IF EXISTS seasons CASCADE;
CREATE TABLE seasons (
	year INT PRIMARY KEY,
	url VARCHAR(127) NOT NULL
);
COPY seasons FROM '/var/lib/csv/seasons.csv' CSV HEADER; 

DROP TABLE IF EXISTS races CASCADE;
CREATE TABLE races (
	race_id serial PRIMARY KEY,
	year INT NOT NULL,
	round INT NOT NULL,
	circuit_id INT NOT NULL,
	name VARCHAR(30) NOT NULL,
	date DATE NOT NULL,
	time TIME,
	url VARCHAR(127),
	FOREIGN KEY (circuit_id) REFERENCES circuits (circuit_id),
	FOREIGN KEY (year) REFERENCES seasons (year)
);
COPY races FROM '/var/lib/csv/races.csv' CSV HEADER null '\N'; 


DROP TABLE IF EXISTS constructor_results CASCADE;
CREATE TABLE constructor_results (
	constructor_result_id serial PRIMARY KEY,
	race_id INT NOT NULL,
	constructor_id INT NOT NULL,
	points FLOAT NOT NULL,
	status VARCHAR(5),
	FOREIGN KEY (race_id) REFERENCES races (race_id),
	FOREIGN KEY (constructor_id) REFERENCES constructors (constructor_id)
);
COPY constructor_results FROM '/var/lib/csv/constructor_results.csv' CSV HEADER null '\N'; 

DROP TABLE IF EXISTS constructor_standings CASCADE;
CREATE TABLE constructor_standings (
	constructor_standing_id serial PRIMARY KEY,
	race_id INT NOT NULL,
	constructor_id INT NOT NULL,
	points FLOAT NOT NULL,
	position INT NOT NULL,
	positionText VARCHAR(5) NOT NULL,
	wins INT NOT NULL,
	FOREIGN KEY (race_id) REFERENCES races (race_id),
	FOREIGN KEY (constructor_id) REFERENCES constructors (constructor_id)
);
COPY constructor_standings FROM '/var/lib/csv/constructor_standings.csv' CSV HEADER null '\N'; 

DROP TABLE IF EXISTS driver_standings CASCADE;
CREATE TABLE driver_standings (
	driver_standing_id serial PRIMARY KEY,
	race_id INT NOT NULL,
	driver_id INT NOT NULL,
	points FLOAT NOT NULL,
	position INT NOT NULL,
	position_text VARCHAR(5) NOT NULL,
	wins INT NOT NULL,
	FOREIGN KEY (race_id) REFERENCES races (race_id),
	FOREIGN KEY (driver_id) REFERENCES drivers (driver_id)
);
COPY driver_standings FROM '/var/lib/csv/driver_standings.csv' CSV HEADER null '\N'; 

DROP TABLE IF EXISTS lap_times CASCADE;
CREATE TABLE lap_times (
	race_id INT NOT NULL,
	driver_id INT NOT NULL,
	lap INT NOT NULL,
	position INT NOT NULL,
	time INTERVAL NOT NULL,
	milliseconds INT NOT NULL,
	FOREIGN KEY (race_id) REFERENCES races (race_id),
	FOREIGN KEY (driver_id) REFERENCES drivers (driver_id),
	PRIMARY KEY (race_id, driver_id, lap)
);
COPY lap_times FROM '/var/lib/csv/lap_times.csv' CSV HEADER null '\N'; 

DROP TABLE IF EXISTS pit_stops CASCADE;
CREATE TABLE pit_stops (
	race_id INT NOT NULL,
	driver_id INT NOT NULL,
	stop INT NOT NULL,
	lap INT NOT NULL,
	time TIME NOT NULL,
	duration INTERVAL NOT NULL,
	milliseconds INT NOT NULL,
	FOREIGN KEY (race_id) REFERENCES races (race_id),
	FOREIGN KEY (driver_id) REFERENCES drivers (driver_id),
	PRIMARY KEY (race_id, driver_id, stop)
); 
COPY pit_stops FROM '/var/lib/csv/pit_stops.csv' CSV HEADER null '\N'; 

DROP TABLE IF EXISTS qualifying CASCADE;
CREATE TABLE qualifying (
	qualify_id serial PRIMARY KEY,
	race_id INT NOT NULL,
	driver_id INT NOT NULL,
	constructor_id INT NOT NULL,
	number INT NOT NULL,
	position INT NOT NULL,
	q1 INTERVAL,
	q2 INTERVAL,
	q3 INTERVAL,
	FOREIGN KEY (race_id) REFERENCES races (race_id),
	FOREIGN KEY (driver_id) REFERENCES drivers (driver_id),
	FOREIGN KEY (constructor_id) REFERENCES constructors (constructor_id)
);
COPY qualifying FROM '/var/lib/csv/qualifying.csv' CSV HEADER null '\N';

DROP TABLE IF EXISTS status CASCADE;
CREATE TABLE status(
	status_id serial PRIMARY KEY,
	status VARCHAR(30)
);
COPY status FROM '/var/lib/csv/status.csv' CSV HEADER null '\N'; 

DROP TABLE IF EXISTS results CASCADE;
CREATE TABLE results (
	result_id serial PRIMARY KEY,
	race_id INT NOT NULL,
	driver_id INT NOT NULL,
	constructor_id INT NOT NULL,
	number INT,
	grid INT NOT NULL,
	position INT,
	position_text VARCHAR(5) NOT NULL,
	position_order INT NOT NULL,
	points FLOAT NOT NULL,
	laps INT NOT NULL,
	time varchar(20),
	milliseconds INT,
	fastest_lap INT,
	rank INT,
	fastest_lap_time TIME,
	fastest_lap_speed FLOAT,
	status_id INT NOT NULL,
	FOREIGN KEY (race_id) REFERENCES races (race_id),
	FOREIGN KEY (driver_id) REFERENCES drivers (driver_id),
	FOREIGN KEY (constructor_id) REFERENCES constructors (constructor_id),
	FOREIGN KEY (status_id) REFERENCES status (status_id)
);
COPY results FROM '/var/lib/csv/results.csv' CSV HEADER null '\N'; 
