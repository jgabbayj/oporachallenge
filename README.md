## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Endpoints](#Endpoints)

## General info
This project was created for Opora back-end challenge
	
## Technologies
Project is created with:
* Nodejs
* Express
* Postgresql
* Docker
	
## Setup
Download and install docker from https://www.docker.com/get-started

Run the project:

```
$ git clone https://github.com/jgabbayj/oporachallenge.git
$ cd oporachallenge
$ docker-compose up
```

## Endpoints
* /drivers/byseason?season=[year]
* /seasons/
* /races/bydriver?name=[name] 
* /races/bydriver?id=[id]