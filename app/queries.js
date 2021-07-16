const Pool = require('pg').Pool
const pool = new Pool({
user: 'postgres',
host: 'db',
database: 'formulaone',
password: 'postgres',
port: 5432,
})


// Returns a list of drivers sorted by the wins in the requested season
function getDriversBySeason(request, response){
	var season = request.query.season;
	if(season){
		var query = "SELECT drivers.*, races.year, count(CASE WHEN position=1 THEN 1 END)::int as wins "+
		"FROM drivers "+
		"INNER JOIN results USING(driver_id) "+
		"LEFT JOIN races USING(race_id) "+
		"GROUP BY driver_id,races.year "+
		"HAVING races.year=$1 "+
		"ORDER BY wins DESC;"
		pool.query(query,[season],(error, results) => {
			if(error)
				if(error.code == "22P02")
					response.status(400).json({msg:'Season must be a valid year(e.g 1999)'});
				else if(error.code == "22003")
					response.status(400).json({msg:'Year too big or too small'});
				else
					throw error
			else	
				response.status(200).json(results.rows);
		});
}
	else
		response.status(400).json({msg:'Year must be present'});
}

// Returns a list of seasons with the top 3 drivers in each season
function getDriversPerSeason(request,response){
	var query = "SELECT year, seasonurl, json_agg(json_build_object('driver',drivers.*,'points',total_points)) as top_drivers "+
	"FROM "+
	"(SELECT year, seasons.url as seasonurl, driver_id, SUM(t2.points) as total_points, RANK() OVER(PARTITION BY year ORDER BY SUM(points) DESC) rank "+
	"FROM seasons "+
	"INNER JOIN "+
	"(SELECT race_id, year from races) as t1 USING(year) "+
	"INNER JOIN "+
	"(SELECT driver_id, race_id, points from results) as t2 USING(race_id) "+
	"GROUP BY year,driver_id "+
	"ORDER BY year DESC, total_points DESC) as t "+
	"LEFT JOIN "+
	"drivers USING(driver_id) "+
	"WHERE rank<4 "+
	"GROUP BY year, seasonurl "+
	"ORDER BY year DESC"
	pool.query(query,(error,results)=>{
		if(error)
			throw error
		response.status(200).json(results.rows)
	})


}

// Get a specifig driver (By id/name) with all of his races sorted by date from newest to oldest
function getDriverRacesByIdOrName(request,response){
	var id = request.query.id;
	var name = request.query.name;
		
	var param;
	var q;
	if(id){
		q="WHERE driver_id = $1 ";
		param = id;
	}
	else if(name){
		q="WHERE driver_ref = $1 ";
		param=name;
	}
	else{
		response.status(400).json({msg:'Name or ID must be present'});
		return
	}
	
	var query = "SELECT drivers.*, json_agg(json_build_object('race_id',race_id,'date',date,'average_lap_time',avg_lap_time,'fastest_lap_time',fastest_lap_time,'slowest_lap_time',slowest_lap_time,'pit_stops',pit_stops_count,"+
	"'fastest_pit_stop',fastest_pit_stop,'slowest_pit_stop',slowest_pit_stop,'circuit_name',circuit_name,'points',t1.points,'position',t1.position) ORDER BY date DESC) as races "+
	"FROM drivers "+
	"INNER JOIN "+
	"(SELECT race_id, driver_id, points,position FROM results) as t1 USING(driver_id) "+
	"LEFT JOIN "+
	"(SELECT race_id, driver_id, COUNT(stop) as pit_stops_count, MAX(time) as slowest_pit_stop, MIN(time) as fastest_pit_stop FROM pit_stops GROUP BY race_id,driver_id) as t2 USING (race_id,driver_id) "+
	"LEFT JOIN "+
	"(SELECT race_id, driver_id, AVG(time) as avg_lap_time, MAX(time) slowest_lap_time, MIN(time) fastest_lap_time FROM lap_times GROUP BY race_id,driver_id) as t3 USING(driver_id,race_id) "+
	"LEFT JOIN "+
	"(SELECT race_id, circuit_id,date from races) as t4 USING (race_id) "+
	"LEFT JOIN "+
	"(SELECT circuit_id, name as circuit_name FROM circuits) as t5 USING(circuit_id) "+
	q+
	"GROUP BY driver_id "
	
	
	pool.query(query,[param],(error,results)=>{
	if(error){
		if(error.code == "22P02")
			response.status(400).json({msg:'ID must be numeric'});
		else if(error.code == "22003")
			response.status(400).json({msg:'ID too big or too small'});
		else
			throw error
	}
	else
		response.status(200).json(results.rows)
	})

}



module.exports = {
	getDriversBySeason,
	getDriversPerSeason,
	getDriverRacesByIdOrName
}