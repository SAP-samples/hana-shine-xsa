var conn = $.hdb.getConnection();
var query = 'SELECT "PARTNERID","COMPANYNAME" FROM "MD.BusinessPartner"';
var rs = '';
try {
	rs = conn.executeQuery(query);
	conn.close();
	$.response.status = $.net.http.OK;
	$.response.setBody(rs);
} catch (e) {
	conn.close();
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(e);
}