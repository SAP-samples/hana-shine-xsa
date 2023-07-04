/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0*/
"use strict";

/**
@function JSON as returned by hdb 
*/
async function hdbDirectTest(){
  var results = await _selection();
//Pass output to response		
$.response.status = $.net.http.OK;
$.response.contentType = "application/json";
await $.response.setBody(JSON.stringify(results));

}

/**
@function Flattended JSON structure
*/
async function hdbFlattenedTest(){
	await outputJSON(await _selection().EX_TOP_3_EMP_PO_COMBINED_CNT);
}

/**
@function load/call the procedure
*/
async function _selection(){
	var connection = await $.hdb.getConnection();

	var getPOHeaderData = await connection.loadProcedure( 
		"get_po_header_data");

	var results = getPOHeaderData();
	return results;
}

/**
@function Puts a JSON object into the Response Object
@param {object} jsonOut - JSON Object
*/
async function outputJSON(jsonOut){
	var out = [];
	for(var i=0; i<jsonOut.length;i++){
		out.push(jsonOut[i]);
	}
	$.response.status = $.net.http.OK;
	$.response.contentType = "application/json";
	await $.response.setBody(JSON.stringify(out));
}


var aCmd = encodeURI($.request.parameters.get("cmd"));
switch (aCmd) {
case "direct":
	await hdbDirectTest();
	break;
case "flattened":
	await hdbFlattenedTest();
	break;	
default:
	await hdbDirectTest();
	break;
}
export default {hdbDirectTest,hdbFlattenedTest,_selection,outputJSON,aCmd};
