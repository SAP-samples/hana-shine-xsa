/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, no-redeclare: 0*/
"use strict";

await $.import("user.xsjs", "session");
var SESSIONINFO = $.user.xsjs.session;

/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
*/
async function usersCreate(param){
	var after = param.afterTableName;    
	
	//Get Input New Record Values
	var	pStmt = await param.connection.prepareStatement("select * from \"" + after + "\"");	 
	var User = await SESSIONINFO.recordSetToJSON(await pStmt.executeQuery(), "Details");
	await pStmt.close();


	//Validate Email
	if(!validateEmail(User.Details[0].Email)){
		throw "Invalid email for "  + User.Details[0].FirstName +  
        " No Way! E-Mail must be valid and " + User.Details[0].Email + " has problems";
	} 

	//Get Next Personnel Number
	pStmt = await param.connection.prepareStatement("select \"userSeqId\".NEXTVAL from dummy"); 
	var rs = await pStmt.executeQuery();
	var PersNo = "";
	while (await rs.next()) {
		PersNo = rs.getString(1);
	}
	await pStmt.close();
	//Insert Record into DB Table and Temp Output Table
	for( var i = 0; i<2; i++){
		var pStmt;
		if(i<1){
			pStmt = await param.connection.prepareStatement("insert into \"UserData.User\" values(?,?,?,?,?)" );			
		}else{
			pStmt = await param.connection.prepareStatement("TRUNCATE TABLE \"" + after + "\"" );
			await pStmt.executeUpdate();
			await pStmt.close();
			pStmt = await param.connection.prepareStatement("insert into \"" + after + "\" values(?,?,?,?,?)" );		
		}
		pStmt.setString(1, PersNo.toString());
		pStmt.setString(2, User.Details[0].FirstName.toString());		
		pStmt.setString(3, User.Details[0].LastName.toString());	
		pStmt.setString(4, User.Details[0].Email.toString());	
		pStmt.setString(5, "");
		await pStmt.executeUpdate();
		await pStmt.close();
	}
}

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export default {SESSIONINFO,usersCreate,validateEmail};