var purchaseOrder = await $.import("xsjs.JavaScriptBasics", "purchaseOrderBasic");

async function getObjectsJSON(){
	var inputPO = encodeURI($.request.parameters.get('po'));
	inputPO = typeof inputPO !== 'undefined' ? inputPO : '300000000'; 
	var po = await new purchaseOrder.getHeader(inputPO);
	var poJson = {"purchaseOrder": po};
	
	var body = JSON.stringify(poJson);
	
	$.response.contentType = 'application/json';
	await $.response.setBody(body);
	$.response.status = $.net.http.OK;
	
}

var aCmd = encodeURI($.request.parameters.get('cmd'));
switch (aCmd) {
case "json":
	await getObjectsJSON();
	break;
default:
	await getObjectsJSON();
}
export default {purchaseOrder,getObjectsJSON,aCmd};
