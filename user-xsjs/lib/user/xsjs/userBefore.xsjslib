/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
 */

async function create_before_exit(param) {

    var after = param.afterTableName;
    var pStmt = null;
    //Get Input New Record Values

    try {

        pStmt = await param.connection.prepareStatement("select \"userSeqId\".NEXTVAL from dummy");
        var rs = await pStmt.executeQuery();
        var PersNo = "";
        while (await rs.next()) {
            PersNo = rs.getString(1);
        }
        await pStmt.close();
        pStmt = await param.connection.prepareStatement("update\"" + after + "\"set \"UserId\" = ?");
        pStmt.setString(1, PersNo);
        await pStmt.execute();
        await pStmt.close();
    } catch (e) {
        await pStmt.close();
    }
}

export default {create_before_exit};