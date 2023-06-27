$.response.contentType = "application/json";
var output = {
    entry: {}
};

try{
var conn = await $.db.getConnection();

// get keys from MapKeys table
var pstmt = await conn.prepareStatement('select count(*) from "PO.Header"');
  

var rs = await pstmt.executeQuery();
var jsonString = '{"d":'+'{"icon": "sap-icon://sales-order","info": " ",';
var jsonString3 = '"numberDigits": 1,"numberFactor": "k","numberState": "Positive","subtitle": "No of PurchaseOrders"}}';  
var successBody = "{message:Data available}";
var errorBody="{message:Data unavailable}";

if(await rs.next())
{
	console.log("true");
	var count =  rs.getNString(1);
	console.log("count"+count);
	var jsonString2 = '"number":'+(count/1000)+',';
	var responseString = jsonString+jsonString2+jsonString3;
	console.log("response string"+responseString);
	var Response = JSON.parse(responseString);
	console.log("Response"+Response);
	await conn.commit();
    $.response.status = $.net.http.OK;
    $.response.contentType = 'application/json';
    await $.response.setBody(JSON.stringify(Response));
}

else
{
	console.log("Data unavailable");
	 $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
     await $.response.setBody(JSON.stringify(errorBody));
   
}


} catch (e){
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    console.log(e.message);
    await $.response.setBody(JSON.stringify(errorBody));
    
}


await conn.close();
export default {output};
