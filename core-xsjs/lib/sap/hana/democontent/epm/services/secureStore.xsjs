/*eslint no-console: 0, no-unused-vars: 0, no-shadow:0*/
async function store(overallData) {
 /* delete entry first and then store */
	
  var keyConfig = {
    name: overallData.apiKeyKey,
    value: overallData.apiKey
  };
  
  
  try{
  	 var aStore = await (new $.security.Store("localStore.xssecurestore"));
  	 await aStore.remove(keyConfig);
  }
  catch(ex)
  {
  	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	  await $.response.setBody("Error in deleting entries from secure store");
  }
  try
  {
  aStore = await (new $.security.Store("localStore.xssecurestore"));
  console.log("keyConfig",JSON.stringify(keyConfig));
  await aStore.store(keyConfig);
  console.log("Done");
   $.response.status = $.net.http.OK;
  await $.response.setBody(JSON.stringify(keyConfig));
  }
   catch(ex) {
    console.log("error"+ex);
    await $.response.setBody(JSON.stringify(ex));
  } 
}
async function read(apiKeyKey) {
  var keyConfig = {
    name: apiKeyKey
  };
  try {
    var store = await (new $.security.Store("localStore.xssecurestore"));
    var apiKey = await store.read(keyConfig);
    console.log("value"+apiKey);
    var results = {
    	 apiKey: apiKey
    };
    console.log("results"+results);
    $.response.status = $.net.http.OK;
    await $.response.setBody(JSON.stringify(results));
  }
  catch(ex) {
    console.log("error"+ex);
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    await $.response.setBody(JSON.stringify(ex));
  } 
}

var aCmd = $.request.parameters.get("cmd");


switch (aCmd) {
case "store":
	var body = $.request.body.asString();
  var overallData = JSON.parse(body);
	await store(overallData);
	break;
case "read":
	var userID = $.request.parameters.get('query');
	await read(userID);
	break;	
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	await $.response.setBody("Invalid Command");
}
export default {store,read,aCmd};