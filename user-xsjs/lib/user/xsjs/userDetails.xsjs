$.response.contentType = "application/json";
var output = {
    entry: {}
};

try{
var conn = await $.db.getConnection();

// get keys from MapKeys table
var pstmt = await conn.prepareStatement('select count(*) from "UserData.User"');
var rs = await pstmt.executeQuery();
var jsonString = '{"d":'+
'{"icon": "sap-icon://account","info": " ",'
var jsonString3 = '"numberDigits": 5,"subtitle": "No of Users","title": "User CRUD"}}'; 
var successBody = "{message:Data available}";
var errorBody="{message:Data unavailable}";

if(await rs.next())
{
	console.log("true");
	var count =  rs.getNString(1);
	console.log("count"+count);
	var numberStateString = '"numberState": "Positive",';
	if(count > 0){
	   numberStateString = '"numberState": "Positive",';
	}else{
           numberStateString = '"numberState": "Negative",';
	}
	var jsonString2 = '"number":'+count+','+numberStateString;
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