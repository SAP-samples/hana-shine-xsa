var rs, query;
var SALESORDERID, PARTNERID, QUANTITY, GROSSAMOUNT;
var conn = $.hdb.getConnection();
try {
	//select current new sales order
	query =
		'SELECT "SALESORDERID","PARTNER.PARTNERID" as "PARTNERID","GROSSAMOUNT" FROM "SO.Header" WHERE "SALESORDERID" = (SELECT MAX("SALESORDERID") FROM "SO.Header")';
	rs = conn.executeQuery(query);
	if (rs.length > 0) {
		SALESORDERID = rs[0].SALESORDERID;
		PARTNERID = rs[0].PARTNERID;
		GROSSAMOUNT = rs[0].GROSSAMOUNT;
	}
} catch (e) {
	conn.close();
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody("Error occurred during SO prediction");
}

//select quantity from SO.Item
try {
	query = 'SELECT SUM("QUANTITY") as QUANTITY,"SALESORDERID" FROM "SO.Item" WHERE "SALESORDERID"=? GROUP BY "SALESORDERID"';
	rs = conn.executeQuery(query, SALESORDERID);
	if (rs.length > 0) {
		QUANTITY = rs[0].QUANTITY;
	}
} catch (e) {
	conn.close();
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody("Error occurred during SO prediction");
}

//Removing rows from SO_Predict
try {
	query = 'TRUNCATE TABLE "PAL.SO_Predict"';
	rs = conn.executeUpdate(query);

	//insert into SO_Predict
	query = 'INSERT INTO "PAL.SO_Predict" VALUES(?,?,?,?)';
	rs = conn.executeUpdate(query, 1, PARTNERID, GROSSAMOUNT, QUANTITY);
	//call procedure
	var procLoad = conn.loadProcedure("predict");
	procLoad();
} catch (e) {
	conn.close();
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody("Error occurred during SO prediction");
}
//select status of current sales order
try {
	query = 'SELECT "category" FROM "PAL.result" WHERE "id"=1';
	rs = conn.executeQuery(query);
	var category;
	if (rs.length > 0) {
		category = rs[0].category;
		if (category === "X") {
			category = "N";
		}
	}
} catch (e) {
	conn.close();
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody("Error occurred during SO prediction");
}
//update status in SO.Header
try {
	query = 'UPDATE "SO.Header" SET "LIFECYCLESTATUS"=? WHERE "SALESORDERID"=?';
	rs = conn.executeUpdate(query, category, SALESORDERID);

	conn.commit();
	conn.close();
	$.response.setBody("Sales Order Prediction completed");
} catch (e) {
	conn.close();
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody("Error occurred during SO prediction");
}