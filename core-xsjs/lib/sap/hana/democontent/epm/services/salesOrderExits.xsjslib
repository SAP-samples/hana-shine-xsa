async function so_delete_before_exit(param) {
    var before = param.beforeTableName;
    //Get Input New Record Values
    var pStmt,soId,rs;
    pStmt = soId = null;
    try {
    	pStmt = await param.connection.prepareStatement('select \"SALESORDERID\" from "' + before + '"');
        rs = await pStmt.executeQuery();
        while (await rs.next()) {
            soId = rs.getString(1);
      
        }
		await pStmt.close();
		
		var salesOrderId = '';
		pStmt = await param.connection.prepareStatement("select \"SALESORDERID\" from \"SO.Header\" where \"SALESORDERID\" ='"+soId+"'");
		rs = await pStmt.executeQuery();
		while(await rs.next()){
			salesOrderId = rs.getString(1);
		}
		await pStmt.close();
		
		if(salesOrderId === ''){
			throw new error("Invalid Sales Order ID.");
		}else{
			//delete SO.Item
			pStmt = await param.connection.prepareStatement("delete from \"SO.Item\" where \"SALESORDERID\"='"+soId+"'");
	        await pStmt.executeUpdate();
	        await pStmt.close();
	       
	        //delete SO.Header
			pStmt = await param.connection.prepareStatement("delete from \"SO.Header\" where \"SALESORDERID\"='"+soId+"'");
	        await pStmt.executeUpdate();
	        await pStmt.close();
		}
		
     
    } catch (e) {
    	console.log(e);
    	await pStmt.close();
    }

}
export default {so_delete_before_exit};
