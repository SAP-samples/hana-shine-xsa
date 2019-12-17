function so_delete_before_exit(param) {
    var before = param.beforeTableName;
    //Get Input New Record Values
    var pStmt,soId,rs;
    pStmt = soId = null;
    try {
    	pStmt = param.connection.prepareStatement('select \"SALESORDERID\" from "' + before + '"');
        rs = pStmt.executeQuery();
        while (rs.next()) {
            soId = rs.getString(1);
      
        }
		pStmt.close();
		
		var salesOrderId = '';
		pStmt = param.connection.prepareStatement("select \"SALESORDERID\" from \"SO.Header\" where \"SALESORDERID\" ='"+soId+"'");
		rs = pStmt.executeQuery();
		while(rs.next()){
			salesOrderId = rs.getString(1);
		}
		pStmt.close();
		
		if(salesOrderId === ''){
			throw new error("Invalid Sales Order ID.");
		}else{
			//delete SO.Item
			pStmt = param.connection.prepareStatement("delete from \"SO.Item\" where \"SALESORDERID\"='"+soId+"'");
	        pStmt.executeUpdate();
	        pStmt.close();
	       
	        //delete SO.Header
			pStmt = param.connection.prepareStatement("delete from \"SO.Header\" where \"SALESORDERID\"='"+soId+"'");
	        pStmt.executeUpdate();
	        pStmt.close();
		}
		
     
    } catch (e) {
    	console.log(e);
    	pStmt.close();
    }

}
