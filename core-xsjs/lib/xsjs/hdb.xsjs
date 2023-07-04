/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0*/
"use strict";

var conn = await $.hdb.getConnection();
var query = "SELECT FROM PO.Item { " +
	        " PURCHASEORDERID as \"PurchaseOrderItemId\", " +
            " PURCHASEORDERITEM as \"ItemPos\", " +
            " PRODUCT.PRODUCTID as \"ProductID\", " +
            " GROSSAMOUNT as \"Amount\" " +
            " } ";
/*var query = "SELECT "  +
	" PURCHASEORDERID as \"PurchaseOrderItemId\", " +
	" PURCHASEORDERITEM as \"ItemPos\", " +
	" \"PRODUCT.PRODUCTID\" as \"ProductID\", " +
	" GROSSAMOUNT as \"Amount\" " +
	"FROM \"PO.Item\" ";            */
var rs = await conn.executeQuery(query);

var body = "";

for(var i = 0; i < rs.length; i++){
   if(rs[i]["Amount"] >= 500){
	body += rs[i]["PurchaseOrderItemId"] + "\t" + rs[i]["ItemPos"] + "\t" + 
			rs[i]["ProductID"] + "\t" + rs[i]["Amount"] + "\n";
   }
}


await $.response.setBody(body);
$.response.contentType = "application/vnd.ms-excel; charset=utf-16le";
$.response.headers.set("Content-Disposition",
		"attachment; filename=Excel.xls");
$.response.status = $.net.http.OK;
export default {conn,query,rs,body};
