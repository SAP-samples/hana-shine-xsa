/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, new-cap: 0*/
function bpCreateBuyer(param) {
	bpCreateBusinessPartner(param,1);
}

function bpCreateSupplier(param) {
	bpCreateBusinessPartner(param,2);
}

function bpCreateBusinessPartner(param,partnerRole){
	var XSDS = $.require("sap-cds").xsjs(param.connection);
	XSDS.Transaction.$setAutoCommit(false);
	
	
	var afterTable = param.afterTableName;
	afterTable = "\"" + afterTable + "\"";
	//Get Input New Record Values
	var InputBP = XSDS.$defineEntity("Details", afterTable, {
	    Id : { $key: true }
	});
	var input = InputBP.$findAll(); 
	
	//Validate Email
	if(!validateEmail(input[0].EmailAddress)){
		throw "Invalid email for company "  + input[0].CompanyName + 
        " No Way! E-Mail must be valid and " + input[0].EmailAddress + " has problems";
	} 
	
	
	var oBP = XSDS.$importEntity("", "MD.BusinessPartner", 
			 { PARTNERID: { $key:  "\"partnerSeqId\"" }
			 });
	var oAddress = XSDS.$importEntity("", "MD.Addresses", 
			 { ADDRESSID: { $key:  "\":addressSeqId\"" }
			 });
	var oEmployee = XSDS.$importEntity("", "MD.Employees");

	// create new Address
	var newAddress = new oAddress({
	 CITY:  input[0].City,
	 COUNTRY: input[0].Country,
	 REGION: input[0].Region
    });
	newAddress.$save();
	
	//Lookup Employee
	var employee = oEmployee.$find({ LOGINNAME: "SSPRINGS" }); 
	
	// create new Business Partner
	var newBP = new oBP({ 		
	 PARTNERROLE: partnerRole,
	 EMAILADDRESS: input[0].EmailAddress,
	 COMPANYNAME:  input[0].CompanyName,
	 ADDRESSES: newAddress,
	 HISTORY: { CREATEDBY: employee, CREATEDAT: new Date(), CHANGEDBY: employee, CHANGEDAT: new Date() }
    });
	newBP.$save();
	
}


function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 