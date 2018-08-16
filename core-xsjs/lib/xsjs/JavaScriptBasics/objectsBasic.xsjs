var purchaseOrder = $.import("xsjs.JavaScriptBasics", "purchaseOrderBasic");

function getObjectsJSON(){
	var inputPO = encodeURI($.request.parameters.get('po'));
	inputPO = typeof inputPO !== 'undefined' ? inputPO : '300000000'; 
	var po = new purchaseOrder.getHeader(inputPO);
	var poJson = {"purchaseOrder": po};
	
	var body = JSON.stringify(poJson);
	
	$.response.contentType = 'application/json';
	$.response.setBody(body);
	$.response.status = $.net.http.OK;
	
}

var aCmd = encodeURI($.request.parameters.get('cmd'));
switch (aCmd) {
case "json":
	getObjectsJSON();
	break;
default:
	getObjectsJSON();
}