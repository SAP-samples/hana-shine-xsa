/*eslint no-console: 0, no-unused-vars: 0, no-shadow:0*/
function store(overallData) {
 /* delete entry first and then store */
	
  var idConfig = {
    name: overallData.appIdKey,
    value: overallData.appId
  };
  
   var codeConfig = {
    name: overallData.appCodeKey,
    value: overallData.appCode
  };
  
  try{
  	 var aStore = new $.security.Store("localStore.xssecurestore");
  	 aStore.remove(idConfig);
  	 aStore.remove(codeConfig);
  }
  catch(ex)
  {
  	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody("Error in deleting entries from secure store");
  }
  try
  {
  aStore = new $.security.Store("localStore.xssecurestore");
  console.log("idconfig",JSON.stringify(idConfig));
  console.log("idconfig",JSON.stringify(codeConfig));
  aStore.store(idConfig);
  aStore.store(codeConfig);
  console.log("Done");
   $.response.status = $.net.http.OK;
   $.response.setBody(JSON.stringify(idConfig));
  }
   catch(ex) {
    console.log("error"+ex);
     $.response.setBody(JSON.stringify(ex));
  } 
}
function read(appIdKey,appCodeKey) {
  var idConfig = {
    name: appIdKey
  };
  var keyConfig = {
    name: appCodeKey
  };
  try {
    var store = new $.security.Store("localStore.xssecurestore");
    var appID = store.read(idConfig);
    var appCode = store.read(keyConfig);
    console.log("value"+appID+" "+appCode);
   
    
    var results = {
    	 appID: appID,
         appCode: appCode
    };
    console.log("results"+results);
    $.response.status = $.net.http.OK;
    $.response.setBody(JSON.stringify(results));
    
    
   
  }
  catch(ex) {
    console.log("error"+ex);
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
     $.response.setBody(JSON.stringify(ex));
  } 
}

var aCmd = $.request.parameters.get("cmd");


switch (aCmd) {
case "store":
	var body = $.request.body.asString();
    var overallData = JSON.parse(body);
	store(overallData);
	break;
case "read":
	var userID = $.request.parameters.get('query');
	userID  = userID.split("@");  
	console.log("userID"+userID[0]+""+userID[1]);
	read(userID[0],userID[1]);
	break;	
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody("Invalid Command");
}