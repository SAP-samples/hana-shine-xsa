function getProducts(partnerId) {
	var conn = $.hdb.getConnection();
	var query = 'SELECT t."TEXT" as PRODUCTNAME,p."PRODUCTID",p."PRICE",p."CURRENCY" FROM "MD.Products" as p INNER JOIN "Util.Texts" as t on p."NAMEID"=t."TEXTID" WHERE p."SUPPLIER.PARTNERID"='+partnerId;
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
}

var partnerId = $.request.parameters.get('PARTNERID');
getProducts(partnerId);