async function po_create_before_exit(param) {
    $.trace.error("Start of Exit");
    var after = param.afterTableName;
    var pStmt = null;
    var poid = '';
   
    try {
        pStmt = await param.connection.prepareStatement('select "purchaseOrderSeqId".NEXTVAL from "DUMMY"');
                   //.prepareStatement('SELECT max(PURCHASEORDERID + 1) from "PO.Header"');
        var rs = await pStmt.executeQuery();
        while (await rs.next()) {
           	poid = rs.getString(1);
        }
        $.trace.error(poid);
        await pStmt.close();

        pStmt = await param.connection.prepareStatement("update\"" + after + "\"set PURCHASEORDERID = ?");
        pStmt.setString(1, poid.toString());
        await pStmt.execute();
        await pStmt.close();
    } catch (e) {
    	$.trace.error(e.message);
        await pStmt.close();
    }

}
export default {po_create_before_exit};