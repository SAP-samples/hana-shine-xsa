/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0*/
"use strict";

async function fillSessionInfo(){
	var body = "";
	body = JSON.stringify({
		"session" : [{"UserName": $.session.getUsername(), "Language": $.session.language}]
	});
	$.response.contentType = "application/json";
	await $.response.setBody(body);
	$.response.status = $.net.http.OK; 
}


var aCmd = $.request.parameters.get("cmd");
switch (aCmd) {
case "getSessionInfo":
	await fillSessionInfo();
	break; 
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	await $.response.setBody("Invalid Request Method");
}
export default {fillSessionInfo,aCmd};