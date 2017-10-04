/*eslint no-console: 0, no-unused-vars: 0, no-shadow:0*/
function store() {
  var config = {
    name: "foo",
    value: "bar"
  };
  var aStore = new $.security.Store("localStoreTest.xssecurestore");
  aStore.store(config);
}
function read() {
  var config = {
    name: "foo"
  };
  try {
    var store = new $.security.Store("localStoreTest.xssecurestore");
    var value = store.read(config);
  }
  catch(ex) {
    //do some error handling
  } 
}

var aCmd = $.request.parameters.get("cmd");
switch (aCmd) {
case "store":
	store();
	break;
case "read":
	read();
	break;	
default:
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody("Invalid Command");
}