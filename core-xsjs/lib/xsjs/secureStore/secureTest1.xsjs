/*eslint no-console: 0, no-unused-vars: 0, no-shadow:0*/
async function store() {
  var config = {
    name: "foo",
    value: "bar"
  };
  var aStore = new $.security.Store("localStoreTest.xssecurestore");
  await aStore.store(config);
}
async function read() {
  var config = {
    name: "foo"
  };
  try {
    var store = new $.security.Store("localStoreTest.xssecurestore");
    var value = await store.read(config);
  }
  catch(ex) {
    //do some error handling
  } 
}

var aCmd = $.request.parameters.get("cmd");
switch (aCmd) {
case "store":
	await store();
	break;
case "read":
	await read();
	break;	
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	await $.response.setBody("Invalid Command");
}
export default {store,read,aCmd};