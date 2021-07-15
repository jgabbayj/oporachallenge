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
	var query = "SELECT year, seasonurl as url, json_agg(json_build_object('driver',drivers.*,'points',total_points)) as top_drivers "+
	"FROM (SELECT year, seasons.url AS seasonurl, driver_id, SUM(results.points) as total_points, "+
	"RANK() OVER(PARTITION BY year ORDER BY SUM(results.points) DESC) rank "+
	"FROM seasons "+
	"INNER JOIN races USING(year) "+
	"LEFT JOIN results USING(race_id) "+
	"INNER JOIN drivers USING(driver_id) "+
	"GROUP BY driver_id,year "+
	"ORDER BY year DESC, total_points DESC) as res "+
	"LEFT JOIN drivers USING(driver_id) "+
	"WHERE RANK<4 "+
	"GROUP BY year, seasonurl "+
	"ORDER BY year DESC;"
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

	var query = "SELECT drivers.*, json_agg(json_build_object('race_id',race_id,'average_lap_time',avg_lap_time,'fastest_lap_time'"+
	",min_lap_time,'slowest_lap_time',max_lap_time,'pit_stops',pit_stops_count,'fastest_pit_stop',min_pit_stop,"+
	"'slowest_pit_stop',max_pit_stop,'circut_name',circut_name,'points',results_points,'position',results_position)) as races "+
	"FROM drivers "+
	"INNER JOIN "+
	"(SELECT race_id, driver_id, MAX(pit_stops.stop) as pit_stops_count, MAX(pit_stops.time) max_pit_stop, MIN(pit_stops.time) min_pit_stop,"+
	"AVG(lap_times.time) avg_lap_time, MAX(lap_times.time) max_lap_time, MIN(lap_times.time) min_lap_time, circuits.name as circut_name,"+
	"results.points as results_points,results.position as results_position "+
	"FROM results "+
	"LEFT JOIN races USING(race_id) "+
	"LEFT JOIN pit_stops USING(driver_id,race_id) "+
	"LEFT JOIN lap_times USING(driver_id,race_id) "+
	"LEFT JOIN circuits USING(circuit_id) "+
	"GROUP BY race_id, circuits.name, results.points, results.position, races.date, driver_id "+
	"ORDER BY races.date DESC) AS t1 USING(driver_id) ";
	
	var param;
	
	if(id){
		query+="WHERE driver_id = $1 ";
		param = id;
	}
	else if(name){
		query+="WHERE drivers.driver_ref = $1 ";
		param=name;
	}
	else{
		response.status(400).json({msg:'Name or ID must be present'});
		return
	}
	query+="GROUP BY drivers.driver_id";
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