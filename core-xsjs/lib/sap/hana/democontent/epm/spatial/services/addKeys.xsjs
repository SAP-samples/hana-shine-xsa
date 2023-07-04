var body = $.request.body.asString();

var entry = JSON.parse(body);

var responseBody = '';

var conn = await $.db.getConnection();
var deletePstmt = await conn.prepareStatement('delete from "Core.MapKeys"');
var rs = await deletePstmt.execute();
await deletePstmt.close();

var pstmt = await conn.prepareStatement(
    'insert into "Core.MapKeys" values(?,?,?,?,?)');
pstmt.setString(1, "1");
pstmt.setString(2, entry.APP_ID);
pstmt.setString(3, entry.APP_CODE);
pstmt.setString(4, "");
pstmt.setString(5, "");

var rs = await pstmt.execute();

await pstmt.close();

await conn.commit();
await conn.close();

$.response.status = $.net.http.CREATED;
await $.response.setBody(responseBody);
export default {body,entry,responseBody,conn,deletePstmt,rs,pstmt,rs};
