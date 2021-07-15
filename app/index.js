const express = require('express')
const app = express()
const db = require('./queries')
const port = 3000

app.get('/', (request, response) => {
  response.json({ info: 'endpoints: /drivers/byseason?season=[year]; /drivers/; /races/bydriver?name=[name]; /races/bydriver?id=[id]' })
})


app.get('/drivers/byseason/', db.getDriversBySeason);
app.get('/drivers/', db.getDriversPerSeason);
app.get('/races/bydriver/', db.getDriverRacesByIdOrName);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})