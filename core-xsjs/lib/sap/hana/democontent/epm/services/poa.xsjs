await $.import("sap.hana.democontent.epm.services", "messages");
var MESSAGES = $.sap.hana.democontent.epm.services.messages;
await $.import("sap.hana.democontent.epm.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epm.services.session;

async function getEmployees(){
	function createEmployeeEntry(rs) {
		return {
			"FirstName" : rs.FIRST,
			"LastName" : rs.LAST,
			"Department" : "Approving Department",
			"Thumbnail" : rs.EMPLOYEEPICURL
		};
	}

	var body = '';
	var list = [];

	try {
		
		var query = 'SELECT "NAME.FIRST" as FIRST, "NAME.LAST" AS LAST, EMPLOYEEPICURL ' 
			        + 'FROM "MD.Employees"';
		$.trace.debug(query);
		var conn = await $.hdb.getConnection();
		var rs = await conn.executeQuery(query);

		for(var i = 0; i < rs.length; i++){
			list.push(createEmployeeEntry(rs[i]));
		}
	} catch (e) {
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		await $.response.setBody(e.message);
		return;
	}

	body = JSON.stringify({
		"Employees" : list
	});

	$.response.contentType = 'application/json; charset=UTF-8';
	await $.response.setBody(body);
	$.response.status = $.net.http.OK;
}


var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
case "getSessionInfo":
	await SESSIONINFO.fillSessionInfo();
	break; 
case "getEmployees":
	await getEmployees();
	break;
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	await $.response.setBody(await MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
}
export default {MESSAGES,SESSIONINFO,getEmployees,aCmd};
