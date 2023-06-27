$.response.contentType = "text/html";
var sOutput = "Hello, World! <br><br>";

var oConn = await $.hdb.getConnection();
var sQuery = "select * from DUMMY";
var aRs = await oConn.executeQuery(sQuery);

if (aRs.length < 1) {
    await $.response.setBody("Failed to retrieve data");
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
} else {
    sOutput += "This is the response from my SQL: " + aRs[0].DUMMY;
    await $.response.setBody(sOutput);
}
await oConn.close(); 
export default {sOutput,oConn,sQuery,aRs};