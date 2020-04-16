
$.response.contentType = "application/json";
var query = "";
var rs = "";
var successBody = "{message:Time Dimensional Data Generated successfully}";
var errorBody = "{message:Time Dimensional Data not generated}";
try{
	var connection = $.hdb.getConnection();
	query = "SELECT CURRENT_SCHEMA FROM \"DUMMY\""; 
	rs = connection.executeQuery(query);
	var currentSchema = rs[0].CURRENT_SCHEMA;
	
	//selecting current year
	query = 'SELECT YEAR(CURRENT_DATE) as CURRENT_YEAR FROM DUMMY';
	rs = connection.executeQuery(query);
	var currentYear = rs[0].CURRENT_YEAR;
	
	query = 'MDX UPDATE TIME DIMENSION HOUR 2017 '+currentYear+' MONDAY TARGET_TABLE \"Core.SHINE_TIME_DIM\" TARGET_SCHEMA "'+currentSchema+'"';
	rs = connection.executeQuery(query);
	connection.commit();
	connection.close();
	$.response.status = $.net.http.OK;
	$.response.setBody(JSON.stringify(successBody));
}catch(e){
	console.log(e);
	connection.close();
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(JSON.stringify(errorBody));
}