await $.import("sap.hana.democontent.epm.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epm.services.session;

/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
 */

async function bp_create_before_exit(param) {

	var	after = param.afterTableName;
	var pStmt;
	try {

		pStmt = await param.connection.prepareStatement('select "businessPartnerId".NEXTVAL from DUMMY');
		var rs = await pStmt.executeQuery();
		var PartnerId = '';
		while (await rs.next()) {
			PartnerId = rs.getString(1);
		}
		await pStmt.close();

		pStmt = await param.connection.prepareStatement('update "' + after
				+ '" set PARTNERID = ?,' + 
				  '  PARTNERROLE = ?, ' +
				  '  "HISTORY.CREATEDBY.EMPLOYEEID" = ?,' +
				  '  "HISTORY.CHANGEDBY.EMPLOYEEID" = ?,' +
				  '  "HISTORY.CREATEDAT" = now(),' + 
				  '  "HISTORY.CHANGEDAT" = now(),' + 
				  '  "CURRENCY" = ?');
		pStmt.setString(1, PartnerId);	
		pStmt.setString(2, '01');	
		pStmt.setString(3, '0000000033');
		pStmt.setString(4, '0000000033');
		pStmt.setString(5, 'EUR');		
		
		await pStmt.execute();
		await pStmt.close();

		
	}
	catch (e) {
		return;
	}

}

async function address_create_before_exit(param) {

	var	after = param.afterTableName;
	
	var pStmt;
	try {
		
	pStmt = await param.connection.prepareStatement('select "addressId".NEXTVAL from dummy');
	var rs = await pStmt.executeQuery();
	var AddressId = '';
	while (await rs.next()) {
		AddressId = rs.getString(1);
	}
	await pStmt.close();

	pStmt = await param.connection.prepareStatement('update "' + after
			+ '" set "ADDRESSID" = ?,' +
			  'ADDRESSTYPE = ?,' +
			  '"VALIDITY.STARTDATE" = TO_DATE(' + "'2000-01-01', 'YYYY-MM-DD'),"  +
			  '"VALIDITY.ENDDATE" = TO_DATE(' + "'9999-12-31', 'YYYY-MM-DD')" );
	pStmt.setString(1, AddressId);		
	pStmt.setString(2, '02');			
	await pStmt.execute();
	await pStmt.close();
		
	}
	catch (e) {
		return;
	}

}

/**
@param {connection} Connection - The SQL connection used in the OData request
@param {principalTableName} String - The name of a temporary table with the entity type at the principal end of the association
@param {dependentTableName} String -The name of a temporary table with the dependent entity type
 */


async function assocation_create_exit(param){
	var	princ = param.principalTableName;
	var	dep = param.dependentTableName;


	var	pStmt = await param.connection.prepareStatement('select * from "' + princ + '"');
	var Principal = await SESSIONINFO.recordSetToJSON(await pStmt.executeQuery(), 'Details');
	await pStmt.close();
	
	var	pStmt = await param.connection.prepareStatement('select * from "' + dep + '"');
	var Dependent = await SESSIONINFO.recordSetToJSON(await pStmt.executeQuery(), 'Details');
	await pStmt.close();	
	
	$.trace.debug(JSON.stringify(Principal));
	$.trace.debug(JSON.stringify(Dependent));
	var pStmt = await param.connection.prepareStatement('update "MD.BusinessPartner" ' +
			    ' SET "ADDRESSES.ADDRESSID" = ? WHERE "PARTNERID" = ? ');
	pStmt.setString(1, Dependent.Details[0].ADDRESSID);
	pStmt.setString(2, Principal.Details[0].PARTNERID);		
	await pStmt.execute();
	await pStmt.close();	
			
}

function metadata(param){
//	 var result = processXML(param.metadata, function(name, atts) {
//	        var EDM = "http://schemas.microsoft.com/ado/2008/09/edm";
//	        var SAP = "http://www.sap.com/Protocols/SAPData";
//	        var newAtts = {};
//	        if (name === EDM + ":Property" && atts.Name === "M1") {
//	            newAtts[SAP + ":label"] = "The Measure";
//	        }
//	        return newAtts;
//	    });
	    return {metadata: param.metadata};
}
export default {SESSIONINFO,bp_create_before_exit,address_create_before_exit,assocation_create_exit,metadata};
