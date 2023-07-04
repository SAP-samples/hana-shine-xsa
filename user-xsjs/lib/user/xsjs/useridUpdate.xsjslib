/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
 */

async function my_create_after_exit(param) {
    var after = param.afterTableName;
    //Get Input New Record Values
    var pStmt, persNo, perFName, perLName, perEmail;
    pStmt = persNo = perFName = perLName = perEmail = null;
    try {

        pStmt = await param.connection.prepareStatement('select "userSeqId".NEXTVAL from dummy');
        var rs = await pStmt.executeQuery();
        var PersNo = '';
        while (await rs.next()) {
            PersNo = rs.getString(1);
        }
        await pStmt.close();
        pStmt = await param.connection.prepareStatement("update\"" + after + "\"set \"UserId\" = ?");
        pStmt.setString(1, PersNo);
        await pStmt.execute();
        await pStmt.close();

        pStmt = await param.connection.prepareStatement('select * from "' + after + '"');
        rs = await pStmt.executeQuery();
        while (await rs.next()) {
            persNo = rs.getString(1);
            perFName = rs.getString(2);
            perLName = rs.getString(3);
            perEmail = rs.getString(4);
        }
        pStmt = await param.connection.prepareStatement('insert into "UserData.User" values(?,?,?,?,?)');
        pStmt.setString(1, persNo);
        pStmt.setString(2, perFName);
        pStmt.setString(3, perLName);
        pStmt.setString(4, perEmail);
        pStmt.setString(5, "");        
        await pStmt.executeUpdate();
        await pStmt.close();

    } catch (e) {
        await pStmt.close();
    }

}

export default {my_create_after_exit};