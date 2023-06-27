$.response.contentType = "text/html";

var conn = await $.hdb.getConnection();
var body = "";
var rs = "";
var query;
var overAllId = "";

try {
	// Business Partner Company Name
	query =
		'select * from "Util.SeriesData" where "t" >= (select current_timestamp from dummy ) and "t" < (SELECT ADD_SECONDS (TO_TIMESTAMP (CURRENT_TIMESTAMP), 60*120) "add seconds" FROM DUMMY)';
	rs = await conn.executeQuery(query);
	await conn.close();
} catch (e) {
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	await $.response.setBody(e.message);
}

if (rs.length > 0) {
	overAllId = rs[0].FACTOR;
} else {
	overAllId = "0";
}

body = overAllId;
$.trace.debug(body);
$.response.contentType = "application/json";
await $.response.setBody(body);
$.response.status = $.net.http.OK;
export default {conn,body,rs,query,overAllId};