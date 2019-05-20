function getAllNewSalesOrders(){
	var conn = $.hdb.getConnection();
	var query =
		'SELECT s."SALESORDERID",s."PARTNER.PARTNERID",b."COMPANYNAME", a."CITY",s."GROSSAMOUNT",s."TAXAMOUNT",s."CURRENCY",s."LIFECYCLESTATUS" FROM "SO.Header" as s INNER JOIN "MD.BusinessPartner" as b on s."PARTNER.PARTNERID"=b."PARTNERID"' +
		'INNER JOIN "MD.Addresses" as a on b."ADDRESSES.ADDRESSID"=a."ADDRESSID" WHERE s."LIFECYCLESTATUS"=? order by s."SALESORDERID" desc';
	var rs = "";
	try {
		rs = conn.executeQuery(query,'N');
		conn.close();
		$.response.status = $.net.http.OK;
		$.response.setBody(rs);
	} catch (e) {
		conn.close();
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e);
	}
}
function getAllSalesOrders() {
	var conn = $.hdb.getConnection();
	var query =
		'SELECT s."SALESORDERID",s."PARTNER.PARTNERID",b."COMPANYNAME", a."CITY",s."GROSSAMOUNT",s."TAXAMOUNT",s."CURRENCY",s."LIFECYCLESTATUS" FROM "SO.Header" as s INNER JOIN "MD.BusinessPartner" as b on s."PARTNER.PARTNERID"=b."PARTNERID"' +
		'INNER JOIN "MD.Addresses" as a on b."ADDRESSES.ADDRESSID"=a."ADDRESSID" order by s."SALESORDERID" desc';
	var rs = "";
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

}

function getSalesOrderById(soId) {
	var conn = $.hdb.getConnection();
	var query =
		'SELECT s."SALESORDERID",s."PARTNER.PARTNERID",b."COMPANYNAME", a."CITY",s."GROSSAMOUNT",s."TAXAMOUNT",s."CURRENCY",s."LIFECYCLESTATUS" FROM "SO.Header" as s INNER JOIN "MD.BusinessPartner" as b on s."PARTNER.PARTNERID"=b."PARTNERID"' +
		'INNER JOIN "MD.Addresses" as a on b."ADDRESSES.ADDRESSID"=a."ADDRESSID" WHERE s."SALESORDERID"=' + soId +
		' order by s."SALESORDERID" desc';
	var rs = "";
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
}

function getSalesOrderItems(soId) {
	var conn = $.hdb.getConnection();
	var query =
		'SELECT "SALESORDERITEM","PRODUCT.PRODUCTID",u."TEXT" as PRODUCTNAME, "QUANTITY","NETAMOUNT","TAXAMOUNT" FROM "SO.Item" i' +
		'INNER JOIN "MD.Products" as p on  p."PRODUCTID" = "PRODUCT.PRODUCTID" INNER JOIN "Util.Texts" as u on p."NAMEID"=u."TEXTID" WHERE "SALESORDERID" =' +
		soId;
	var rs = "";
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
}

function deleteSalesOrder(soId) {
	var conn = $.hdb.getConnection();
	var query1 = 'DELETE FROM "SO.Item" WHERE SALESORDERID=' + soId;
	var query2 = 'DELETE FROM "SO.Header" WHERE SALESORDERID=' + soId;
	try {
		conn.executeUpdate(query1);
		conn.executeUpdate(query2);
		conn.commit();
		$.response.status = $.net.http.OK;
	} catch (e) {
		conn.close();
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(e);
	}
}

var aCmd = $.request.parameters.get('cmd');
var soId = $.request.parameters.get('ID');
switch (aCmd) {
case "DELETESALESORDER":
	if (soId === undefined) {
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.setBody({
			"message": "Invalid request. Missing ID parameter"
		});
		break;
	}
	deleteSalesOrder(soId);
	break;
case "GETSALESORDERITEMS":
	if (soId === undefined) {
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.setBody({
			"message": "Invalid request. Missing ID parameter"
		});
		break;
	}
	getSalesOrderItems(soId);
	break;
case "GETALLNEWSALESORDER":
	getAllNewSalesOrders();
	break;
case "GETALLSALESORDER":
	getAllSalesOrders();
	break;
case "GETSALESORDERBYID":
	if (soId === undefined) {
		$.response.status = $.net.http.BAD_REQUEST;
		$.response.setBody({
			"message": "Invalid request. Missing ID parameter"
		});
		break;
	}
	getSalesOrderById(soId);
	break;
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody({
		"message": "Invalid request"
	});
}