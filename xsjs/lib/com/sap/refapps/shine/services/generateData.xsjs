function reset(tables) {
	try {
		var conn = $.hdb.getConnection();
		var query;

		for (var i = 0; i < tables.length; i++) {
			query = 'DELETE FROM "' + tables[i] + '"';
			conn.executeUpdate(query);

		}
		conn.commit();
		//load master data from shadow table
		var shadowTables = ["SOShadow.Header", "SOShadow.Item"];
		for (var j = 0; j < tables.length; j++) {
			query = 'insert into "' + tables[j] + '" select * from "' + shadowTables[j] + '"';
			conn.executeUpdate(query);
		}
		conn.commit();
		conn.close();
	} catch (e) {
		conn.close();
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e);
	}
}

function generateData(data) {
	try {
		var conn = $.hdb.getConnection();
		var loadSO = conn.loadProcedure("load_data_SO");
		var result = loadSO({START_DATE: data.startDate, END_DATE: data.endDate, ANOREC: data.noSO});
		conn.commit();
		conn.close();
		$.response.status = $.net.http.OK;
		$.response.setBody(data.noSO+" Sales Orders generated");
	} catch (e) {
		conn.close();
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e);
	}
}
var body = $.request.body.asString();
var data = JSON.parse(body);
//reset SO.Header and SO.Item
var tables = ["SO.Header", "SO.Item"];
reset(tables);
generateData(data);