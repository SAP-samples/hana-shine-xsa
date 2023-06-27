$.response.contentType = "application/json";
var output = {
    entry: {}
};

try{
var conn = await $.db.getConnection();

// get keys from MapKeys table
var pstmt = await conn.prepareStatement('SELECT * from "Core.SHINE_TIME_DIM"');
var rs = await pstmt.executeQuery();
var successBody = "{message:Data available}";
var errorBody="{message:Data unavailable}";
if(await rs.next())
{
	console.log("Data available");
	await conn.commit();
    $.response.status = $.net.http.OK;
    $.response.contentType = 'application/json';
    await $.response.setBody(JSON.stringify(successBody));
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
