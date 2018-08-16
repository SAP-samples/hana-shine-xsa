$.import("sap.hana.democontent.epm.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epm.services.session;

function validateEmail(email) {
	var re =
		/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function bpCreateBusinessPartner(param, partnerRole) {

	var afterTable = param.afterTableName;
	//Get Input New Record Values
	var pStmt = param.connection.prepareStatement("select * from \"" + afterTable + "\"");
	var input = SESSIONINFO.recordSetToJSON(pStmt.executeQuery(), "Details");
	pStmt.close();

	//Validate Email
	if (!validateEmail(input.Details[0].EmailAddress)) {
		throw "Invalid email for company " + input.Details[0].CompanyName +
			" No Way! E-Mail must be valid and " + input.Details[0].EmailAddress + " has problems";
	}

	//insert addresss
	try {

		pStmt = param.connection.prepareStatement("select \"addressSeqId\".NEXTVAL from dummy");
		var rs = pStmt.executeQuery();
		var AddressId = "";
		while (rs.next()) {
			AddressId = rs.getString(1);
		}
		pStmt.close();
		pStmt = param.connection.prepareStatement("INSERT INTO \"MD.Addresses\" " +
		                   " (ADDRESSID, ADDRESSTYPE, CITY, COUNTRY, REGION, \"VALIDITY.STARTDATE\", \"VALIDITY.ENDDATE\") "+
		                   " VALUES( ?,?,?,?,?, TO_DATE('2000-01-01', 'YYYY-MM-DD'), TO_DATE('9999-12-31', 'YYYY-MM-DD') )");
		pStmt.setString(1, AddressId.toString());
		pStmt.setString(2, "02");
		pStmt.setString(3, input.Details[0].City);
		pStmt.setString(4, input.Details[0].Country);	
		pStmt.setString(5, input.Details[0].Region);		

		 
		pStmt.execute();
		pStmt.close();

	} catch (e) {
		console.error(e);
		throw e; 
	}

//Business Partner
	try {

		pStmt = param.connection.prepareStatement("select \"partnerSeqId\".NEXTVAL from DUMMY");
		
		rs = pStmt.executeQuery();
		var PartnerId = "";
		while (rs.next()) {
			PartnerId = rs.getString(1);
		}
		pStmt.close();
		pStmt = param.connection.prepareStatement("INSERT INTO  \"MD.BusinessPartner\" " +
		             " (PARTNERID, PARTNERROLE, \"HISTORY.CREATEDAT\", \"HISTORY.CHANGEDAT\", \"ADDRESSES.ADDRESSID\", EMAILADDRESS, COMPANYNAME  ) " +
		             " values(?, ?, now(), now(), ?, ?, ?)");
		pStmt.setString(1, PartnerId.toString());	
		pStmt.setString(2, partnerRole);	
		pStmt.setString(3, AddressId.toString());		
		pStmt.setString(4, input.Details[0].EmailAddress);
		pStmt.setString(5, input.Details[0].CompanyName);
		pStmt.execute();
		pStmt.close();

		
	}
	catch (e) {
		console.error(e);
		throw e; 
	}

}

function bpCreateBuyer(param) {
	bpCreateBusinessPartner(param, "1");
}

function bpCreateSupplier(param) {
	bpCreateBusinessPartner(param, "2");
}