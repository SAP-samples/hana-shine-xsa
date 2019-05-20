function acceptSO(soId) {
	try {
		var conn = $.hdb.getConnection();
		//update status in SO.Header
		var query = 'UPDATE "SO.Header" SET "LIFECYCLESTATUS"=? WHERE "SALESORDERID"=?';
		conn.executeUpdate(query, "P", soId);
		conn.commit();
		conn.close();
		$.response.status = $.net.http.OK;
		$.response.setBody("Sales Order " + soId + " accepted");
	} catch (e) {
		conn.close();
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody("Error occurred during approval of sales order");
	}
}

function rejectSO(soId) {
	try {
		var conn = $.hdb.getConnection();
		//update status in SO.Header
		var query = 'UPDATE "SO.Header" SET "LIFECYCLESTATUS"=? WHERE "SALESORDERID"=?';
		conn.executeUpdate(query, "X", soId);
		conn.commit();
		conn.close();
		$.response.status = $.net.http.OK;
		$.response.setBody("Sales Order " + soId + " rejected");
	} catch (e) {
		conn.close();
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody("Error occurred during approval of sales order");
	}
}

var action = $.request.parameters.get('action');
var soId = $.request.parameters.get('SOID');

switch (action) {
case "Accept":
	acceptSO(soId);
	break;
case "Reject":
	rejectSO(soId);
	break;
default:
	$.trace.error("BAD REQUEST" + $.net.http.BAD_REQUEST);
	$.response.status = $.net.http.BAD_REQUEST;
	$.response.setBody("Bad Request");
}