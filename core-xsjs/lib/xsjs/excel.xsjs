/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0*/
"use strict";

var excel = $.require("node-xlsx");
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
	"FROM \"PO.Item\" ";	*/
var rs = await conn.executeQuery(query);

var body = "";
var out = [];
for (var i = 0; i < rs.length; i++) {
	out.push([rs[i]["PurchaseOrderItemId"], rs[i]["ItemPos"], rs[i]["ProductID"], rs[i]["Amount"]]);
}
var result = excel.build([{
	name: "Purchase Orders",
	data: out
}]);

await $.response.setBody(result);
$.response.contentType = "application/vnd.ms-excel;";
$.response.headers.set("Content-Transfer-Encoding",
	"binary");
$.response.headers.set("Content-Disposition",
	"attachment; filename=Excel.xlsx");
$.response.status = $.net.http.OK;
export default {excel,conn,query,rs,body,out,result};
