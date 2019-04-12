function po_create_before_exit(param) {
    console.log("Start of Exit");
    var after = param.afterTableName;
    var pStmt = null;
    var poid = '';
	var partnerid = '';
	var grossamount = 0;
	var netamount = 0;
	var taxamount = 0;
	var currency = '';
	var productid = '';
	var quantity = 0;
	var date = '';
	var price = 0;
	
	var rs = null; 
	
	
   
    try {
	//getting POID
       // pStmt = param.connection.prepareStatement('select "purchaseOrderSeqId".NEXTVAL from "DUMMY"');
        pStmt = param.connection.prepareStatement('SELECT max(PURCHASEORDERID + 1) from "PO.Header"');
        rs = pStmt.executeQuery();
        while (rs.next()) {
           	poid = rs.getString(1);
        }
        console.log(poid);
        pStmt.close();
		
		pStmt = param.connection.prepareStatement("update\"" + after + "\"set PURCHASEORDERID = ?");
        pStmt.setString(1, poid.toString());
        pStmt.execute();
        pStmt.close();
		
		//getting data
		pStmt = param.connection.prepareStatement('select "PRODUCTID","PARTNERID","CURRENCY","QUANTITY","DELIVERYDATE" from "' + after + '"');
		rs = pStmt.executeQuery();
		while(rs.next()){
			productid = rs.getString(1);
			partnerid = rs.getString(2);
			currency = rs.getString(3);
			quantity = rs.getDouble(4);
			date = rs.getDate(5);
			
		}
		console.log(productid);
		console.log(date);
		pStmt.close();
		
		//getting product price
		
		pStmt = param.connection.prepareStatement("select \"PRICE\" from \"MD.Products\" where \"PRODUCTID\" = '"+productid+"'");
		rs = pStmt.executeQuery();
		while(rs.next()){
			price = rs.getDouble(1);
		}
		pStmt.close();

		
		//setting amount
		netamount = price * quantity;
		taxamount = netamount * 0.19;
		grossamount = netamount + taxamount;
		
		//insert PO.Header
		var query = "insert into \"PO.Header\" values('"+poid+"','33',CURRENT_DATE,'33',CURRENT_DATE,'','"+partnerid+"','"+currency+"',"+grossamount+","+netamount+","+taxamount+",'N','I','I','I','I')";
		pStmt = param.connection.prepareStatement(query);
		pStmt.executeUpdate();
		pStmt.close();
		
		date = new Date(date).toISOString();
		//insert PO.Item
		query = "insert into \"PO.Item\" values ('"+poid+"','10','"+productid+"','','"+currency+"',"+grossamount+","+netamount+","+taxamount+","+quantity+",'EA','"+date+"')";  
		pStmt = param.connection.prepareStatement(query);
		pStmt.executeUpdate();
		pStmt.close();
    
	
	} catch (e) {
		console.log(e);
    	$.trace.error(e.message);
        pStmt.close();
    }

}
