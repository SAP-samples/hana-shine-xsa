$.response.contentType = "application/json";
var output = {
    entry: {}
};

var conn = await $.db.getConnection();
// get keys from MapKeys table
var pstmt = await conn.prepareStatement('select TOP 1 "KEYID","APP_ID","APP_CODE",' + '"EXT1","EXT2" from "Core.MapKeys"');
var rs = await pstmt.executeQuery();

if (! await rs.next()) {
    await $.response.setBody(JSON.stringify(output));
    $.response.status = $.net.http.OK;
} else {
    do {
        // add the keys retreived from database to response
        output.entry.APP_ID = rs.getString(2);
        output.entry.APP_CODE = rs.getString(3);
    } while (await rs.next());

   await $.response.setBody(JSON.stringify(output));
    $.response.status = $.net.http.OK;
}

await rs.close();
await pstmt.close();
await conn.close();
export default {output,conn,pstmt,rs};
